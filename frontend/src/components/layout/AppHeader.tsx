import { useNavigate } from "react-router-dom";
import {
  HStack,
  Box,
  Icon,
  Heading,
  Container,
  Portal,
  Text,
} from "@chakra-ui/react";
import { Avatar } from "@chakra-ui/react/avatar";
import { Menu } from "@chakra-ui/react/menu";
import { FaUser, FaSignOutAlt, FaArrowLeft } from "react-icons/fa";
import { Logo } from "../ui/logo";
import { authService } from "../../services/auth.service";
import { useAuth } from "../../contexts/useAuth";
import { toaster } from "../ui/toaster";
import type { ElementType } from "react";
import { useRef, useState } from "react";
import { getFullName, pickAvatarPalette } from "../../utils/avatar";
import { useScrollPosition } from "../../hooks/useScrollPosition";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { useConfirmDialog } from "../../hooks/useConfirmDialog";

interface AppHeaderProps {
  title?: string;
  isVolunteer?: boolean;
  variant?: "default" | "navigation";
  onBack?: () => void;
  logoSize?: string;
  backButtonTitle?: string;
}

export const AppHeader = ({
  title,
  isVolunteer = false,
  variant = "default",
  onBack,
  logoSize = "1.3rem",
  backButtonTitle = "Back",
}: AppHeaderProps) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isScrolled } = useScrollPosition(20);
  const { confirm, dialogProps } = useConfirmDialog();

  const clearHoverTimer = () => {
    if (hoverTimer.current) {
      clearTimeout(hoverTimer.current);
      hoverTimer.current = null;
    }
  };

  const openMenu = () => {
    clearHoverTimer();
    setMenuOpen(true);
  };

  const closeMenuWithDelay = (delay = 120) => {
    clearHoverTimer();
    hoverTimer.current = setTimeout(() => setMenuOpen(false), delay);
  };

  // Get current user from auth context
  const { user } = useAuth();
  const currentUser = user ?? {
    first_name: "User",
    last_name: "",
    id: 0,
  };

  const handleLogout = async () => {
    const confirmed = await confirm({
      title: "Logout?",
      message:
        "Are you sure you want to logout? You will need to sign in again to access your account.",
      confirmLabel: "Logout",
      cancelLabel: "Stay Logged In",
      variant: "danger",
    });

    if (!confirmed) return;

    try {
      await authService.logout();
      toaster.create({
        title: "Logged out successfully",
        type: "success",
        duration: 3000,
      });
      navigate("/login");
    } catch {
      toaster.create({
        title: "Logout failed",
        description: "Please try again",
        type: "error",
        duration: 5000,
      });
    }
  };

  const handleProfileClick = () => {
    navigate(`/profile/${currentUser.id}`);
  };

  return (
    <>
      <Box
        position="sticky"
        top={0}
        zIndex={10}
        py={4}
        transition="all 0.3s ease"
        _before={{
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "44px", // blur only across the top band
          pointerEvents: "none",
          backdropFilter: isScrolled ? "blur(10px)" : "none",
          bgGradient:
            "linear(to-b, rgba(255,255,255,0.85), rgba(255,255,255,0.4) 60%, rgba(255,255,255,0))",
          opacity: isScrolled ? 1 : 0,
          transition: "opacity 0.25s ease, backdrop-filter 0.25s ease",
        }}
      >
        <Container maxW="container.xl" mx="auto">
          <Box
            bg="white"
            borderRadius="full"
            boxShadow={isScrolled ? "xl" : "lg"}
            px={8}
            py={5}
            transition="box-shadow 0.3s ease"
          >
            <HStack justify="space-between" align="center">
              {variant === "navigation" ? (
                <Box>
                  <Box
                    as="button"
                    aria-label="Back"
                    onClick={() => (onBack ? onBack() : navigate(-1))}
                    display="inline-flex"
                    alignItems="center"
                    justifyContent="center"
                    borderRadius="full"
                    px={3}
                    py={2}
                    cursor="pointer"
                    transition="background-color 0.2s, transform 0.1s"
                    _hover={{ bg: "gray.100" }}
                    _active={{ bg: "gray.100", transform: "translateY(1px)" }}
                  >
                    <Icon as={FaArrowLeft as ElementType} mr={2} />
                    <Text as="span" fontWeight="semibold" color="gray.700">
                      {backButtonTitle}
                    </Text>
                  </Box>
                </Box>
              ) : (
                <Box
                  cursor="pointer"
                  onClick={() => navigate("/requests")}
                  transition="transform 0.2s"
                  position="relative"
                  top="2px"
                  _hover={{ transform: "scale(1.05)" }}
                >
                  <Logo
                    actorType={isVolunteer ? "volunteer" : "help-seeker"}
                    size="1.3rem"
                  />
                </Box>
              )}

              {variant === "navigation" ? (
                <Box
                  position="absolute"
                  left="50%"
                  transform="translateX(-50%)"
                  cursor="pointer"
                  onClick={() => navigate("/requests")}
                >
                  <Logo
                    actorType={isVolunteer ? "volunteer" : "help-seeker"}
                    size={logoSize || "1.6rem"}
                  />
                </Box>
              ) : (
                <Heading
                  size="lg"
                  color="gray.800"
                  position="absolute"
                  left="50%"
                  transform="translateX(-50%)"
                  pointerEvents="none"
                  textAlign="center"
                >
                  {title}
                </Heading>
              )}

              {/* User Greeting + Menu - Right side */}
              <HStack align="center" gap={5}>
                <Text color="gray.700">
                  Welcome,{" "}
                  <Text as="span" fontWeight="bold">
                    {currentUser.first_name}
                  </Text>
                  !{" "}
                </Text>
                <Menu.Root
                  positioning={{ placement: "bottom-end" }}
                  open={menuOpen}
                  onOpenChange={(e: { open: boolean }) => setMenuOpen(e.open)}
                >
                  <Menu.Trigger asChild>
                    <Box
                      cursor="pointer"
                      borderRadius="full"
                      transition="box-shadow 0.2s, background-color 0.2s"
                      _hover={{
                        boxShadow: "sm",
                      }}
                      onMouseEnter={openMenu}
                      onMouseLeave={() => closeMenuWithDelay()}
                      onClick={() => setMenuOpen((v) => !v)}
                    >
                      <Avatar.Root
                        colorPalette={pickAvatarPalette(
                          currentUser.first_name,
                          currentUser.last_name
                        )}
                      >
                        <Avatar.Fallback
                          name={getFullName(
                            currentUser.first_name,
                            currentUser.last_name
                          )}
                        />
                      </Avatar.Root>
                    </Box>
                  </Menu.Trigger>
                  <Portal>
                    <Menu.Positioner>
                      <Menu.Content
                        minW="200px"
                        p={4}
                        boxShadow={"lg"}
                        display="flex"
                        flexDir="column"
                        gap={3}
                        onMouseEnter={clearHoverTimer}
                        onMouseLeave={() => closeMenuWithDelay()}
                      >
                        <Menu.Item
                          value="profile"
                          onClick={() => {
                            handleProfileClick();
                            setMenuOpen(false);
                          }}
                          cursor="pointer"
                          py={3}
                          px={3}
                          _hover={{ bg: "gray.50" }}
                        >
                          <Icon as={FaUser as ElementType} mr={3} />
                          My Profile
                        </Menu.Item>
                        <Menu.Item
                          value="logout"
                          onClick={() => {
                            handleLogout();
                            setMenuOpen(false);
                          }}
                          cursor="pointer"
                          color="red.500"
                          py={3}
                          px={3}
                          _hover={{ bg: "red.50" }}
                        >
                          <Icon as={FaSignOutAlt as ElementType} mr={3} />
                          Logout
                        </Menu.Item>
                      </Menu.Content>
                    </Menu.Positioner>
                  </Portal>
                </Menu.Root>
              </HStack>
            </HStack>
          </Box>
        </Container>
      </Box>
      <ConfirmDialog {...dialogProps} />
    </>
  );
};
