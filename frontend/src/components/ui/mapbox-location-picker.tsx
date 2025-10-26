import { useEffect, useRef, useState } from "react";
import { Box, Input, HStack, Text } from "@chakra-ui/react";

interface MapboxLocationPickerProps {
  value: string;
  onChange: (
    address: string,
    coordinates: { longitude: number; latitude: number }
  ) => void;
  placeholder?: string;
  initialCoordinates?: { longitude: number; latitude: number };
}

export const MapboxLocationPicker = ({
  value,
  onChange,
  placeholder = "Search for a location",
}: MapboxLocationPickerProps) => {
  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN as string | undefined;
  const [inputValue, setInputValue] = useState(value ?? "");
  const [suggestions, setSuggestions] = useState<
    Array<{ id: string; place_name: string; center: [number, number] }>
  >([]);
  const [open, setOpen] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(-1);
  const [hasInteracted, setHasInteracted] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  type MapboxFeature = {
    id: string;
    place_name: string;
    center?: [number, number];
    geometry?: { coordinates: [number, number] };
  };

  useEffect(() => {
    setInputValue(value ?? "");
  }, [value]);

  useEffect(() => {
    if (!token || !hasInteracted) return;
    const q = inputValue.trim();
    if (q.length < 3) {
      setSuggestions([]);
      setOpen(false);
      setHighlightIndex(-1);
      return;
    }

    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    const timer = setTimeout(async () => {
      try {
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
          q
        )}.json?access_token=${token}&autocomplete=true&limit=6&types=address,place,poi`;
        const resp = await fetch(url, { signal: controller.signal });
        if (!resp.ok) throw new Error(`Geocoding failed: ${resp.status}`);
        const data = await resp.json();
        const items = (data.features || []).map((f: MapboxFeature) => ({
          id: f.id,
          place_name: f.place_name,
          center: (f.center || f.geometry?.coordinates) as [number, number],
        }));
        setSuggestions(items);
        setOpen(true);
        setHighlightIndex(-1);
      } catch (err: unknown) {
        if (!(err instanceof DOMException && err.name === "AbortError")) {
          // Fail silently; keep suggestions closed
          setSuggestions([]);
          setOpen(false);
          setHighlightIndex(-1);
        }
      }
    }, 250);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [inputValue, token, hasInteracted]);

  const commitSelection = (item: {
    id: string;
    place_name: string;
    center: [number, number];
  }) => {
    // Prevent any in-flight autocomplete results from reopening the dropdown
    if (abortRef.current) {
      try {
        abortRef.current.abort();
      } catch {
        // no-op
      }
      abortRef.current = null;
    }

    setHasInteracted(false);
    setHighlightIndex(-1);
    setInputValue(item.place_name);
    setOpen(false);
    setSuggestions([]);
    console.log("Selected location:", {
      address: item.place_name,
      longitude: item.center[0],
      latitude: item.center[1],
    });
    onChange(item.place_name, {
      longitude: item.center[0],
      latitude: item.center[1],
    });
  };

  return (
    <Box position="relative" w="full">
      <HStack gap={2} w="full">
        <Input
          value={inputValue}
          placeholder={placeholder}
          onChange={(e) => {
            setHasInteracted(true);
            setInputValue(e.target.value);
          }}
          onFocus={() => {
            setHasInteracted(true);
            if (suggestions.length) setOpen(true);
          }}
          onBlur={() => {
            // Delay closing to allow click selection from the list
            setTimeout(() => setOpen(false), 150);
          }}
          onKeyDown={(e) => {
            if (!open && (e.key === "ArrowDown" || e.key === "ArrowUp")) {
              setOpen(true);
              return;
            }
            if (!open) return;
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setHighlightIndex((i) => Math.min(i + 1, suggestions.length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setHighlightIndex((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter") {
              if (highlightIndex >= 0 && highlightIndex < suggestions.length) {
                e.preventDefault();
                commitSelection(suggestions[highlightIndex]);
              }
            } else if (e.key === "Escape") {
              setOpen(false);
            }
          }}
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="location-suggestions"
          size="md"
          px={5}
          py={4}
          w="full"
          flex={1}
        />
      </HStack>
      {open && suggestions.length > 0 && (
        <Box
          position="absolute"
          top="100%"
          left={0}
          right={0}
          mt={1}
          bg="white"
          borderRadius="lg"
          boxShadow="md"
          zIndex={10}
          maxH="300px"
          overflowY="auto"
        >
          <Box id="location-suggestions" role="listbox">
            {suggestions.map((s, idx) => (
              <Box
                as="div"
                key={s.id}
                role="option"
                aria-selected={idx === highlightIndex}
                px={4}
                py={3}
                cursor="pointer"
                bg={idx === highlightIndex ? "gray.50" : "white"}
                _hover={{ bg: "gray.50" }}
                onMouseEnter={() => setHighlightIndex(idx)}
                onMouseLeave={() => setHighlightIndex(-1)}
                onMouseDown={(e) => {
                  // prevent input blur before click
                  e.preventDefault();
                }}
                onClick={() => commitSelection(s)}
              >
                <Text fontSize="sm" color="gray.800">
                  {s.place_name}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Box>
  );
};
