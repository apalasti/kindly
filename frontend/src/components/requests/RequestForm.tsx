import { useEffect, useMemo, useState, type ElementType } from "react";
import {
  Box,
  Button,
  HStack,
  Icon,
  Input,
  Separator,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  VStack,
  Wrap,
  Badge,
} from "@chakra-ui/react";
import { Field } from "@chakra-ui/react/field";
import { useForm, Controller } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { DateTimePicker } from "../ui/date-time-picker";
import { TypeSelector } from "../ui/type-selector";
import { MapboxLocationPicker } from "../ui/mapbox-location-picker";
import { requestService } from "../../services/request.service";
import { toaster } from "../ui/toaster";
import { FaMagic } from "react-icons/fa";
import type {
  CreateRequestData,
  RequestType,
  UpdateRequestData,
} from "../../types";

export type RequestFormMode = "create" | "edit";

export type RequestFormValues = {
  name: string;
  description: string;
  address: string;
  location_coordinates: { longitude: number; latitude: number };
  start: Date;
  end: Date;
  reward: number;
  request_type_ids: number[];
  submitIcon?: ElementType;
};

const formSchema = z
  .object({
    name: z.string().min(1, "Name is required").max(200, "Name is too long"),
    description: z
      .string()
      .min(1, "Description is required")
      .max(1000, "Description is too long"),
    address: z.string().min(1, "Location is required"),
    location_coordinates: z.object({
      longitude: z.number(),
      latitude: z.number(),
    }),
    start: z.date().refine((d) => d > new Date(), {
      message: "Start date must be in the future",
    }),
    end: z.date(),
    reward: z.number().min(0, "Reward must be 0 or positive"),
    request_type_ids: z.array(z.number()),
  })
  .refine((data) => data.end > data.start, {
    message: "End date must be after start date",
    path: ["end"],
  });

type Props = {
  mode: RequestFormMode;
  initialValues?: Partial<RequestFormValues>;
  requestTypes: RequestType[];
  submitLabel: string;
  cancelLabel: string;
  onSubmit: (
    payload: CreateRequestData | UpdateRequestData
  ) => Promise<void> | void;
  onCancel: () => void;
  leftAction?: React.ReactNode;
  submitIcon?: ElementType;
};

type AIGeneratedType = { id: number; name: string; confidence: number };

export function RequestForm({
  mode,
  initialValues,
  requestTypes,
  submitLabel,
  cancelLabel,
  onSubmit,
  onCancel,
  leftAction,
  submitIcon,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingTypes, setIsGeneratingTypes] = useState(false);
  const [aiGeneratedTypes, setAiGeneratedTypes] = useState<AIGeneratedType[]>(
    []
  );

  const defaultValues: RequestFormValues = useMemo(
    () => ({
      name: initialValues?.name ?? "",
      description: initialValues?.description ?? "",
      address: initialValues?.address ?? "",
      location_coordinates: initialValues?.location_coordinates ?? {
        longitude: initialValues?.location_coordinates?.longitude ?? 0,
        latitude: initialValues?.location_coordinates?.latitude ?? 0,
      },
      start:
        initialValues?.start ?? new Date(new Date().getTime() + 60 * 60 * 1000),
      end:
        initialValues?.end ??
        new Date(new Date().getTime() + 2 * 60 * 60 * 1000),
      reward: initialValues?.reward ?? 0,
      request_type_ids: initialValues?.request_type_ids ?? [],
    }),
    [initialValues]
  );

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<RequestFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultValues,
    mode: "onBlur",
    reValidateMode: "onChange",
    shouldFocusError: true,
  });

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const watchedName = watch("name");
  const watchedDescription = watch("description");
  const watchedTypes = watch("request_type_ids") || [];

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
      if (types.length > 0) setValue("request_type_ids", types);
      toaster.create({
        title: "Types generated",
        description: `Found ${response.data.length} matching types`,
        type: "success",
        duration: 3000,
      });
    } catch (err) {
      console.error("Error generating types:", err);
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

  const submitHandler = async (data: RequestFormValues) => {
    setIsSubmitting(true);
    try {
      if (mode === "create") {
        const payload: CreateRequestData = {
          name: data.name,
          description: data.description,
          longitude: data.location_coordinates.longitude,
          latitude: data.location_coordinates.latitude,
          address: data.address,
          start: data.start.toISOString(),
          end: data.end.toISOString(),
          reward: data.reward,
          request_type_ids: data.request_type_ids,
        };
        await onSubmit(payload);
      } else {
        const payload: UpdateRequestData = {
          name: data.name,
          description: data.description,
          longitude: data.location_coordinates.longitude,
          latitude: data.location_coordinates.latitude,
          address: data.address,
          start: data.start.toISOString(),
          end: data.end.toISOString(),
          reward: data.reward,
          request_type_ids: data.request_type_ids,
        };
        await onSubmit(payload);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit(submitHandler)}>
      <Stack gap={6}>
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

          {/* Type Selection */}
          <TypeSelector
            items={requestTypes}
            value={watchedTypes}
            onChange={(ids) => setValue("request_type_ids", ids)}
            placeholder="Select types..."
          />
          {errors.request_type_ids && (
            <Field.ErrorText>{errors.request_type_ids.message}</Field.ErrorText>
          )}
        </Field.Root>

        <Separator />

        {/* Location */}
        <Field.Root invalid={!!errors.address}>
          <Field.Label>Location</Field.Label>
          <Controller
            name="address"
            control={control}
            render={({ field }) => (
              <MapboxLocationPicker
                value={field.value}
                onChange={(address, coordinates) => {
                  field.onChange(address);
                  setValue("location_coordinates", coordinates);
                }}
                placeholder="Search for an address"
              />
            )}
          />
          {errors.address && (
            <Field.ErrorText>{errors.address.message}</Field.ErrorText>
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
                  isVolunteer={false}
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
                  isVolunteer={false}
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

        {/* Actions */}
        <HStack justify="space-between" align="center" pt={4} w="full">
          <Box>{leftAction}</Box>
          <HStack gap={4}>
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              px={5}
              py={4}
            >
              {cancelLabel}
            </Button>
            <Button
              type="submit"
              bg="coral.600"
              _hover={{ bg: "coral.700" }}
              loading={isSubmitting}
              px={5}
              py={4}
            >
              {submitIcon && <Icon as={submitIcon} mr={2} />}
              {submitLabel}
            </Button>
          </HStack>
        </HStack>
      </Stack>
    </Box>
  );
}
