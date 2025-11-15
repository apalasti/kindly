import { useNavigate } from "react-router-dom";
import { useState } from "react";
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
} from "react-icons/fa";
import { useDisclosure } from "@chakra-ui/react";
import { LeaveReviewModal } from "./LeaveReviewModal";
import { RequestDetailsBadges } from "./RequestDetailsBadges";
import { ApplicantsSection } from "./ApplicantsSection";
import { SelectApplicantModal } from "./SelectApplicantModal";
import { VolunteerAction, HelpSeekerActions } from "./RequestDetailsActions";
import {
  type RequestDetails as RequestDetailsType,
  type RequestApplication,
  type HelpSeekerRequestDetails,
  type VolunteerRequestDetails,
  RequestStatus,
  ApplicationStatus,
} from "../../types";
import type { ElementType } from "react";
import { getFullName, pickAvatarPalette } from "../../utils/avatar";
import { formatDateFull } from "../../utils/date";
import { requestService } from "../../services/request.service";
import { toaster } from "../ui/toaster";

interface RequestDetailsProps {
  request: RequestDetailsType;
  applications?: RequestApplication[];
  isVolunteer: boolean;
}

export const RequestDetails = ({
  request,
  applications,
  isVolunteer,
}: RequestDetailsProps) => {
  const navigate = useNavigate();
  const isCreator = !isVolunteer;

  const apps = applications ?? [];

  const acceptedVolunteer =
    apps.find((app) => app.status === ApplicationStatus.ACCEPTED)?.volunteer ||
    null;

  const canSelectApplicant =
    !isVolunteer && isCreator && !acceptedVolunteer && apps.length > 0;

  const canMarkComplete =
    !isVolunteer &&
    isCreator &&
    !!acceptedVolunteer &&
    request.status !== RequestStatus.COMPLETED;

  const {
    open: isSelectOpen,
    onOpen: onOpenSelect,
    onClose: onCloseSelect,
  } = useDisclosure();
  const handleAccepted = async (userId: number) => {
    try {
      const res = await requestService.acceptApplication(request.id, userId);
      if (res.success) {
        toaster.create({
          title: "Success",
          description: "Volunteer selected successfully",
          type: "success",
          duration: 5000,
        });
        onCloseSelect();
        window.location.reload();
      } else {
        throw new Error(res.message || "Failed to accept application");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Please try again";
      toaster.create({
        title: "Couldn't select volunteer",
        description: errorMessage,
        type: "error",
        duration: 5000,
      });
    }
  };

  const volunteerRequest = request as VolunteerRequestDetails;

  const rating: number | undefined = isVolunteer
    ? volunteerRequest.creator.avg_rating
    : undefined;
  const showRating = rating !== undefined && rating > 0;

  const isEditDisabled = apps.length > 0;

  const handleEdit = () => {
    if (!isEditDisabled) {
      navigate(`/requests/${request.id}/edit`);
    }
  };

  const handleCreatorClick = () => {
    if (isVolunteer && volunteerRequest.creator) {
      navigate(`/profile/${volunteerRequest.creator.id}`);
    }
  };

  const currentVolunteerAccepted =
    isVolunteer &&
    volunteerRequest.application_status === ApplicationStatus.ACCEPTED;
  const otherVolunteerAccepted =
    isVolunteer &&
    !currentVolunteerAccepted &&
    (volunteerRequest.application_status === ApplicationStatus.DECLINED ||
      volunteerRequest.status === RequestStatus.CLOSED);

  // Review modal state
  const {
    open: isReviewOpen,
    onOpen: onOpenReview,
    onClose: onCloseReview,
  } = useDisclosure();

  const [canLeaveReview, setCanLeaveReview] = useState(
    request.status === RequestStatus.COMPLETED &&
      ((currentVolunteerAccepted && !volunteerRequest.has_rated_seeker) ||
        (isCreator && !(request as HelpSeekerRequestDetails).has_rated_helper))
  );

  const handleReviewSubmitted = () => {
    setCanLeaveReview(false);
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
              {request.name}
            </Text>
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
            {isVolunteer && volunteerRequest.creator && (
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
                        volunteerRequest.creator.first_name,
                        volunteerRequest.creator.last_name
                      )}
                    </Text>
                    {showRating && (
                      <HStack gap={1} color="gray.800" px={2} borderRadius="xl">
                        <Icon as={FaStar as ElementType} boxSize={4} />
                        <Text
                          fontSize="md"
                          fontWeight="semibold"
                          textAlign="right"
                        >
                          {rating.toFixed(1)}
                        </Text>
                      </HStack>
                    )}
                  </VStack>
                  <Avatar.Root
                    size="lg"
                    colorPalette={pickAvatarPalette(
                      volunteerRequest.creator.first_name,
                      volunteerRequest.creator.last_name
                    )}
                  >
                    <Avatar.Fallback
                      name={getFullName(
                        volunteerRequest.creator.first_name,
                        volunteerRequest.creator.last_name
                      )}
                    />
                  </Avatar.Root>
                </HStack>
              </Box>
            )}
          </HStack>
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
              {request.address || "Address not provided"}
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
            applicationsCount={request.application_count}
          />
        ) : (
          <Box>
            <Text fontSize="lg" fontWeight="semibold" color="gray.700" mb={3}>
              Applicants ({apps.length})
            </Text>
            {apps.length === 0 && !acceptedVolunteer ? (
              <Text color="gray.800">No applicants yet</Text>
            ) : (
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} gap={6}>
                {(() => {
                  let ordered = apps.slice();
                  if (acceptedVolunteer) {
                    const index = ordered.findIndex(
                      (a) => a.volunteer.id === acceptedVolunteer.id
                    );
                    const [acceptedApp] = ordered.splice(index, 1);
                    ordered = [acceptedApp, ...ordered];
                  }
                  return ordered.map((application) => {
                    const isAccepted =
                      !!acceptedVolunteer &&
                      application.volunteer.id === acceptedVolunteer.id;
                    return (
                      <Box
                        key={application.volunteer.id}
                        p={3}
                        bg={isAccepted ? "green.50" : "gray.50"}
                        borderRadius="lg"
                        cursor="pointer"
                        onClick={() =>
                          navigate(`/profile/${application.volunteer.id}`)
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
                              application.volunteer.first_name,
                              application.volunteer.last_name
                            )}
                          >
                            <Avatar.Fallback
                              name={getFullName(
                                application.volunteer.first_name,
                                application.volunteer.last_name
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
                                application.volunteer.first_name,
                                application.volunteer.last_name
                              )}
                            </Text>
                            {application.volunteer.avg_rating ? (
                              <HStack gap={1} color="gray.800">
                                <Icon as={FaStar as ElementType} boxSize={3} />
                                <Text fontSize="sm">
                                  {application.volunteer.avg_rating.toFixed(1)}
                                </Text>
                              </HStack>
                            ) : (
                              <Text fontSize="sm" color="gray.600">
                                No ratings yet
                              </Text>
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

        {/* Actions by actor type */}
        {isVolunteer ? (
          <Box>
            <VolunteerAction
              request={volunteerRequest}
              currentVolunteerAccepted={currentVolunteerAccepted}
              otherVolunteerAccepted={otherVolunteerAccepted}
              applicationStatus={volunteerRequest.application_status}
            />
          </Box>
        ) : (
          <HelpSeekerActions
            request={request as HelpSeekerRequestDetails}
            canSelectApplicant={canSelectApplicant}
            canMarkComplete={canMarkComplete}
            onOpenSelect={onOpenSelect}
          />
        )}
      </Stack>
      <LeaveReviewModal
        isOpen={isReviewOpen}
        onClose={onCloseReview}
        requestId={request.id}
        isVolunteer={isVolunteer}
        onSubmitted={handleReviewSubmitted}
      />
      {!isVolunteer && (
        <SelectApplicantModal
          isOpen={isSelectOpen}
          onClose={onCloseSelect}
          applications={apps}
          onAccepted={handleAccepted}
        />
      )}
    </Box>
  );
};
