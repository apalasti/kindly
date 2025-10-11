import React from "react";
import { Box } from "@chakra-ui/react";
import { LogoIcon, type ActorType } from "./logo-icon";

interface LogoProps {
  actorType?: ActorType;
  className?: string;
  // Controls BOTH the text font-size and the icon height.
  // Accepts a number (px) or any valid CSS size string (e.g., '5rem').
  size?: number | string;
}
export const Logo: React.FC<LogoProps> = ({
  actorType = "volunteer",
  className = "",
  size = "5rem",
}) => {
  const resolvedSize = typeof size === "number" ? `${size}px` : size ?? "5rem";
  const iconSize = `calc(${resolvedSize} * 1.05)`;
  const iconYOffset = `calc(${resolvedSize} * -0.05)`;

  return (
    <div
      className={className}
      role="img"
      aria-label="Kindly logo"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 0,
      }}
    >
      <LogoIcon
        actorType={actorType}
        size={iconSize}
        style={{ transform: `translateY(${iconYOffset})` }}
      />
      <Box
        as="span"
        color="primary.500"
        style={{
          fontFamily: "'Bukhari Script', cursive",
          fontSize: resolvedSize,
          lineHeight: 1,
          marginLeft: `calc(${resolvedSize} * 0.05)`,
        }}
      >
        Kindly
      </Box>
    </div>
  );
};

export default Logo;
