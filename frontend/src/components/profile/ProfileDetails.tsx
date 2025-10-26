import { type ElementType } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Stack,
  Text,
  HStack,
  VStack,
  Button,
  Icon,
  Separator,
  Badge,
} from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/react/avatar";
import {
  FaStar,
  FaEdit,
  FaCalendarAlt,
  FaEnvelope,
  FaInfoCircle,
  FaUserClock,
} from "react-icons/fa";
import type { User } from "../../types";
import { getFullName, pickAvatarPalette } from "../../utils/avatar";
import { formatDateCompact } from "../../utils/date";

interface ProfileDetailsProps {
  currentUserIsVolunteer: boolean;
  user: User;
  isOwnProfile: boolean;
}

export const ProfileDetails = ({
  currentUserIsVolunteer,
  user,
  isOwnProfile,
}: ProfileDetailsProps) => {
  const navigate = useNavigate();

  const handleEdit = () => {
    navigate(`/profile/${user.id}/edit`);
  };

  // Determine accent color based on user type
  const accentColor = currentUserIsVolunteer ? "teal.400" : "coral.500";

  const rating = Number(user.avg_rating);
  const showRating = Number.isFinite(rating) && rating > 0;

  return (
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
      position="relative"
    >
      <Stack gap={6}>
        {isOwnProfile && (
          <Button
            onClick={handleEdit}
            bg={accentColor}
            color="white"
            size="md"
            borderRadius="full"
            px={5}
            position="absolute"
            top={6}
            right={6}
            _hover={{ transform: "translateY(-2px)", boxShadow: "lg" }}
            _active={{ transform: "translateY(0)" }}
            transition="all 0.2s ease"
          >
            <Icon as={FaEdit as ElementType} mr={2} />
            Edit Profile
          </Button>
        )}
        {/* Header with profile picture, name, and rating */}
        <VStack gap={4} align="center">
          {/* Profile Picture */}
          <Avatar.Root
            size="2xl"
            colorPalette={pickAvatarPalette(user.first_name, user.last_name)}
          >
            <Avatar.Fallback
              name={getFullName(user.first_name, user.last_name)}
            />
          </Avatar.Root>

          {/* Name */}
          <Text fontSize="3xl" fontWeight="bold" color="gray.800">
            {getFullName(user.first_name, user.last_name)}
          </Text>

          {/* Role badge + optional star rating */}
          <HStack gap={3} align="center">
            <Badge
              px={4}
              fontSize="sm"
              fontWeight="semibold"
              borderRadius="999px"
              bg={user.is_volunteer ? "teal.50" : "coral.50"}
              color={user.is_volunteer ? "teal.600" : "coral.800"}
              h="34px"
              display="inline-flex"
              alignItems="center"
              lineHeight="1"
            >
              {user.is_volunteer ? "Volunteer" : "Help Seeker"}
            </Badge>
            {showRating && (
              <HStack
                gap={2}
                bg="gray.100"
                px={4}
                borderRadius="999px"
                h="34px"
                align="center"
              >
                <Icon as={FaStar as ElementType} boxSize={4} color="gray.700" />
                <Text
                  fontSize="sm"
                  fontWeight="semibold"
                  color="gray.700"
                  lineHeight="1"
                >
                  {rating.toFixed(1)}
                </Text>
              </HStack>
            )}
          </HStack>
        </VStack>

        <Separator />

        {/* Profile Information */}
        <Stack gap={6}>
          {/* About Me */}
          <Box>
            <HStack gap={2} mb={3}>
              <Icon
                as={FaInfoCircle as ElementType}
                boxSize={5}
                color="gray.600"
              />
              <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                About Me
              </Text>
            </HStack>
            <Text fontSize="md" color="gray.600" lineHeight="1.7" pl={7}>
              {user.about_me || "No description provided"}
            </Text>
          </Box>

          {/* Email*/}

          <Box>
            <HStack gap={2} mb={3}>
              <Icon
                as={FaEnvelope as ElementType}
                boxSize={5}
                color="gray.600"
              />
              <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                Email Address
              </Text>
            </HStack>
            <Text fontSize="md" color="gray.600" pl={7}>
              {user.email}
            </Text>
          </Box>

          {/* Date of Birth */}
          <Box>
            <HStack gap={2} mb={3}>
              <Icon
                as={FaCalendarAlt as ElementType}
                boxSize={5}
                color="gray.600"
              />
              <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                Date of Birth
              </Text>
            </HStack>
            <Text fontSize="md" color="gray.600" pl={7}>
              {formatDateCompact(user.date_of_birth)}
            </Text>
          </Box>

          {/* Member Since */}
          {user.created_at && (
            <Box>
              <HStack gap={2} mb={3}>
                <Icon
                  as={FaUserClock as ElementType}
                  boxSize={5}
                  color="gray.600"
                />
                <Text fontSize="lg" fontWeight="semibold" color="gray.700">
                  Member Since
                </Text>
              </HStack>
              <Text fontSize="md" color="gray.600" pl={7}>
                {formatDateCompact(user.created_at)}
              </Text>
            </Box>
          )}
        </Stack>
      </Stack>
    </Box>
  );
};
