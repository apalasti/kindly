import {
  HStack,
  IconButton,
  Text,
  Box,
  Icon,
  ButtonGroup,
} from "@chakra-ui/react";
import { Pagination } from "@chakra-ui/react/pagination";
import { LuChevronLeft, LuChevronRight } from "react-icons/lu";
import type { ElementType } from "react";

interface RequestsPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  isVolunteer: boolean;
}

export const RequestsPagination = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  isVolunteer,
}: RequestsPaginationProps) => {
  if (totalPages <= 1) {
    return null;
  }

  const startItem = Math.min((currentPage - 1) * itemsPerPage + 1, totalItems);
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <Box bg="white" p={4} borderRadius="lg" boxShadow="sm" mt={6}>
      <HStack justify="space-between" flexWrap="wrap" gap={4}>
        {/* Items info */}
        <Text fontSize="sm" color="gray.600">
          Showing {startItem} - {endItem} of {totalItems} requests
        </Text>

        {/* Pagination controls */}
        <Pagination.Root
          count={totalItems}
          pageSize={itemsPerPage}
          page={currentPage}
          siblingCount={1}
          onPageChange={(e) => onPageChange(e.page)}
        >
          <ButtonGroup
            variant="ghost"
            size="sm"
            colorPalette={isVolunteer ? "teal" : "coral"}
          >
            <Pagination.PrevTrigger asChild>
              <IconButton
                variant="ghost"
                size="sm"
                colorPalette={isVolunteer ? "teal" : "coral"}
              >
                <Icon as={LuChevronLeft as ElementType} />
              </IconButton>
            </Pagination.PrevTrigger>

            <Pagination.Items
              render={(page) => (
                <IconButton
                  key={page.value}
                  variant={{ base: "ghost", _selected: "solid" }}
                  colorPalette={isVolunteer ? "teal" : "coral"}
                  size="sm"
                >
                  {page.value}
                </IconButton>
              )}
            />

            <Pagination.NextTrigger asChild>
              <IconButton
                variant="ghost"
                size="sm"
                colorPalette={isVolunteer ? "teal" : "coral"}
              >
                <Icon as={LuChevronRight as ElementType} />
              </IconButton>
            </Pagination.NextTrigger>
          </ButtonGroup>
        </Pagination.Root>
      </HStack>
    </Box>
  );
};
