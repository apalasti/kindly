import { useState, useMemo, type ElementType } from "react";
import {
  Box,
  Button,
  Input,
  Textarea,
  Stack,
  Text,
  HStack,
  Icon,
} from "@chakra-ui/react";
import { Field } from "@chakra-ui/react/field";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PasswordInput, PasswordStrengthMeter } from "../ui/password-input";
import { DatePicker } from "../ui/date-picker";
import { toDateOnly } from "../../utils/date";
import { passwordStrength, type Options } from "check-password-strength";
import { FaSave, FaTimes } from "react-icons/fa";
import type { User } from "../../types";

// Dynamic schemas for edit vs register modes
const buildSchema = (mode: "edit" | "register") => {
  if (mode === "register") {
    return z
      .object({
        first_name: z.string().min(1, "First name is required"),
        last_name: z.string().min(1, "Last name is required"),
        email: z.string().email("Invalid email address"),
        password: z
          .string()
          .min(8, "Password must be at least 8 characters")
          .max(72, "Password is too long"),
        repeat_password: z.string().min(1, "Please repeat the password"),
        date_of_birth: z.string().min(1, "Date of birth is required"),
        about_me: z
          .string()
          .min(
            10,
            "Please tell us a bit about yourself (at least 10 characters)"
          ),
        // For compatibility with edit mode fields (not used here)
        new_password: z.string().optional(),
      })
      .refine((data) => data.password === data.repeat_password, {
        message: "Passwords don't match",
        path: ["repeat_password"],
      });
  }
  // edit mode schema
  return z
    .object({
      first_name: z.string().min(1, "First name is required"),
      last_name: z.string().min(1, "Last name is required"),
      email: z.string().email("Invalid email address"),
      password: z.string().optional(), // current password
      new_password: z.string().optional(),
      repeat_password: z.string().optional(),
      date_of_birth: z.string().min(1, "Date of birth is required"),
      about_me: z
        .string()
        .min(
          10,
          "Please tell us a bit about yourself (at least 10 characters)"
        ),
    })
    .refine(
      (data) => {
        if (data.new_password && data.new_password !== data.repeat_password) {
          return false;
        }
        return true;
      },
      {
        message: "Passwords don't match",
        path: ["repeat_password"],
      }
    );
};

export type ProfileFormData = {
  first_name: string;
  last_name: string;
  email: string;
  password?: string;
  new_password?: string;
  repeat_password?: string;
  date_of_birth: string;
  about_me: string;
};

interface ProfileFormProps {
  initialData?: User;
  onSubmit: (data: ProfileFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
  mode?: "register" | "edit";
  accentColor?: string;
  accentColorShade?: string;
  submitLabel?: string;
  cancelLabel?: string;
  showCancel?: boolean;
  footer?: React.ReactNode;
  hideSubmitIcon?: boolean;
}

export const ProfileForm = ({
  initialData,
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = "edit",
  accentColor = "teal.400",
  accentColorShade = "teal.500",
  submitLabel,
  cancelLabel,
  showCancel,
  footer,
  hideSubmitIcon = false,
}: ProfileFormProps) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const activeSchema = useMemo(() => buildSchema(mode), [mode]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
  } = useForm<ProfileFormData>({
    resolver: zodResolver(activeSchema),
    mode: "onTouched",
    defaultValues: {
      first_name: initialData?.first_name || "",
      last_name: initialData?.last_name || "",
      email: initialData?.email || "",
      date_of_birth: initialData?.date_of_birth || "",
      about_me: initialData?.about_me || "",
      password: "",
      new_password: "",
      repeat_password: "",
    },
  });

  // Password strength using check-password-strength
  const strengthOptions = useMemo<Options<string>>(
    () => [
      { id: 1, value: "weak", minDiversity: 0, minLength: 0 },
      { id: 2, value: "medium", minDiversity: 2, minLength: 6 },
      { id: 3, value: "strong", minDiversity: 3, minLength: 8 },
      { id: 4, value: "very-strong", minDiversity: 4, minLength: 10 },
    ],
    []
  );

  const passwordStrengthField =
    mode === "register" ? watch("password") : watch("new_password");
  const strength = useMemo(() => {
    if (!passwordStrengthField) return 0;
    return passwordStrength(passwordStrengthField, strengthOptions).id;
  }, [passwordStrengthField, strengthOptions]);

  const handleFormSubmit = async (data: ProfileFormData) => {
    await onSubmit(data);
  };

  return (
    <Box as="form" onSubmit={handleSubmit(handleFormSubmit)}>
      <Stack gap={6}>
        {/* Name Fields */}
        <HStack w="full" gap={4} align="start">
          <Field.Root invalid={!!errors.first_name} flex="1">
            <Field.Label>First Name</Field.Label>
            <Input
              {...register("first_name")}
              placeholder="Enter your first name"
              size="md"
              borderRadius="md"
              px={5}
              py={4}
            />
            {errors.first_name?.message && (
              <Field.ErrorText>{errors.first_name.message}</Field.ErrorText>
            )}
          </Field.Root>

          <Field.Root invalid={!!errors.last_name} flex="1">
            <Field.Label>Last Name</Field.Label>
            <Input
              {...register("last_name")}
              placeholder="Enter your last name"
              size="md"
              borderRadius="md"
              px={5}
              py={4}
            />
            {errors.last_name?.message && (
              <Field.ErrorText>{errors.last_name.message}</Field.ErrorText>
            )}
          </Field.Root>
        </HStack>

        {/* Email Field */}
        <Field.Root invalid={!!errors.email}>
          <Field.Label>Email Address</Field.Label>
          <Input
            {...register("email")}
            type="email"
            placeholder="your.email@example.com"
            size="md"
            borderRadius="md"
            px={5}
            py={4}
          />
          {errors.email?.message && (
            <Field.ErrorText>{errors.email.message}</Field.ErrorText>
          )}
        </Field.Root>

        {/* Password Fields */}
        {mode === "edit" ? (
          <>
            <Text fontSize="lg" fontWeight="semibold" color="gray.700" mt={2}>
              Change Password (optional)
            </Text>
            <Field.Root invalid={!!errors.password}>
              <Field.Label>Current Password</Field.Label>
              <PasswordInput
                {...register("password")}
                placeholder="Enter current password"
                visible={isPasswordVisible}
                onVisibleChange={setIsPasswordVisible}
                borderRadius="md"
                px={5}
                py={4}
              />
              {errors.password?.message && (
                <Field.ErrorText>{errors.password.message}</Field.ErrorText>
              )}
            </Field.Root>
            <HStack w="full" gap={4} align="start">
              <Field.Root invalid={!!errors.new_password} flex={1}>
                <Field.Label>New Password</Field.Label>
                <Stack gap="3" w="full">
                  <PasswordInput
                    {...register("new_password")}
                    placeholder="Create a new password"
                    visible={isPasswordVisible}
                    onVisibleChange={setIsPasswordVisible}
                    borderRadius="md"
                    px={5}
                    py={4}
                  />
                  {passwordStrengthField && (
                    <PasswordStrengthMeter value={strength} />
                  )}
                </Stack>
                {errors.new_password?.message && (
                  <Field.ErrorText>
                    {errors.new_password.message}
                  </Field.ErrorText>
                )}
              </Field.Root>
              <Field.Root invalid={!!errors.repeat_password} flex={1}>
                <Field.Label>Repeat New Password</Field.Label>
                <PasswordInput
                  {...register("repeat_password")}
                  placeholder="Re-enter new password"
                  visible={isPasswordVisible}
                  onVisibleChange={setIsPasswordVisible}
                  borderRadius="md"
                  px={5}
                  py={4}
                />
                {errors.repeat_password?.message && (
                  <Field.ErrorText>
                    {errors.repeat_password.message}
                  </Field.ErrorText>
                )}
              </Field.Root>
            </HStack>
          </>
        ) : (
          <>
            <Field.Root invalid={!!errors.password}>
              <Field.Label>Password</Field.Label>
              <Stack gap="3" w="full">
                <PasswordInput
                  {...register("password")}
                  placeholder="Create a strong password"
                  visible={isPasswordVisible}
                  onVisibleChange={setIsPasswordVisible}
                  borderRadius="md"
                  px={5}
                  py={4}
                />
                {passwordStrengthField && (
                  <PasswordStrengthMeter value={strength} />
                )}
              </Stack>
              {errors.password?.message && (
                <Field.ErrorText>{errors.password.message}</Field.ErrorText>
              )}
            </Field.Root>
            <Field.Root invalid={!!errors.repeat_password}>
              <Field.Label>Repeat Password</Field.Label>
              <PasswordInput
                {...register("repeat_password")}
                placeholder="Re-enter your password"
                visible={isPasswordVisible}
                onVisibleChange={setIsPasswordVisible}
                borderRadius="md"
                px={5}
                py={4}
              />
              {errors.repeat_password?.message && (
                <Field.ErrorText>
                  {errors.repeat_password.message}
                </Field.ErrorText>
              )}
            </Field.Root>
          </>
        )}

        {/* Date of Birth */}
        <Field.Root invalid={!!errors.date_of_birth}>
          <Field.Label>Date of Birth</Field.Label>
          <Controller
            name="date_of_birth"
            control={control}
            render={({ field }) => (
              <DatePicker
                selected={field.value ? new Date(field.value) : null}
                onChange={(date) => {
                  field.onChange(date ? toDateOnly(date) : "");
                }}
                size="lg"
              />
            )}
          />
          {errors.date_of_birth?.message && (
            <Field.ErrorText>{errors.date_of_birth.message}</Field.ErrorText>
          )}
        </Field.Root>

        {/* About Me */}
        <Field.Root invalid={!!errors.about_me}>
          <Field.Label>About Me</Field.Label>
          <Textarea
            {...register("about_me")}
            placeholder="Tell us about yourself..."
            size="md"
            minHeight="100px"
            rows={4}
            transition="all 0.3s ease"
            borderRadius="md"
            px={5}
            py={4}
          />
          {errors.about_me?.message && (
            <Field.ErrorText>{errors.about_me.message}</Field.ErrorText>
          )}
        </Field.Root>

        {/* Action Buttons */}
        <HStack
          gap={4}
          justify={mode === "register" ? "center" : "flex-end"}
          pt={4}
          w="full"
        >
          {(showCancel ?? mode === "edit") && (
            <Button
              type="button"
              variant="outline"
              size="lg"
              onClick={onCancel}
              disabled={isSubmitting}
              px={6}
              _hover={{
                transform: "translateY(-2px)",
              }}
            >
              {!hideSubmitIcon && <Icon as={FaTimes as ElementType} mr={2} />}
              {cancelLabel || (mode === "edit" ? "Cancel" : "Back")}
            </Button>
          )}
          <Button
            type="submit"
            size="lg"
            w={mode === "register" ? "full" : undefined}
            maxW={mode === "register" ? "420px" : undefined}
            bg={accentColor}
            color="white"
            _hover={{
              bg: accentColorShade,
              transform: "translateY(-2px)",
              boxShadow: "lg",
            }}
            _active={{
              transform: "translateY(0)",
            }}
            loading={isSubmitting}
            loadingText={mode === "edit" ? "Saving..." : "Creating..."}
            transition="all 0.2s ease"
            px={6}
          >
            {!hideSubmitIcon && mode === "edit" && (
              <Icon as={FaSave as ElementType} mr={2} />
            )}
            {submitLabel ||
              (mode === "edit" ? "Save Changes" : "Create Account")}
          </Button>
        </HStack>
        {footer && <Box pt={2}>{footer}</Box>}
      </Stack>
    </Box>
  );
};
