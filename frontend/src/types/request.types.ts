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
  applicants?: RequestApplication[];
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
  volunteer: {
    id: number;
    first_name: string;
    last_name: string;
    avg_rating?: number;
  };
  acceptance_status?: AcceptanceStatus;
  applied_at: string;
}

export const AcceptanceStatus = {
  ACCEPTED: "ACCEPTED",
  DECLINED: "DECLINED",
  PENDING: "PENDING",
} as const;
export type AcceptanceStatus =
  (typeof AcceptanceStatus)[keyof typeof AcceptanceStatus];

export const RequestStatus = {
  OPEN: "OPEN",
  COMPLETED: "COMPLETED",
  ALL: "ALL",
  APPLIED: "APPLIED",
} as const;
export type RequestStatus = (typeof RequestStatus)[keyof typeof RequestStatus];

export interface RequestFilters {
  status?: RequestStatus;
  request_type_ids?: number[];
  location_lat?: number;
  location_lng?: number;
  radius?: number;
  min_reward?: number;
  max_reward?: number;
  page?: number;
  limit?: number;
  sort?: "CREATED_AT" | "START" | "REWARD";
  order?: "ASC" | "DESC";
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
