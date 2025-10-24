import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Text,
  HStack,
  VStack,
  Button,
  Icon,
  Stack,
} from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/react/avatar";
import {
  DialogRoot,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogBody,
  DialogBackdrop,
  DialogCloseTrigger,
} from "@chakra-ui/react/dialog";
import { FaUsers, FaStar } from "react-icons/fa";
import type { RequestApplication } from "../../types";
import type { ElementType } from "react";
import { getFullName, pickAvatarPalette } from "../../utils/avatar";

// Volunteer view - only sees count
interface VolunteerApplicantsProps {
  variant: "volunteer";
  applicationsCount: number;
}

// Help-seeker view - sees full list
interface HelpSeekerApplicantsProps {
  variant: "help-seeker";
  applications: RequestApplication[];
  isCreator: boolean;
}

type ApplicantsSectionProps =
  | VolunteerApplicantsProps
  | HelpSeekerApplicantsProps;

export const ApplicantsSection = (props: ApplicantsSectionProps) => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Volunteer view - only shows count
  if (props.variant === "volunteer") {
    const { applicationsCount } = props;

    if (applicationsCount === 0) {
      return (
        <Box>
          <Text fontSize="lg" fontWeight="semibold" color="gray.700" mb={3}>
            Applicants
          </Text>
          <Text color="gray.500">No applicants yet</Text>
        </Box>
      );
    }

    return (
      <Box>
        <Text fontSize="lg" fontWeight="semibold" color="gray.700" mb={3}>
          Applicants
        </Text>
        <HStack gap={2} color="gray.600">
          <Icon as={FaUsers as ElementType} boxSize={5} />
          <Text fontSize="md">
            {applicationsCount}{" "}
            {applicationsCount === 1 ? "applicant" : "applicants"}
          </Text>
        </HStack>
      </Box>
    );
  }

  // Help-seeker view - shows avatar group and modal
  const { applications, isCreator } = props;

  if (applications.length === 0) {
    return (
      <Box>
        <Text fontSize="lg" fontWeight="semibold" color="gray.700" mb={3}>
          Applicants
        </Text>
        <Text color="gray.500">No applicants yet</Text>
      </Box>
    );
  }

  const maxVisible = 4;
  const visibleApplicants = applications.slice(0, maxVisible);
  const remainingCount = Math.max(0, applications.length - maxVisible);

  return (
    <>
      <Box>
        <Text fontSize="lg" fontWeight="semibold" color="gray.700" mb={3}>
          Applicants ({applications.length})
        </Text>
        <Box
          cursor={isCreator ? "pointer" : "default"}
          onClick={() => isCreator && setIsModalOpen(true)}
          transition="transform 0.2s"
          _hover={isCreator ? { transform: "scale(1.02)" } : {}}
        >
          <HStack gap={0} spaceX="-3">
            {visibleApplicants.map((application) => (
              <Avatar.Root
                key={application.volunteer.id}
                size="lg"
                colorPalette={pickAvatarPalette(
                  application.volunteer.first_name,
                  application.volunteer.last_name
                )}
                borderWidth="2px"
                borderColor="white"
              >
                <Avatar.Fallback
                  name={getFullName(
                    application.volunteer.first_name,
                    application.volunteer.last_name
                  )}
                />
              </Avatar.Root>
            ))}
            {remainingCount > 0 && (
              <Avatar.Root size="lg" variant="solid" colorPalette="gray">
                <Avatar.Fallback>+{remainingCount}</Avatar.Fallback>
              </Avatar.Root>
            )}
          </HStack>
        </Box>
      </Box>

      {/* Modal for applicants list */}
      <DialogRoot
        open={isModalOpen}
        onOpenChange={(e) => setIsModalOpen(e.open)}
        size="md"
      >
        <DialogBackdrop />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Applicants</DialogTitle>
          </DialogHeader>
          <DialogCloseTrigger />
          <DialogBody>
            <Stack gap={3}>
              {applications.map((application) => (
                <Button
                  key={application.volunteer.id}
                  onClick={() => {
                    navigate(`/profile/${application.volunteer.id}`);
                    setIsModalOpen(false);
                  }}
                  variant="outline"
                  size="lg"
                  justifyContent="flex-start"
                  px={4}
                  py={6}
                  _hover={{ bg: "gray.50" }}
                >
                  <HStack gap={3} w="full">
                    <Avatar.Root
                      size="md"
                      colorPalette={pickAvatarPalette(
                        application.volunteer.first_name,
                        application.volunteer.last_name
                      )}
                    >
                      <Avatar.Fallback
                        name={application.volunteer.first_name}
                      />
                    </Avatar.Root>
                    <VStack align="start" gap={0} flex={1}>
                      <Text fontWeight="semibold" fontSize="md">
                        {`${application.volunteer.first_name} ${application.volunteer.last_name}`}
                      </Text>
                      {application.volunteer.avg_rating && (
                        <HStack gap={1} color="grey.700">
                          <Icon as={FaStar as ElementType} boxSize={3} />
                          <Text fontSize="sm">
                            {application.volunteer.avg_rating.toFixed(1)}
                          </Text>
                        </HStack>
                      )}
                    </VStack>
                  </HStack>
                </Button>
              ))}
            </Stack>
          </DialogBody>
        </DialogContent>
      </DialogRoot>
    </>
  );
};
