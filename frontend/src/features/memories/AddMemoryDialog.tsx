import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarDays, Clock, Star } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { useCreateMemory, useUpdateMemory } from "@/hooks/useMemories";
import { useUpdateListItem } from "@/hooks/useListItems";
import type { Memory, Plan, ListItemStatus } from "@/types";

const schema = z.object({
  visitedDate: z.string().min(1, "Date is required"),
  visitedTime: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface AddMemoryDialogProps {
  listItemId: string;
  itemStatus: ListItemStatus;
  plans?: Plan[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  memory?: Memory;
}

function getDefaultDate(plans?: Plan[]): string {
  if (!plans || plans.length === 0) return "";
  const sorted = [...plans].sort((a, b) => a.date.localeCompare(b.date));
  return sorted[sorted.length - 1].date;
}

function getDefaultTime(plans?: Plan[]): string {
  if (!plans || plans.length === 0) return "";
  const sorted = [...plans].sort((a, b) => a.date.localeCompare(b.date));
  return sorted[sorted.length - 1].time ?? "";
}

function getDefaultPlanId(plans?: Plan[]): string | undefined {
  if (!plans || plans.length === 0) return undefined;
  const sorted = [...plans].sort((a, b) => a.date.localeCompare(b.date));
  return sorted[sorted.length - 1].id;
}

// Extract local YYYY-MM-DD from a full ISO timestamp
function isoToLocalDate(iso: string): string {
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Extract local HH:MM from a full ISO timestamp
function isoToLocalTime(iso: string): string {
  const d = new Date(iso);
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${min}`;
}

export function AddMemoryDialog({
  listItemId,
  itemStatus,
  plans,
  open,
  onOpenChange,
  memory,
}: AddMemoryDialogProps) {
  const isEditing = !!memory;
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  const createMemory = useCreateMemory();
  const updateMemory = useUpdateMemory();
  const updateItem = useUpdateListItem();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (open) {
      if (memory) {
        reset({
          visitedDate: isoToLocalDate(memory.visitedAt),
          visitedTime: isoToLocalTime(memory.visitedAt),
          notes: memory.notes ?? "",
        });
        setRating(memory.rating);
      } else {
        reset({
          visitedDate: getDefaultDate(plans),
          visitedTime: getDefaultTime(plans),
          notes: "",
        });
        setRating(5);
      }
      setHoveredStar(null);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (values: FormValues) => {
    const visitedAt = values.visitedTime
      ? new Date(`${values.visitedDate}T${values.visitedTime}`).toISOString()
      : new Date(`${values.visitedDate}T12:00:00`).toISOString();

    if (isEditing) {
      await updateMemory.mutateAsync({
        id: memory.id,
        listItemId,
        data: { rating, notes: values.notes || undefined, visitedAt },
      });
    } else {
      await createMemory.mutateAsync({
        listItemId,
        planId: getDefaultPlanId(plans),
        rating,
        notes: values.notes || undefined,
        photos: [],
        tags: [],
        visitedAt,
      });
      if (itemStatus !== "done") {
        updateItem.mutate({ id: listItemId, data: { status: "done" } });
      }
    }

    handleClose();
  };

  const handleClose = () => {
    reset();
    setRating(5);
    setHoveredStar(null);
    onOpenChange(false);
  };

  const displayRating = hoveredStar ?? rating;
  const isPending = createMemory.isPending || updateMemory.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Memory" : "Add a Memory"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Date + Time */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="visitedDate" className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5" />
                Date visited
              </Label>
              <Input id="visitedDate" type="date" {...register("visitedDate")} />
              {errors.visitedDate && (
                <p className="text-xs text-destructive">{errors.visitedDate.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <Label htmlFor="visitedTime" className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Time
              </Label>
              <Input id="visitedTime" type="time" {...register("visitedTime")} />
            </div>
          </div>

          {/* Plan pre-fill notice (create only) */}
          {!isEditing && plans && plans.length > 0 && (
            <p className="text-xs text-muted-foreground -mt-1">
              Pre-filled from your plan — adjust if needed.
            </p>
          )}

          {/* Star rating */}
          <div className="space-y-1.5">
            <Label>Rating</Label>
            <div
              className="flex gap-1"
              onMouseLeave={() => setHoveredStar(null)}
            >
              {([1, 2, 3, 4, 5] as const).map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredStar(star)}
                  className="p-0.5 rounded transition-transform hover:scale-110 focus:outline-none"
                  aria-label={`${star} star${star !== 1 ? "s" : ""}`}
                >
                  <Star
                    className={cn(
                      "h-7 w-7 transition-colors",
                      star <= displayRating
                        ? "fill-amber-400 text-amber-400"
                        : "fill-none text-muted-foreground/40"
                    )}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="What made it memorable? Would you go back?"
              rows={4}
              {...register("notes")}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : isEditing ? "Save Changes" : "Save Memory"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
