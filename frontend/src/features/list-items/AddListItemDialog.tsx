import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, MapPin } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateListItem } from "@/hooks/useListItems";
import {
  suggestMapboxPlaces,
  retrieveMapboxPlace,
  createPlace,
} from "@/services/places";
import type { MapboxSuggestion } from "@/services/places";
import type { Place, ListItemPriority } from "@/types";

const schema = z.object({
  notes: z.string().optional(),
  priority: z.enum(["low", "medium", "high"]).default("medium"),
});

type FormValues = z.infer<typeof schema>;

interface AddListItemDialogProps {
  listId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  proximity?: { lat: number; lng: number };
}

export function AddListItemDialog({
  listId,
  open,
  onOpenChange,
  proximity,
}: AddListItemDialogProps) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<MapboxSuggestion[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [suggesting, setSuggesting] = useState(false);
  const [retrieving, setRetrieving] = useState(false);

  // One UUID per search session; refreshed after each /retrieve (ends the billing session)
  const sessionTokenRef = useRef(crypto.randomUUID());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const createItem = useCreateListItem();

  const { register, handleSubmit, reset, setValue } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { priority: "medium" },
  });

  // Refresh session token whenever the dialog opens so each search session is distinct
  useEffect(() => {
    if (open) sessionTokenRef.current = crypto.randomUUID();
  }, [open]);

  // Debounced suggest — fires 350 ms after the user stops typing
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!query.trim() || selectedPlace) {
      setSuggestions([]);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setSuggesting(true);
      const results = await suggestMapboxPlaces(
        query,
        sessionTokenRef.current,
        proximity
      );
      setSuggestions(results);
      setSuggesting(false);
    }, 350);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, proximity, selectedPlace]);

  const handleSelect = async (suggestion: MapboxSuggestion) => {
    setSuggestions([]);
    setRetrieving(true);

    const retrieved = await retrieveMapboxPlace(
      suggestion.mapboxId,
      sessionTokenRef.current
    );

    // /retrieve ends this billing session — get a fresh token for the next search
    sessionTokenRef.current = crypto.randomUUID();

    if (!retrieved) {
      setRetrieving(false);
      return;
    }

    const place = await createPlace({
      name: retrieved.name,
      description: "",
      address: retrieved.fullAddress,
      lat: retrieved.lat,
      lng: retrieved.lng,
      category: retrieved.category,
      externalIds: { mapboxId: suggestion.mapboxId },
    });

    setSelectedPlace(place);
    setRetrieving(false);
  };

  const onSubmit = async (values: FormValues) => {
    if (!selectedPlace) return;
    await createItem.mutateAsync({
      listId,
      targetType: "place",
      targetId: selectedPlace.id,
      notes: values.notes,
      priority: values.priority as ListItemPriority,
      status: "wanted",
      tags: [],
    });
    handleClose();
  };

  const handleClose = () => {
    reset();
    setQuery("");
    setSuggestions([]);
    setSelectedPlace(null);
    onOpenChange(false);
  };

  const isLoading = suggesting || retrieving;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add to List</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Search input */}
          <div className="space-y-2">
            <Label>Search for a place</Label>
            <div className="relative">
              <Input
                placeholder="Coffee shop, museum, restaurant…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (selectedPlace) setSelectedPlace(null);
                }}
                autoComplete="off"
                disabled={retrieving}
              />
              {isLoading && (
                <Loader2 className="absolute right-3 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Suggestion dropdown */}
          {suggestions.length > 0 && !selectedPlace && (
            <div className="border rounded-md divide-y max-h-56 overflow-y-auto shadow-sm">
              {suggestions.map((s) => (
                <button
                  key={s.mapboxId}
                  type="button"
                  className="w-full text-left px-3 py-2.5 hover:bg-accent text-sm flex items-start gap-2"
                  onClick={() => handleSelect(s)}
                >
                  <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="font-medium truncate">{s.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {s.fullAddress}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Retrieving state */}
          {retrieving && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-1">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading place details…
            </div>
          )}

          {/* No results */}
          {!isLoading && query.trim().length > 1 && suggestions.length === 0 && !selectedPlace && (
            <p className="text-xs text-muted-foreground text-center py-2">
              No results found. Try a different search.
            </p>
          )}

          {/* Confirmed selection */}
          {selectedPlace && (
            <div className="border rounded-md p-3 bg-accent/50 flex items-start justify-between gap-2">
              <div className="flex items-start gap-2 min-w-0">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{selectedPlace.name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {selectedPlace.address}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="shrink-0 text-xs h-auto py-1"
                onClick={() => { setSelectedPlace(null); setQuery(""); }}
              >
                Change
              </Button>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="priority">Priority</Label>
              <Select
                defaultValue="medium"
                onValueChange={(v) => setValue("priority", v as ListItemPriority)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                placeholder="Any notes about this place…"
                {...register("notes")}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!selectedPlace || createItem.isPending}
              >
                {createItem.isPending ? "Adding…" : "Add to List"}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
