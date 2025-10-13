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
import { Dialog } from "@chakra-ui/react/dialog";
import { FaSave, FaTrash } from "react-icons/fa";
import { AppLayout } from "../layouts/AppLayout";
import { requestService } from "../services/request.service";
import { toaster } from "../components/ui/toaster";
import { RequestForm } from "../components/requests/RequestForm";
import type { RequestFormValues } from "../components/requests/RequestForm";
import type { Request, RequestType, UpdateRequestData } from "../types";
// removed duplicate ElementType import (declared in first import)

// Reuse RequestForm for validation and UI

export const RequestEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [request, setRequest] = useState<Request | null>(null);
  const [requestTypes, setRequestTypes] = useState<RequestType[]>([]);

  const [initialValues, setInitialValues] =
    useState<Partial<RequestFormValues> | null>(null);

  // Check if user can edit

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

        // // Check if user can edit (creator only, and no applications)
        // const currentUserId = parseInt(localStorage.getItem("user_id") || "-1");
        // if (
        //   requestData.creator_id !== currentUserId ||
        //   requestData.applications_count > 0
        // ) {
        //   toaster.create({
        //     title: "Cannot edit request",
        //     description:
        //       requestData.applications_count > 0
        //         ? "You can't edit a request once applications have been submitted."
        //         : "You can only edit your own requests.",
        //     type: "error",
        //     duration: 5000,
        //   });
        //   navigate(`/requests/${id}`);
        //   return;
        // }

        // Load request types
        const typesResponse = await requestService.getRequestTypes();
        setRequestTypes(typesResponse.data);

        // Prepare initial values for RequestForm
        setInitialValues({
          name: requestData.name,
          description: requestData.description,
          location_address: requestData.location_address || "",
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
    } finally {
      // no-op
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!id) return;

    setIsDeleting(true);
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
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  // Type selection handled via TypeSelector

  if (isLoading || !request) {
    return (
      <AppLayout
        title=""
        headerVariant="navigation"
        onBack={() => navigate(-1)}
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
                onCancel={() => navigate(`/requests/${id}`)}
                leftAction={
                  <Button
                    onClick={() => setShowDeleteDialog(true)}
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

        {/* Delete Confirmation Dialog */}
        <Dialog.Root
          open={showDeleteDialog}
          onOpenChange={(e) => setShowDeleteDialog(e.open)}
        >
          <Dialog.Backdrop />
          <Dialog.Positioner
            position="fixed"
            inset={0}
            display="flex"
            alignItems="center"
            justifyContent="center"
            p={4}
            zIndex={1700}
          >
            <Dialog.Content
              w="full"
              maxW="480px"
              borderRadius="2xl"
              boxShadow="2xl"
              bg="white"
            >
              <Dialog.Header px={6} pt={6} pb={2}>
                <Dialog.Title>Delete Request</Dialog.Title>
              </Dialog.Header>
              <Dialog.Body px={6} py={3}>
                <Text>
                  Are you sure you want to delete this request? This action
                  cannot be undone.
                </Text>
              </Dialog.Body>
              <Dialog.Footer px={6} pb={6} pt={2}>
                <HStack justify="flex-end" gap={3} w="full">
                  <Button
                    variant="outline"
                    onClick={() => setShowDeleteDialog(false)}
                    px={4}
                    py={2}
                  >
                    Cancel
                  </Button>
                  <Button
                    bg="red.500"
                    _hover={{ bg: "red.700" }}
                    color="white"
                    onClick={handleDelete}
                    loading={isDeleting}
                    px={4}
                    py={2}
                  >
                    Delete
                  </Button>
                </HStack>
              </Dialog.Footer>
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      </Container>
    </AppLayout>
  );
};
