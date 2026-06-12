import type { User } from "@/types";

export const mockUsers: User[] = [
  {
    id: "user-1",
    name: "Alex Rivera",
    avatarUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Alex+Rivera",
  },
  {
    id: "user-2",
    name: "Sam Chen",
    avatarUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Sam+Chen",
  },
  {
    id: "user-3",
    name: "Jordan Park",
    avatarUrl: "https://api.dicebear.com/9.x/initials/svg?seed=Jordan+Park",
  },
];

export const currentUser = mockUsers[0];
