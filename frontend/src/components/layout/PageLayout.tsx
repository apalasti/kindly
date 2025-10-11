import { Box, type BoxProps } from "@chakra-ui/react";
import { type ReactNode } from "react";

interface PageLayoutProps extends Omit<BoxProps, "children"> {
  children: ReactNode;
  backgroundStyle?: React.CSSProperties;
}

export const PageLayout = ({
  children,
  backgroundStyle,
  ...boxProps
}: PageLayoutProps) => {
  return (
    <>
      {/* Fixed background layer that covers entire viewport */}
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        style={backgroundStyle}
        zIndex={-1}
        pointerEvents="none"
      />

      {/* Scrollable content layer */}
      <Box minH="100vh" position="relative" zIndex={0} {...boxProps}>
        {children}
      </Box>
    </>
  );
};
