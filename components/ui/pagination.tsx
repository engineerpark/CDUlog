// 실외기케어 대시보드 - 페이지네이션 컴포넌트
"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  className?: string
  showPageInfo?: boolean
  showQuickJump?: boolean
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  showPageInfo = true,
  showQuickJump = false
}: PaginationProps) {
  // 페이지 범위 계산
  const getPageNumbers = () => {
    const delta = 2 // 현재 페이지 좌우로 보여줄 페이지 수
    const pages = []
    const rangeStart = Math.max(1, currentPage - delta)
    const rangeEnd = Math.min(totalPages, currentPage + delta)

    // 시작 부분 처리
    if (rangeStart > 1) {
      pages.push(1)
      if (rangeStart > 2) {
        pages.push('ellipsis-start')
      }
    }

    // 중간 부분
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pages.push(i)
    }

    // 끝 부분 처리
    if (rangeEnd < totalPages) {
      if (rangeEnd < totalPages - 1) {
        pages.push('ellipsis-end')
      }
      pages.push(totalPages)
    }

    return pages
  }

  if (totalPages <= 1) return null

  const pageNumbers = getPageNumbers()

  return (
    <nav className={cn("flex items-center justify-between", className)}>
      {/* 페이지 정보 */}
      {showPageInfo && (
        <div className="text-sm text-muted-foreground">
          페이지 {currentPage} / {totalPages}
        </div>
      )}

      {/* 페이지네이션 버튼들 */}
      <div className="flex items-center space-x-1">
        {/* 이전 페이지 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">이전 페이지</span>
        </Button>

        {/* 페이지 번호들 */}
        <div className="flex items-center space-x-1">
          {pageNumbers.map((pageNumber, index) => {
            if (pageNumber === 'ellipsis-start' || pageNumber === 'ellipsis-end') {
              return (
                <div
                  key={`ellipsis-${index}`}
                  className="flex h-8 w-8 items-center justify-center"
                >
                  <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                </div>
              )
            }

            const isCurrentPage = pageNumber === currentPage

            return (
              <Button
                key={pageNumber}
                variant={isCurrentPage ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNumber as number)}
                className={cn(
                  "h-8 w-8 p-0",
                  isCurrentPage && "bg-primary text-primary-foreground"
                )}
              >
                {pageNumber}
              </Button>
            )
          })}
        </div>

        {/* 다음 페이지 */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">다음 페이지</span>
        </Button>
      </div>

      {/* 빠른 이동 (선택사항) */}
      {showQuickJump && (
        <div className="flex items-center space-x-2 text-sm">
          <span className="text-muted-foreground">이동:</span>
          <select
            value={currentPage}
            onChange={(e) => onPageChange(Number(e.target.value))}
            className="h-8 rounded border border-input bg-background px-2 py-1"
          >
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <option key={page} value={page}>
                {page}
              </option>
            ))}
          </select>
        </div>
      )}
    </nav>
  )
}

// 페이지네이션 정보를 계산하는 유틸리티 훅
export function usePagination(totalItems: number, itemsPerPage: number = 10, currentPage: number = 1) {
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)
  
  return {
    totalPages,
    startIndex,
    endIndex,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    isFirstPage: currentPage === 1,
    isLastPage: currentPage === totalPages
  }
}