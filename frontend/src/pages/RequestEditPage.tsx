import { useState, useEffect, type ElementType } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Stack,
  Text,
  HStack,
  Center,
  Spinner,
  Icon,
} from "@chakra-ui/react";
import { FaSave, FaTrash } from "react-icons/fa";
import { AppLayout } from "../layouts/AppLayout";
import { requestService } from "../services/request.service";
import { toaster } from "../components/ui/toaster";
import { RequestForm } from "../components/requests/RequestForm";
import type { RequestFormValues } from "../components/requests/RequestForm";
import type { Request, RequestType, UpdateRequestData } from "../types";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { useConfirmDialog } from "../hooks/useConfirmDialog";

export const RequestEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [request, setRequest] = useState<Request | null>(null);
  const [requestTypes, setRequestTypes] = useState<RequestType[]>([]);
  const { confirm, dialogProps } = useConfirmDialog();

  const [initialValues, setInitialValues] =
    useState<Partial<RequestFormValues> | null>(null);

  // Load request data
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      setIsLoading(true);
      try {
        // Load request details
        const requestResponse = await requestService.getRequestDetails(
          parseInt(id),
          false
        );
        const requestData = requestResponse.data;
        setRequest(requestData);

        // Load request types
        const typesResponse = await requestService.getRequestTypes();
        setRequestTypes(typesResponse.data);

        // Prepare initial values for RequestForm
        setInitialValues({
          name: requestData.name,
          description: requestData.description,
          address: requestData.address || "",
          location_coordinates: {
            longitude: requestData.longitude,
            latitude: requestData.latitude,
          },
          start: new Date(requestData.start),
          end: new Date(requestData.end),
          reward: requestData.reward,
          request_type_ids: requestData.request_types.map((t) => t.id),
        });
      } catch (error) {
        console.error("Error loading request:", error);
        toaster.create({
          title: "Error loading request",
          description: "Failed to load request details",
          type: "error",
          duration: 5000,
        });
        navigate("/requests");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, navigate]);

  const onSubmit = async (payload: UpdateRequestData) => {
    if (!id) return;

    const confirmed = await confirm({
      title: "Update Request?",
      message: "Are you sure you want to save these changes to your request?",
      confirmLabel: "Save Changes",
      cancelLabel: "Keep Editing",
      variant: "info",
      isVolunteer: false,
    });

    if (!confirmed) return;

    try {
      await requestService.updateRequest(parseInt(id), payload);
      toaster.create({
        title: "Request updated",
        description: "Your request has been updated successfully",
        type: "success",
        duration: 5000,
      });
      navigate(`/requests/${id}`);
    } catch (error) {
      console.error("Error updating request:", error);
      toaster.create({
        title: "Update failed",
        description: "Failed to update the request. Please try again.",
        type: "error",
        duration: 5000,
      });
    }
  };

  const handleCancel = async () => {
    const confirmed = await confirm({
      title: "Discard Changes?",
      message: "Your changes will be lost. This action cannot be undone.",
      confirmLabel: "Discard",
      cancelLabel: "Keep Editing",
      variant: "danger",
    });
    if (confirmed) navigate(`/requests/${id}`);
  };

  const handleDelete = async () => {
    if (!id) return;

    const confirmed = await confirm({
      title: "Delete Request?",
      message:
        "Are you sure you want to delete this request? This action cannot be undone.",
      confirmLabel: "Delete",
      cancelLabel: "Cancel",
      variant: "danger",
    });

    if (!confirmed) return;

    try {
      await requestService.deleteRequest(parseInt(id));

      toaster.create({
        title: "Request deleted",
        description: "Your request has been deleted successfully",
        type: "success",
        duration: 5000,
      });

      navigate("/requests");
    } catch (error) {
      console.error("Error deleting request:", error);
      toaster.create({
        title: "Delete failed",
        description: "Failed to delete the request. Please try again.",
        type: "error",
        duration: 5000,
      });
    }
  };

  // Type selection handled via TypeSelector

  if (isLoading || !request) {
    return (
      <AppLayout
        title=""
        headerVariant="navigation"
        onBack={() => navigate(-1)}
        isVolunteer={false}
      >
        <Center py={12}>
          <Stack align="center" gap={4}>
            <Spinner size="xl" color="coral.500" />
            <Text color="gray.600">Loading...</Text>
          </Stack>
        </Center>
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title=""
      headerVariant="navigation"
      onBack={() => navigate(`/requests/${id}`)}
      isVolunteer={false}
    >
      <Container maxW="container.xl" mx="auto">
        <Box
          bg="white"
          p={8}
          borderRadius="2xl"
          boxShadow="xl"
          w="full"
          maxW="900px"
          mx="auto"
        >
          <Stack gap={6}>
            <HStack justify="flex-start" align="center">
              <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                Edit Request
              </Text>
            </HStack>
            {initialValues && (
              <RequestForm
                mode="edit"
                initialValues={initialValues}
                requestTypes={requestTypes}
                submitLabel="Save Changes"
                cancelLabel="Cancel"
                onSubmit={(p) => onSubmit(p as UpdateRequestData)}
                submitIcon={FaSave as ElementType}
                onCancel={handleCancel}
                leftAction={
                  <Button
                    onClick={handleDelete}
                    bg="red.500"
                    _hover={{ bg: "red.600" }}
                    color="white"
                    px={5}
                    py={4}
                  >
                    <Icon as={FaTrash as ElementType} mr={2} /> Delete Request
                  </Button>
                }
              />
            )}
          </Stack>
        </Box>
      </Container>
      <ConfirmDialog isVolunteer={false} {...dialogProps} />
    </AppLayout>
  );
};
