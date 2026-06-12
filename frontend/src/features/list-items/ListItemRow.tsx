import { MapPin, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ListItem, Place, Occurrence } from "@/types";
import { resolveTarget } from "@/services/listItems";
import { mockPlaces } from "@/mock";

interface ListItemRowProps {
  item: ListItem;
  isSelected: boolean;
  onClick: () => void;
}

const statusColors: Record<ListItem["status"], string> = {
  wanted: "bg-muted text-muted-foreground",
  planned: "bg-blue-100 text-blue-700",
  done: "bg-green-100 text-green-700",
};

const statusLabels: Record<ListItem["status"], string> = {
  wanted: "Wanted",
  planned: "Planned",
  done: "Done",
};

function getTargetName(item: ListItem): string {
  const target = resolveTarget(item);
  if (!target) return "Unknown";
  return target.name ?? "Unknown";
}

function getTargetLocation(item: ListItem): string | undefined {
  if (item.targetType === "place") {
    const place = resolveTarget(item) as Place | undefined;
    return place?.address;
  }
  if (item.targetType === "occurrence") {
    const occ = resolveTarget(item) as Occurrence | undefined;
    const place = mockPlaces.find((p) => p.id === occ?.placeId);
    return place?.address;
  }
  return undefined;
}

function getTargetDate(item: ListItem): string | undefined {
  if (item.targetType === "occurrence") {
    const occ = resolveTarget(item) as Occurrence | undefined;
    return occ?.date;
  }
  return undefined;
}

export function ListItemRow({ item, isSelected, onClick }: ListItemRowProps) {
  const name = getTargetName(item);
  const location = getTargetLocation(item);
  const date = getTargetDate(item);

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full text-left p-3 rounded-lg border transition-colors hover:bg-accent",
        isSelected ? "border-primary bg-accent" : "border-transparent"
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{name}</p>
          {location && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
              <MapPin className="h-3 w-3 shrink-0" />
              {location}
            </p>
          )}
          {date && (
            <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
              <Calendar className="h-3 w-3 shrink-0" />
              {new Date(date).toLocaleDateString()}
            </p>
          )}
          {item.notes && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
              {item.notes}
            </p>
          )}
        </div>
        <Badge
          className={cn("shrink-0 text-xs", statusColors[item.status])}
          variant="outline"
        >
          {statusLabels[item.status]}
        </Badge>
      </div>
    </button>
  );
}
