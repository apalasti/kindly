import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Container, Stack, Text, Box } from "@chakra-ui/react";
import { AppLayout } from "../layouts/AppLayout";
import { LoadingState } from "../components/ui/loading-state";
import {
  ProfileForm,
  type ProfileFormData,
} from "../components/profile/ProfileForm";
import { userService } from "../services/user.service";
import { useAuth } from "../contexts/useAuth";
import { toaster } from "../components/ui/toaster";
import { getAccentColor } from "../theme/backgrounds";
import type { User } from "../types";
import { ConfirmDialog } from "../components/ui/ConfirmDialog";
import { useConfirmDialog } from "../hooks/useConfirmDialog";

export const EditProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const { confirm, dialogProps } = useConfirmDialog();

  // Get current user from auth context
  const { user: currentUser, isVolunteer: currentUserIsVolunteer } = useAuth();
  const isOwnProfile = currentUser?.id === parseInt(id || "0");

  useEffect(() => {
    const loadProfile = async () => {
      if (!id) {
        toaster.create({
          title: "Error",
          description: "Invalid profile ID",
          type: "error",
          duration: 5000,
        });
        navigate("/requests");
        return;
      }

      // Check if user can edit (only own profile)
      if (!isOwnProfile) {
        toaster.create({
          title: "Access Denied",
          description: "You can only edit your own profile",
          type: "error",
          duration: 5000,
        });
        navigate(`/profile/${id}`);
        return;
      }

      setIsLoading(true);

      try {
        const response = await userService.getCurrentUserProfile();
        if (response.success) {
          setUser(response.data);
        } else {
          throw new Error("Failed to load profile");
        }
      } catch (err) {
        console.error("Error loading profile:", err);
        toaster.create({
          title: "Error",
          description: "Failed to load profile. Please try again.",
          type: "error",
          duration: 5000,
        });
        navigate(`/profile/${id}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [id, isOwnProfile, navigate]);

  const handleSubmit = async (data: ProfileFormData) => {
    setIsSaving(true);

    try {
      // Combine first and last name
      const updateData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email,
        date_of_birth: data.date_of_birth,
        about_me: data.about_me,
        ...(data.new_password && { password: data.new_password }),
      };

      const response = await userService.updateProfile(updateData);

      if (response.success) {
        toaster.create({
          title: "Success",
          description: "Profile updated successfully",
          type: "success",
          duration: 5000,
        });
        navigate(`/profile/${id}`);
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (err) {
      console.error("Error updating profile:", err);
      toaster.create({
        title: "Update Failed",
        description:
          err instanceof Error
            ? err.message
            : "Failed to update profile. Please try again.",
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsSaving(false);
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
    if (confirmed) navigate(`/profile/${id}`);
  };

  // Loading state
  if (isLoading || !user) {
    return (
      <AppLayout
        title="Edit Profile"
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

  // Get accent colors based on user type
  const accentColor = getAccentColor(user.is_volunteer);
  const accentColorShade = getAccentColor(user.is_volunteer, true);

  return (
    <>
      <AppLayout
        title=""
        headerVariant="navigation"
        onBack={() => navigate(`/profile/${id}`)}
        isVolunteer={user.is_volunteer}
      >
        <Container maxW="container.xl" mx="auto">
          <Box
            bg="white"
            borderRadius="2xl"
            boxShadow="xl"
            p={8}
            w="full"
            maxW="900px"
            mx="auto"
            borderTop="4px solid"
            borderColor={accentColor}
          >
            <Stack gap={6}>
              <Text fontSize="2xl" fontWeight="bold" color="gray.800">
                Edit Profile
              </Text>

              <ProfileForm
                initialData={user}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={isSaving}
                mode="edit"
                accentColor={accentColor}
                accentColorShade={accentColorShade}
              />
            </Stack>
          </Box>
        </Container>
      </AppLayout>
      <ConfirmDialog {...dialogProps} />
    </>
  );
};
