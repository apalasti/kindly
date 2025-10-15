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
  SimpleGrid,
} from "@chakra-ui/react";
import { Tooltip } from "@chakra-ui/react/tooltip";
import { Avatar } from "@chakra-ui/react/avatar";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaStar,
  FaEdit,
  FaCheckCircle,
  FaEnvelopeOpenText,
  FaClock,
  FaTimesCircle,
} from "react-icons/fa";
import { useDisclosure } from "@chakra-ui/react";
import { LeaveReviewModal } from "./LeaveReviewModal";
import { RequestDetailsBadges } from "./RequestDetailsBadges";
import { ApplicantsSection } from "./ApplicantsSection";
import { SelectApplicantModal } from "./SelectApplicantModal";
import type { Request, RequestApplication } from "../../types";
import type { ElementType } from "react";
import { getFullName, pickAvatarPalette } from "../../utils/avatar";
import { formatDateFull } from "../../utils/date";

interface RequestDetailsProps {
  request: Request;
  applications: RequestApplication[];
  isVolunteer: boolean;
  currentUserId: number;
}

export const RequestDetails = ({
  request,
  applications,
  isVolunteer,
  currentUserId,
}: RequestDetailsProps) => {
  const navigate = useNavigate();
  // const isCreator = request.creator_id === currentUserId;

  const isCreator = true;

  const acceptedVolunteer =
    applications.find((app) => app.is_accepted)?.user || null;

  // const acceptedVolunteer = applications[0].user;
  const canSelectApplicant =
    !isVolunteer && isCreator && !acceptedVolunteer && applications.length > 0;
  const {
    open: isSelectOpen,
    onOpen: onOpenSelect,
    onClose: onCloseSelect,
  } = useDisclosure();
  const handleAccepted = (userId: number) => {
    // Update UI optimistically; in future, refetch or adjust state shape
    // For now this component relies on acceptedVolunteer stub above
    console.log("Accepted volunteer user id:", userId);
  };

  const handleApply = () => {
    // TODO: Implement apply functionality
    console.log("Apply to request:", request.id);
  };

  const handleEdit = () => {
    navigate(`/requests/${request.id}/edit`);
  };

  const handleCreatorClick = () => {
    if (request.creator) {
      navigate(`/profile/${request.creator.id}`);
    }
  };

  const currentVolunteerAccepted =
    !!request.accepted_volunteer &&
    request.accepted_volunteer.id === currentUserId;
  const otherVolunteerAccepted =
    !!request.accepted_volunteer &&
    request.accepted_volunteer.id !== currentUserId;

  const isEditDisabled = request.applications_count > 0;

  // Review modal state
  const {
    open: isReviewOpen,
    onOpen: onOpenReview,
    onClose: onCloseReview,
  } = useDisclosure();

  // const canLeaveReview =
  //   request.is_completed &&
  //   ((isVolunteer && currentVolunteerAccepted) || (!isVolunteer && isCreator));

  const canLeaveReview = true;

  const handleReviewSubmitted = () => {
    // TODO: optionally refresh request details or show toast
  };

  const renderVolunteerAction = () => {
    if (otherVolunteerAccepted) {
      return (
        <HStack gap={2} p={4} bg="red.50" borderRadius="lg" justify="center">
          <Icon as={FaTimesCircle as ElementType} boxSize={5} color="red.600" />
          <Text color="red.700" fontWeight="semibold" fontSize="lg">
            You have not been accepted for this request
          </Text>
        </HStack>
      );
    }

    if (request.is_completed) {
      return (
        <HStack gap={2} p={4} bg="gray.100" borderRadius="lg" justify="center">
          <Icon
            as={FaCheckCircle as ElementType}
            boxSize={5}
            color="gray.600"
          />
          <Text color="gray.700" fontWeight="semibold" fontSize="lg">
            This request has been completed
          </Text>
        </HStack>
      );
    }

    if (currentVolunteerAccepted) {
      return (
        <HStack gap={2} p={4} bg="teal.50" borderRadius="lg" justify="center">
          <Icon
            as={FaCheckCircle as ElementType}
            boxSize={5}
            color="teal.500"
          />
          <Text color="teal.600" fontWeight="semibold" fontSize="lg">
            You have been accepted for this request
          </Text>
        </HStack>
      );
    }

    if (request.has_applied) {
      return (
        <HStack gap={2} p={4} bg="teal.50" borderRadius="lg" justify="center">
          <Icon as={FaClock as ElementType} boxSize={5} color="teal.500" />
          <Text color="teal.600" fontWeight="semibold" fontSize="lg">
            You have applied to this request
          </Text>
        </HStack>
      );
    }

    return (
      <HStack px={4}>
        <Button
          onClick={handleApply}
          px={4}
          py={6}
          borderRadius="2xl"
          w="full"
          maxW="xl"
          mx="auto"
          bg="teal.400"
          _hover={{ bg: "teal.500", transform: "translateY(-2px)" }}
          transition="all 0.3s ease"
        >
          <Icon as={FaEnvelopeOpenText as ElementType} mr={2} />
          <Text color="white" fontWeight="semibold" fontSize="lg">
            Apply to Help
          </Text>
        </Button>
      </HStack>
    );
  };

  return (
    <Box
      bg="white"
      borderRadius="2xl"
      boxShadow="xl"
      p={8}
      w="full"
      maxW="900px"
      mx="auto"
    >
      <Stack gap={6}>
        {/* Header with Edit button for creators */}
        <Stack gap={4}>
          <HStack justify="space-between" align="center" position="relative">
            <Text
              fontSize="3xl"
              fontWeight="bold"
              color="gray.800"
              flex={1}
              whiteSpace="normal"
              minWidth={0}
              wordBreak="break-word"
              pr={10}
            >
              {/* {request.name} */}
              Lorem ipsum dolor sit amet, consectetur adipiscing elit
              fndsfgjsdigjsikgjfdgndfjghnfdjgbnfsjgnsjfgnjsfgnjf
            </Text>
            {canSelectApplicant && (
              <Button
                size="md"
                variant="solid"
                bg="coral.500"
                color="white"
                borderRadius="full"
                boxShadow="md"
                onClick={onOpenSelect}
                px={5}
                _hover={{
                  boxShadow: "md",
                  transform: "translateY(-1px)",
                  bg: "coral.600",
                }}
                _active={{ transform: "translateY(0)" }}
                transition="all 0.15s ease"
              >
                Select applicant
              </Button>
            )}
            {canLeaveReview && (
              <Button
                size="md"
                variant="solid"
                bg="green.500"
                color="white"
                borderRadius="full"
                boxShadow="md"
                onClick={onOpenReview}
                px={5}
                _hover={{
                  boxShadow: "md",
                  transform: "translateY(-1px)",
                  bg: "green.600",
                }}
                _active={{ transform: "translateY(0)" }}
                transition="all 0.15s ease"
              >
                Leave review
              </Button>
            )}
            {!isVolunteer && isCreator && (
              <Tooltip.Root
                openDelay={150}
                disabled={!isEditDisabled}
                positioning={{ placement: "left" }}
              >
                <Tooltip.Trigger asChild>
                  {/* Wrap disabled button so tooltip still triggers */}
                  <Box as="span">
                    <Button
                      onClick={handleEdit}
                      bg="coral.500"
                      variant="solid"
                      size="md"
                      borderRadius="full"
                      px={5}
                      boxShadow="sm"
                      disabled={isEditDisabled}
                      _hover={{
                        boxShadow: "md",
                        transform: "translateY(-1px)",
                        bg: "coral.600",
                      }}
                      _active={{ transform: "translateY(0)" }}
                      transition="all 0.15s ease"
                    >
                      <Icon as={FaEdit as ElementType} mr={2} />
                      Edit
                    </Button>
                  </Box>
                </Tooltip.Trigger>
                <Tooltip.Positioner>
                  <Tooltip.Content
                    p={3}
                    bg="gray.300"
                    color="black"
                    borderRadius="md"
                  >
                    You can't edit a request once applications have been
                    submitted.
                  </Tooltip.Content>
                </Tooltip.Positioner>
              </Tooltip.Root>
            )}
            {isVolunteer && request.creator && (
              <Box>
                <HStack
                  gap={4}
                  p={4}
                  borderRadius="lg"
                  cursor="pointer"
                  onClick={handleCreatorClick}
                  transition="all 0.2s"
                  _hover={{ bg: "gray.100", transform: "translateY(-2px)" }}
                >
                  <VStack align="flex-end" gap={0.5}>
                    <Text
                      fontWeight="semibold"
                      fontSize="lg"
                      color="gray.800"
                      textAlign="right"
                    >
                      {getFullName(
                        request.creator.first_name,
                        request.creator.last_name
                      )}
                    </Text>
                    {request.creator.avg_rating && (
                      <HStack gap={1} color="gray.800" px={2} borderRadius="xl">
                        <Icon as={FaStar as ElementType} boxSize={4} />
                        <Text
                          fontSize="md"
                          fontWeight="semibold"
                          textAlign="right"
                        >
                          {request.creator.avg_rating.toFixed(1)}
                        </Text>
                      </HStack>
                    )}
                  </VStack>
                  <Avatar.Root
                    size="lg"
                    colorPalette={pickAvatarPalette(
                      request.creator.first_name,
                      request.creator.last_name
                    )}
                  >
                    <Avatar.Fallback
                      name={getFullName(
                        request.creator.first_name,
                        request.creator.last_name
                      )}
                    />
                  </Avatar.Root>
                </HStack>
              </Box>
            )}
          </HStack>
          {/* Accepted volunteer now rendered first in applicants grid */}
        </Stack>

        <Separator />

        {/* Description */}
        <Box>
          <Text fontSize="lg" fontWeight="semibold" color="gray.700" mb={2}>
            Description
          </Text>
          <Text fontSize="md" color="gray.600" lineHeight="1.7">
            {request.description}
          </Text>
        </Box>

        <Separator />

        {/* Location */}
        <Box>
          <Text fontSize="lg" fontWeight="semibold" color="gray.700" mb={2}>
            Location
          </Text>
          <HStack gap={2} color="gray.600">
            <Icon as={FaMapMarkerAlt as ElementType} boxSize={5} />
            <Text fontSize="md">
              {request.location_address || "Address not provided"}
            </Text>
          </HStack>
        </Box>

        <Separator />

        {/* Date Range */}
        <Box>
          <Text fontSize="lg" fontWeight="semibold" color="gray.700" mb={3}>
            Schedule
          </Text>
          <VStack align="start" gap={2}>
            <HStack gap={2} color="gray.600">
              <Icon as={FaCalendarAlt as ElementType} boxSize={5} />
              <Text fontSize="md">
                <Text as="span" fontWeight="semibold">
                  Start:
                </Text>{" "}
                {formatDateFull(request.start)}
              </Text>
            </HStack>
            <HStack gap={2} color="gray.600">
              <Icon as={FaCalendarAlt as ElementType} boxSize={5} />
              <Text fontSize="md">
                <Text as="span" fontWeight="semibold">
                  End:
                </Text>{" "}
                {formatDateFull(request.end)}
              </Text>
            </HStack>
          </VStack>
        </Box>

        <Separator />

        {/* Reward */}
        <Box>
          <Text fontSize="lg" fontWeight="semibold" color="gray.700" mb={2}>
            Reward
          </Text>
          <Text fontSize="xl" fontWeight="bold" color="green.600">
            ${request.reward}
          </Text>
        </Box>

        <Separator />

        {/* Request Types */}
        <Box>
          <Text fontSize="lg" fontWeight="semibold" color="gray.700" mb={3}>
            Request Types
          </Text>
          <RequestDetailsBadges requestTypes={request.request_types} />
        </Box>

        <Separator />

        {/* Applicants Section */}
        {isVolunteer ? (
          <ApplicantsSection
            variant="volunteer"
            applicationsCount={request.applications_count}
          />
        ) : (
          <Box>
            <Text fontSize="lg" fontWeight="semibold" color="gray.700" mb={3}>
              Applicants ({applications.length})
            </Text>
            {applications.length === 0 && !acceptedVolunteer ? (
              <Text color="gray.800">No applicants yet</Text>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                {(() => {
                  let ordered = applications.slice();
                  if (acceptedVolunteer) {
                    const index = ordered.findIndex(
                      (a) => a.user.id === acceptedVolunteer.id
                    );
                    const [acceptedApp] = ordered.splice(index, 1);
                    ordered = [acceptedApp, ...ordered];
                  }
                  return ordered.map((application) => {
                    const isAccepted =
                      !!acceptedVolunteer &&
                      application.user.id === acceptedVolunteer.id;
                    return (
                      <Box
                        key={application.user.id}
                        p={3}
                        bg={isAccepted ? "green.50" : "gray.50"}
                        borderRadius="lg"
                        cursor="pointer"
                        onClick={() =>
                          navigate(`/profile/${application.user.id}`)
                        }
                        transition="all 0.2s"
                        _hover={{
                          bg: isAccepted ? "green.100" : "gray.100",
                          transform: "translateY(-2px)",
                        }}
                        h="full"
                        position="relative"
                      >
                        <HStack gap={3} align="start">
                          <Avatar.Root
                            size="md"
                            colorPalette={pickAvatarPalette(
                              application.user.first_name,
                              application.user.last_name
                            )}
                          >
                            <Avatar.Fallback
                              name={getFullName(
                                application.user.first_name,
                                application.user.last_name
                              )}
                            />
                          </Avatar.Root>
                          <VStack align="start" gap={0} flex={1}>
                            <Text
                              fontWeight="semibold"
                              fontSize="md"
                              color="gray.800"
                            >
                              {getFullName(
                                application.user.first_name,
                                application.user.last_name
                              )}
                            </Text>
                            {application.user.avg_rating && (
                              <HStack gap={1} color="gray.800">
                                <Icon as={FaStar as ElementType} boxSize={3} />
                                <Text fontSize="sm">
                                  {application.user.avg_rating.toFixed(1)}
                                </Text>
                              </HStack>
                            )}
                          </VStack>
                          {isAccepted && (
                            <Icon
                              as={FaCheckCircle as ElementType}
                              boxSize={5}
                              color="green.500"
                            />
                          )}
                        </HStack>
                      </Box>
                    );
                  });
                })()}
              </SimpleGrid>
            )}
          </Box>
        )}

        {/* Apply Button for Volunteers */}
        {isVolunteer && <Box>{renderVolunteerAction()}</Box>}
      </Stack>
      <LeaveReviewModal
        isOpen={isReviewOpen}
        onClose={onCloseReview}
        requestId={request.id}
        isVolunteer={isVolunteer}
        onSubmitted={handleReviewSubmitted}
      />
      <SelectApplicantModal
        isOpen={isSelectOpen}
        onClose={onCloseSelect}
        applications={applications}
        onAccepted={handleAccepted}
      />
    </Box>
  );
};
