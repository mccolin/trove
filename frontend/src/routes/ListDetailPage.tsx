import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Plus, Map, List, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListItemRow } from "@/features/list-items/ListItemRow";
import { ListItemDetailDrawer } from "@/features/list-items/ListItemDetailDrawer";
import { AddListItemDialog } from "@/features/list-items/AddListItemDialog";
import { ListMap } from "@/features/map/ListMap";
import { useList } from "@/hooks/useLists";
import { useListItems } from "@/hooks/useListItems";
import type { ListItemStatus } from "@/types";

const STATUS_FILTERS: { label: string; value: ListItemStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Wanted", value: "wanted" },
  { label: "Planned", value: "planned" },
  { label: "Done", value: "done" },
];

export default function ListDetailPage() {
  const { listId } = useParams<{ listId: string }>();
  const { data: list } = useList(listId!);
  const { data: items = [], isLoading } = useListItems(listId!);

  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<ListItemStatus | "all">("all");
  const [showAddItem, setShowAddItem] = useState(false);

  const selectedItem = items.find((i) => i.id === selectedItemId) ?? null;

  const filteredItems =
    statusFilter === "all"
      ? items
      : items.filter((i) => i.status === statusFilter);

  const handleSelectItem = (id: string) => {
    setSelectedItemId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b px-4 py-3 flex items-center gap-3 shrink-0">
        <Link to="/lists" className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Gem className="h-4 w-4 text-primary shrink-0" />
          <span className="font-semibold truncate">{list?.name ?? "Loading..."}</span>
        </div>
        <Button size="sm" onClick={() => setShowAddItem(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </header>

      {/* Mobile: tabs between list and map */}
      <div className="flex-1 flex flex-col md:hidden overflow-hidden">
        <Tabs defaultValue="list" className="flex flex-col flex-1 overflow-hidden">
          <TabsList className="mx-4 mt-3 shrink-0">
            <TabsTrigger value="list" className="flex-1">
              <List className="h-4 w-4 mr-1" /> Items
            </TabsTrigger>
            <TabsTrigger value="map" className="flex-1">
              <Map className="h-4 w-4 mr-1" /> Map
            </TabsTrigger>
          </TabsList>
          <TabsContent value="list" className="flex-1 overflow-y-auto px-4 pb-4">
            <ItemList
              items={filteredItems}
              isLoading={isLoading}
              selectedItemId={selectedItemId}
              statusFilter={statusFilter}
              onStatusFilter={setStatusFilter}
              onSelectItem={handleSelectItem}
            />
          </TabsContent>
          <TabsContent value="map" className="flex-1">
            <ListMap
              items={items}
              selectedItemId={selectedItemId}
              onSelectItem={handleSelectItem}
              mapCenter={list?.mapCenter ?? { lat: 39.952, lng: -75.165 }}
              defaultZoom={list?.defaultZoom ?? 12}
            />
          </TabsContent>
        </Tabs>

        {selectedItem && (
          <div className="border-t h-64 overflow-y-auto shrink-0">
            <ListItemDetailDrawer
              item={selectedItem}
              onClose={() => setSelectedItemId(null)}
            />
          </div>
        )}
      </div>

      {/* Desktop: side-by-side */}
      <div className="hidden md:flex flex-1 overflow-hidden">
        {/* Left: items */}
        <div className="w-96 border-r flex flex-col overflow-hidden shrink-0">
          <ItemList
            items={filteredItems}
            isLoading={isLoading}
            selectedItemId={selectedItemId}
            statusFilter={statusFilter}
            onStatusFilter={setStatusFilter}
            onSelectItem={handleSelectItem}
            className="flex-1 overflow-y-auto p-3"
          />
        </div>

        {/* Center/right: detail drawer + map */}
        <div className="flex flex-1 overflow-hidden">
          {selectedItem && (
            <div className="w-80 border-r overflow-hidden shrink-0">
              <ListItemDetailDrawer
                item={selectedItem}
                onClose={() => setSelectedItemId(null)}
              />
            </div>
          )}
          <div className="flex-1 relative">
            <ListMap
              items={items}
              selectedItemId={selectedItemId}
              onSelectItem={handleSelectItem}
              mapCenter={list?.mapCenter ?? { lat: 39.952, lng: -75.165 }}
              defaultZoom={list?.defaultZoom ?? 12}
            />
          </div>
        </div>
      </div>

      <AddListItemDialog
        listId={listId!}
        open={showAddItem}
        onOpenChange={setShowAddItem}
        proximity={list?.mapCenter}
      />
    </div>
  );
}

interface ItemListProps {
  items: ReturnType<typeof useListItems>["data"] extends undefined
    ? never[]
    : NonNullable<ReturnType<typeof useListItems>["data"]>;
  isLoading: boolean;
  selectedItemId: string | null;
  statusFilter: ListItemStatus | "all";
  onStatusFilter: (f: ListItemStatus | "all") => void;
  onSelectItem: (id: string) => void;
  className?: string;
}

function ItemList({
  items,
  isLoading,
  selectedItemId,
  statusFilter,
  onStatusFilter,
  onSelectItem,
  className,
}: ItemListProps) {
  return (
    <div className={className}>
      {/* Status filters */}
      <div className="flex gap-1 flex-wrap mb-3">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => onStatusFilter(f.value)}
            className={`px-2 py-1 rounded-full text-xs font-medium transition-colors ${
              statusFilter === f.value
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : items.length > 0 ? (
        <div className="space-y-1">
          {items.map((item) => (
            <ListItemRow
              key={item.id}
              item={item}
              isSelected={item.id === selectedItemId}
              onClick={() => onSelectItem(item.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground text-sm">
          No items yet. Add something to your list!
        </div>
      )}
    </div>
  );
}
