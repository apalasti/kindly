import type { User } from "./user.types";

export interface RequestType {
  id: number;
  name: string;
}

export interface Request {
  id: number;
  name: string;
  description: string;
  longitude: number;
  latitude: number;
  start: string;
  end: string;
  reward: number;
  creator_id: number;
  creator?: User;
  is_completed: boolean;
  request_types: RequestType[];
  applications_count: number;
  accepted_volunteer?: User | null;
  has_applied?: boolean; // For volunteer view
  created_at: string;
  updated_at: string;
}

export interface RequestApplication {
  user: {
    id: number;
    name: string;
    avg_rating?: number;
  };
  is_accepted: boolean;
  applied_at: string;
}

export type RequestStatus = "open" | "completed" | "all" | "applied";

export interface RequestFilters {
  status?: RequestStatus;
  type?: number; // Request type ID
  location_lat?: number;
  location_lng?: number;
  radius?: number;
  min_reward?: number;
  max_reward?: number;
  page?: number;
  limit?: number;
  sort?: "created_at" | "start" | "reward";
  order?: "asc" | "desc";
}

export interface CreateRequestData {
  name: string;
  description: string;
  longitude: number;
  latitude: number;
  start: string;
  end: string;
  reward: number;
  request_type_ids: number[];
}

export type UpdateRequestData = Partial<CreateRequestData>;
