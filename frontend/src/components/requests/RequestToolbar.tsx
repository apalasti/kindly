import { HStack, Button, Icon, Box, Text, Portal } from "@chakra-ui/react";
import { Tabs } from "@chakra-ui/react/tabs";
import { Select } from "@chakra-ui/react/select";
import { createListCollection } from "@chakra-ui/react/collection";
import { FaList, FaMap } from "react-icons/fa";
import type { RequestFilters } from "../../types";
import type { ElementType } from "react";

interface RequestToolbarProps {
  filters: RequestFilters;
  onFiltersChange: (filters: RequestFilters) => void;
  isVolunteer: boolean;
  viewMode: "list" | "map";
  onViewModeChange: (mode: "list" | "map") => void;
}

export const RequestToolbar = ({
  filters,
  onFiltersChange,
  isVolunteer,
  viewMode,
  onViewModeChange,
}: RequestToolbarProps) => {
  const handleSortChange = (sort: string) => {
    const newFilters = {
      ...filters,
      sort: sort as RequestFilters["sort"],
    };
    onFiltersChange(newFilters);
  };

  const handleOrderChange = () => {
    const newFilters: RequestFilters = {
      ...filters,
      order: (filters.order === "asc" ? "desc" : "asc") as "asc" | "desc",
    };
    onFiltersChange(newFilters);
  };

  const sortOptions = isVolunteer
    ? [
        { value: "start", label: "Start Date" },
        { value: "reward", label: "Reward" },
      ]
    : [
        { value: "created_at", label: "Created Date" },
        { value: "start", label: "Start Date" },
        { value: "reward", label: "Reward" },
      ];

  return (
    <Box bg="white" p={4} borderRadius="lg" boxShadow="sm" mb={6}>
      <HStack justify="space-between" flexWrap="wrap" gap={3}>
        {/* View Mode Toggle (Volunteers only) */}
        {isVolunteer && (
          <Tabs.Root
            value={viewMode}
            onValueChange={(e) => onViewModeChange(e.value as "list" | "map")}
            variant="plain"
          >
            <Tabs.List bg="bg.muted" rounded="l3" p="1">
              <Tabs.Trigger
                value="list"
                px="4"
                py="2"
                minW="110px"
                justifyContent="center"
                gap={2}
              >
                <Icon as={FaList as ElementType} />
                List
              </Tabs.Trigger>
              <Tabs.Trigger
                value="map"
                title="Map view coming soon"
                px="4"
                py="2"
                minW="110px"
                justifyContent="center"
                gap={2}
              >
                <Icon as={FaMap as ElementType} />
                Map
              </Tabs.Trigger>
              <Tabs.Indicator rounded="l2" />
            </Tabs.List>
          </Tabs.Root>
        )}

        {/* Sort Options */}
        <HStack gap={3} flex={1} justify="flex-end" minW="250px" align="center">
          <Text color="gray.700" fontWeight="medium">
            Sort by:
          </Text>
          <Select.Root
            collection={createListCollection({
              items: sortOptions,
            })}
            value={[filters.sort || (isVolunteer ? "start" : "created_at")]}
            onValueChange={(e) => handleSortChange(e.value[0])}
            size="sm"
            width="auto"
          >
            <Select.HiddenSelect />
            <Select.Control borderColor="gray.200">
              <Select.Trigger minW="180px" p={2}>
                <Select.ValueText />
              </Select.Trigger>
              <Select.IndicatorGroup px={2} py={1}>
                <Select.Indicator />
              </Select.IndicatorGroup>
            </Select.Control>
            <Portal>
              <Select.Positioner>
                <Select.Content>
                  {sortOptions.map((option) => (
                    <Select.Item key={option.value} item={option} px={3} py={2}>
                      {option.label}
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
            </Portal>
          </Select.Root>
          <Button
            size="sm"
            variant="outline"
            onClick={handleOrderChange}
            colorScheme={isVolunteer ? "teal" : "coral"}
            minW="fit-content"
            px={4}
            py={2}
          >
            {filters.order === "asc" ? "↑" : "↓"}
          </Button>
        </HStack>
      </HStack>
    </Box>
  );
};
