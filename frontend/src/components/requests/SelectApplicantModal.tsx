import { useState } from "react";
import {
  Button,
  HStack,
  Stack,
  Dialog,
  Portal,
  Box,
  Text,
  Avatar,
  Icon,
  ScrollArea,
} from "@chakra-ui/react";
import type { RequestApplication } from "../../types";
import type { ElementType } from "react";
import { FaCheckCircle, FaStar } from "react-icons/fa";
import { toaster } from "../ui/toaster";
import { getFullName, pickAvatarPalette } from "../../utils/avatar";

interface SelectApplicantModalProps {
  isOpen: boolean;
  onClose: () => void;
  applications: RequestApplication[];
  onAccepted: (userId: number) => void;
}

export const SelectApplicantModal = ({
  isOpen,
  onClose,
  applications,
  onAccepted,
}: SelectApplicantModalProps) => {
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!selectedUserId) return;
    try {
      setIsSaving(true);
      onAccepted(selectedUserId);
      toaster.create({
        title: "Success",
        description: "Volunteer selected successfully",
        type: "success",
        duration: 5000,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  const resetAndClose = () => {
    setSelectedUserId(null);
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(d) => !d.open && resetAndClose()}>
      <Portal>
        <Dialog.Backdrop bg="blackAlpha.600" backdropFilter="blur(2px)" />
        <Dialog.Positioner
          zIndex={2000}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Dialog.Content
            borderRadius="xl"
            boxShadow="2xl"
            maxW="480px"
            w="full"
            p={0}
            overflow="hidden"
          >
            <Dialog.Header
              px={6}
              pt={5}
              pb={0}
              fontSize="xl"
              fontWeight="semibold"
            >
              Select applicant
            </Dialog.Header>
            <Dialog.Body px={6} py={5}>
              <Stack gap={4} maxH="300px">
                <ScrollArea.Root>
                  <ScrollArea.Viewport pr={5}>
                    <Stack gap={2}>
                      {applications.map((app) => {
                        const isSelected = selectedUserId === app.user.id;
                        return (
                          <HStack
                            key={app.user.id}
                            p={3}
                            borderRadius="md"
                            bg={isSelected ? "green.50" : "gray.50"}
                            cursor="pointer"
                            borderWidth={isSelected ? "2px" : "1px"}
                            borderColor={isSelected ? "green.400" : "gray.200"}
                            transition="all 0.15s"
                            _hover={{
                              bg: isSelected ? "green.100" : "gray.100",
                            }}
                            onClick={() => setSelectedUserId(app.user.id)}
                          >
                            <Avatar.Root
                              size="sm"
                              colorPalette={pickAvatarPalette(
                                app.user.first_name,
                                app.user.last_name
                              )}
                            >
                              <Avatar.Fallback
                                name={getFullName(
                                  app.user.first_name,
                                  app.user.last_name
                                )}
                              />
                            </Avatar.Root>
                            <Stack flex={1} gap={0}>
                              <Text fontWeight="semibold" color="gray.800">
                                {getFullName(
                                  app.user.first_name,
                                  app.user.last_name
                                )}
                              </Text>
                              {app.user.avg_rating && (
                                <HStack gap={1} fontSize="xs" color="gray.600">
                                  <Icon as={FaStar as ElementType} />
                                  <Text>{app.user.avg_rating.toFixed(1)}</Text>
                                </HStack>
                              )}
                            </Stack>
                            {isSelected && (
                              <Icon
                                as={FaCheckCircle as ElementType}
                                color="green.500"
                                boxSize={5}
                              />
                            )}
                          </HStack>
                        );
                      })}
                      {applications.length === 0 && (
                        <Box p={4} textAlign="center" color="gray.600">
                          No applicants yet.
                        </Box>
                      )}
                    </Stack>
                  </ScrollArea.Viewport>
                  <ScrollArea.Scrollbar orientation="vertical" />
                </ScrollArea.Root>
              </Stack>
            </Dialog.Body>
            <Dialog.Footer px={6} pb={5} pt={0}>
              <HStack w="full" justify="flex-end" gap={3}>
                <Button
                  variant="ghost"
                  onClick={resetAndClose}
                  px={6}
                  py={5}
                  borderRadius="lg"
                >
                  Cancel
                </Button>
                <Button
                  bg="gray.700"
                  _hover={{ bg: "gray.800", transform: "translateY(-1px)" }}
                  onClick={handleSave}
                  disabled={!selectedUserId || isSaving}
                  loading={isSaving}
                  px={7}
                  py={5}
                  borderRadius="lg"
                >
                  Save
                </Button>
              </HStack>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};
