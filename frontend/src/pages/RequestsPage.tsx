import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Stack,
  Text,
  SimpleGrid,
  Spinner,
  Center,
  Grid,
  Box,
  Portal,
  Dialog,
} from "@chakra-ui/react";
import { AppLayout } from "../layouts/AppLayout";
import { RequestCard } from "../components/requests/RequestCard";
import { RequestFilters } from "../components/requests/RequestFilters";
import { RequestToolbar } from "../components/requests/RequestToolbar";
import { RequestsPagination } from "../components/requests/RequestsPagination";
import { RequestMapView } from "../components/requests/RequestMapView";
import { requestService } from "../services/request.service";
import { useAuth } from "../contexts/useAuth";
import {
  type Request,
  type RequestFilters as Filters,
  type RequestType,
  RequestStatus,
} from "../types";

export const RequestsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[]>([]);
  const [mapRequests, setMapRequests] = useState<Request[]>([]);
  const [requestTypes, setRequestTypes] = useState<RequestType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [isFiltersDialogOpen, setIsFiltersDialogOpen] = useState(false);

  const { isVolunteer } = useAuth();

  const pageLimit = 9;

  const [filters, setFilters] = useState<Filters>({
    status: RequestStatus.ALL,
    page: 1,
    limit: pageLimit,
    sort: isVolunteer ? "start" : "created_at",
    order: isVolunteer ? "asc" : "desc",
  });

  const [mapFilters, setMapFilters] = useState<Filters>({
    status: filters.status,
    request_type_ids: filters.request_type_ids,
    min_reward: filters.min_reward,
    max_reward: filters.max_reward,
    limit: 40, // Higher limit for map view
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: pageLimit,
    total: 0,
    totalPages: 0,
  });

  // Fetch request types for volunteers
  useEffect(() => {
    if (isVolunteer) {
      fetchRequestTypes();
    }
  }, [isVolunteer]);

  const fetchRequestTypes = async () => {
    try {
      const response = await requestService.getRequestTypes();
      if (response.success) {
        setRequestTypes(response.data);
      }
    } catch (err) {
      console.error("Failed to fetch request types:", err);
    }
  };

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = isVolunteer
        ? await requestService.browseRequests(filters)
        : await requestService.getMyRequests(filters);

      setRequests(response.data);
      setPagination({
        page: response.page,
        limit: response.limit,
        total: response.total,
        totalPages: response.totalPages,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch requests");
      console.error("Failed to fetch requests:", err);
    } finally {
      setIsLoading(false);
    }
  }, [filters, isVolunteer]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  // Fetch requests for map view based on location
  const fetchMapRequests = useCallback(
    async (locationFilters: Filters) => {
      setIsMapLoading(true);

      try {
        const response = isVolunteer
          ? await requestService.browseRequests(locationFilters)
          : await requestService.getMyRequests(locationFilters);

        setMapRequests(response.data);
      } catch (err) {
        console.error("Failed to fetch map requests:", err);
      } finally {
        setIsMapLoading(false);
      }
    },
    [isVolunteer]
  );

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
    // Update map filters with non-location filters
    setMapFilters((prev) => ({
      ...prev,
      status: newFilters.status,
      request_type_ids: newFilters.request_type_ids,
      min_reward: newFilters.min_reward,
      max_reward: newFilters.max_reward,
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRequestClick = (requestId: number) => {
    navigate(`/requests/${requestId}`);
  };

  const pageTitle = isVolunteer ? "Browse Requests" : "My Requests";

  return (
    <AppLayout title={pageTitle} isVolunteer={isVolunteer}>
      <Container maxW="container.xl" mx="auto">
        <Grid
          templateColumns={{
            base: "1fr",
            lg: "280px 1fr",
          }}
          gap={6}
        >
          {/* Left Sidebar - Filters */}
          <Box display={{ base: "none", lg: "block" }}>
            <RequestFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              isVolunteer={isVolunteer}
              requestTypes={requestTypes}
            />
          </Box>

          {/* Main Content Area */}
          <Stack gap={0}>
            {/* Toolbar - View mode and sorting */}
            <RequestToolbar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              isVolunteer={isVolunteer}
              viewMode={viewMode}
              onViewModeChange={setViewMode}
              onOpenFilters={() => setIsFiltersDialogOpen(true)}
            />

            {/* Map View - Always mounted to persist map instance */}
            {isVolunteer && (
              <Box display={viewMode === "map" ? "block" : "none"}>
                <RequestMapView
                  requests={mapRequests}
                  isVolunteer={isVolunteer}
                  onRequestClick={handleRequestClick}
                  isLoading={isMapLoading}
                  uiFilters={mapFilters}
                  onLocationChange={fetchMapRequests}
                />
              </Box>
            )}

            {/* List View */}
            {viewMode === "list" && (
              <>
                {/* List-specific content states */}
                {isLoading ? (
                  <Center py={12}>
                    <Stack align="center" gap={4}>
                      <Spinner
                        size="xl"
                        color={isVolunteer ? "teal.500" : "coral.500"}
                      />
                      <Text color="gray.600">Loading requests...</Text>
                    </Stack>
                  </Center>
                ) : error ? (
                  <Center py={12}>
                    <Stack align="center" gap={4}>
                      <Text color="red.500" fontSize="lg">
                        {error}
                      </Text>
                      <Text color="gray.600">Please try again later.</Text>
                    </Stack>
                  </Center>
                ) : requests.length === 0 ? (
                  <Center py={12}>
                    <Stack align="center" gap={4}>
                      <Text color="gray.600" fontSize="lg">
                        No requests found
                      </Text>
                      <Text color="gray.500" fontSize="sm">
                        There are no requests matching the filters.
                      </Text>
                    </Stack>
                  </Center>
                ) : (
                  <>
                    <SimpleGrid
                      columns={{ base: 1, md: 2, xl: 3 }}
                      gap={6}
                      w="full"
                    >
                      {requests.map((request) => (
                        <RequestCard
                          key={request.id}
                          request={request}
                          isVolunteer={isVolunteer}
                          onClick={() => handleRequestClick(request.id)}
                        />
                      ))}
                    </SimpleGrid>

                    <RequestsPagination
                      currentPage={pagination.page}
                      totalPages={pagination.totalPages}
                      totalItems={pagination.total}
                      itemsPerPage={pagination.limit}
                      onPageChange={handlePageChange}
                      isVolunteer={isVolunteer}
                    />
                  </>
                )}
              </>
            )}
          </Stack>
        </Grid>
      </Container>

      {/* Mobile Filters Dialog */}
      <Portal>
        <Dialog.Root
          open={isFiltersDialogOpen}
          onOpenChange={(e) => setIsFiltersDialogOpen(e.open)}
          placement="center"
          size="lg"
        >
          <Dialog.Backdrop
            bg="blackAlpha.600"
            backdropFilter="blur(4px)"
            transition="all 0.2s"
          />
          <Dialog.Positioner>
            <Dialog.Content
              bg="white"
              borderRadius="2xl"
              boxShadow="2xl"
              maxW="500px"
              mx={4}
              maxH="90vh"
              overflowY="auto"
            >
              <RequestFilters
                filters={filters}
                onFiltersChange={(newFilters) => {
                  handleFiltersChange(newFilters);
                  setIsFiltersDialogOpen(false);
                }}
                isVolunteer={isVolunteer}
                requestTypes={requestTypes}
              />
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      </Portal>
    </AppLayout>
  );
};
