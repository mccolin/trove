import { Link } from "react-router-dom";
import { Users, Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { List } from "@/types";

interface ListCardProps {
  list: List;
}

export function ListCard({ list }: ListCardProps) {
  return (
    <Link to={`/lists/${list.id}`}>
      <Card className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-full">
        {list.coverImageUrl && (
          <div className="h-40 overflow-hidden">
            <img
              src={list.coverImageUrl}
              alt={list.name}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        <CardContent className="p-4 space-y-2">
          <h3 className="font-semibold text-base leading-tight">{list.name}</h3>
          {list.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {list.description}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-muted-foreground pt-1">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {list.memberIds.length}
            </span>
            {list.tags.length > 0 && (
              <span className="flex items-center gap-1">
                <Tag className="h-3 w-3" />
                {list.tags.slice(0, 2).map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs py-0">
                    {tag}
                  </Badge>
                ))}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
