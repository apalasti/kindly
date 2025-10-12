import { Box, HStack, Stack, Text, Badge, Icon } from "@chakra-ui/react";
import {
  FaUsers,
  FaCalendarAlt,
  FaDollarSign,
  FaCheckCircle,
  FaClock,
  FaUserCheck,
} from "react-icons/fa";
import type { Request } from "../../types";
import type { ElementType } from "react";

interface RequestCardProps {
  request: Request;
  isVolunteer: boolean;
  onClick?: () => void;
}

export const RequestCard = ({
  request,
  isVolunteer,
  onClick,
}: RequestCardProps) => {
  // Determine status and styling
  const getStatusInfo = () => {
    if (request.is_completed) {
      return {
        label: "Completed",
        colorScheme: "gray",
        icon: FaCheckCircle,
      };
    }
    if (request.accepted_volunteer) {
      return {
        label: "Volunteer Accepted",
        colorScheme: "blue",
        icon: FaUserCheck,
      };
    }
    return {
      label: "Open",
      colorScheme: isVolunteer ? "teal" : "coral",
      icon: FaClock,
    };
  };

  const statusInfo = getStatusInfo();

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Truncate description
  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <Box
      bg="white"
      borderRadius="lg"
      boxShadow="md"
      p={5}
      cursor="pointer"
      transition="all 0.2s"
      _hover={{
        transform: "translateY(-2px)",
        boxShadow: "lg",
      }}
      onClick={onClick}
      borderLeft="4px solid"
      borderLeftColor={`${statusInfo.colorScheme}.400`}
    >
      <Stack gap={3}>
        {/* Header with title and status */}
        <HStack justify="space-between" align="start">
          <Text fontSize="lg" fontWeight="bold" color="gray.800" flex={1}>
            {request.name}
          </Text>
          <Badge
            colorScheme={statusInfo.colorScheme}
            px={2}
            py={1}
            borderRadius="full"
            display="flex"
            alignItems="center"
            gap={1}
          >
            <Icon as={statusInfo.icon as ElementType} boxSize={3} />
            {statusInfo.label}
          </Badge>
        </HStack>

        {/* Description */}
        <Text fontSize="sm" color="gray.600" lineHeight="1.5">
          {truncateText(request.description, 150)}
        </Text>

        {/* Request types */}
        {request.request_types.length > 0 && (
          <HStack gap={2} flexWrap="wrap">
            {request.request_types.map((type) => (
              <Badge
                key={type.id}
                colorScheme="purple"
                variant="subtle"
                fontSize="xs"
              >
                {type.name}
              </Badge>
            ))}
          </HStack>
        )}

        {/* Footer info */}
        <HStack
          justify="space-between"
          pt={2}
          borderTop="1px solid"
          borderColor="gray.100"
        >
          {/* Start date */}
          <HStack gap={1} color="gray.500" fontSize="sm">
            <Icon as={FaCalendarAlt as ElementType} boxSize={3} />
            <Text>{formatDate(request.start)}</Text>
          </HStack>

          {/* Reward (for volunteers) or Applications count (for help seekers) */}
          {isVolunteer ? (
            <HStack gap={3}>
              {request.reward > 0 && (
                <HStack gap={1} color="green.600" fontSize="sm">
                  <Icon as={FaDollarSign as ElementType} boxSize={3} />
                  <Text fontWeight="semibold">${request.reward}</Text>
                </HStack>
              )}
              <HStack gap={1} color="gray.500" fontSize="sm">
                <Icon as={FaUsers as ElementType} boxSize={3} />
                <Text>{request.applications_count} applicants</Text>
              </HStack>
            </HStack>
          ) : (
            <HStack gap={1} color="gray.500" fontSize="sm">
              <Icon as={FaUsers as ElementType} boxSize={3} />
              <Text>
                {request.applications_count}{" "}
                {request.applications_count === 1 ? "applicant" : "applicants"}
              </Text>
            </HStack>
          )}
        </HStack>

        {/* Applied indicator for volunteers */}
        {isVolunteer && request.has_applied && (
          <Badge
            colorScheme="green"
            variant="subtle"
            alignSelf="start"
            fontSize="xs"
          >
            You applied
          </Badge>
        )}
      </Stack>
    </Box>
  );
};
