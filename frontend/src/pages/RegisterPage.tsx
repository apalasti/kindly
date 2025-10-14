import { useState, type ElementType } from "react";
import { Box, Container, Stack, Text, HStack, Icon } from "@chakra-ui/react";
import { useForm, Controller, useWatch } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { FaHandHoldingHeart, FaHandsHelping } from "react-icons/fa";
import type { RegisterFormData } from "../utils/validators";
import { authService } from "../services/auth.service";
import { toaster } from "../components/ui/toaster";
import { Logo } from "../components/ui/logo";
import { getBackgroundStyle, getAccentColor } from "../theme/backgrounds";
import { ActorTypeSwitch } from "../components/ui/actor-type-switch";
import { ProfileForm } from "../components/profile/ProfileForm";
import { PageLayout } from "../components/layout/PageLayout";

export const RegisterPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  // Password visibility managed inside ProfileForm
  const navigate = useNavigate();

  const { control, setValue } = useForm<RegisterFormData>({
    defaultValues: { is_volunteer: false },
  });

  const isVolunteer = useWatch({
    control,
    name: "is_volunteer",
  });

  interface BasicProfilePayload {
    first_name: string;
    last_name: string;
    email: string;
    password?: string;
    repeat_password?: string;
    date_of_birth: string;
    about_me: string;
  }
  const handleProfileSubmit = async (data: BasicProfilePayload) => {
    setIsLoading(true);
    try {
      const formattedDate = data.date_of_birth
        ? new Date(data.date_of_birth).toISOString().split("T")[0]
        : "";
      if (!data.password) {
        throw new Error("Password is required");
      }
      const registerData = {
        name: `${data.first_name} ${data.last_name}`.trim(),
        email: data.email,
        password: data.password,
        date_of_birth: formattedDate,
        about_me: data.about_me,
        is_volunteer: isVolunteer,
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

  // Password strength handled inside ProfileForm

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

          {/* Registration Form (shared ProfileForm) */}
          <Box
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
            <ProfileForm
              mode="register"
              onSubmit={handleProfileSubmit}
              onCancel={() => navigate("/login")}
              isSubmitting={isLoading}
              accentColor={accentColor}
              accentColorShade={accentColorShade}
              submitLabel="Create Account"
              cancelLabel="Cancel"
              showCancel={false}
              hideSubmitIcon
              footer={
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
              }
            />
          </Box>
        </Stack>
      </Container>
    </PageLayout>
  );
};
