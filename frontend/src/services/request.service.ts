import { api } from "./api";
import { handleApiError } from "../utils/error";
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
    try {
      const endpoint = actor.is_volunteer
        ? `/volunteer/requests/${requestId}/rate-seeker`
        : `/help-seeker/requests/${requestId}/rate-volunteer`;

      const response = await api.post<
        ApiResponse<{ request_id: number; rating: number }>
      >(endpoint, { rating });
      return response.data;
    } catch (err: unknown) {
      throw new Error(handleApiError(err));
    }
  },

  getRequestTypes: async (): Promise<ApiResponse<RequestType[]>> => {
    try {
      const response = await api.get<ApiResponse<RequestType[]>>(
        "/common/request-types"
      );
      return response.data;
    } catch (err: unknown) {
      throw new Error(handleApiError(err));
    }
  },

  getMyRequests: async (
    filters: RequestFilters
  ): Promise<PaginatedResponse<HelpSeekerRequest>> => {
    try {
      const response = await api.get<PaginatedResponse<HelpSeekerRequest>>(
        "/help-seeker/requests",
        { params: filters }
      );
      return response.data;
    } catch (err: unknown) {
      throw new Error(handleApiError(err));
    }
  },

  createRequest: async (
    data: CreateRequestData
  ): Promise<ApiResponse<Request>> => {
    try {
      const response = await api.post<ApiResponse<Request>>(
        "/help-seeker/requests",
        data
      );
      return response.data;
    } catch (err: unknown) {
      throw new Error(handleApiError(err));
    }
  },

  updateRequest: async (
    id: number,
    data: UpdateRequestData
  ): Promise<ApiResponse<Request>> => {
    try {
      const response = await api.put<ApiResponse<Request>>(
        `/help-seeker/requests/${id}`,
        data
      );
      return response.data;
    } catch (err: unknown) {
      throw new Error(handleApiError(err));
    }
  },

  deleteRequest: async (id: number): Promise<ApiResponse<void>> => {
    try {
      const response = await api.delete<ApiResponse<void>>(
        `/help-seeker/requests/${id}`
      );
      return response.data;
    } catch (err: unknown) {
      throw new Error(handleApiError(err));
    }
  },

  completeRequest: async (id: number): Promise<ApiResponse<void>> => {
    try {
      const response = await api.patch<ApiResponse<void>>(
        `/help-seeker/requests/${id}/complete`
      );
      return response.data;
    } catch (err: unknown) {
      throw new Error(handleApiError(err));
    }
  },

  getApplications: async (
    requestId: number
  ): Promise<ApiResponse<RequestApplication[]>> => {
    try {
      const response = await api.get<ApiResponse<RequestApplication[]>>(
        `/help-seeker/requests/${requestId}/applications`
      );
      return response.data;
    } catch (err: unknown) {
      throw new Error(handleApiError(err));
    }
  },

  acceptApplication: async (
    requestId: number,
    userId: number
  ): Promise<
    ApiResponse<{ request_id: number; user_id: number; is_accepted: boolean }>
  > => {
    try {
      const response = await api.patch<
        ApiResponse<{
          request_id: number;
          user_id: number;
          is_accepted: boolean;
        }>
      >(`/help-seeker/requests/${requestId}/applications/${userId}/accept`);
      return response.data;
    } catch (err: unknown) {
      throw new Error(handleApiError(err));
    }
  },

  browseRequests: async (
    filters: RequestFilters
  ): Promise<PaginatedResponse<VolunteerRequest>> => {
    try {
      const response = await api.get<PaginatedResponse<VolunteerRequest>>(
        "/volunteer/requests",
        { params: filters }
      );
      return response.data;
    } catch (err: unknown) {
      throw new Error(handleApiError(err));
    }
  },

  getRequestDetails: async (
    id: number,
    is_volunteer: boolean
  ): Promise<ApiResponse<RequestDetails>> => {
    try {
      const endpoint = is_volunteer
        ? `/volunteer/requests/${id}`
        : `/help-seeker/requests/${id}`;

      const response = await api.get<ApiResponse<RequestDetails>>(endpoint);
      return response.data;
    } catch (err: unknown) {
      throw new Error(handleApiError(err));
    }
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
    try {
      const response = await api.post<
        ApiResponse<{
          request_id: number;
          user_id: number;
          is_accepted: boolean;
          applied_at: string;
        }>
      >(`/volunteer/requests/${requestId}/application`);
      return response.data;
    } catch (err: unknown) {
      throw new Error(handleApiError(err));
    }
  },

  suggestRequestTypes: async (_data: {
    description: string;
  }): Promise<ApiResponse<SuggestedRequestType[]>> => {
    try {
      const response = await api.post<ApiResponse<SuggestedRequestType[]>>(
        "/help-seeker/requests/generate-categories",
        _data
      );
      return response.data;
    } catch (err: unknown) {
      throw new Error(handleApiError(err));
    }
  },
};
