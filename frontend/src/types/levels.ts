import {
  FaHandsHelping,
  FaHandshake,
  FaShieldAlt,
  FaTrophy,
  FaStar,
  FaUser,
  FaUserCheck,
  FaUserFriends,
  FaHeart,
  FaBullhorn,
} from "react-icons/fa";

export type LevelMeta = {
  name: string;
  icon: any;
  color: string;
};

export const VOLUNTEER_LEVELS: Record<number, LevelMeta> = {
  1: { name: "Helper", icon: FaHandsHelping, color: "primary.400" },
  2: { name: "Supporter", icon: FaHandshake, color: "teal.300" },
  3: { name: "Guardian", icon: FaShieldAlt, color: "teal.500" },
  4: { name: "Champion", icon: FaTrophy, color: "teal.700" },
  5: { name: "Luminary", icon: FaStar, color: "yellow.500" },
};

export const HELP_SEEKER_LEVELS: Record<number, LevelMeta> = {
  1: { name: "Newcomer", icon: FaUser, color: "primary.400" },
  2: { name: "Member", icon: FaUserCheck, color: "coral.300" },
  3: { name: "Regular", icon: FaUserFriends, color: "coral.500" },
  4: { name: "Enthusiast", icon: FaHeart, color: "coral.700" },
  5: { name: "Ambassador", icon: FaBullhorn, color: "yellow.500" },
};
