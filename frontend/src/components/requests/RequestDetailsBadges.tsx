import { HStack, Badge } from "@chakra-ui/react";
import type { RequestType } from "../../types";

interface RequestDetailsBadgesProps {
  requestTypes: RequestType[];
}

export const RequestDetailsBadges = ({
  requestTypes,
}: RequestDetailsBadgesProps) => {
  if (requestTypes.length === 0) return null;

  return (
    <HStack gap={2} flexWrap="wrap">
      {requestTypes.map((type) => (
        <Badge
          key={type.id}
          colorScheme="purple"
          variant="subtle"
          fontSize="md"
          py={2}
          px={3}
          borderRadius="md"
        >
          {type.name}
        </Badge>
      ))}
    </HStack>
  );
};
