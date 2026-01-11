import { Table } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Icon from "../ui/icons";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
  page?: number;
  pageSize?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
}

export function DataTablePagination<TData>({
  table,
  page,
  pageSize,
  totalItems,
  onPageChange,
  onPageSizeChange,
}: DataTablePaginationProps<TData>) {
  const tablePagination = table.getState().pagination;

  const resolvedPageSize = pageSize ?? tablePagination.pageSize;
  const resolvedPageIndex =
    (page ?? tablePagination.pageIndex + 1) - 1;

  const hasTotal = typeof totalItems === "number";

  const pageCount = hasTotal
    ? totalItems === 0
      ? 1
      : Math.max(
          1,
          Math.ceil(totalItems / (resolvedPageSize || 1))
        )
    : table.getPageCount() || 1;

  const canPrevious = hasTotal
    ? resolvedPageIndex > 0
    : table.getCanPreviousPage();

  const canNext = hasTotal
    ? resolvedPageIndex + 1 < pageCount
    : table.getCanNextPage();

  const handleFirstPage = () => {
    if (onPageChange) {
      onPageChange(1);
    } else {
      table.setPageIndex(0);
    }
  };

  const handlePreviousPage = () => {
    if (onPageChange) {
      const newPage = resolvedPageIndex <= 0 ? 1 : resolvedPageIndex;
      onPageChange(newPage);
    } else {
      table.previousPage();
    }
  };

  const handleNextPage = () => {
    if (onPageChange) {
      const newPage =
        resolvedPageIndex + 2 > pageCount
          ? pageCount
          : resolvedPageIndex + 2;
      onPageChange(newPage);
    } else {
      table.nextPage();
    }
  };

  const handleLastPage = () => {
    if (onPageChange) {
      onPageChange(pageCount);
    } else {
      table.setPageIndex(pageCount - 1);
    }
  };

  return (
    <div className="flex items-center justify-between px-2 py-6">
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          className="hidden size-8 lg:flex"
          onClick={handleFirstPage}
          disabled={!canPrevious}
        >
          <span className="sr-only">Go to first page</span>
          <Icon name="ChevronsLeft" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          onClick={handlePreviousPage}
          disabled={!canPrevious}
        >
          <span className="sr-only">Go to previous page</span>
          <Icon name="ChevronLeft" />
        </Button>
      </div>
      <div className="flex items-center gap-x-4">
        <div className="flex items-center space-x-2">
          <p className="text-sm font-medium">Quantidade por página</p>
          <Select
            value={`${resolvedPageSize}`}
            onValueChange={(value) => {
              const newSize = Number(value);

              if (onPageSizeChange) {
                onPageSizeChange(newSize);
              } else {
                table.setPageSize(newSize);
              }
            }}
          >
            <SelectTrigger className="h-8 w-[70px]">
              <SelectValue placeholder={resolvedPageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {[10, 30, 50, 100].map((pageSize) => (
                <SelectItem key={pageSize} value={`${pageSize}`}>
                  {pageSize}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex w-[100px] items-center justify-center text-sm font-medium">
          Página {resolvedPageIndex + 1} de {pageCount}
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="icon"
          className="size-8"
          onClick={handleNextPage}
          disabled={!canNext}
        >
          <span className="sr-only">Go to next page</span>
          <Icon name="ChevronRight" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="hidden size-8 lg:flex"
          onClick={handleLastPage}
          disabled={!canNext}
        >
          <span className="sr-only">Go to last page</span>
          <Icon name="ChevronsRight" />
        </Button>
      </div>
    </div>
  );
}
