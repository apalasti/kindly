import type { User } from "./user.types";

export interface RequestType {
  id: number;
  name: string;
}

interface BaseRequest {
  id: number;
  name: string;
  description: string;
  longitude: number;
  latitude: number;
  address?: string;
  start: string;
  end: string;
  reward: number;
  is_completed: boolean;
  request_types: RequestType[];
  applications_count: number;
  created_at: string;
  updated_at: string;
}

export interface HelpSeekerRequest extends BaseRequest {
  applications?: RequestApplication[];
}

export interface VolunteerRequest extends BaseRequest {
  acceptance_status?: AcceptanceStatus;
}

export interface VolunteerRequestDetails extends VolunteerRequest {
  creator: User;
}

export type HelpSeekerRequestDetails = HelpSeekerRequest;

export type Request = HelpSeekerRequest | VolunteerRequest;

export type RequestDetails = HelpSeekerRequestDetails | VolunteerRequestDetails;

export interface RequestApplication {
  user: {
    id: number;
    first_name: string;
    last_name: string;
    avg_rating?: number;
  };
  acceptance_status?: AcceptanceStatus;
  applied_at: string;
}

export type AcceptanceStatus = "accepted" | "declined" | "pending";

export type RequestStatus = "open" | "completed" | "all" | "applied";

export interface RequestFilters {
  status?: RequestStatus;
  type?: number;
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
  address?: string;
  start: string;
  end: string;
  reward: number;
  request_type_ids: number[];
}

export interface UpdateRequestData {
  name?: string;
  description?: string;
  longitude?: number;
  latitude?: number;
  address?: string;
  start?: string;
  end?: string;
  reward?: number;
  request_type_ids?: number[];
}

export interface SuggestedRequestType {
  id: number;
  name: string;
  confidence: number;
  reasoning?: string;
}
