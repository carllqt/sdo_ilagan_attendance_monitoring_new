import React from "react";
import { Head } from "@inertiajs/react";
import { Toaster } from "sonner";
import TalaBackground from "@/Components/TalaBackground";
import AttendanceHeader from "./Partials/AttendanceHeader";
import LogsPanel from "./Partials/LogsPanel";
import PromptModal from "./Partials/PromptModal";
import ScannerPanel from "./Partials/ScannerPanel";
import useAttendanceController from "./hooks/useAttendanceController";
import { defaultFingerprintServiceUrl } from "./utils";

const Attendance = ({
    attendances,
    attendanceFilters = {},
    attendanceAccess = {},
    fingerprintServiceUrl = defaultFingerprintServiceUrl,
}) => {
    const attendance = useAttendanceController({
        attendances,
        attendanceAccess,
        attendanceFilters,
        fingerprintServiceUrl,
    });

    return (
        <>
            <Head title="Attendance" />
            <main className="relative h-screen overflow-hidden bg-[#02062f] px-4 py-4 text-white sm:px-6">
                <Toaster position="top-right" visibleToasts={3} gap={10} />
                <TalaBackground />
                <div className="relative z-10 mx-auto flex h-full w-full max-w-7xl flex-col gap-4">
                    <AttendanceHeader
                        currentStatus={attendance.currentStatus}
                        formattedDate={attendance.formattedDate}
                        scanStatus={attendance.scanStatus}
                        StatusIcon={attendance.StatusIcon}
                        time={attendance.time}
                    />

                    <div className="grid min-h-0 flex-1 grid-cols-1 items-start gap-4 xl:grid-cols-2">
                        <ScannerPanel
                            currentStatus={attendance.currentStatus}
                            employee={attendance.employee}
                            employeeName={attendance.employeeName}
                            fingerprintColor={attendance.fingerprintColor}
                            handleLogActionChange={
                                attendance.handleLogActionChange
                            }
                            handleLogSessionToggle={
                                attendance.handleLogSessionToggle
                            }
                            logAction={attendance.logAction}
                            logSession={attendance.logSession}
                            retryCountdown={attendance.retryCountdown}
                            scanMessage={attendance.scanMessage}
                            selectedChoice={attendance.selectedChoice}
                            successCountdown={attendance.successCountdown}
                        />

                        <LogsPanel
                            activeTab={attendance.activeTab}
                            dailyAttendance={attendance.dailyAttendance}
                            filterLoading={attendance.filterLoading}
                            handleSearchChange={attendance.handleSearchChange}
                            handleSessionChange={attendance.handleSessionChange}
                            hasOpenSuggestions={attendance.hasOpenSuggestions}
                            search={attendance.search}
                            searchBoxRef={attendance.searchBoxRef}
                            selectSuggestion={attendance.selectSuggestion}
                            setShowSuggestions={attendance.setShowSuggestions}
                            suggestionMatches={attendance.suggestionMatches}
                            suggestionsLoading={attendance.suggestionsLoading}
                            totalAttendanceRecords={
                                attendance.totalAttendanceRecords
                            }
                        />
                    </div>
                </div>

                {attendance.showAMPromptModal && attendance.amPromptData && (
                    <PromptModal
                        employee={attendance.amPromptData.employee}
                        message={attendance.amPromptData.message}
                        secondaryLabel="AM Time-Out"
                        primaryLabel="PM Time-In"
                        onSecondary={() =>
                            attendance.handlePromptChoice("AM Time-Out")
                        }
                        onPrimary={() =>
                            attendance.handlePromptChoice("PM Time-In")
                        }
                    />
                )}

                {attendance.showPMPromptModal && attendance.pmPromptData && (
                    <PromptModal
                        employee={attendance.pmPromptData.employee}
                        message={attendance.pmPromptData.message}
                        secondaryLabel="PM Time-In"
                        primaryLabel="PM Time-Out"
                        onSecondary={() =>
                            attendance.handlePromptChoice("PM Time-In")
                        }
                        onPrimary={() =>
                            attendance.handlePromptChoice("PM Time-Out")
                        }
                    />
                )}
            </main>
        </>
    );
};

export default Attendance;
