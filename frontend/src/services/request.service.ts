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
  HelpSeekerRequestDetails,
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
    const response = await api.get<PaginatedResponse<HelpSeekerRequest>>(
      "/help-seeker/requests",
      { params: filters }
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
    const response = await api.get<PaginatedResponse<VolunteerRequest>>(
      "/volunteer/requests",
      { params: filters }
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
    const base = response.data;

    // If the actor is a help-seeker, also fetch applications and merge them
    if (base?.success && !is_volunteer) {
      try {
        const appsResponse = await api.get<ApiResponse<RequestApplication[]>>(
          `/help-seeker/requests/${id}/applications`
        );

        if (appsResponse.data?.success) {
          // Merge applicants into the help-seeker request details
          const merged: HelpSeekerRequestDetails = {
            ...(base.data as HelpSeekerRequestDetails),
            applicants: appsResponse.data.data,
          };

          return { ...base, data: merged };
        }
      } catch (e) {
        console.error("Failed to fetch applications for request", id, e);
      }
    }

    return base;
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

  suggestRequestTypes: async (_data: {
    name: string;
    description: string;
  }): Promise<ApiResponse<SuggestedRequestType[]>> => {
    const response = await api.post<ApiResponse<SuggestedRequestType[]>>(
      "/help-seeker/requests/suggest-type",
      _data
    );
    return response.data;
  },
};
