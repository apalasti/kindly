import { Dialog, Portal, Button, HStack, VStack, Icon } from "@chakra-ui/react";
import { FaExclamationTriangle, FaInfoCircle } from "react-icons/fa";
import type { ElementType } from "react";

export type ConfirmDialogVariant = "danger" | "info";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmDialogVariant;
  icon?: ElementType;
  isVolunteer: boolean;
}

export const ConfirmDialog = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "danger",
  icon,
  isVolunteer,
}: ConfirmDialogProps) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          iconColor: "error.500",
          confirmBg: "error.500",
          confirmHoverBg: "error.600",
          defaultIcon: FaExclamationTriangle,
        };
      case "info":
        return {
          iconColor: isVolunteer ? "teal.500" : "coral.600",
          confirmBg: isVolunteer ? "teal.500" : "coral.600",
          confirmHoverBg: isVolunteer ? "teal.600" : "coral.700",
          defaultIcon: FaInfoCircle,
        };
      default:
        return {
          iconColor: "error.500",
          confirmBg: "error.500",
          confirmHoverBg: "error.600",
          defaultIcon: FaExclamationTriangle,
        };
    }
  };

  const styles = getVariantStyles();
  const IconComponent = icon || styles.defaultIcon;

  return (
    <Portal>
      <Dialog.Root
        open={isOpen}
        onOpenChange={(e) => {
          if (!e.open) onClose();
        }}
        placement="center"
        motionPreset="slide-in-bottom"
      >
        <Dialog.Backdrop
          bg="blackAlpha.600"
          backdropFilter="blur(4px)"
          transition="all 0.2s"
        />
        <Dialog.Positioner>
          <Dialog.Content
            bg="white"
            borderRadius="2xl"
            boxShadow="2xl"
            p={8}
            maxW="500px"
            mx={4}
          >
            <VStack gap={6} align="stretch">
              {/* Icon and Title */}
              <VStack gap={4} align="center">
                <Icon
                  as={IconComponent as ElementType}
                  boxSize={12}
                  color={styles.iconColor}
                />
                <Dialog.Title
                  fontSize="2xl"
                  fontWeight="bold"
                  color="gray.800"
                  textAlign="center"
                >
                  {title}
                </Dialog.Title>
              </VStack>

              {/* Message */}
              <Dialog.Description
                fontSize="md"
                color="gray.600"
                textAlign="center"
                lineHeight="tall"
              >
                {message}
              </Dialog.Description>

              {/* Action Buttons */}
              <HStack gap={4} justify="center" pt={2}>
                <Button
                  variant="outline"
                  onClick={onClose}
                  px={6}
                  py={5}
                  fontSize="md"
                  borderWidth="2px"
                  _hover={{ bg: "gray.50" }}
                  flex={1}
                >
                  {cancelLabel}
                </Button>
                <Button
                  bg={styles.confirmBg}
                  color="white"
                  onClick={handleConfirm}
                  px={6}
                  py={5}
                  fontSize="md"
                  _hover={{ bg: styles.confirmHoverBg }}
                  flex={1}
                >
                  {confirmLabel}
                </Button>
              </HStack>
            </VStack>
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>
    </Portal>
  );
};
