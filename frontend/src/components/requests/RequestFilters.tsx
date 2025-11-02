import { useState } from "react";
import { Stack, Text, Box, Separator, Wrap } from "@chakra-ui/react";
import { Tag } from "@chakra-ui/react/tag";
import { RadioGroup } from "@chakra-ui/react/radio-group";
import { Slider } from "@chakra-ui/react/slider";
import {
  RequestStatus,
  type RequestFilters as Filters,
  type RequestType,
} from "../../types";
import { TypeSelector } from "../ui/type-selector";

interface RequestFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  isVolunteer: boolean;
  requestTypes?: RequestType[];
}

interface StatusOption {
  value: string;
  label: string;
  checked: boolean;
}

export const RequestFilters = ({
  filters,
  onFiltersChange,
  isVolunteer,
  requestTypes = [],
}: RequestFiltersProps) => {
  const [priceRange, setPriceRange] = useState<number[]>([
    filters.min_reward || 0,
    filters.max_reward || 500,
  ]);

  const baseStatusOptions = isVolunteer
    ? [
        { value: RequestStatus.OPEN, label: "Open" },
        { value: RequestStatus.COMPLETED, label: "Completed" },
        { value: RequestStatus.APPLIED, label: "Applied" },
      ]
    : [
        { value: RequestStatus.OPEN, label: "Open" },
        { value: RequestStatus.COMPLETED, label: "Completed" },
      ];

  const [statusOptions, setStatusOptions] = useState<StatusOption[]>(
    baseStatusOptions.map((opt) => ({
      ...opt,
      checked:
        filters.status === RequestStatus.ALL || filters.status === opt.value,
    }))
  );

  // Initialize selected types
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    filters.request_type_ids ? filters.request_type_ids.map(String) : []
  );

  const handleStatusRadioChange = (value: string) => {
    if (value === RequestStatus.ALL) {
      setStatusOptions((current) =>
        current.map((o) => ({ ...o, checked: true }))
      );
    } else {
      setStatusOptions((current) =>
        current.map((o) => ({ ...o, checked: o.value === value }))
      );
    }

    const newFilters = {
      ...filters,
      status: (value as Filters["status"]) || RequestStatus.ALL,
      page: 1,
    };
    onFiltersChange(newFilters);
  };

  // Handle type change
  const handleTypeChange = (details: { value: string[] }) => {
    setSelectedTypes(details.value);

    const newFilters = {
      ...filters,
      request_type_ids:
        details.value.length > 0 ? details.value.map(Number) : undefined,
      page: 1,
    };
    onFiltersChange(newFilters);
  };

  // Handle price change
  const handlePriceChange = (details: { value: number[] }) => {
    setPriceRange(details.value);
  };

  const handlePriceChangeEnd = (details: { value: number[] }) => {
    const newFilters = {
      ...filters,
      min_reward: details.value[0],
      max_reward: details.value[1],
      page: 1,
    };
    onFiltersChange(newFilters);
  };

  // Remove individual filter
  const removeFilter = (filterType: string, value?: string) => {
    if (filterType === "price") {
      setPriceRange([0, 500]);
      const newFilters = {
        ...filters,
        min_reward: 0,
        max_reward: 500,
        page: 1,
      };
      onFiltersChange(newFilters);
    } else if (filterType === "status" && value) {
      // With radio, removing a specific status reverts to "ALL"
      setStatusOptions((current) =>
        current.map((o) => ({ ...o, checked: true }))
      );
      const newFilters = {
        ...filters,
        status: RequestStatus.ALL as Filters["status"],
        page: 1,
      };
      onFiltersChange(newFilters);
    } else if (filterType === "type" && value) {
      const newTypes = selectedTypes.filter((t) => t !== value);
      setSelectedTypes(newTypes);
      handleTypeChange({ value: newTypes });
    }
  };

  // Get active filter tags
  const getActiveFilterTags = () => {
    const tags: Array<{ type: string; label: string; value?: string }> = [];

    // Price tag
    if (priceRange[0] !== 0 || priceRange[1] !== 500) {
      tags.push({
        type: "price",
        label: `$${priceRange[0]} - $${priceRange[1]}`,
      });
    }

    // Status tags
    const checkedStatuses = statusOptions.filter((opt) => opt.checked);
    if (checkedStatuses.length === baseStatusOptions.length) {
      tags.push({ type: "status", label: "All Statuses" });
    } else {
      checkedStatuses.forEach((status) => {
        tags.push({
          type: "status",
          label: status.label,
          value: status.value,
        });
      });
    }

    // Type tags
    if (selectedTypes.length === 0) {
      tags.push({ type: "type", label: "All Types" });
    } else {
      selectedTypes.forEach((typeId) => {
        const type = requestTypes.find((t) => String(t.id) === typeId);
        if (type) {
          tags.push({
            type: "type",
            label: type.name,
            value: typeId,
          });
        }
      });
    }

    return tags;
  };

  const activeFilterTags = getActiveFilterTags();
  const colorPalette = isVolunteer ? "teal" : "coral";

  return (
    <Box
      bg="white"
      p={6}
      borderRadius="lg"
      boxShadow="md"
      position="sticky"
      top="100px"
      h="fit-content"
    >
      <Stack gap={6}>
        <Stack gap={4}>
          {/* Title */}
          <Text fontSize="xl" fontWeight="bold" color="gray.800">
            Filters
          </Text>

          {/* Active Filters Tags */}
          {activeFilterTags.length > 0 && (
            <>
              <Wrap gap={2}>
                {activeFilterTags.map((tag, index) => (
                  <Tag.Root
                    key={`${tag.type}-${tag.value || index}`}
                    size="sm"
                    px={2}
                    py={1}
                    _hover={{
                      boxShadow: "sm",
                    }}
                  >
                    <Tag.Label>{tag.label}</Tag.Label>
                    {tag.value && (
                      <Tag.EndElement>
                        <Tag.CloseTrigger
                          onClick={() => removeFilter(tag.type, tag.value)}
                        />
                      </Tag.EndElement>
                    )}
                    {tag.type === "price" && (
                      <Tag.EndElement>
                        <Tag.CloseTrigger
                          onClick={() => removeFilter(tag.type)}
                        />
                      </Tag.EndElement>
                    )}
                  </Tag.Root>
                ))}
              </Wrap>
              <Separator />
            </>
          )}
        </Stack>

        {/* Price Range Filter */}
        {isVolunteer && (
          <Stack gap={3}>
            <Text fontSize="sm" fontWeight="semibold" color="gray.700">
              Price Range
            </Text>
            <Slider.Root
              value={priceRange}
              onValueChange={handlePriceChange}
              onValueChangeEnd={handlePriceChangeEnd}
              min={0}
              max={500}
              step={5}
              colorPalette={colorPalette}
            >
              <Slider.Control>
                <Slider.Track>
                  <Slider.Range />
                </Slider.Track>
                <Slider.Thumb index={0} />
                <Slider.Thumb index={1} />
              </Slider.Control>
              <Slider.ValueText>
                ${priceRange[0]} - ${priceRange[1]}
              </Slider.ValueText>
            </Slider.Root>
          </Stack>
        )}

        {/* Status Filter */}
        <Stack gap={3}>
          <Text fontSize="sm" fontWeight="semibold" color="gray.700">
            Status
          </Text>
          <RadioGroup.Root
            value={filters.status || RequestStatus.ALL}
            onValueChange={(e: { value: string | null }) =>
              handleStatusRadioChange(e.value ?? RequestStatus.ALL)
            }
            colorPalette={colorPalette}
          >
            <Stack gap={2} align="flex-start">
              <RadioGroup.Item value={RequestStatus.ALL}>
                <RadioGroup.ItemHiddenInput />
                <RadioGroup.ItemIndicator />
                <RadioGroup.ItemText>All</RadioGroup.ItemText>
              </RadioGroup.Item>
              {statusOptions.map((option) => (
                <RadioGroup.Item key={option.value} value={option.value}>
                  <RadioGroup.ItemHiddenInput />
                  <RadioGroup.ItemIndicator />
                  <RadioGroup.ItemText>{option.label}</RadioGroup.ItemText>
                </RadioGroup.Item>
              ))}
            </Stack>
          </RadioGroup.Root>
        </Stack>

        {/* Type Filter (Volunteers only) */}
        {isVolunteer && requestTypes.length > 0 && (
          <Stack gap={3}>
            <Text fontSize="sm" fontWeight="semibold" color="gray.700">
              Type
            </Text>
            <TypeSelector
              items={requestTypes}
              value={selectedTypes.map(Number)}
              onChange={(ids) =>
                handleTypeChange({ value: ids.map((id) => String(id)) })
              }
              placeholder="Select types..."
              allowMultiple
              hideSelectedTagList
              width="100%"
            />
          </Stack>
        )}
      </Stack>
    </Box>
  );
};
