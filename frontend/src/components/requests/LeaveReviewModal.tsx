import { useState } from "react";
import { Button, HStack, Stack, Icon, Dialog, Portal } from "@chakra-ui/react";
import type { ElementType } from "react";
import { FaStar } from "react-icons/fa";
import { requestService } from "../../services/request.service";
import { toaster } from "../ui/toaster";

interface LeaveReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: number;
  isVolunteer: boolean;
  onSubmitted?: (rating: number) => void;
}

export const LeaveReviewModal = ({
  isOpen,
  onClose,
  requestId,
  isVolunteer,
  onSubmitted,
}: LeaveReviewModalProps) => {
  const [selectedRating, setSelectedRating] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Track if save happened to avoid clearing before parent refresh if needed
  const [didSave, setDidSave] = useState(false);

  const handleSave = async () => {
    if (selectedRating < 1) return;
    try {
      setIsSaving(true);
      await requestService.rateRequestParticipant(requestId, selectedRating, {
        is_volunteer: isVolunteer,
      });
      onSubmitted?.(selectedRating);
      setDidSave(true);
      toaster.create({
        title: "Success",
        description: "Your review has been submitted",
        type: "success",
        duration: 5000,
      });
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  // When dialog closes (and not due to save), reset state
  const handleOpenChange = (d: { open: boolean }) => {
    if (!d.open) {
      if (!didSave) {
        setSelectedRating(0);
        setHoverRating(null);
      }
      setDidSave(false); // reset flag
      onClose();
    }
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleOpenChange}>
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
            maxW="400px"
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
              Leave review
            </Dialog.Header>
            <Dialog.Body px={6} py={6}>
              <Stack gap={5} align="center">
                <HStack>
                  {Array.from({ length: 5 }).map((_, i) => {
                    const starValue = i + 1;
                    const active =
                      hoverRating != null
                        ? hoverRating >= starValue
                        : selectedRating >= starValue;
                    return (
                      <Icon
                        as={FaStar as ElementType}
                        key={starValue}
                        boxSize={9}
                        cursor="pointer"
                        color={active ? "yellow.800" : "gray.300"}
                        transition="color 0.12s, transform 0.12s"
                        onMouseEnter={() => setHoverRating(starValue)}
                        onMouseLeave={() => setHoverRating(null)}
                        onClick={() => setSelectedRating(starValue)}
                        _hover={{
                          transform: "scale(1.08)",
                          color: active ? "yellow.800" : "gray.400",
                        }}
                      />
                    );
                  })}
                </HStack>
              </Stack>
            </Dialog.Body>
            <Dialog.Footer px={6} pb={5} pt={0}>
              <HStack w="full" justify="flex-end" gap={3}>
                <Button
                  variant="ghost"
                  onClick={onClose}
                  disabled={isSaving}
                  px={6}
                  py={5}
                  borderRadius="lg"
                  _hover={{ transform: "translateY(-1px)" }}
                >
                  Cancel
                </Button>
                <Button
                  bg="gray.700"
                  onClick={handleSave}
                  disabled={selectedRating === 0 || isSaving}
                  loading={isSaving}
                  px={7}
                  py={5}
                  borderRadius="lg"
                  _hover={{ bg: "gray.800", transform: "translateY(-1px)" }}
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
