import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Center, Stack, Text } from "@chakra-ui/react";
import { AppLayout } from "../layouts/AppLayout";
import { ProfileDetails } from "../components/profile/ProfileDetails";
import { userService } from "../services/user.service";
import type { User } from "../types";
import { LoadingState } from "../components/ui/loading-state";

export const ProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get current user info from localStorage (mock)
  // const currentUserId = parseInt(localStorage.getItem("mock_user_id") || "1");
  // const currentUserIsVolunteer =
  //   localStorage.getItem("is_volunteer") === "false";
  // const isOwnProfile = currentUserId === parseInt(id || "0");

  const currentUserIsVolunteer = false;
  const isOwnProfile = true;

  useEffect(() => {
    const loadProfile = async () => {
      if (!id) {
        setError("Invalid profile ID");
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const response = await userService.getUserProfile(parseInt(id));
        if (response.success) {
          setUser(response.data);
        } else {
          setError("Failed to load profile");
        }
      } catch (err) {
        console.error("Error loading profile:", err);

        // Handle different error types
        if (err instanceof Error) {
          if (err.message.includes("404")) {
            setError("Profile not found");
          } else if (err.message.includes("403")) {
            setError("You don't have permission to view this profile");
          } else {
            setError("Failed to load profile. Please try again.");
          }
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [id]);

  // Handle error states
  if (error) {
    return (
      <AppLayout
        title=""
        headerVariant="navigation"
        onBack={() => navigate(-1)}
        isVolunteer={currentUserIsVolunteer}
      >
        <Container maxW="container.xl" mx="auto">
          <Center py={12}>
            <Stack align="center" gap={4}>
              <Text fontSize="2xl" fontWeight="bold" color="red.500">
                Error
              </Text>
              <Text color="gray.600" fontSize="lg">
                {error}
              </Text>
            </Stack>
          </Center>
        </Container>
      </AppLayout>
    );
  }

  // Loading state
  if (isLoading || !user) {
    return (
      <AppLayout
        title=""
        headerVariant="navigation"
        onBack={() => navigate(-1)}
        isVolunteer={currentUserIsVolunteer}
      >
        <LoadingState
          message="Loading profile..."
          colorScheme={currentUserIsVolunteer ? "teal.500" : "coral.500"}
        />
      </AppLayout>
    );
  }

  return (
    <AppLayout
      title=""
      headerVariant="navigation"
      onBack={() => navigate(-1)}
      isVolunteer={currentUserIsVolunteer}
    >
      <Container maxW="container.xl" mx="auto">
        <ProfileDetails
          currentUserIsVolunteer={currentUserIsVolunteer}
          user={user}
          isOwnProfile={isOwnProfile}
        />
      </Container>
    </AppLayout>
  );
};
