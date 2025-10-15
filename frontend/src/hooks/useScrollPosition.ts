import { useState, useEffect } from "react";

/**
 * Custom hook to track scroll position
 * @param threshold - The scroll position threshold to trigger the effect
 * @returns Object with scroll position and whether threshold is exceeded
 */
export const useScrollPosition = (threshold: number = 50) => {
  const [scrollY, setScrollY] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setScrollY(currentScrollY);
      setIsScrolled(currentScrollY > threshold);
    };

    // Set initial scroll position
    handleScroll();

    // Add scroll event listener
    window.addEventListener("scroll", handleScroll, { passive: true });

    // Cleanup
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return { scrollY, isScrolled };
};
