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
  request_types: RequestType[];
  application_count: number;
  created_at: string;
  updated_at: string;
  status: RequestStatus;
}

export interface HelpSeekerRequest extends BaseRequest {
  applications?: RequestApplication[];
}

export interface VolunteerRequest extends BaseRequest {
  application_status?: ApplicationStatus;
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
  status?: ApplicationStatus;
  applied_at: string;
}

export enum ApplicationStatus {
  ACCEPTED = "ACCEPTED",
  DECLINED = "DECLINED",
  PENDING = "PENDING",
  NOT_APPLIED = "NOT_APPLIED",
}

export enum RequestStatus {
  OPEN = "OPEN",
  COMPLETED = "COMPLETED",
  ALL = "ALL",
  APPLIED = "APPLIED",
  CLOSED = "CLOSED",
}

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
}
