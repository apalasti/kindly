import { useState, useEffect, type ElementType } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Box,
  Button,
  Container,
  Input,
  Textarea,
  Stack,
  Text,
  HStack,
  Icon,
  Separator,
  SimpleGrid,
  Badge,
  Center,
  Spinner,
  VStack,
  Wrap,
} from "@chakra-ui/react";
import { Field } from "@chakra-ui/react/field";
import { Dialog } from "@chakra-ui/react/dialog";
import { FaSave, FaTrash, FaMagic } from "react-icons/fa";
import { AppLayout } from "../layouts/AppLayout";
import { requestService } from "../services/request.service";
import { toaster } from "../components/ui/toaster";
import { MapboxLocationPicker } from "../components/ui/mapbox-location-picker";
import { TypeSelector } from "../components/ui/type-selector";
import { DateTimePicker } from "../components/ui/date-time-picker";
import type { Request, RequestType, UpdateRequestData } from "../types";
// removed duplicate ElementType import (declared in first import)

// Validation schema
const editRequestSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(200, "Name is too long"),
    description: z
      .string()
      .min(1, "Description is required")
      .max(1000, "Description is too long"),
    location_address: z.string().min(1, "Location is required"),
    location_coordinates: z.object({
      longitude: z.number(),
      latitude: z.number(),
    }),
    start: z.date().refine((date) => date > new Date(), {
      message: "Start date must be in the future",
    }),
    end: z.date(),
    reward: z.number().min(0, "Reward must be 0 or positive"),
    request_type_ids: z
      .array(z.number())
      .min(1, "At least one type is required"),
  })
  .refine((data) => data.end > data.start, {
    message: "End date must be after start date",
    path: ["end"],
  });

type EditRequestFormData = z.infer<typeof editRequestSchema>;

interface AIGeneratedType {
  id: number;
  name: string;
  confidence: number;
}

export const RequestEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGeneratingTypes, setIsGeneratingTypes] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [request, setRequest] = useState<Request | null>(null);
  const [requestTypes, setRequestTypes] = useState<RequestType[]>([]);
  const [aiGeneratedTypes, setAiGeneratedTypes] = useState<AIGeneratedType[]>(
    []
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
    reset,
  } = useForm<EditRequestFormData>({
    resolver: zodResolver(editRequestSchema),
    mode: "onBlur",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });

  const watchedName = watch("name");
  const watchedDescription = watch("description");
  const watchedTypes = watch("request_type_ids") || [];

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

        // Set form values
        reset({
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
  }, [id, navigate, reset]);

  // Type collection handled inside TypeSelector

  // Generate AI types
  const handleGenerateTypes = async () => {
    if (!watchedName || !watchedDescription) return;

    setIsGeneratingTypes(true);
    try {
      const response = await requestService.suggestRequestTypes({
        name: watchedName,
        description: watchedDescription,
      });

      setAiGeneratedTypes(response.data);

      const types = response.data.map((t: AIGeneratedType) => t.id);

      if (types.length > 0) {
        setValue("request_type_ids", types);
      }

      toaster.create({
        title: "Types generated",
        description: `Found ${response.data.length} matching types`,
        type: "success",
        duration: 3000,
      });
    } catch (error) {
      console.error("Error generating types:", error);
      toaster.create({
        title: "Generation failed",
        description: "Could not generate types. Please select manually.",
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsGeneratingTypes(false);
    }
  };

  // Handle form submission
  const onSubmit = async (data: EditRequestFormData) => {
    if (!id) return;

    setIsSaving(true);
    try {
      const updateData: UpdateRequestData = {
        name: data.name,
        description: data.description,
        longitude: data.location_coordinates.longitude,
        latitude: data.location_coordinates.latitude,
        location_address: data.location_address,
        start: data.start.toISOString(),
        end: data.end.toISOString(),
        reward: data.reward,
        request_type_ids: data.request_type_ids,
      };

      await requestService.updateRequest(parseInt(id), updateData);

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
      setIsSaving(false);
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
          as="form"
          onSubmit={handleSubmit(onSubmit)}
          bg="white"
          p={8}
          borderRadius="2xl"
          boxShadow="xl"
          w="full"
          maxW="900px"
          mx="auto"
        >
          <Stack gap={6}>
            {/* Card Header */}
            <HStack justify="flex-start" align="center">
              <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                Edit Request
              </Text>
            </HStack>
            {/* Name */}
            <Field.Root invalid={!!errors.name}>
              <Field.Label>Request Name</Field.Label>
              <Input
                {...register("name")}
                placeholder="Enter a descriptive name for your request"
                size="md"
                px={5}
                py={4}
              />
              {errors.name && (
                <Field.ErrorText>{errors.name.message}</Field.ErrorText>
              )}
            </Field.Root>

            {/* Description */}
            <Field.Root invalid={!!errors.description}>
              <Field.Label>Description</Field.Label>
              <Textarea
                {...register("description")}
                placeholder="Provide details about what you need help with"
                rows={4}
                minHeight={"100px"}
                maxHeight={"200px"}
                size="md"
                px={5}
                py={4}
              />
              {errors.description && (
                <Field.ErrorText>{errors.description.message}</Field.ErrorText>
              )}
            </Field.Root>

            <Separator />

            {/* Request Types */}
            <Field.Root invalid={!!errors.request_type_ids}>
              <Field.Label mb={4}>
                <HStack justify="space-between">
                  <VStack align="start" gap={3}>
                    <Text>Request Types</Text>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={handleGenerateTypes}
                      loading={isGeneratingTypes}
                      disabled={!watchedName || !watchedDescription}
                      px={4}
                      py={2}
                    >
                      <Icon as={FaMagic as ElementType} mr={2} />
                      Generate with AI
                    </Button>
                  </VStack>
                </HStack>
              </Field.Label>

              {/* AI Generated Suggestions */}
              {aiGeneratedTypes.length > 0 && (
                <Box p={4} bg="gray.100" borderRadius="lg" mb={4}>
                  <VStack align="start" gap={2}>
                    <Text fontSize="sm" fontWeight="semibold">
                      AI Suggestions:
                    </Text>
                    <Wrap gap={2}>
                      {aiGeneratedTypes.map((type) => (
                        <Badge
                          key={type.id}
                          px={2}
                          py={1.5}
                          borderRadius="md"
                          bg="transparent"
                        >
                          {type.name}
                          <Text as="span" fontWeight="semibold" ml={1}>
                            ({Math.round(type.confidence * 100)}%)
                          </Text>
                        </Badge>
                      ))}
                    </Wrap>
                  </VStack>
                </Box>
              )}

              {/* Type Selection - shared style */}
              <TypeSelector
                items={requestTypes}
                value={watchedTypes}
                onChange={(ids) => setValue("request_type_ids", ids)}
                placeholder="Select types..."
              />

              {errors.request_type_ids && (
                <Field.ErrorText>
                  {errors.request_type_ids.message}
                </Field.ErrorText>
              )}
            </Field.Root>

            <Separator />

            {/* Location */}
            <Field.Root invalid={!!errors.location_address}>
              <Field.Label>Location</Field.Label>
              <Controller
                name="location_address"
                control={control}
                render={({ field }) => (
                  <MapboxLocationPicker
                    value={field.value}
                    onChange={(address, coordinates) => {
                      field.onChange(address);
                      setValue("location_coordinates", coordinates);
                    }}
                    placeholder="Search for an address"
                    initialCoordinates={watch("location_coordinates")}
                  />
                )}
              />
              {errors.location_address && (
                <Field.ErrorText>
                  {errors.location_address.message}
                </Field.ErrorText>
              )}
            </Field.Root>

            <Separator />

            {/* Schedule */}
            <SimpleGrid columns={2} gap={4}>
              <Field.Root invalid={!!errors.start}>
                <Field.Label>Start Date & Time</Field.Label>
                <Controller
                  name="start"
                  control={control}
                  render={({ field }) => (
                    <DateTimePicker
                      selected={field.value}
                      onChange={field.onChange}
                      minDate={new Date()}
                      placeholderText="Select start date and time"
                    />
                  )}
                />
                {errors.start && (
                  <Field.ErrorText>{errors.start.message}</Field.ErrorText>
                )}
              </Field.Root>

              <Field.Root invalid={!!errors.end}>
                <Field.Label>End Date & Time</Field.Label>
                <Controller
                  name="end"
                  control={control}
                  render={({ field }) => (
                    <DateTimePicker
                      selected={field.value}
                      onChange={field.onChange}
                      minDate={watch("start") || new Date()}
                      placeholderText="Select end date and time"
                    />
                  )}
                />
                {errors.end && (
                  <Field.ErrorText>{errors.end.message}</Field.ErrorText>
                )}
              </Field.Root>
            </SimpleGrid>

            <Separator />

            {/* Reward */}
            <Field.Root invalid={!!errors.reward}>
              <Field.Label>Reward ($)</Field.Label>
              <Input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                placeholder="Enter amount"
                size="md"
                px={5}
                py={4}
                w="full"
                maxW="200px"
                {...register("reward", {
                  valueAsNumber: true,
                  setValueAs: (v) => (v === "" || v === null ? 0 : parseInt(v)),
                })}
              />
              {errors.reward && (
                <Field.ErrorText>{errors.reward.message}</Field.ErrorText>
              )}
            </Field.Root>

            {/* Action Row: Delete left, Cancel/Save right */}
            <HStack justify="space-between" align="center" pt={4} w="full">
              <Button
                onClick={() => setShowDeleteDialog(true)}
                bg="red.500"
                _hover={{ bg: "red.600" }}
                color="white"
                px={5}
                py={4}
              >
                <Icon as={FaTrash as ElementType} mr={2} />
                Delete Request
              </Button>
              <HStack gap={4}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/requests/${id}`)}
                  px={5}
                  py={4}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  bg="coral.600"
                  _hover={{ bg: "coral.700" }}
                  loading={isSaving}
                  px={5}
                  py={4}
                >
                  <Icon as={FaSave as ElementType} mr={2} />
                  Save Changes
                </Button>
              </HStack>
            </HStack>
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
