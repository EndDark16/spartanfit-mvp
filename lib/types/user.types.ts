export interface UpdateUserProfileDTO {
  name?: string;
  age?: number | null;
  weight?: number | null;
  height?: number | null;
  activityIndex?: number | null;
  goal?: string;
  gymIds?: string[];
  roleId?: string | null;
}

export interface UserProfileResponse {
  id: string;
  name: string;
  email: string;
  age: number | null;
  weight: number | null;
  height: number | null;
  activityIndex: number | null;
  goal: string;
  status: "ACTIVE" | "SUSPENDED";
  roleId: string | null;
  role: { name: string } | null;
  userGyms: { gymLocation: { id: string; name: string } }[];
}
