

"use client"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"

interface CustomPaginationProps {
  currentPage: number
  totalCount: number
  pageSize: number
  onPageChange: (page: number) => void
  className?: string
  siblingCount?: number
}

export function CustomPagination({
  currentPage,
  totalCount,
  pageSize,
  onPageChange,
  className = "",
  siblingCount = 1,
}: CustomPaginationProps) {
  // Calculate total pages
  console.log("totalCount", totalCount)
  console.log("pageSize", pageSize)
  const totalPages = Math.ceil(totalCount / pageSize)

  // Generate page numbers to display
  const generatePagination = () => {
    // If there are 7 or fewer pages, show all pages
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    // Calculate range based on current page and sibling count
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)

    // Determine if we should show ellipsis
    const shouldShowLeftDots = leftSiblingIndex > 2
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1

    // Default first and last page indexes
    const firstPageIndex = 1
    const lastPageIndex = totalPages

    // No left dots, but right dots
    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1)
      return [...leftRange, "dots", totalPages]
    }

    // No right dots, but left dots
    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount
      const rightRange = Array.from({ length: rightItemCount }, (_, i) => totalPages - rightItemCount + i + 1)
      return [firstPageIndex, "dots", ...rightRange]
    }

    // Both left and right dots
    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i,
      )
      return [firstPageIndex, "dots", ...middleRange, "dots", lastPageIndex]
    }

    return []
  }

  const pages = generatePagination()

  // Handle page changes
  const handlePageChange = (page: number) => {
    if (page > 0 && page <= totalPages) {
      onPageChange(page)
    }
  }

  if (totalPages <= 1) return null

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious 
            href="#" 
            onClick={(e) => {
              e.preventDefault()
              handlePageChange(currentPage - 1)
            }}
            aria-disabled={currentPage === 1}
            className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>

        {pages.map((page, index) => {
          if (page === "dots") {
            return (
              <PaginationItem key={`dots-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            )
          }

          return (
            <PaginationItem key={`page-${page}`}>
              <PaginationLink 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  handlePageChange(Number(page))
                }}
                isActive={currentPage === page}
                aria-current={currentPage === page ? "page" : undefined}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          )
        })}

        <PaginationItem>
          <PaginationNext 
            href="#" 
            onClick={(e) => {
              e.preventDefault()
              handlePageChange(currentPage + 1)
            }}
            aria-disabled={currentPage === totalPages}
            className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  )
}