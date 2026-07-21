import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const AttendanceSuggestionSkeletonList = () => (
    <div className="space-y-2 px-3 py-3">
        {Array.from({ length: 3 }).map((_, index) => (
            <div
                key={index}
                className="flex items-center justify-between gap-3"
            >
                <div className="min-w-0 flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4 bg-white/25" />
                    <Skeleton className="h-3 w-1/2 bg-white/20" />
                </div>
                <Skeleton className="h-6 w-14 rounded-full bg-white/25" />
            </div>
        ))}
    </div>
);

export default AttendanceSuggestionSkeletonList;
