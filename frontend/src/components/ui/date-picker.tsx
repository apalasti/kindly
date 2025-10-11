import {
  forwardRef,
  useState,
  useRef,
  useEffect,
  type ElementType,
} from "react";
import { DayPicker } from "react-day-picker";
import {
  Input,
  Popover,
  IconButton,
  HStack,
  Icon,
  Box,
} from "@chakra-ui/react";
import {
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
} from "@chakra-ui/react/popover";
import { LuCalendar, LuX } from "react-icons/lu";
import "react-day-picker/style.css";

interface DatePickerProps {
  selected?: Date | null;
  onChange: (date: Date | null) => void;
  size?: "sm" | "md" | "lg";
  placeholderText?: string;
}

export const DatePicker = forwardRef<HTMLDivElement, DatePickerProps>(
  (
    { selected, onChange, size = "md", placeholderText = "Select date" },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (isOpen && popoverRef.current) {
        // Small delay to ensure the popover is fully rendered
        setTimeout(() => {
          if (popoverRef.current) {
            const popoverRect = popoverRef.current.getBoundingClientRect();
            const viewportHeight = window.innerHeight;
            const popoverCenter = popoverRect.top + popoverRect.height / 2;
            const viewportCenter = viewportHeight / 2;
            const scrollOffset = popoverCenter - viewportCenter;

            // Smooth scroll to center the popover
            window.scrollBy({
              top: scrollOffset,
              behavior: "smooth",
            });
          }
        }, 50);
      }
    }, [isOpen]);

    const formatDate = (date: Date | null) => {
      if (!date) return "";
      return date.toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      });
    };

    const handleSelect = (date: Date | undefined) => {
      onChange(date ?? null);
      setIsOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(null);
    };

    const currentYear = new Date().getFullYear();
    const fromYear = currentYear - 120;
    const toYear = currentYear;

    return (
      <Box ref={ref} w="full">
        <Popover.Root
          open={isOpen}
          onOpenChange={(details) => setIsOpen(details.open)}
        >
          <PopoverTrigger asChild>
            <HStack gap={0} w="full" position="relative">
              <Input
                ref={inputRef}
                value={formatDate(selected ?? null)}
                placeholder={placeholderText}
                readOnly
                cursor="pointer"
                size={size}
                px={5}
                py={4}
                pr={selected ? "4.5rem" : "3rem"}
                onClick={() => setIsOpen(true)}
              />

              <HStack
                position="absolute"
                right={2}
                gap={1}
                pointerEvents="none"
                zIndex={1}
              >
                {selected && (
                  <IconButton
                    aria-label="Clear date"
                    size="xs"
                    variant="ghost"
                    onClick={handleClear}
                    pointerEvents="auto"
                  >
                    <Icon as={LuX as unknown as ElementType} />
                  </IconButton>
                )}
                <IconButton
                  aria-label="Open calendar"
                  size="xs"
                  variant="ghost"
                  pointerEvents="auto"
                  onClick={() => setIsOpen(!isOpen)}
                >
                  <Icon as={LuCalendar as unknown as ElementType} />
                </IconButton>
              </HStack>
            </HStack>
          </PopoverTrigger>

          <PopoverContent width="auto" zIndex={1500} ref={popoverRef}>
            <PopoverBody p={0}>
              <DayPicker
                mode="single"
                selected={selected ?? undefined}
                onSelect={handleSelect}
                disabled={{ after: new Date() }}
                captionLayout="dropdown"
                defaultMonth={selected || new Date(currentYear - 25, 0)}
                startMonth={new Date(fromYear, 0)}
                endMonth={new Date(toYear, 11)}
              />
            </PopoverBody>
          </PopoverContent>
        </Popover.Root>
      </Box>
    );
  }
);

DatePicker.displayName = "DatePicker";
