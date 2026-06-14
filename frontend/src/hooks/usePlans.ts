import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getPlansForItem, createPlan, updatePlan, deletePlan } from "@/services/plans";
import type { Plan } from "@/types";

export function usePlans(listItemId: string) {
  return useQuery({
    queryKey: ["plans", listItemId],
    queryFn: () => getPlansForItem(listItemId),
    enabled: !!listItemId,
  });
}

export function useCreatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Plan, "id" | "createdAt" | "updatedAt">) =>
      createPlan(data),
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["plans", vars.listItemId] }),
  });
}

export function useUpdatePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      listItemId: string;
      data: Partial<Omit<Plan, "id" | "createdAt" | "updatedAt">>;
    }) => updatePlan(id, data),
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["plans", vars.listItemId] }),
  });
}

export function useDeletePlan() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      listItemId: _listItemId,
    }: {
      id: string;
      listItemId: string;
    }) => deletePlan(id),
    onSuccess: (_data, vars) =>
      qc.invalidateQueries({ queryKey: ["plans", vars.listItemId] }),
  });
}
