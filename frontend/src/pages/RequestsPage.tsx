import { useState, useEffect } from "react";
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
} from "@chakra-ui/react";
import { PageLayout } from "../components/layout/PageLayout";
import { AppHeader } from "../components/layout/AppHeader";
import { RequestCard } from "../components/requests/RequestCard";
import { RequestFilters } from "../components/requests/RequestFilters";
import { RequestToolbar } from "../components/requests/RequestToolbar";
import { RequestsPagination } from "../components/requests/RequestsPagination";
import { requestService } from "../services/request.service";
import { getBackgroundStyle } from "../theme/backgrounds";
import type { Request, RequestFilters as Filters, RequestType } from "../types";

export const RequestsPage = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<Request[]>([]);
  const [requestTypes, setRequestTypes] = useState<RequestType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "map">("list");

  // Mock user data - in real app, this would come from auth context
  // For now, we'll check if the token contains "volunteer" to determine user type
  //  TODO
  const isVolunteer =
    localStorage.getItem("auth_token")?.includes("volunteer") ?? true;

  const [filters, setFilters] = useState<Filters>({
    status: "all",
    page: 1,
    limit: 20,
    sort: isVolunteer ? "start" : "created_at",
    order: isVolunteer ? "asc" : "desc",
  });

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  // Fetch request types for volunteers
  useEffect(() => {
    if (isVolunteer) {
      fetchRequestTypes();
    }
  }, [isVolunteer]);

  // Fetch requests when filters change
  useEffect(() => {
    fetchRequests();
  }, [filters, isVolunteer]);

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

  const fetchRequests = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = isVolunteer
        ? await requestService.browseRequests(filters)
        : await requestService.getMyRequests(filters);

      if (response.success) {
        setRequests(response.data);
        setPagination(response.pagination);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch requests");
      console.error("Failed to fetch requests:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleRequestClick = (requestId: number) => {
    navigate(`/requests/${requestId}`);
  };

  const backgroundStyle = getBackgroundStyle(isVolunteer);

  const pageTitle = isVolunteer ? "Browse Requests" : "My Requests";

  return (
    <>
      <PageLayout backgroundStyle={backgroundStyle} pt={2} pb={6}>
        <AppHeader title={pageTitle} isVolunteer={isVolunteer} />
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
              />

              {/* Content */}
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
                      {filters.status === "all"
                        ? "There are no requests to display."
                        : `There are no ${filters.status} requests.`}
                    </Text>
                  </Stack>
                </Center>
              ) : (
                <>
                  {/* Request Cards Grid */}
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

                  {/* Pagination */}
                  {pagination.totalPages > 1 && (
                    <RequestsPagination
                      currentPage={pagination.page}
                      totalPages={pagination.totalPages}
                      totalItems={pagination.total}
                      onPageChange={handlePageChange}
                      isVolunteer={isVolunteer}
                    />
                  )}
                </>
              )}
            </Stack>
          </Grid>
        </Container>
      </PageLayout>
    </>
  );
};
