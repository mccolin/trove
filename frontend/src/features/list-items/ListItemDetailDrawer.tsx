import { useState } from "react";
import { X, MapPin, Calendar, ExternalLink, Star, CheckCircle, CalendarPlus, BookHeart, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { usePlans, useDeletePlan } from "@/hooks/usePlans";
import { useMemories, useDeleteMemory } from "@/hooks/useMemories";
import { useUpdateListItem } from "@/hooks/useListItems";
import { formatLocalDate } from "@/lib/utils";
import { resolveTarget } from "@/services/listItems";
import { getPlaceById } from "@/services/places";
import { AddPlanDialog } from "@/features/plans/AddPlanDialog";
import { AddMemoryDialog } from "@/features/memories/AddMemoryDialog";
import type { ListItem, Plan, Memory, Place, Occurrence } from "@/types";

interface ListItemDetailDrawerProps {
  item: ListItem;
  onClose: () => void;
}

interface ConfirmState {
  title: string;
  description: string;
  onConfirm: () => void;
}

export function ListItemDetailDrawer({ item, onClose }: ListItemDetailDrawerProps) {
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null);
  const [memoryDialogOpen, setMemoryDialogOpen] = useState(false);
  const [editingMemory, setEditingMemory] = useState<Memory | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  const openAddPlan = () => { setEditingPlan(null); setPlanDialogOpen(true); };
  const openEditPlan = (plan: Plan) => { setEditingPlan(plan); setPlanDialogOpen(true); };
  const openAddMemory = () => { setEditingMemory(null); setMemoryDialogOpen(true); };
  const openEditMemory = (memory: Memory) => { setEditingMemory(memory); setMemoryDialogOpen(true); };

  const target = resolveTarget(item);
  const { data: plans } = usePlans(item.id);
  const { data: memories } = useMemories(item.id);
  const updateItem = useUpdateListItem();
  const deletePlan = useDeletePlan();
  const deleteMemory = useDeleteMemory();

  const place =
    item.targetType === "place"
      ? (target as Place)
      : item.targetType === "occurrence"
      ? getPlaceById((target as Occurrence)?.placeId ?? "")
      : undefined;

  const handleMarkDone = () => {
    updateItem.mutate({ id: item.id, data: { status: "done" } });
  };

  const confirmDeletePlan = (plan: Plan) => {
    setConfirm({
      title: "Delete plan?",
      description: `This will permanently remove the plan for ${formatLocalDate(plan.date)}.`,
      onConfirm: () => {
        deletePlan.mutate(
          { id: plan.id, listItemId: item.id },
          { onSuccess: () => setConfirm(null) }
        );
      },
    });
  };

  const confirmDeleteMemory = (memory: Memory) => {
    setConfirm({
      title: "Delete memory?",
      description: "This will permanently remove this memory.",
      onConfirm: () => {
        deleteMemory.mutate(
          { id: memory.id, listItemId: item.id },
          { onSuccess: () => setConfirm(null) }
        );
      },
    });
  };

  const isDeleting = deletePlan.isPending || deleteMemory.isPending;

  return (
    <div className="flex flex-col h-full overflow-y-auto">
      <div className="flex items-start justify-between p-4 border-b">
        <div className="flex-1 min-w-0">
          <h2 className="font-semibold text-base truncate">{target?.name ?? "Unknown"}</h2>
          {place?.address && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {place.address}
            </p>
          )}
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="shrink-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="p-4 space-y-4 flex-1">
        {/* Image */}
        {(target as Place | Occurrence)?.imageUrl && (
          <img
            src={(target as Place | Occurrence).imageUrl}
            alt={target?.name}
            className="w-full h-40 object-cover rounded-lg"
          />
        )}

        {/* Status & Priority */}
        <div className="flex gap-2">
          <Badge variant="outline" className="capitalize">
            {item.status}
          </Badge>
          <Badge variant="secondary" className="capitalize">
            {item.priority} priority
          </Badge>
          {item.targetType === "occurrence" && (
            <Badge variant="outline" className="text-xs">
              <Calendar className="h-3 w-3 mr-1" />
              {(target as Occurrence)?.date}
            </Badge>
          )}
        </div>

        {/* Notes */}
        {item.notes && (
          <div>
            <p className="text-sm font-medium mb-1">Notes</p>
            <p className="text-sm text-muted-foreground">{item.notes}</p>
          </div>
        )}

        {/* Description */}
        {(target as Place)?.description && (
          <div>
            <p className="text-sm font-medium mb-1">About</p>
            <p className="text-sm text-muted-foreground">
              {(target as Place).description}
            </p>
          </div>
        )}

        {/* Website */}
        {(target as Place)?.websiteUrl && (
          <a
            href={(target as Place).websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            Website <ExternalLink className="h-3 w-3" />
          </a>
        )}

        <Separator />

        {/* Plans */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Plans</p>
            {item.status !== "done" && (
              <Button
                variant="ghost"
                size="sm"
                className="h-auto py-0.5 px-1.5 text-xs"
                onClick={openAddPlan}
              >
                <CalendarPlus className="h-3.5 w-3.5 mr-1" />
                Add
              </Button>
            )}
          </div>
          {plans && plans.length > 0 ? (
            <div className="space-y-2">
              {plans.map((plan) => (
                <div key={plan.id} className="text-sm p-2 bg-muted rounded-md">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">
                      {formatLocalDate(plan.date)}
                      {plan.time && ` at ${plan.time}`}
                    </p>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-muted-foreground hover:text-foreground"
                        onClick={() => openEditPlan(plan)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-muted-foreground hover:text-destructive"
                        onClick={() => confirmDeletePlan(plan)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  {plan.notes && (
                    <p className="text-muted-foreground text-xs mt-0.5">{plan.notes}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No plans yet.</p>
          )}
        </div>

        <Separator />

        {/* Memories */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Memories</p>
            <Button
              variant="ghost"
              size="sm"
              className="h-auto py-0.5 px-1.5 text-xs"
              onClick={openAddMemory}
            >
              <BookHeart className="h-3.5 w-3.5 mr-1" />
              Add
            </Button>
          </div>
          {memories && memories.length > 0 ? (
            <div className="space-y-2">
              {memories.map((memory) => (
                <div key={memory.id} className="text-sm p-2 bg-muted rounded-md">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: memory.rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-muted-foreground hover:text-foreground"
                        onClick={() => openEditMemory(memory)}
                      >
                        <Pencil className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-5 w-5 text-muted-foreground hover:text-destructive"
                        onClick={() => confirmDeleteMemory(memory)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  {memory.notes && (
                    <p className="text-muted-foreground text-xs mt-1">{memory.notes}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(memory.visitedAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No memories yet.</p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t flex gap-2">
        {item.status !== "done" && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={openAddPlan}
          >
            <CalendarPlus className="h-4 w-4 mr-1" />
            Add Plan
          </Button>
        )}
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={openAddMemory}
        >
          <BookHeart className="h-4 w-4 mr-1" />
          Add Memory
        </Button>
        {item.status !== "done" && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={handleMarkDone}
            disabled={updateItem.isPending}
          >
            <CheckCircle className="h-4 w-4 mr-1" />
            Mark Done
          </Button>
        )}
      </div>

      <AddPlanDialog
        listItemId={item.id}
        itemStatus={item.status}
        open={planDialogOpen}
        onOpenChange={setPlanDialogOpen}
        plan={editingPlan ?? undefined}
      />
      <AddMemoryDialog
        listItemId={item.id}
        itemStatus={item.status}
        plans={plans}
        open={memoryDialogOpen}
        onOpenChange={setMemoryDialogOpen}
        memory={editingMemory ?? undefined}
      />
      <ConfirmDialog
        open={!!confirm}
        onOpenChange={(open) => { if (!open) setConfirm(null); }}
        title={confirm?.title ?? ""}
        description={confirm?.description ?? ""}
        onConfirm={confirm?.onConfirm ?? (() => {})}
        isPending={isDeleting}
      />
    </div>
  );
}
