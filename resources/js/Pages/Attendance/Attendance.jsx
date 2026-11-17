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
    attendanceRules = {},
    fingerprintServiceUrl = defaultFingerprintServiceUrl,
}) => {
    const attendance = useAttendanceController({
        attendances,
        attendanceAccess,
        attendanceFilters,
        attendanceRules,
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
                            employeeConfirmationKey={
                                attendance.employeeConfirmationKey
                            }
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
                            scanMessage={attendance.scanMessage}
                            scannerOwner={attendance.scannerOwner}
                            selectedChoice={attendance.selectedChoice}
                            scanStatus={attendance.scanStatus}
                            takeScannerHere={attendance.takeScannerHere}
                            amSessionClosesAt={attendance.amSessionClosesAt}
                            pmSessionLocked={attendance.pmSessionLocked}
                            pmSessionOpensAt={attendance.pmSessionOpensAt}
                            timeOutLocked={attendance.timeOutLocked}
                            timeOutOpensAt={attendance.timeOutOpensAt}
                        />

                        <LogsPanel
                            activeTab={attendance.activeTab}
                            applyAttendanceSearch={
                                attendance.applyAttendanceSearch
                            }
                            clearAttendanceSearch={
                                attendance.clearAttendanceSearch
                            }
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

                {[
                    {
                        show: attendance.showAMPromptModal,
                        data: attendance.amPromptData,
                        fallback: ["AM Time-Out", "PM Time-In"],
                    },
                    {
                        show: attendance.showPMPromptModal,
                        data: attendance.pmPromptData,
                        fallback: ["PM Time-In", "PM Time-Out"],
                    },
                ].map(({ show, data, fallback }) => {
                    if (!show || !data) return null;

                    // The server sends the two choices: [secondary, primary].
                    const [secondary, primary] =
                        data.options?.length === 2 ? data.options : fallback;

                    return (
                        <PromptModal
                            key={`${secondary}-${primary}`}
                            employee={data.employee}
                            message={data.message}
                            secondaryLabel={secondary}
                            primaryLabel={primary}
                            onSecondary={() =>
                                attendance.handlePromptChoice(secondary)
                            }
                            onPrimary={() =>
                                attendance.handlePromptChoice(primary)
                            }
                            onExpire={attendance.handlePromptTimeout}
                        />
                    );
                })}

            </main>
        </>
    );
};

export default Attendance;
