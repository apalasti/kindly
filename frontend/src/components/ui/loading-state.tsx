import { Center, Stack, Spinner, Text } from "@chakra-ui/react";

export interface LoadingStateProps {
  message?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  colorScheme?: string;
  fullHeight?: boolean;
}

/**
 * Reusable loading state component
 * @param message - Loading message to display
 * @param size - Size of the spinner
 * @param colorScheme - Color scheme for the spinner
 * @param fullHeight - Whether to use full viewport height
 */
export const LoadingState = ({
  message = "Loading...",
  size = "xl",
  colorScheme = "coral.500",
  fullHeight = false,
}: LoadingStateProps) => {
  return (
    <Center py={fullHeight ? 0 : 12} h={fullHeight ? "100vh" : "auto"}>
      <Stack align="center" gap={4}>
        <Spinner size={size} color={colorScheme} />
        <Text color="gray.600">{message}</Text>
      </Stack>
    </Center>
  );
};
