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
  VStack,
  Text,
  SimpleGrid,
  Button,
  Portal,
} from "@chakra-ui/react";
import {
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverPositioner,
} from "@chakra-ui/react/popover";
import { LuCalendar, LuX, LuClock } from "react-icons/lu";
import "react-day-picker/style.css";

interface DateTimePickerProps {
  selected?: Date | null;
  onChange: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  placeholderText?: string;
  isVolunteer?: boolean;
}

export const DateTimePicker = forwardRef<HTMLDivElement, DateTimePickerProps>(
  (
    {
      selected,
      onChange,
      minDate,
      maxDate,
      placeholderText = "Select date and time",
      isVolunteer = false,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(
      selected || null
    );
    const [selectedHour, setSelectedHour] = useState<number>(
      selected ? selected.getHours() : 12
    );
    const [selectedMinute, setSelectedMinute] = useState<number>(
      selected ? selected.getMinutes() : 0
    );
    const inputRef = useRef<HTMLInputElement>(null);
    const popoverRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      if (selected) {
        setSelectedDate(selected);
        setSelectedHour(selected.getHours());
        setSelectedMinute(selected.getMinutes());
      }
    }, [selected]);

    const formatDateTime = (date: Date | null) => {
      if (!date) return "";
      return date.toLocaleString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    const handleDateSelect = (date: Date | undefined) => {
      if (date) {
        const newDate = new Date(date);
        newDate.setHours(selectedHour);
        newDate.setMinutes(selectedMinute);
        setSelectedDate(newDate);
      }
    };

    const handleTimeChange = (hour: number, minute: number) => {
      if (selectedDate) {
        const newDate = new Date(selectedDate);
        newDate.setHours(hour);
        newDate.setMinutes(minute);
        setSelectedDate(newDate);
        setSelectedHour(hour);
        setSelectedMinute(minute);
      }
    };

    const handleConfirm = () => {
      onChange(selectedDate);
      setIsOpen(false);
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      onChange(null);
      setSelectedDate(null);
      setSelectedHour(12);
      setSelectedMinute(0);
    };

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    return (
      <Box ref={ref} w="full">
        <Popover.Root
          positioning={{ strategy: "fixed" }}
          open={isOpen}
          onOpenChange={(details) => {
            setIsOpen(details.open);
            if (details.open) {
              // After popover mounts, ensure the entire popover is visible in viewport
              setTimeout(() => {
                const el = popoverRef.current || inputRef.current;
                if (!el) return;
                // First, center it
                el.scrollIntoView({ behavior: "smooth", block: "center" });
                // Then adjust to ensure full visibility with a small margin
                const rect = el.getBoundingClientRect();
                const margin = 24; // px cushion from edges
                const viewportBottom = window.innerHeight - margin;
                const viewportTop = margin;
                let scrollDelta = 0;
                if (rect.top < viewportTop) {
                  scrollDelta = rect.top - viewportTop; // negative -> scroll up
                } else if (rect.bottom > viewportBottom) {
                  scrollDelta = rect.bottom - viewportBottom; // positive -> scroll down
                }
                if (scrollDelta !== 0) {
                  window.scrollBy({ top: scrollDelta, behavior: "smooth" });
                }
              }, 50);
            }
          }}
        >
          <PopoverTrigger asChild>
            <HStack gap={0} w="full" position="relative">
              <Input
                ref={inputRef}
                value={formatDateTime(selected ?? null)}
                placeholder={placeholderText}
                readOnly
                cursor="pointer"
                size="md"
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

          <Portal>
            <PopoverPositioner>
              <PopoverContent
                width="auto"
                maxW="95vw"
                maxH="80vh"
                overflowY="auto"
                zIndex={1500}
                ref={popoverRef}
              >
                <PopoverBody p={4}>
                  <VStack gap={4} align="stretch">
                    {/* Date Picker */}
                    <Box>
                      <DayPicker
                        mode="single"
                        selected={selectedDate ?? undefined}
                        onSelect={handleDateSelect}
                        disabled={(date) => {
                          if (minDate && date < minDate) return true;
                          if (maxDate && date > maxDate) return true;
                          return false;
                        }}
                        defaultMonth={selectedDate || minDate || new Date()}
                      />
                    </Box>

                    {/* Time Picker */}
                    <Box borderTop="1px solid" borderColor="gray.200" pt={4}>
                      <HStack gap={2} mb={3}>
                        <Icon
                          as={LuClock as unknown as ElementType}
                          boxSize={4}
                        />
                        <Text fontSize="sm" fontWeight="semibold">
                          Select Time
                        </Text>
                      </HStack>

                      <HStack gap={4}>
                        {/* Hour selector */}
                        <VStack align="stretch" flex={1}>
                          <Text fontSize="xs" color="gray.600">
                            Hour
                          </Text>
                          <Box
                            maxH="120px"
                            overflowY="auto"
                            borderWidth={1}
                            borderRadius="md"
                            p={1}
                          >
                            <SimpleGrid columns={4} gap={1}>
                              {hours.map((hour) => (
                                <Button
                                  key={hour}
                                  size="xs"
                                  variant={
                                    selectedHour === hour ? "solid" : "ghost"
                                  }
                                  onClick={() =>
                                    handleTimeChange(hour, selectedMinute)
                                  }
                                  disabled={!selectedDate}
                                >
                                  {hour.toString().padStart(2, "0")}
                                </Button>
                              ))}
                            </SimpleGrid>
                          </Box>
                        </VStack>

                        {/* Minute selector */}
                        <VStack align="stretch" flex={1}>
                          <Text fontSize="xs" color="gray.600">
                            Minute
                          </Text>
                          <Box
                            maxH="120px"
                            overflowY="auto"
                            borderWidth={1}
                            borderRadius="md"
                            p={1}
                          >
                            <SimpleGrid columns={4} gap={1}>
                              {minutes
                                .filter((m) => m % 5 === 0) // Show only 5-minute intervals
                                .map((minute) => (
                                  <Button
                                    key={minute}
                                    size="xs"
                                    variant={
                                      selectedMinute === minute
                                        ? "solid"
                                        : "ghost"
                                    }
                                    onClick={() =>
                                      handleTimeChange(selectedHour, minute)
                                    }
                                    disabled={!selectedDate}
                                  >
                                    {minute.toString().padStart(2, "0")}
                                  </Button>
                                ))}
                            </SimpleGrid>
                          </Box>
                        </VStack>
                      </HStack>
                    </Box>

                    {/* Selected DateTime Display */}
                    {selectedDate && (
                      <Box
                        p={2}
                        bg="gray.50"
                        borderRadius="md"
                        borderWidth={1}
                        borderColor="gray.200"
                      >
                        <Text fontSize="sm" textAlign="center">
                          {formatDateTime(selectedDate)}
                        </Text>
                      </Box>
                    )}

                    {/* Action Buttons */}
                    <HStack justify="flex-end" gap={2}>
                      <Button
                        size="sm"
                        variant="outline"
                        px="2"
                        onClick={() => setIsOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        bg={isVolunteer ? "teal.500" : "coral.600"}
                        px="2"
                        onClick={handleConfirm}
                        disabled={!selectedDate}
                        _hover={{ bg: isVolunteer ? "teal.600" : "coral.700" }}
                      >
                        Confirm
                      </Button>
                    </HStack>
                  </VStack>
                </PopoverBody>
              </PopoverContent>
            </PopoverPositioner>
          </Portal>
        </Popover.Root>
      </Box>
    );
  }
);

DateTimePicker.displayName = "DateTimePicker";
