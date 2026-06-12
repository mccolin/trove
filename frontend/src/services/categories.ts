import type { Category } from "@/types";
import { mockCategories } from "@/mock";

let categories = [...mockCategories];

export async function getCategoriesForList(listId: string): Promise<Category[]> {
  await delay();
  return categories.filter((c) => c.listId === listId);
}

export async function createCategory(
  data: Omit<Category, "id">
): Promise<Category> {
  await delay();
  const category: Category = {
    ...data,
    id: `cat-${Date.now()}`,
  };
  categories = [...categories, category];
  return category;
}

function delay(ms = 150) {
  return new Promise((res) => setTimeout(res, ms));
}
