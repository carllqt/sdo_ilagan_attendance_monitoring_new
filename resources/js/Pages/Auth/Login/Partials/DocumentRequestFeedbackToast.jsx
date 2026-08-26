import AttendanceToast from "@/Pages/Attendance/Partials/AttendanceToast";
import { CircleCheck, TriangleAlert } from "lucide-react";

const DocumentRequestFeedbackToast = ({ message, type = "success" }) => {
    const isError = type === "error";

    return (
        <AttendanceToast
            icon={
                isError ? (
                    <TriangleAlert className="h-5 w-5" />
                ) : (
                    <CircleCheck className="h-5 w-5" />
                )
            }
            message={message}
            title={isError ? "Request failed" : "Request submitted"}
            tone={isError ? "error" : "success"}
        />
    );
};

export default DocumentRequestFeedbackToast;
