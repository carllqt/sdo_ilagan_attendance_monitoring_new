import { useMemo } from "react";
import dayjs from "dayjs";
import { getEmployeeName } from "@/lib/utils";

const formatTime = (time) => {
    if (!time) return "-";

    const value = String(time);
    const timeMatch = value.match(/(\d{1,2}):(\d{2})(?::\d{2})?/);

    if (timeMatch) {
        const hour = Number(timeMatch[1]);
        const minute = timeMatch[2];
        const displayHour = hour % 12 || 12;

        return `${displayHour}:${minute}`;
    }

    const parsedTime = dayjs(value);

    return parsedTime.isValid() ? parsedTime.format("h:mm") : "-";
};

const getAllDaysInMonth = (year, month) => {
    const start = dayjs(`${year}-${month}-01`).startOf("month");
    const end = dayjs(`${year}-${month}-01`).endOf("month");
    const days = [];
    let current = start;

    while (current.isBefore(end) || current.isSame(end, "day")) {
        days.push(current);
        current = current.add(1, "day");
    }

    return days;
};

const travelOrdersFor = (timeRecord) =>
    timeRecord?.employee_travel_orders || timeRecord?.employeeTravelOrders || [];

const travelOrderForDate = (timeRecord, date) =>
    travelOrdersFor(timeRecord).find(
        (travelOrder) =>
            !date.isBefore(dayjs(travelOrder.start_date), "day") &&
            !date.isAfter(dayjs(travelOrder.end_date), "day"),
    );

const generateLogs = (timeRecord, selectedMonth, selectedYear) =>
    getAllDaysInMonth(selectedYear, selectedMonth).map((date) => {
        const travelOrder = travelOrderForDate(timeRecord, date);
        const attendance = (timeRecord.attendances || []).find((att) =>
            dayjs(att.date).isSame(date, "day"),
        );

        if (travelOrder) {
            return {
                date: date.format("YYYY-MM-DD"),
                isTravelOrder: true,
                amIn: "-",
                amOut: "-",
                pmIn: "-",
                pmOut: "-",
                undertime: "-",
            };
        }

        return {
            date: date.format("YYYY-MM-DD"),
            amIn: formatTime(attendance?.am?.am_time_in),
            amOut: formatTime(attendance?.am?.am_time_out),
            pmIn: formatTime(attendance?.pm?.pm_time_in),
            pmOut: formatTime(attendance?.pm?.pm_time_out),
            undertime: attendance?.tardiness_record?.converted_tardy ?? "-",
        };
    });

const useEmployeePreviewDtr = ({
    previewDtrModal,
    selectedMonth,
    selectedYear,
}) =>
    useMemo(() => {
        const timeRecord = previewDtrModal?.time_record;
        const fullName = getEmployeeName(timeRecord);
        const previewMonth = String(selectedMonth).padStart(2, "0");
        const previewYear = String(selectedYear);
        const logs = timeRecord
            ? generateLogs(timeRecord, previewMonth, previewYear)
            : [];
        const monthKey = `${previewYear}-${previewMonth}`;
        const undertimeTotal =
            previewDtrModal?.monthly_totals?.[monthKey] ?? 0;
        const previewMonthLabel = new Date(
            `${previewYear}-${previewMonth}-01`,
        ).toLocaleString("default", { month: "long" });

        return {
            fullName,
            logs,
            previewMonth,
            previewMonthLabel,
            previewYear,
            timeRecord,
            undertimeTotal,
        };
    }, [previewDtrModal, selectedMonth, selectedYear]);

export default useEmployeePreviewDtr;

