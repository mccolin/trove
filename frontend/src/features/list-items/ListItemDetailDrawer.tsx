import { useState } from "react";
import { X, MapPin, Calendar, ExternalLink, Star, CheckCircle, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { usePlans } from "@/hooks/usePlans";
import { useMemories } from "@/hooks/useMemories";
import { useUpdateListItem } from "@/hooks/useListItems";
import { resolveTarget } from "@/services/listItems";
import { getPlaceById } from "@/services/places";
import { AddPlanDialog } from "@/features/plans/AddPlanDialog";
import type { ListItem, Place, Occurrence } from "@/types";

interface ListItemDetailDrawerProps {
  item: ListItem;
  onClose: () => void;
}

export function ListItemDetailDrawer({ item, onClose }: ListItemDetailDrawerProps) {
  const [showAddPlan, setShowAddPlan] = useState(false);
  const target = resolveTarget(item);
  const { data: plans } = usePlans(item.id);
  const { data: memories } = useMemories(item.id);
  const updateItem = useUpdateListItem();

  const place =
    item.targetType === "place"
      ? (target as Place)
      : item.targetType === "occurrence"
      ? getPlaceById((target as Occurrence)?.placeId ?? "")
      : undefined;

  const handleMarkDone = () => {
    updateItem.mutate({ id: item.id, data: { status: "done" } });
  };

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
                onClick={() => setShowAddPlan(true)}
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
                  <p className="font-medium">
                    {new Date(plan.date).toLocaleDateString()}
                    {plan.time && ` at ${plan.time}`}
                  </p>
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
          <p className="text-sm font-medium mb-2">Memories</p>
          {memories && memories.length > 0 ? (
            <div className="space-y-2">
              {memories.map((memory) => (
                <div key={memory.id} className="text-sm p-2 bg-muted rounded-md">
                  <div className="flex items-center gap-1 mb-1">
                    {Array.from({ length: memory.rating }).map((_, i) => (
                      <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  {memory.notes && (
                    <p className="text-muted-foreground text-xs">{memory.notes}</p>
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
      {item.status !== "done" && (
        <div className="p-4 border-t flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => setShowAddPlan(true)}
          >
            <CalendarPlus className="h-4 w-4 mr-1" />
            Add Plan
          </Button>
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
        </div>
      )}

      <AddPlanDialog
        listItemId={item.id}
        itemStatus={item.status}
        open={showAddPlan}
        onOpenChange={setShowAddPlan}
      />
    </div>
  );
}
