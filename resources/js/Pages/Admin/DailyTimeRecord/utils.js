export const formatSearchDisplay = (value) =>
    String(value || "")
        .replace(/^\d+\s+/, "")
        .trim();

export const extractTimeRecordEmployees = (timeRecord) =>
    Array.isArray(timeRecord?.data)
        ? timeRecord.data
        : Array.isArray(timeRecord)
          ? timeRecord
          : [];

export const resolveCurrentDateParts = ({ month, year }) => {
    const currentDate = new Date();

    return {
        currentMonth: month || currentDate.getMonth() + 1,
        currentYear: year || currentDate.getFullYear(),
    };
};

export const tardinessAnimationPath =
    "/animations/daily_time_record_computation.lottie";

let tardinessAnimationPromise = null;

export const loadTardinessAnimationData = () => {
    if (!tardinessAnimationPromise) {
        tardinessAnimationPromise = fetch(tardinessAnimationPath, {
            cache: "force-cache",
        }).then((response) => {
            if (!response.ok) {
                throw new Error("Unable to load tardiness animation.");
            }

            return response.arrayBuffer();
        });
    }

    return tardinessAnimationPromise;
};

