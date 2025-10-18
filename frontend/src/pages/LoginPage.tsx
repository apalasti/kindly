import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Input,
  Stack,
  Text,
  VStack,
} from "@chakra-ui/react";
import { Field } from "@chakra-ui/react/field";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useLocation } from "react-router-dom";
import { loginSchema, type LoginFormData } from "../utils/validators";
import { authService } from "../services/auth.service";
import { PasswordInput } from "../components/ui/password-input";
import { toaster } from "../components/ui/toaster";
import { Logo } from "../components/ui/logo";
import { backgroundStyles } from "../theme/backgrounds";
import { PageLayout } from "../components/layout/PageLayout";

export const LoginPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      toaster.create({
        title: "Login successful!",
        description: response.message,
        type: "success",
        duration: 5000,
      });
      const target = location.state?.from || "/requests";
      navigate(target, { replace: true });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again.";
      toaster.create({
        title: "Login failed",
        description: errorMessage,
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Use the "both" background style for login page
  const backgroundStyle = backgroundStyles.both;

  return (
    <PageLayout
      backgroundStyle={backgroundStyle}
      py={12}
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <Container maxW="container.md">
        <VStack gap={8}>
          {/* Logo with larger size */}
          <Logo actorType="both" size="7rem" />

          {/* Login Form */}
          <Box
            as="form"
            onSubmit={handleSubmit(onSubmit)}
            position="relative"
            p="4px"
            borderRadius="2xl"
            bgGradient="linear(to-r, coral.500, teal.300)"
            w="full"
            maxW="md"
            mx="auto"
            boxShadow="xl"
          >
            <Box
              bg="white"
              borderRadius="calc(1rem - 4px)"
              p={8}
              position="relative"
            >
              <Stack gap={6}>
                <Text fontSize="xl" fontWeight="bold" textAlign="center">
                  Sign in to your account
                </Text>

                {/* Email Field */}
                <Field.Root invalid={!!errors.email}>
                  <Field.Label>Email Address</Field.Label>
                  <Input
                    {...register("email")}
                    type="email"
                    placeholder="your.email@example.com"
                    size="lg"
                    px={5}
                    py={6}
                  />
                  {errors.email?.message && (
                    <Field.ErrorText>{errors.email.message}</Field.ErrorText>
                  )}
                </Field.Root>

                <Field.Root invalid={!!errors.password}>
                  <Field.Label>Password</Field.Label>
                  <PasswordInput
                    {...register("password")}
                    placeholder="Enter your password"
                    visible={isPasswordVisible}
                    onVisibleChange={setIsPasswordVisible}
                    size="lg"
                    px={5}
                    py={6}
                  />
                  {errors.password?.message && (
                    <Field.ErrorText>{errors.password.message}</Field.ErrorText>
                  )}
                </Field.Root>

                <Button
                  type="submit"
                  size="lg"
                  w="full"
                  background="linear-gradient(to right, token(colors.coral.500), token(colors.teal.300))"
                  color="white"
                  fontWeight="semibold"
                  _hover={{
                    background:
                      "linear-gradient(to right, token(colors.coral.600), token(colors.teal.400))",
                    transform: "translateY(-2px)",
                    boxShadow: "lg",
                  }}
                  _active={{
                    transform: "translateY(0)",
                  }}
                  _disabled={{
                    opacity: 0.7,
                  }}
                  loading={isLoading}
                  loadingText="Signing in..."
                  transition="all 0.2s ease"
                  mt={2}
                >
                  Sign In
                </Button>

                <Text color="primary.400" textAlign="center" mt={2}>
                  Don't have an account?{" "}
                  <Text
                    as="span"
                    color="primary.500"
                    fontWeight="semibold"
                    cursor="pointer"
                    onClick={() => navigate("/register")}
                    _hover={{ textDecoration: "underline" }}
                  >
                    Create one now
                  </Text>
                </Text>
              </Stack>
            </Box>
          </Box>
        </VStack>
      </Container>
    </PageLayout>
  );
};
