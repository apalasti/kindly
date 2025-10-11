import { createSystem, defaultConfig, defineTokens } from "@chakra-ui/react";

const colors = {
  primary: {
    50: "#f0f1f2",
    100: "#d9dbdc",
    200: "#b8bcc0",
    300: "#969ca3",
    400: "#6a7178",
    500: "#3D4248", // Main dark gray
    600: "#32373c",
    700: "#272b2f",
    800: "#1c1f22",
    900: "#111315",
  },
  teal: {
    50: "#e6f5f4",
    100: "#b3e0de",
    200: "#80cbc8",
    300: "#66B2B0", // Main teal
    400: "#52a09e",
    500: "#3e8e8c",
    600: "#357a78",
    700: "#2c6664",
    800: "#235250",
    900: "#1a3e3c",
  },
  coral: {
    50: "#fef3f0",
    100: "#fcd9d0",
    200: "#f9bfb0",
    300: "#f7a590",
    400: "#f3a189",
    500: "#EE9D83", // Main coral
    600: "#e88a6f",
    700: "#e2775b",
    800: "#dc6447",
    900: "#d65133",
  },
  cream: {
    50: "#fefef9",
    100: "#fcfce8",
    200: "#fafad7",
    300: "#f8f8c6",
    400: "#f6f6b5",
    500: "#F4FEC1", // Light cream
    600: "#f2fcb0",
    700: "#f0fa9f",
    800: "#eef88e",
    900: "#ecf67d",
  },
  yellow: {
    50: "#fefdf5",
    100: "#fcf9e0",
    200: "#faf5cb",
    300: "#f9f2b6",
    400: "#f8f0b2",
    500: "#F7F0AE", // Main yellow
    600: "#f5ee9a",
    700: "#f3ec86",
    800: "#f1ea72",
    900: "#efe85e",
  },
  error: {
    50: "#fde8eb",
    100: "#f9b8c0",
    200: "#f58895",
    300: "#f1586a",
    400: "#c5042a",
    500: "#9A031E", // Error red
    600: "#7b0218",
    700: "#5c0212",
    800: "#3d010c",
    900: "#1e0106",
  },
  success: {
    50: "#f4fce8",
    100: "#e0f5b8",
    200: "#ccee88",
    300: "#b8e758",
    400: "#b6e445",
    500: "#B4E33D", // Success green
    600: "#a0cc37",
    700: "#8cb531",
    800: "#789e2b",
    900: "#648725",
  },
};
// Define tokens with proper shape for Chakra v3 System
const tokens = defineTokens({
  colors: {
    primary: {
      50: { value: colors.primary[50] },
      100: { value: colors.primary[100] },
      200: { value: colors.primary[200] },
      300: { value: colors.primary[300] },
      400: { value: colors.primary[400] },
      500: { value: colors.primary[500] },
      600: { value: colors.primary[600] },
      700: { value: colors.primary[700] },
      800: { value: colors.primary[800] },
      900: { value: colors.primary[900] },
    },
    teal: {
      50: { value: colors.teal[50] },
      100: { value: colors.teal[100] },
      200: { value: colors.teal[200] },
      300: { value: colors.teal[300] },
      400: { value: colors.teal[400] },
      500: { value: colors.teal[500] },
      600: { value: colors.teal[600] },
      700: { value: colors.teal[700] },
      800: { value: colors.teal[800] },
      900: { value: colors.teal[900] },
    },
    coral: {
      50: { value: colors.coral[50] },
      100: { value: colors.coral[100] },
      200: { value: colors.coral[200] },
      300: { value: colors.coral[300] },
      400: { value: colors.coral[400] },
      500: { value: colors.coral[500] },
      600: { value: colors.coral[600] },
      700: { value: colors.coral[700] },
      800: { value: colors.coral[800] },
      900: { value: colors.coral[900] },
    },
    cream: {
      50: { value: colors.cream[50] },
      100: { value: colors.cream[100] },
      200: { value: colors.cream[200] },
      300: { value: colors.cream[300] },
      400: { value: colors.cream[400] },
      500: { value: colors.cream[500] },
      600: { value: colors.cream[600] },
      700: { value: colors.cream[700] },
      800: { value: colors.cream[800] },
      900: { value: colors.cream[900] },
    },
    yellow: {
      50: { value: colors.yellow[50] },
      100: { value: colors.yellow[100] },
      200: { value: colors.yellow[200] },
      300: { value: colors.yellow[300] },
      400: { value: colors.yellow[400] },
      500: { value: colors.yellow[500] },
      600: { value: colors.yellow[600] },
      700: { value: colors.yellow[700] },
      800: { value: colors.yellow[800] },
      900: { value: colors.yellow[900] },
    },
    error: {
      50: { value: colors.error[50] },
      100: { value: colors.error[100] },
      200: { value: colors.error[200] },
      300: { value: colors.error[300] },
      400: { value: colors.error[400] },
      500: { value: colors.error[500] },
      600: { value: colors.error[600] },
      700: { value: colors.error[700] },
      800: { value: colors.error[800] },
      900: { value: colors.error[900] },
    },
    success: {
      50: { value: colors.success[50] },
      100: { value: colors.success[100] },
      200: { value: colors.success[200] },
      300: { value: colors.success[300] },
      400: { value: colors.success[400] },
      500: { value: colors.success[500] },
      600: { value: colors.success[600] },
      700: { value: colors.success[700] },
      800: { value: colors.success[800] },
      900: { value: colors.success[900] },
    },
  },
  fonts: {
    heading: {
      value: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
    },
    body: {
      value: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
    },
  },
});

const system = createSystem(defaultConfig, {
  theme: {
    tokens,
  },
});

export default system;
