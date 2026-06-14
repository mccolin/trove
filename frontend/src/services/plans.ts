import type { Plan } from "@/types";
import { mockPlans } from "@/mock";

let plans = [...mockPlans];

export async function getPlansForItem(listItemId: string): Promise<Plan[]> {
  await delay();
  return plans.filter((p) => p.listItemId === listItemId);
}

export async function createPlan(
  data: Omit<Plan, "id" | "createdAt" | "updatedAt">
): Promise<Plan> {
  await delay();
  const plan: Plan = {
    ...data,
    id: `plan-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  plans = [...plans, plan];
  return plan;
}

export async function updatePlan(
  id: string,
  data: Partial<Omit<Plan, "id" | "createdAt" | "updatedAt">>
): Promise<Plan> {
  await delay();
  const index = plans.findIndex((p) => p.id === id);
  if (index === -1) throw new Error("Plan not found");
  const updated: Plan = {
    ...plans[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  plans = plans.map((p) => (p.id === id ? updated : p));
  return updated;
}

export async function deletePlan(id: string): Promise<void> {
  await delay();
  plans = plans.filter((p) => p.id !== id);
}

function delay(ms = 150) {
  return new Promise((res) => setTimeout(res, ms));
}
