import { api } from "./api";
import type {
  Request,
  HelpSeekerRequest,
  VolunteerRequest,
  RequestDetails,
  RequestType,
  RequestFilters,
  CreateRequestData,
  UpdateRequestData,
  RequestApplication,
  SuggestedRequestType,
  ApiResponse,
  PaginatedResponse,
} from "../types";

export const requestService = {
  rateRequestParticipant: async (
    requestId: number,
    rating: number,
    actor: { is_volunteer: boolean }
  ): Promise<ApiResponse<{ request_id: number; rating: number }>> => {
    const endpoint = actor.is_volunteer
      ? `/volunteer/requests/${requestId}/rate-seeker`
      : `/help-seeker/requests/${requestId}/rate-volunteer`;

    const response = await api.post<
      ApiResponse<{ request_id: number; rating: number }>
    >(endpoint, { rating });
    return response.data;
  },

  getRequestTypes: async (): Promise<ApiResponse<RequestType[]>> => {
    const response = await api.get<ApiResponse<RequestType[]>>(
      "/common/request-types"
    );
    return response.data;
  },

  getMyRequests: async (
    filters: RequestFilters
  ): Promise<PaginatedResponse<HelpSeekerRequest>> => {
    const response = await api.post<PaginatedResponse<HelpSeekerRequest>>(
      "/help-seeker/requests",
      filters
    );
    return response.data;
  },

  createRequest: async (
    data: CreateRequestData
  ): Promise<ApiResponse<Request>> => {
    const response = await api.post<ApiResponse<Request>>(
      "/help-seeker/requests/new",
      data
    );
    return response.data;
  },

  updateRequest: async (
    id: number,
    data: UpdateRequestData
  ): Promise<ApiResponse<Request>> => {
    const response = await api.put<ApiResponse<Request>>(
      `/help-seeker/requests/${id}`,
      data
    );
    return response.data;
  },

  deleteRequest: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(
      `/help-seeker/requests/${id}`
    );
    return response.data;
  },

  completeRequest: async (id: number): Promise<ApiResponse<void>> => {
    const response = await api.patch<ApiResponse<void>>(
      `/help-seeker/requests/${id}/complete`
    );
    return response.data;
  },

  getApplications: async (
    requestId: number
  ): Promise<ApiResponse<RequestApplication[]>> => {
    const response = await api.get<ApiResponse<RequestApplication[]>>(
      `/help-seeker/requests/${requestId}/applications`
    );
    return response.data;
  },

  acceptApplication: async (
    requestId: number,
    userId: number
  ): Promise<
    ApiResponse<{ request_id: number; user_id: number; is_accepted: boolean }>
  > => {
    const response = await api.patch<
      ApiResponse<{ request_id: number; user_id: number; is_accepted: boolean }>
    >(`/help-seeker/requests/${requestId}/applications/${userId}/accept`);
    return response.data;
  },

  browseRequests: async (
    filters: RequestFilters
  ): Promise<PaginatedResponse<VolunteerRequest>> => {
    const response = await api.post<PaginatedResponse<VolunteerRequest>>(
      "/volunteer/requests",
      filters
    );
    return response.data;
  },

  getRequestDetails: async (
    id: number,
    is_volunteer: boolean
  ): Promise<ApiResponse<RequestDetails>> => {
    const endpoint = is_volunteer
      ? `/volunteer/requests/${id}`
      : `/help-seeker/requests/${id}`;

    const response = await api.get<ApiResponse<RequestDetails>>(endpoint);
    return response.data;
  },

  applyToRequest: async (
    requestId: number
  ): Promise<
    ApiResponse<{
      request_id: number;
      user_id: number;
      is_accepted: boolean;
      applied_at: string;
    }>
  > => {
    const response = await api.post<
      ApiResponse<{
        request_id: number;
        user_id: number;
        is_accepted: boolean;
        applied_at: string;
      }>
    >(`/volunteer/requests/${requestId}/application`);
    return response.data;
  },

  withdrawApplication: async (
    requestId: number
  ): Promise<ApiResponse<void>> => {
    const response = await api.delete<ApiResponse<void>>(
      `/volunteer/requests/${requestId}/application`
    );
    return response.data;
  },

  suggestRequestTypes: async (_data: {
    name: string;
    description: string;
  }): Promise<ApiResponse<SuggestedRequestType[]>> => {
    // Calls backend to get suggested request types based on name/description
    const response = await api.post<ApiResponse<SuggestedRequestType[]>>(
      "/help-seeker/requests/suggest-type",
      _data
    );
    return response.data;
  },
};
