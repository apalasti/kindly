import React from "react";
import logoBlue from "../../assets/images/logo-blue.svg";
import logoOrange from "../../assets/images/logo-orange.svg";

export type ActorType = "volunteer" | "help-seeker";

export interface LogoIconProps {
  actorType?: ActorType;
  size?: "small" | "medium" | "large" | number | string;
  className?: string;
  style?: React.CSSProperties;
  fit?: "contain" | "cover" | "fill" | "none" | "scale-down";
  alt?: string;
}

const sizeToHeight = (size: LogoIconProps["size"]): string => {
  if (typeof size === "number") return `${size}px`;
  if (typeof size === "string") {
    switch (size) {
      case "small":
        return "24px";
      case "medium":
        return "32px";
      case "large":
        return "48px";
      default:
        return size;
    }
  }
  return "32px"; // default
};

export const LogoIcon: React.FC<LogoIconProps> = ({
  actorType = "volunteer",
  size = "medium",
  className = "",
  style,
  fit = "contain",
  alt,
}) => {
  const logoSrc = actorType === "volunteer" ? logoBlue : logoOrange;
  const height = sizeToHeight(size);

  return (
    <img
      src={logoSrc}
      alt={alt ?? `Kindly ${actorType} logo`}
      className={className}
      style={{
        height,
        width: "auto",
        objectFit: fit,
        display: "block",
        verticalAlign: "middle",
        ...style,
      }}
    />
  );
};

export default LogoIcon;
