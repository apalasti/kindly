import { useState, useMemo } from "react";
import { Stack, Text, Box, Separator, Wrap, Portal } from "@chakra-ui/react";
import { Tag } from "@chakra-ui/react/tag";
import { Checkbox } from "@chakra-ui/react/checkbox";
import { Combobox } from "@chakra-ui/react/combobox";
import { Slider } from "@chakra-ui/react/slider";
import { createListCollection } from "@chakra-ui/react/collection";
import type { RequestFilters as Filters, RequestType } from "../../types";

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
        { value: "open", label: "Open" },
        { value: "completed", label: "Completed" },
        { value: "applied", label: "Applied" },
      ]
    : [
        { value: "open", label: "Open" },
        { value: "completed", label: "Completed" },
      ];

  const [statusOptions, setStatusOptions] = useState<StatusOption[]>(
    baseStatusOptions.map((opt) => ({
      ...opt,
      checked: filters.status === "all" || filters.status === opt.value,
    }))
  );

  // Initialize selected types
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    filters.type ? [String(filters.type)] : []
  );
  const [typeSearchValue, setTypeSearchValue] = useState("");

  const allChecked = statusOptions.every((option) => option.checked);
  const indeterminate =
    statusOptions.some((option) => option.checked) && !allChecked;

  // Filter type options based on search
  const filteredTypeOptions = useMemo(
    () =>
      requestTypes.filter((item) =>
        item.name.toLowerCase().includes(typeSearchValue.toLowerCase())
      ),
    [typeSearchValue, requestTypes]
  );

  const typeCollection = useMemo(
    () =>
      createListCollection({
        items: filteredTypeOptions.map((t) => ({
          value: String(t.id),
          label: t.name,
        })),
      }),
    [filteredTypeOptions]
  );

  const handleAllStatusChange = (e: { checked: boolean | "indeterminate" }) => {
    setStatusOptions((current) =>
      current.map((option) => ({ ...option, checked: !!e.checked }))
    );

    const newFilters = {
      ...filters,
      status: "all" as Filters["status"],
      page: 1,
    };
    onFiltersChange(newFilters);
  };

  const handleStatusChange = (
    index: number,
    e: { checked: boolean | "indeterminate" }
  ) => {
    const isChecked = !!e.checked;

    setStatusOptions((current) => {
      const newValues = [...current];
      newValues[index] = { ...newValues[index], checked: isChecked };
      return newValues;
    });

    const newStatusOptions = [...statusOptions];
    newStatusOptions[index] = {
      ...newStatusOptions[index],
      checked: isChecked,
    };

    const checkedOptions = newStatusOptions.filter((opt) => opt.checked);
    let newStatus: Filters["status"];

    if (checkedOptions.length === 0) {
      newStatus = "all";
    } else if (checkedOptions.length === newStatusOptions.length) {
      newStatus = "all";
    } else {
      newStatus = checkedOptions[0].value as Filters["status"];
    }

    const newFilters = {
      ...filters,
      status: newStatus,
      page: 1,
    };
    onFiltersChange(newFilters);
  };

  // Handle type change
  const handleTypeChange = (details: { value: string[] }) => {
    setSelectedTypes(details.value);

    const newFilters = {
      ...filters,
      type: details.value.length > 0 ? parseInt(details.value[0]) : undefined,
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
      const index = statusOptions.findIndex((opt) => opt.value === value);
      if (index !== -1) {
        handleStatusChange(index, { checked: false });
      }
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

        {/* Status Filter */}
        <Stack gap={3}>
          <Text fontSize="sm" fontWeight="semibold" color="gray.700">
            Status
          </Text>
          <Stack gap={2} align="flex-start">
            {/* Parent "All Requests" checkbox */}
            <Checkbox.Root
              checked={indeterminate ? "indeterminate" : allChecked}
              onCheckedChange={handleAllStatusChange}
              variant="solid"
              colorPalette={colorPalette}
            >
              <Checkbox.HiddenInput />
              <Checkbox.Control>
                <Checkbox.Indicator />
              </Checkbox.Control>
              <Checkbox.Label>All Requests</Checkbox.Label>
            </Checkbox.Root>

            {/* Child status checkboxes */}
            {statusOptions.map((option, index) => (
              <Checkbox.Root
                key={option.value}
                ms="6"
                checked={option.checked}
                onCheckedChange={(e) => handleStatusChange(index, e)}
                variant="solid"
                colorPalette={colorPalette}
              >
                <Checkbox.HiddenInput />
                <Checkbox.Control />
                <Checkbox.Label>{option.label}</Checkbox.Label>
              </Checkbox.Root>
            ))}
          </Stack>
        </Stack>

        {/* Type Filter (Volunteers only) */}
        {isVolunteer && requestTypes.length > 0 && (
          <Stack gap={3}>
            <Text fontSize="sm" fontWeight="semibold" color="gray.700">
              Type
            </Text>
            <Combobox.Root
              multiple
              closeOnSelect
              value={selectedTypes}
              collection={typeCollection}
              onValueChange={handleTypeChange}
              onInputValueChange={(details) =>
                setTypeSearchValue(details.inputValue)
              }
            >
              <Combobox.Control borderColor="gray.200">
                <Combobox.Input placeholder="Select types..." p={2} />
                <Combobox.IndicatorGroup px={2} py={1}>
                  <Combobox.Trigger />
                </Combobox.IndicatorGroup>
              </Combobox.Control>

              <Portal>
                <Combobox.Positioner>
                  <Combobox.Content p={2}>
                    <Combobox.ItemGroup>
                      <Combobox.ItemGroupLabel px={2} py={1}>
                        Types
                      </Combobox.ItemGroupLabel>
                      {filteredTypeOptions.map((item) => (
                        <Combobox.Item
                          key={item.id}
                          item={{ value: String(item.id), label: item.name }}
                          px={3}
                          py={2}
                          borderRadius="md"
                          _hover={{ bg: "gray.50" }}
                        >
                          {item.name}
                          <Combobox.ItemIndicator />
                        </Combobox.Item>
                      ))}
                      <Combobox.Empty px={3} py={2}>
                        No types found
                      </Combobox.Empty>
                    </Combobox.ItemGroup>
                  </Combobox.Content>
                </Combobox.Positioner>
              </Portal>
            </Combobox.Root>
          </Stack>
        )}
      </Stack>
    </Box>
  );
};
