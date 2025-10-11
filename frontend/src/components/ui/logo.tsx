import React from "react";
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
  const iconSize = `calc(${resolvedSize} * 1.8)`;
  const iconYOffset = `calc(${resolvedSize} * 0.15)`;

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
      <span
        style={{
          fontFamily: "'Bukhari Script', cursive",
          color: "#3d4248",
          fontSize: resolvedSize,
          lineHeight: 1,
          // Counter the left side-bearing of the script font so the text hugs the icon
          marginLeft: `calc(${resolvedSize} * -0.5)`,
        }}
      >
        Kindly
      </span>
    </div>
  );
};

export default Logo;
