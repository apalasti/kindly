import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Stack, Spinner, Center, Text } from "@chakra-ui/react";
import { AppLayout } from "../layouts/AppLayout";
import { RequestDetails } from "../components/requests/RequestDetails";
import { requestService } from "../services/request.service";
import type { Request } from "../types";

export const RequestDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [request, setRequest] = useState<Request | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock user data - in real app, this would come from auth context
  const isVolunteer = false;
  const currentUserId = 5;

  useEffect(() => {
    const fetchRequestDetails = async () => {
      if (!id) {
        navigate("/requests");
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const requestId = parseInt(id, 10);
        if (isNaN(requestId)) {
          throw new Error("Invalid request ID");
        }

        // Fetch request details (includes applications for help-seekers)
        const requestResponse = await requestService.getRequestDetails(
          requestId,
          isVolunteer
        );

        if (requestResponse.success) {
          setRequest(requestResponse.data);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch request details"
        );
        console.error("Failed to fetch request details:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequestDetails();
  }, [id, isVolunteer, navigate]);

  if (isLoading) {
    return (
      <AppLayout
        title=""
        isVolunteer={isVolunteer}
        headerVariant="navigation"
        onBack={() => navigate(-1)}
      >
        <Container maxW="container.xl" mx="auto">
          <Center py={12}>
            <Stack align="center" gap={4}>
              <Spinner
                size="xl"
                color={isVolunteer ? "teal.500" : "coral.500"}
              />
              <Text color="gray.600">Loading request details...</Text>
            </Stack>
          </Center>
        </Container>
      </AppLayout>
    );
  }

  if (error || !request) {
    return (
      <AppLayout
        title=""
        isVolunteer={isVolunteer}
        headerVariant="navigation"
        onBack={() => navigate(-1)}
      >
        <Container maxW="container.xl" mx="auto">
          <Stack gap={0}>
            <Center py={12}>
              <Stack align="center" gap={4}>
                <Text color="red.500" fontSize="lg" fontWeight="bold">
                  {error || "Request not found"}
                </Text>
                <Text color="gray.600">
                  The request you're looking for doesn't exist or has been
                  removed.
                </Text>
              </Stack>
            </Center>
          </Stack>
        </Container>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title=""
      isVolunteer={isVolunteer}
      headerVariant="navigation"
      onBack={() => navigate(-1)}
    >
      <Container maxW="container.xl" mx="auto">
        <RequestDetails
          request={request}
          applications={request.applications || []}
          isVolunteer={isVolunteer}
          currentUserId={currentUserId}
        />
      </Container>
    </AppLayout>
  );
};
