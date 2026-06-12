import { useState } from "react";
import { Plus, Gem } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ListCard } from "@/features/lists/ListCard";
import { CreateListDialog } from "@/features/lists/CreateListDialog";
import { useLists } from "@/hooks/useLists";

export default function ListsPage() {
  const [showCreate, setShowCreate] = useState(false);
  const { data: lists, isLoading } = useLists();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Gem className="h-5 w-5 text-primary" />
          <span className="font-semibold text-lg">Trove</span>
        </div>
        <Button size="sm" onClick={() => setShowCreate(true)}>
          <Plus className="h-4 w-4 mr-1" />
          New List
        </Button>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">Your Lists</h1>
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-52 rounded-lg bg-muted animate-pulse" />
            ))}
          </div>
        ) : lists && lists.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {lists.map((list) => (
              <ListCard key={list.id} list={list} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-muted-foreground">
            <Gem className="h-12 w-12 mx-auto mb-4 opacity-30" />
            <p className="text-lg font-medium">No lists yet</p>
            <p className="text-sm mt-1">Create your first list to get started.</p>
            <Button className="mt-4" onClick={() => setShowCreate(true)}>
              <Plus className="h-4 w-4 mr-1" />
              New List
            </Button>
          </div>
        )}
      </main>

      <CreateListDialog open={showCreate} onOpenChange={setShowCreate} />
    </div>
  );
}
