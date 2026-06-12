import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
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
import { useCreateList } from "@/hooks/useLists";
import { currentUser } from "@/mock";

const schema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().default(""),
  coverImageUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
});

type FormValues = z.infer<typeof schema>;

interface CreateListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateListDialog({ open, onOpenChange }: CreateListDialogProps) {
  const createList = useCreateList();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    await createList.mutateAsync({
      name: values.name,
      description: values.description,
      coverImageUrl: values.coverImageUrl || undefined,
      ownerId: currentUser.id,
      memberIds: [currentUser.id],
      tags: [],
      mapCenter: { lat: 39.952, lng: -75.165 },
      defaultZoom: 12,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New List</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="e.g. Summer 2026 Plans" {...register("name")} />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>
          <div className="space-y-1">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="What's this list for?"
              {...register("description")}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="coverImageUrl">Cover image URL (optional)</Label>
            <Input
              id="coverImageUrl"
              placeholder="https://..."
              {...register("coverImageUrl")}
            />
            {errors.coverImageUrl && (
              <p className="text-xs text-destructive">{errors.coverImageUrl.message}</p>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createList.isPending}>
              {createList.isPending ? "Creating..." : "Create List"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
