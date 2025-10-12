import { useEffect, useRef, useState, useCallback, useMemo } from "react";
import {
  Box,
  Text,
  VStack,
  HStack,
  Badge,
  Icon,
  Button,
} from "@chakra-ui/react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Request, RequestFilters } from "../../types";
import { FaChevronDown, FaChevronUp, FaSearch } from "react-icons/fa";
import type { ElementType } from "react";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";

interface RequestMapViewProps {
  requests: Request[];
  isVolunteer: boolean;
  onRequestClick: (requestId: number) => void;
  isLoading?: boolean;
  uiFilters: RequestFilters;
  onLocationChange: (filters: RequestFilters) => void;
}

export const RequestMapView = ({
  requests,
  isVolunteer,
  onRequestClick,
  isLoading = false,
  uiFilters,
  onLocationChange,
}: RequestMapViewProps) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const markers = useRef<mapboxgl.Marker[]>([]);
  const currentPopup = useRef<mapboxgl.Popup | null>(null);
  const prevRequestsRef = useRef<Request[] | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState<string | null>(null);
  const [legendOpen, setLegendOpen] = useState(true);

  const triedGeolocate = useRef(false);

  // Initialize map only once
  useEffect(() => {
    if (!mapContainer.current || map.current) return;

    // Check if access token is set
    if (!mapboxgl.accessToken) {
      setMapError("Mapbox access token is not configured.");
      return;
    }

    try {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v12",
        center: [0, 20], // World view
        zoom: 4,
      });

      map.current.on("load", () => {
        console.log("Map loaded");
        setMapLoaded(true);

        // Try to center on user's geolocation once, fallback to a sensible region
        if (!triedGeolocate.current && navigator.geolocation) {
          triedGeolocate.current = true;
          navigator.geolocation.getCurrentPosition(
            (pos) => {
              const { latitude, longitude } = pos.coords;
              map.current?.flyTo({ center: [longitude, latitude], zoom: 12 });
            },
            () => {
              // Fallback: Europe
              map.current?.flyTo({ center: [10, 50], zoom: 4 });
            },
            { enableHighAccuracy: true, timeout: 5000 }
          );
        } else {
          // Fallback center if geolocation not available
          map.current?.flyTo({ center: [10, 50], zoom: 4 });
        }
      });

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

      // Add fullscreen control
      map.current.addControl(new mapboxgl.FullscreenControl(), "top-right");
    } catch (error) {
      console.error("Error initializing map:", error);
      setMapError(
        "Failed to initialize map. Please check your Mapbox configuration."
      );
    }

    return () => {
      // Note: We intentionally do NOT cleanup the map itself
      // to persist the map instance and avoid multiple map loads (billing optimization)
    };
  }, []);

  // Ensure map resizes to fill container when it becomes visible or changes size
  useEffect(() => {
    if (!map.current || !mapContainer.current) return;

    // Immediate resize in case it was initialized in a hidden container
    try {
      map.current.resize();
    } catch {
      // ignore
    }

    const ro = new ResizeObserver(() => {
      try {
        map.current?.resize();
      } catch {
        // ignore resize errors
      }
    });
    ro.observe(mapContainer.current);

    return () => {
      ro.disconnect();
    };
  }, [mapLoaded]);

  // Calculate center and radius from bounds
  const calculateLocationParams = useCallback(
    (bounds: mapboxgl.LngLatBounds) => {
      const center = bounds.getCenter();
      const ne = bounds.getNorthEast();

      const lat1 = center.lat;
      const lon1 = center.lng;
      const lat2 = ne.lat;
      const lon2 = ne.lng;

      // Haversine formula for distance
      const R = 6371; // Earth's radius in km
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLon = ((lon2 - lon1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const radius = R * c;

      return {
        location_lat: center.lat,
        location_lng: center.lng,
        radius: Math.ceil(radius * 1.5), // Add some buffer
      };
    },
    []
  );

  // Fetch data for current map bounds
  const fetchDataForBounds = useCallback(
    (bounds: mapboxgl.LngLatBounds) => {
      const locationParams = calculateLocationParams(bounds);
      const updatedFilters: RequestFilters = {
        ...uiFilters,
        ...locationParams,
      };
      onLocationChange(updatedFilters);
    },
    [uiFilters, calculateLocationParams, onLocationChange]
  );

  // Manual search button handler
  const handleSearchArea = useCallback(() => {
    if (map.current) {
      const bounds = map.current.getBounds();
      if (bounds) {
        fetchDataForBounds(bounds);
      }
    }
  }, [fetchDataForBounds]);

  // Client-side filter currently loaded requests using UI filters
  const visibleRequests = useMemo(() => {
    return requests.filter((r: Request) => {
      let ok = true;

      // Status filter
      const status = uiFilters.status || "all";
      if (status !== "all") {
        if (status === "completed") ok = ok && r.is_completed;
        else if (status === "applied") ok = ok && r.has_applied === true;
        else if (status === "open") ok = ok && !r.is_completed;
      }

      // Reward range
      if (typeof uiFilters.min_reward === "number")
        ok = ok && r.reward >= uiFilters.min_reward;
      if (typeof uiFilters.max_reward === "number")
        ok = ok && r.reward <= uiFilters.max_reward;

      // Single type filter (UI stores one type id)
      if (typeof uiFilters.type === "number") {
        const reqTypeIds = (r.request_types || []).map((t) => t.id);
        ok = ok && reqTypeIds.includes(uiFilters.type);
      }

      return ok;
    });
  }, [requests, uiFilters]);

  // Update markers when visible requests change
  useEffect(() => {
    if (!map.current || !mapLoaded || isLoading) return;

    // Clear existing markers
    markers.current.forEach((marker) => marker.remove());
    markers.current = [];

    // Add new markers for each request
    const bounds = new mapboxgl.LngLatBounds();
    let hasValidCoordinates = false;
    const didDataChange = prevRequestsRef.current !== requests;

    visibleRequests.forEach((request) => {
      // Skip if coordinates are invalid
      if (!request.longitude || !request.latitude) return;

      hasValidCoordinates = true;
      const coordinates: [number, number] = [
        request.longitude,
        request.latitude,
      ];
      bounds.extend(coordinates);

      // Determine marker color based on status
      let markerColor: string;
      if (request.is_completed) {
        markerColor = "gray"; // Gray for completed
      } else if (isVolunteer) {
        markerColor = "teal"; // Teal for volunteer view
      } else {
        markerColor = "coral"; // Coral for requester view
      }

      // Create popup HTML content
      const popupHTML = `
        <div style="padding: 12px; min-width: 250px; max-width: 300px;">
          <h3 style="margin: 0 0 8px 0; font-weight: bold; font-size: 16px; color: #1a202c;">
            ${request.name}
          </h3>
          <p style="margin: 0 0 12px 0; color: gray.500; font-size: 14px; line-height: 1.5;">
            ${
              request.description.length > 120
                ? request.description.substring(0, 120) + "..."
                : request.description
            }
          </p>
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px; padding-bottom: 12px; border-bottom: 1px solid #e2e8f0;">
            <span style="font-weight: bold; font-size: 16px; color: ${markerColor};">
              $${request.reward}
            </span>
            <span style="color: gray.400; font-size: 13px;">
              ${new Date(request.start).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
          <a
            href="/requests/${request.id}"
            style="
              display: block;
              width: 100%;
              padding: 10px;
              background: ${markerColor};
              color: white;
              border: none;
              border-radius: 6px;
              cursor: pointer;
              font-weight: 600;
              text-align: center;
              text-decoration: none;
              transition: opacity 0.2s;
            "
            onmouseover="this.style.opacity='0.85'"
            onmouseout="this.style.opacity='1'"
          >
            View Details
          </a>
        </div>
      `;

      // Create popup
      const popup = new mapboxgl.Popup({
        offset: 25,
        closeButton: true,
        closeOnClick: false,
        maxWidth: "320px",
      }).setHTML(popupHTML);

      // Style the close button and manage current popup tracking
      popup
        .on("open", () => {
          const el = popup.getElement();
          const btn = el?.querySelector<HTMLButtonElement>(
            ".mapboxgl-popup-close-button"
          );
          if (btn) {
            btn.style.fontSize = "18px";
            btn.style.lineHeight = "1";
            btn.style.width = "24px";
            btn.style.height = "24px";
            btn.style.right = "8px";
            btn.style.top = "8px";
            btn.style.borderRadius = "4px";
            btn.style.background = "white";
            btn.style.color = "gray.600";
            btn.style.boxShadow = "0 1px 2px rgba(0,0,0,0.1)";
          }
          currentPopup.current = popup;
        })
        .on("close", () => {
          if (currentPopup.current === popup) {
            currentPopup.current = null;
          }
        });

      // Create marker with built-in styling (no custom element to avoid hover issues)
      const marker = new mapboxgl.Marker({
        color: markerColor,
        scale: 1,
      })
        .setLngLat(coordinates)
        .setPopup(popup)
        .addTo(map.current!);

      // Ensure only one popup is open at a time
      const markerEl = marker.getElement();
      markerEl.addEventListener("click", () => {
        if (currentPopup.current && currentPopup.current !== popup) {
          currentPopup.current.remove();
        }
        // The new popup will open via setPopup; currentPopup gets set on 'open'
      });

      markers.current.push(marker);
    });

    // Fit map to show all markers ONLY when backend data changed
    if (didDataChange && hasValidCoordinates && visibleRequests.length > 0) {
      if (visibleRequests.length === 1) {
        // If only one marker, center on it with a reasonable zoom
        map.current.setCenter([
          visibleRequests[0].longitude,
          visibleRequests[0].latitude,
        ]);
        map.current.setZoom(14);
      } else {
        // Fit to bounds with padding
        map.current.fitBounds(bounds, {
          padding: { top: 50, bottom: 50, left: 50, right: 50 },
          maxZoom: 15,
        });
      }
    }

    // Track last backend data array identity
    prevRequestsRef.current = requests;
  }, [
    visibleRequests,
    requests,
    isVolunteer,
    onRequestClick,
    mapLoaded,
    isLoading,
  ]);

  if (mapError) {
    return (
      <Box
        bg="white"
        borderRadius="lg"
        boxShadow="sm"
        p={8}
        minH="500px"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <VStack gap={4}>
          <Text color="red.500" fontSize="lg" fontWeight="medium">
            Map Error
          </Text>
          <Text color="gray.600" textAlign="center" maxW="400px">
            {mapError}
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box position="relative" w="full">
      {/* Map Container - Always rendered to persist map instance */}
      <Box
        ref={mapContainer}
        w="full"
        h="600px"
        borderRadius="lg"
        overflow="hidden"
        boxShadow="md"
        bg="gray.100"
        position="relative"
      />

      {/* Map Legend */}
      <Box
        position="absolute"
        bottom={4}
        left={4}
        bg="white"
        p={3}
        borderRadius="md"
        boxShadow="md"
        zIndex={5}
      >
        <HStack
          justify="space-between"
          align="center"
          cursor="pointer"
          onClick={() => setLegendOpen((v) => !v)}
          mb={legendOpen ? 2 : 0}
          userSelect="none"
        >
          <Text fontSize="sm" fontWeight="bold">
            Legend
          </Text>
          <Icon
            as={(legendOpen ? FaChevronUp : FaChevronDown) as ElementType}
            boxSize={3}
            color="gray.500"
          />
        </HStack>
        {legendOpen && (
          <VStack align="start" gap={1}>
            <HStack gap={2}>
              <Box w={3} h={3} borderRadius="full" bg="teal.500" />
              <Text fontSize="xs">Open Requests</Text>
            </HStack>
            <HStack gap={2}>
              <Box w={3} h={3} borderRadius="full" bg="gray.400" />
              <Text fontSize="xs">Completed</Text>
            </HStack>
          </VStack>
        )}
      </Box>

      {/* Top Controls */}
      <HStack position="absolute" top={4} left={4} gap={2} zIndex={5}>
        {/* Request Count (client-side filtered) */}
        <Badge fontSize="sm" px={3} py={1} borderRadius="full" boxShadow="md">
          {visibleRequests.length}{" "}
          {visibleRequests.length === 1 ? "Request" : "Requests"}
        </Badge>

        {/* Search Area Button */}
        <Button
          size="sm"
          onClick={handleSearchArea}
          loading={isLoading}
          boxShadow="md"
          borderRadius="full"
          bg="white"
          color="black"
          px={3}
          py={1}
          _hover={{ bg: "white" }}
          _active={{ bg: "white" }}
        >
          <Icon as={FaSearch as ElementType} mr={2} />
          Search this area
        </Button>
      </HStack>
    </Box>
  );
};
