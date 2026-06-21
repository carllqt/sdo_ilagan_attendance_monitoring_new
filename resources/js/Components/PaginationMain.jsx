import React from "react";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";

export const buildPaginationItems = (currentPage, totalPages) => {
    if (totalPages <= 6) {
        return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    const pages = [1];
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);

    if (start > 2) pages.push("start-ellipsis");

    for (let page = start; page <= end; page += 1) {
        pages.push(page);
    }

    if (end < totalPages - 1) pages.push("end-ellipsis");

    pages.push(totalPages);

    return pages;
};

const PaginationMain = ({
    className = "mt-4",
    currentPage = 1,
    entryLabel = "entries",
    from = 0,
    onPageChange,
    pageNumbers,
    pagination,
    showEntryLabel = true,
    to = 0,
    total = 0,
    totalPages = 1,
    disabled = false,
}) => {
    const activePage = pagination?.current_page || currentPage;
    const pagesTotal = pagination?.last_page || totalPages;
    const start = pagination?.from ?? from;
    const end = pagination?.to ?? to;
    const recordsTotal = pagination?.total ?? total;
    const pages = pageNumbers || buildPaginationItems(activePage, pagesTotal);

    return (
        <div className={`flex items-center ${className}`}>
            <div className="text-sm font-medium text-gray-500">
                Showing {start || 0} to {end || 0} of {recordsTotal || 0}
                {showEntryLabel ? ` ${entryLabel}` : ""}
            </div>

            <div className="ml-auto">
                {pagesTotal > 1 && (
                    <Pagination>
                        <PaginationPrevious
                            disabled={disabled || activePage === 1}
                            onClick={() => {
                                if (disabled) return;

                                onPageChange?.(activePage - 1);
                            }}
                        />
                        <PaginationContent>
                            {pages.map((page, index) => (
                                <PaginationItem key={`${page}-${index}`}>
                                    {typeof page === "number" ? (
                                        <PaginationLink
                                            isActive={activePage === page}
                                            aria-disabled={disabled}
                                            className={
                                                disabled
                                                    ? "pointer-events-none opacity-50"
                                                    : undefined
                                            }
                                            onClick={() => {
                                                if (disabled) return;

                                                onPageChange?.(page);
                                            }}
                                        >
                                            {page}
                                        </PaginationLink>
                                    ) : (
                                        <span className="flex h-9 min-w-9 items-center justify-center px-2 text-sm font-medium text-slate-400">
                                            ...
                                        </span>
                                    )}
                                </PaginationItem>
                            ))}
                        </PaginationContent>
                        <PaginationNext
                            disabled={disabled || activePage === pagesTotal}
                            onClick={() => {
                                if (disabled) return;

                                onPageChange?.(activePage + 1);
                            }}
                        />
                    </Pagination>
                )}
            </div>
        </div>
    );
};

export default PaginationMain;
