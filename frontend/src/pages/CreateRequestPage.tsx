import { useEffect, useState, type ElementType } from "react";
import { Container, Box, HStack, Text } from "@chakra-ui/react";
import { AppLayout } from "../layouts/AppLayout";
import { RequestForm } from "../components/requests/RequestForm";
import { requestService } from "../services/request.service";
import { toaster } from "../components/ui/toaster";
import type { CreateRequestData, RequestType } from "../types";
import { useNavigate } from "react-router-dom";
import { FaPlus } from "react-icons/fa";

export const CreateRequestPage = () => {
  const [requestTypes, setRequestTypes] = useState<RequestType[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const res = await requestService.getRequestTypes();
        setRequestTypes(res.data);
      } catch (err) {
        console.error("Failed to load request types", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleCreate = async (payload: CreateRequestData) => {
    try {
      const res = await requestService.createRequest(payload);
      if (res.success) {
        toaster.create({
          title: "Request created",
          description: "Your request has been created successfully",
          type: "success",
          duration: 5000,
        });
        navigate(`/requests/${res.data.id}`);
      }
    } catch (err) {
      console.error("Error creating request:", err);
      toaster.create({
        title: "Create failed",
        description: "Failed to create the request. Please try again.",
        type: "error",
        duration: 5000,
      });
    }
  };

  const handleCancel = () => {
    // Confirm discard
    const confirmed = window.confirm(
      "Discard this request? Your changes will be lost."
    );
    if (confirmed) navigate("/requests");
  };

  return (
    <AppLayout title="" headerVariant="navigation" onBack={() => navigate(-1)}>
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
          <HStack justify="flex-start" align="center" mb={6}>
            <Text fontSize="2xl" fontWeight="bold" color="gray.800">
              Create Request
            </Text>
          </HStack>
          {!loading && (
            <RequestForm
              mode="create"
              requestTypes={requestTypes}
              submitLabel="Create Request"
              cancelLabel="Discard"
              onSubmit={(p) => handleCreate(p as CreateRequestData)}
              onCancel={handleCancel}
              submitIcon={FaPlus as ElementType}
            />
          )}
        </Box>
      </Container>
    </AppLayout>
  );
};
