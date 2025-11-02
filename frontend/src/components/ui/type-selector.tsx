import { useMemo, useState } from "react";
import { Box, Wrap } from "@chakra-ui/react";
import { Combobox } from "@chakra-ui/react/combobox";
import { Tag } from "@chakra-ui/react/tag";
import { createListCollection } from "@chakra-ui/react/collection";

export interface TypeItem {
  id: number;
  name: string;
}

interface TypeSelectorProps {
  items: TypeItem[];
  value: number[];
  onChange: (ids: number[]) => void;
  placeholder?: string;
  allowMultiple?: boolean;
  hideSelectedTagList?: boolean;
  width?: string | number;
}

export const TypeSelector = ({
  items,
  value,
  onChange,
  placeholder = "Select types...",
  allowMultiple = true,
  hideSelectedTagList = false,
  width = "360px",
}: TypeSelectorProps) => {
  const [inputValue, setInputValue] = useState("");

  const filteredItems = useMemo(() => {
    const q = inputValue.toLowerCase();
    return items.filter(
      (i: TypeItem) => i.name.toLowerCase().indexOf(q) !== -1
    );
  }, [items, inputValue]);

  const collection = useMemo(
    () =>
      createListCollection({
        items: filteredItems.map((t) => ({
          value: String(t.id),
          label: t.name,
        })),
      }),
    [filteredItems]
  );

  const selectedIds = value || [];

  const handleValueChange = (details: { value: string[] }) => {
    let next = details.value.map((v) => Number(v));
    if (!allowMultiple && next.length > 1) {
      next = [next[0]];
    }
    onChange(next);
  };

  const removeSelected = (id: number) => {
    onChange(selectedIds.filter((v) => v !== id));
  };

  return (
    <Box>
      {!hideSelectedTagList && selectedIds.length > 0 && (
        <Wrap gap={2} mb={5}>
          {selectedIds.map((id) => {
            const item = items.filter((t: TypeItem) => t.id === id)[0];
            if (!item) return null;
            return (
              <Tag.Root key={id} size="sm" px={2} py={1}>
                <Tag.Label>{item.name}</Tag.Label>
                <Tag.EndElement>
                  <Tag.CloseTrigger onClick={() => removeSelected(id)} />
                </Tag.EndElement>
              </Tag.Root>
            );
          })}
        </Wrap>
      )}

      <Box width={width} maxW="100%" flexShrink={0}>
        <Combobox.Root
          multiple={allowMultiple}
          value={selectedIds.map(String)}
          collection={collection}
          onValueChange={handleValueChange}
          onInputValueChange={(d) => setInputValue(d.inputValue)}
        >
          <Combobox.Control borderColor="gray.200" w="100%">
            <Combobox.Input placeholder={placeholder} p={2} />
            <Combobox.IndicatorGroup px={2} py={1}>
              <Combobox.Trigger />
            </Combobox.IndicatorGroup>
          </Combobox.Control>
          <Combobox.Positioner>
            <Combobox.Content p={2} minW="100%">
              <Combobox.ItemGroup>
                <Combobox.ItemGroupLabel px={2} py={1}>
                  Types
                </Combobox.ItemGroupLabel>
                {filteredItems.map((item) => (
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
        </Combobox.Root>
      </Box>
    </Box>
  );
};
