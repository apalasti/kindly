// Background configurations for different user types
export const backgroundStyles = {
  volunteer: {
    background: "#f9ffff", // teal-tinted background
    backgroundImage: `
      radial-gradient(circle at 15% 20%, rgba(102, 178, 176, 0.12) 0%, transparent 40%),
      radial-gradient(circle at 85% 30%, rgba(180, 227, 61, 0.08) 0%, transparent 35%),
      radial-gradient(circle at 25% 75%, rgba(244, 254, 193, 0.15) 0%, transparent 45%),
      radial-gradient(circle at 70% 85%, rgba(102, 178, 176, 0.1) 0%, transparent 40%),
      radial-gradient(circle at 50% 50%, rgba(230, 245, 244, 0.2) 0%, transparent 60%)
    `,
  },
  helpSeeker: {
    background: "#fffcfb", // coral-tinted background
    backgroundImage: `
      radial-gradient(circle at 10% 20%, rgba(238, 157, 131, 0.12) 0%, transparent 40%),
      radial-gradient(circle at 80% 25%, rgba(247, 240, 174, 0.15) 0%, transparent 35%),
      radial-gradient(circle at 30% 70%, rgba(252, 217, 208, 0.18) 0%, transparent 45%),
      radial-gradient(circle at 75% 80%, rgba(244, 254, 193, 0.12) 0%, transparent 40%),
      radial-gradient(circle at 50% 50%, rgba(254, 243, 240, 0.2) 0%, transparent 60%)
    `,
  },
  both: {
    background: "linear-gradient(135deg, #fffcfb 0%, #f9ffff 100%)", // gradient from coral-tinted to teal-tinted
    backgroundImage: `
      radial-gradient(circle at 10% 15%, rgba(238, 157, 131, 0.1) 0%, transparent 35%),
      radial-gradient(circle at 90% 20%, rgba(102, 178, 176, 0.1) 0%, transparent 35%),
      radial-gradient(circle at 20% 80%, rgba(102, 178, 176, 0.12) 0%, transparent 40%),
      radial-gradient(circle at 80% 75%, rgba(238, 157, 131, 0.12) 0%, transparent 40%),
      radial-gradient(circle at 50% 50%, rgba(244, 254, 193, 0.15) 0%, transparent 50%),
      radial-gradient(circle at 35% 40%, rgba(252, 217, 208, 0.1) 0%, transparent 35%),
      radial-gradient(circle at 65% 60%, rgba(230, 245, 244, 0.1) 0%, transparent 35%)
    `,
  },
};

export const accentColorScale = {
  volunteer: {
    300: "teal.300",
    400: "teal.400",
    500: "teal.500",
    600: "teal.600",
  },
  helpSeeker: {
    300: "coral.300",
    400: "coral.400",
    500: "coral.500",
    600: "coral.600",
  },
} as const;

// Get background style based on user type
export const getBackgroundStyle = (isVolunteer: boolean) => {
  return isVolunteer ? backgroundStyles.volunteer : backgroundStyles.helpSeeker;
};

// Get accent color based on user type
export const getAccentColor = (
  isVolunteer: boolean,
  shade: boolean = false
) => {
  if (shade) {
    return isVolunteer
      ? accentColorScale.volunteer[400]
      : accentColorScale.helpSeeker[600];
  }
  return isVolunteer
    ? accentColorScale.volunteer[300]
    : accentColorScale.helpSeeker[500];
};
