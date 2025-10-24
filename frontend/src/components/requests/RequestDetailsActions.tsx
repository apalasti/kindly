import { useState } from "react";
import { HStack, Button, Text, Icon } from "@chakra-ui/react";
import {
  FaCheckCircle,
  FaEnvelopeOpenText,
  FaClock,
  FaTimesCircle,
} from "react-icons/fa";
import type { ElementType } from "react";
import {
  type VolunteerRequestDetails,
  type HelpSeekerRequestDetails,
  AcceptanceStatus,
} from "../../types";
import { requestService } from "../../services/request.service";
import { toaster } from "../ui/toaster";

type VolunteerActionProps = {
  request: VolunteerRequestDetails;
  currentVolunteerAccepted: boolean;
  otherVolunteerAccepted: boolean;
  acceptanceStatus?: AcceptanceStatus;
};

export const VolunteerAction = ({
  request,
  currentVolunteerAccepted,
  otherVolunteerAccepted,
  acceptanceStatus,
}: VolunteerActionProps) => {
  const [isApplying, setIsApplying] = useState(false);
  const [localAcceptanceStatus, setLocalAcceptanceStatus] =
    useState(acceptanceStatus);

  const handleApply = async () => {
    try {
      setIsApplying(true);
      const res = await requestService.applyToRequest(request.id);
      if (res.success) {
        setLocalAcceptanceStatus(AcceptanceStatus.PENDING);
        toaster.create({
          title: "Application submitted",
          description: "You've applied to help on this request.",
          type: "success",
          duration: 4000,
        });
      } else {
        throw new Error(res.message || "Failed to apply");
      }
    } catch (e) {
      console.error("Apply failed", e);
      toaster.create({
        title: "Couldn't apply",
        description: "Please try again",
        type: "error",
        duration: 5000,
      });
    } finally {
      setIsApplying(false);
    }
  };

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
        <Icon as={FaCheckCircle as ElementType} boxSize={5} color="gray.600" />
        <Text color="gray.700" fontWeight="semibold" fontSize="lg">
          This request has been completed
        </Text>
      </HStack>
    );
  }

  if (currentVolunteerAccepted) {
    return (
      <HStack gap={2} p={4} bg="teal.50" borderRadius="lg" justify="center">
        <Icon as={FaCheckCircle as ElementType} boxSize={5} color="teal.500" />
        <Text color="teal.600" fontWeight="semibold" fontSize="lg">
          You have been accepted for this request
        </Text>
      </HStack>
    );
  }

  if (localAcceptanceStatus === AcceptanceStatus.PENDING) {
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
        loading={isApplying}
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

type HelpSeekerActionsProps = {
  request: HelpSeekerRequestDetails;
  canSelectApplicant: boolean;
  canMarkComplete: boolean;
  onOpenSelect: () => void;
};

export const HelpSeekerActions = ({
  request,
  canSelectApplicant,
  canMarkComplete,
  onOpenSelect,
}: HelpSeekerActionsProps) => {
  const handleMarkComplete = async () => {
    try {
      await requestService.completeRequest(request.id);
      window.location.reload();
    } catch (e) {
      console.error("Mark as completed failed", e);
      toaster.create({
        title: "Mark as completed failed",
        description: "Please try again",
        type: "error",
        duration: 5000,
      });
    }
  };

  return (
    <HStack gap={3} justify="center">
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
      {canMarkComplete && (
        <Button
          size="md"
          variant="solid"
          bg="green.500"
          color="white"
          borderRadius="full"
          boxShadow="md"
          onClick={handleMarkComplete}
          px={5}
          _hover={{
            boxShadow: "md",
            transform: "translateY(-1px)",
            bg: "green.600",
          }}
          _active={{ transform: "translateY(0)" }}
          transition="all 0.15s ease"
        >
          Mark as completed
        </Button>
      )}
    </HStack>
  );
};
