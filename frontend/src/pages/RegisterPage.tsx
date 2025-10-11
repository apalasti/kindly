import { useMemo, useState, type ElementType } from "react";
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
} from "@chakra-ui/react";
import { Field } from "@chakra-ui/react/field";
import { useForm, Controller, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { FaHandHoldingHeart, FaHandsHelping } from "react-icons/fa";
import { registerSchema, type RegisterFormData } from "../utils/validators";
import { authService } from "../services/auth.service";
import {
  PasswordInput,
  PasswordStrengthMeter,
} from "../components/ui/password-input";
import { DatePicker } from "../components/ui/date-picker";
import { toaster } from "../components/ui/toaster";
import { passwordStrength, type Options } from "check-password-strength";
import { Logo } from "../components/ui/logo";
import { getBackgroundStyle, getAccentColor } from "../theme/backgrounds";
import { ActorTypeSwitch } from "../components/ui/actor-type-switch";
import { PageLayout } from "../components/layout/PageLayout";

export const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    control,
    setValue,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
    defaultValues: {
      is_volunteer: false,
    },
  });

  const isVolunteer = useWatch({
    control,
    name: "is_volunteer",
  });

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      // Format date to YYYY-MM-DD for backend
      const formattedDate = data.date_of_birth
        ? new Date(data.date_of_birth).toISOString().split("T")[0]
        : "";

      const registerData = {
        name: `${data.first_name} ${data.last_name}`,
        email: data.email,
        password: data.password,
        date_of_birth: formattedDate,
        about_me: data.about_me,
        is_volunteer: data.is_volunteer,
      };

      const response = await authService.register(registerData);
      toaster.create({
        title: "Registration successful!",
        description: response.message,
        type: "success",
        duration: 5000,
      });
      navigate("/dashboard");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";
      toaster.create({
        title: "Registration failed",
        description: errorMessage,
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get dynamic styles from theme configuration
  const accentColor = getAccentColor(isVolunteer);
  const accentColorShade = getAccentColor(isVolunteer, true);
  const backgroundStyle = getBackgroundStyle(isVolunteer);

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

  const passwordValue = watch("password");
  const strength = useMemo(() => {
    if (!passwordValue) return 0;
    return passwordStrength(passwordValue, strengthOptions).id;
  }, [passwordValue, strengthOptions]);

  return (
    <PageLayout
      backgroundStyle={backgroundStyle}
      py={12}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Container maxW="container.lg">
        <Stack gap={8}>
          {/* Header */}
          <Stack gap={2} align="center">
            <Logo actorType={isVolunteer ? "volunteer" : "help-seeker"} />
          </Stack>

          {/* Role Switcher */}
          <Box
            bg="white"
            p={6}
            borderRadius="2xl"
            boxShadow="xl"
            w="full"
            maxW="xl"
            mx="auto"
            transition="all 0.3s ease"
          >
            <Stack gap={4}>
              <Text
                fontSize="lg"
                fontWeight="semibold"
                color="primary.500"
                textAlign="center"
              >
                Register as:
              </Text>
              <HStack gap={6} justify="center" align="center" w="full" py={2}>
                <Stack
                  gap={2}
                  opacity={!isVolunteer ? 1 : 0.5}
                  transition="all 0.3s ease"
                  align="center"
                  cursor={isVolunteer ? "pointer" : "default"}
                  onClick={() => {
                    if (isVolunteer) setValue("is_volunteer", false);
                  }}
                  _hover={{ opacity: !isVolunteer ? 1 : 0.7 }}
                >
                  <Icon
                    as={FaHandHoldingHeart as ElementType}
                    boxSize={8}
                    color="coral.500"
                  />
                  <Text fontWeight="bold" color="coral.500" fontSize="lg">
                    Help Seeker
                  </Text>
                </Stack>

                <Controller
                  name="is_volunteer"
                  control={control}
                  render={({ field }) => (
                    <ActorTypeSwitch
                      checked={!!field.value}
                      onChange={(checked) => field.onChange(checked)}
                    />
                  )}
                />

                <Stack
                  gap={2}
                  opacity={isVolunteer ? 1 : 0.5}
                  transition="all 0.3s ease"
                  align="center"
                  cursor={!isVolunteer ? "pointer" : "default"}
                  onClick={() => {
                    if (!isVolunteer) setValue("is_volunteer", true);
                  }}
                  _hover={{ opacity: isVolunteer ? 1 : 0.7 }}
                >
                  <Icon
                    as={FaHandsHelping as unknown as ElementType}
                    boxSize={8}
                    color="teal.300"
                  />
                  <Text fontWeight="bold" color="teal.300" fontSize="lg">
                    Volunteer
                  </Text>
                </Stack>
              </HStack>
            </Stack>
          </Box>

          {/* Registration Form */}
          <Box
            as="form"
            onSubmit={handleSubmit(onSubmit)}
            bg="white"
            p={8}
            borderRadius="2xl"
            boxShadow="xl"
            w="full"
            maxW="xl"
            mx="auto"
            borderTop="4px solid"
            borderColor={accentColor}
            transition="all 0.3s ease"
          >
            <Stack gap={6}>
              <HStack w="full" gap={4} align="start">
                <Field.Root invalid={!!errors.first_name} flex="1">
                  <Field.Label>First Name</Field.Label>
                  <Input
                    {...register("first_name")}
                    placeholder="Enter your first name"
                    size="md"
                    px={5}
                    py={4}
                  />
                  {errors.first_name?.message && (
                    <Field.ErrorText>
                      {errors.first_name.message}
                    </Field.ErrorText>
                  )}
                </Field.Root>

                <Field.Root invalid={!!errors.last_name} flex="1">
                  <Field.Label>Last Name</Field.Label>
                  <Input
                    {...register("last_name")}
                    placeholder="Enter your last name"
                    size="md"
                    px={5}
                    py={4}
                  />
                  {errors.last_name?.message && (
                    <Field.ErrorText>
                      {errors.last_name.message}
                    </Field.ErrorText>
                  )}
                </Field.Root>
              </HStack>

              <Field.Root invalid={!!errors.email}>
                <Field.Label>Email Address</Field.Label>
                <Input
                  {...register("email")}
                  type="email"
                  placeholder="your.email@example.com"
                  size="md"
                  px={5}
                  py={4}
                />
                {errors.email?.message && (
                  <Field.ErrorText>{errors.email.message}</Field.ErrorText>
                )}
              </Field.Root>

              <HStack w="full" gap={4} align="start">
                <Field.Root invalid={!!errors.password} flex={1}>
                  <Field.Label>Password</Field.Label>
                  <Stack gap="3" w="full">
                    <PasswordInput
                      {...register("password")}
                      placeholder="Create a strong password"
                      visible={isPasswordVisible}
                      onVisibleChange={setIsPasswordVisible}
                      px={5}
                      py={4}
                    />
                    <PasswordStrengthMeter value={strength} />
                  </Stack>
                  {errors.password?.message && (
                    <Field.ErrorText>{errors.password.message}</Field.ErrorText>
                  )}
                </Field.Root>

                <Field.Root invalid={!!errors.repeat_password} flex={1}>
                  <Field.Label>Repeat Password</Field.Label>
                  <PasswordInput
                    {...register("repeat_password")}
                    placeholder="Re-enter your password"
                    visible={isPasswordVisible}
                    onVisibleChange={setIsPasswordVisible}
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

              <Field.Root invalid={!!errors.date_of_birth}>
                <Field.Label>Date of Birth</Field.Label>
                <Controller
                  name="date_of_birth"
                  control={control}
                  render={({ field }) => (
                    <DatePicker
                      selected={field.value ? new Date(field.value) : null}
                      onChange={(date) => {
                        field.onChange(date ? date.toISOString() : "");
                      }}
                      size="lg"
                    />
                  )}
                />
                {errors.date_of_birth?.message && (
                  <Field.ErrorText>
                    {errors.date_of_birth.message}
                  </Field.ErrorText>
                )}
              </Field.Root>

              <Field.Root invalid={!!errors.about_me}>
                <Field.Label>About Me</Field.Label>
                <Textarea
                  {...register("about_me")}
                  placeholder={"Tell us about yourself..."}
                  size="md"
                  minHeight={"100px"}
                  rows={4}
                  transition="all 0.3s ease"
                  px={5}
                  py={4}
                />
                {errors.about_me?.message && (
                  <Field.ErrorText>{errors.about_me.message}</Field.ErrorText>
                )}
              </Field.Root>

              <Button
                type="submit"
                size="lg"
                w="full"
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
                loading={isLoading}
                loadingText="Creating account..."
                transition="all 0.2s ease"
              >
                Create Account
              </Button>

              <Text color="primary.400" textAlign="center">
                Already have an account?{" "}
                <Text
                  as="span"
                  color={accentColor}
                  fontWeight="semibold"
                  cursor="pointer"
                  onClick={() => navigate("/login")}
                  _hover={{ textDecoration: "underline" }}
                >
                  Sign in
                </Text>
              </Text>
            </Stack>
          </Box>
        </Stack>
      </Container>
    </PageLayout>
  );
};
