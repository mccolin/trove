import type { Plan } from "@/types";

export const mockPlans: Plan[] = [
  {
    id: "plan-1",
    listItemId: "item-6",
    date: "2026-07-18",
    time: "17:30",
    durationMinutes: 240,
    attendeeIds: ["user-1", "user-2"],
    notes: "Meet at the Broad Street Line at 5:30, get there early for batting practice. Grab cheesesteaks at the park.",
    createdAt: "2024-05-15T00:00:00Z",
    updatedAt: "2024-05-15T00:00:00Z",
  },
  {
    id: "plan-2",
    listItemId: "item-9",
    date: "2026-08-08",
    time: "11:00",
    durationMinutes: 720,
    attendeeIds: ["user-1", "user-2", "user-3"],
    notes: "Drive down Saturday morning, walk the boards, dinner somewhere on Cookman Ave, then the Stone Pony show at night. Stay at the Berkeley Oceanfront.",
    createdAt: "2024-05-20T00:00:00Z",
    updatedAt: "2024-05-20T00:00:00Z",
  },
  {
    id: "plan-3",
    listItemId: "item-10",
    date: "2026-08-08",
    time: "19:00",
    durationMinutes: 180,
    attendeeIds: ["user-1", "user-2", "user-3"],
    notes: "Tickets in hand. Meet at the Summer Stage entrance by 7.",
    createdAt: "2024-05-20T00:00:00Z",
    updatedAt: "2024-05-20T00:00:00Z",
  },
];
