import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CalendarDays, Clock, Timer, Users } from "lucide-react";
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
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useCreatePlan, useUpdatePlan } from "@/hooks/usePlans";
import { useUpdateListItem } from "@/hooks/useListItems";
import { mockUsers, currentUser } from "@/mock";
import type { Plan, ListItemStatus } from "@/types";

const DURATION_OPTIONS = [
  { label: "30 minutes", value: "30" },
  { label: "1 hour", value: "60" },
  { label: "1.5 hours", value: "90" },
  { label: "2 hours", value: "120" },
  { label: "3 hours", value: "180" },
  { label: "Half day", value: "240" },
  { label: "All day", value: "480" },
];

const schema = z.object({
  date: z.string().min(1, "Date is required"),
  time: z.string().optional(),
  durationMinutes: z.string().optional(),
  notes: z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface AddPlanDialogProps {
  listItemId: string;
  itemStatus: ListItemStatus;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  plan?: Plan;
}

export function AddPlanDialog({
  listItemId,
  itemStatus,
  open,
  onOpenChange,
  plan,
}: AddPlanDialogProps) {
  const isEditing = !!plan;
  const [attendeeIds, setAttendeeIds] = useState<string[]>([currentUser.id]);
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const updateItem = useUpdateListItem();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  useEffect(() => {
    if (open) {
      reset({
        date: plan?.date ?? "",
        time: plan?.time ?? "",
        durationMinutes: plan?.durationMinutes?.toString() ?? "",
        notes: plan?.notes ?? "",
      });
      setAttendeeIds(plan?.attendeeIds ?? [currentUser.id]);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleAttendee = (userId: string) => {
    setAttendeeIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const onSubmit = async (values: FormValues) => {
    const data = {
      listItemId,
      date: values.date,
      time: values.time || undefined,
      durationMinutes: values.durationMinutes
        ? parseInt(values.durationMinutes)
        : undefined,
      notes: values.notes || undefined,
      attendeeIds,
    };

    if (isEditing) {
      await updatePlan.mutateAsync({ id: plan.id, listItemId, data });
    } else {
      await createPlan.mutateAsync(data);
      if (itemStatus === "wanted") {
        updateItem.mutate({ id: listItemId, data: { status: "planned" } });
      }
    }

    handleClose();
  };

  const handleClose = () => {
    reset();
    setAttendeeIds([currentUser.id]);
    onOpenChange(false);
  };

  const isPending = createPlan.isPending || updatePlan.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Edit Plan" : "Add a Plan"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Date */}
          <div className="space-y-1">
            <Label htmlFor="date" className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              Date
            </Label>
            <Input id="date" type="date" {...register("date")} />
            {errors.date && (
              <p className="text-xs text-destructive">{errors.date.message}</p>
            )}
          </div>

          {/* Time + Duration on same row */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="time" className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Time
              </Label>
              <Input id="time" type="time" {...register("time")} />
            </div>
            <div className="space-y-1">
              <Label className="flex items-center gap-1.5">
                <Timer className="h-3.5 w-3.5" />
                Duration
              </Label>
              <Select
                defaultValue={plan?.durationMinutes?.toString()}
                onValueChange={(v) => setValue("durationMinutes", v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  {DURATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Attendees */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5" />
              Who's coming?
            </Label>
            <div className="flex gap-2 flex-wrap">
              {mockUsers.map((user) => {
                const selected = attendeeIds.includes(user.id);
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => toggleAttendee(user.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-full border text-sm transition-colors",
                      selected
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-accent"
                    )}
                  >
                    <Avatar className="h-5 w-5">
                      <AvatarImage src={user.avatarUrl} />
                      <AvatarFallback className="text-[10px]">
                        {user.name.split(" ").map((n) => n[0]).join("")}
                      </AvatarFallback>
                    </Avatar>
                    {user.name.split(" ")[0]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any details about this plan…"
              rows={3}
              {...register("notes")}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving…" : isEditing ? "Save Changes" : "Save Plan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
