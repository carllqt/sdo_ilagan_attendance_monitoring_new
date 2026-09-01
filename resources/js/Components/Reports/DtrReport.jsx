import React from "react";

const formatWorkHour = (time) => {
    if (!time) {
        return "";
    }

    const [hours = "0", minutes = "0"] = String(time).split(":");
    const date = new Date();
    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date
        .toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        })
        .toLowerCase();
};

const formatLogTime = (time) => {
    if (!time || time === "-") {
        return time || "";
    }

    const match = String(time).match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);

    if (!match) {
        return time;
    }

    const hours = Number(match[1]);
    const minutes = match[2];

    return `${hours % 12 || 12}:${minutes}`;
};

const DTRReport = React.forwardRef(
    ({ name, dateRange, logs, signatory, workSchedule }, ref) => {
        const signatoryPosition =
            signatory && !signatory.missing ? signatory.position : "";
        const officialTimeIn =
            formatWorkHour(workSchedule?.time_in) || "08:00 am";
        const officialTimeOut =
            formatWorkHour(workSchedule?.time_out) || "05:00 pm";
        const formattedMonth = new Date(dateRange.start).toLocaleDateString(
            "en-US",
            { month: "long", year: "numeric" },
        );

        const logsMap = logs.reduce((acc, log) => {
            acc[log.date] = log;
            return acc;
        }, {});

        const getAllDates = (start, end) => {
            const dates = [];
            let current = new Date(start);
            const last = new Date(end);

            while (current <= last) {
                dates.push(new Date(current));
                current.setDate(current.getDate() + 1);
            }

            return dates;
        };

        const allDates = getAllDates(dateRange.start, dateRange.end);
        const colW = [
            "1.85in",
            "0.72in",
            "0.78in",
            "0.72in",
            "0.78in",
            "0.72in",
            "0.67in",
            "1.26in",
        ];
        const totalWidth = "7.5in";

        const cellStyle = (i, opts = {}) => ({
            width: colW[i],
            boxSizing: "border-box",
            padding: "0 3px",
            fontSize: "12px",
            lineHeight: "15px",
            height: "15px",
            verticalAlign: "middle",
            textAlign: opts.align || "center",
            fontWeight: "normal",
        });

        const detailsRowStyle = {
            display: "flex",
            alignItems: "baseline",
            margin: "0 0 10px",
            whiteSpace: "nowrap",
        };

        const detailsValueStyle = {
            flex: 1,
            minWidth: 0,
            marginLeft: "8px",
            paddingLeft: "2px",
            borderBottom: "1px solid #222",
            textAlign: "center",
        };

        return (
            <div
                ref={ref}
                className="dtr-report"
                style={{
                    position: "relative",
                    boxSizing: "border-box",
                    minHeight: "12in",
                    padding: 0,
                    fontFamily: "Arial, Helvetica, sans-serif",
                }}
            >
                <style>
                    {`
                    table.dtr-table th {
                        font-weight: normal;
                        font-size: 12px;
                        line-height: 15px;
                        padding: 0 4px 8px;
                    }

                    table.dtr-table th {
                        font-weight: bold;
                        font-size: 12px;
                        line-height: 15px;
                        padding: 0 4px 8px;
                    }

                    table.dtr-table td {
                        font-size: 12px !important;
                        padding: 0 4px !important;
                        line-height: 15px !important;
                        height: 15px !important;
                    }

                    table.dtr-table td:first-child {
                        text-align: left;
                    }

                    @media print {
                        .dtr-report h5 {
                            font-size: 12px !important;
                        }

                        .dtr-report h2 {
                            font-size: 12px !important;
                        }

                        .dtr-report .dtr-details {
                            font-size: 12px !important;
                        }

                        .dtr-report table.dtr-table th,
                        .dtr-report table.dtr-table td {
                            font-size: 12px !important;
                            line-height: 15px !important;
                            height: 15px !important;
                        }

                        .dtr-report .dtr-certification {
                            font-size: 10px !important;
                        }

                        .dtr-report .dtr-certification-copy {
                            font-size: 14px !important;
                        }

                        .dtr-report .dtr-signature {
                            font-size: 18px !important;
                        }

                        .dtr-report .dtr-generated-footer {
                            font-size: 12px !important;
                        }
                    }
                `}
                </style>

                <img
                    src="/sdo-pic.jpg"
                    alt="Watermark"
                    style={{
                        position: "absolute",
                        top: "42%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: "70%",
                        opacity: 0.2,
                        zIndex: 0,
                    }}
                />

                <div style={{ position: "relative", zIndex: 1 }}>
                    <div style={{ textAlign: "left", marginBottom: "20px" }}>
                        <h5
                            style={{
                                margin: 0,
                                fontSize: "10px",
                                lineHeight: "10px",
                            }}
                        >
                            CS Form 48
                        </h5>

                        <h2
                            style={{
                                margin: 0,
                                fontSize: "12px",
                                lineHeight: "18px",
                                color: "#aaa",
                            }}
                        >
                            <strong>DAILY TIME RECORD</strong>
                        </h2>
                    </div>

                    <div
                        className="dtr-details"
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                            marginBottom: "30px",
                            fontSize: "12px",
                            lineHeight: "17px",
                        }}
                    >
                        <div style={{ width: "53.33%" }}>
                            <p style={{ margin: "0 0 12px", fontWeight: 600 }}>
                                <strong>
                                    SDO City Of Ilagan Daily Time Record
                                </strong>
                            </p>

                            <p style={{ margin: "0 0 10px" }}>
                                Start Date:{" "}
                                {new Date(dateRange.start).toLocaleDateString(
                                    "en-US",
                                )}
                            </p>

                            <p style={{ margin: 0 }}>
                                End Date:{" "}
                                {new Date(dateRange.end).toLocaleDateString(
                                    "en-US",
                                )}
                            </p>
                        </div>

                        <div
                            style={{
                                width: "calc(46.67% - 12px)",
                                marginLeft: "10px",
                            }}
                        >
                            <div style={detailsRowStyle}>
                                <span>Name:</span>
                                <span
                                    style={{
                                        ...detailsValueStyle,
                                        textTransform: "uppercase",
                                        fontWeight: "normal",
                                    }}
                                >
                                    {name}
                                </span>
                            </div>

                            <div style={detailsRowStyle}>
                                <span>For the Month of:</span>
                                <span style={detailsValueStyle}>
                                    {formattedMonth}
                                </span>
                            </div>

                            <div style={detailsRowStyle}>
                                <span>Official Hour for arrival:</span>
                                <span style={detailsValueStyle}>
                                    {officialTimeIn}
                                </span>
                            </div>

                            <div
                                style={{ ...detailsRowStyle, marginBottom: 0 }}
                            >
                                <span>And Departure (Reg. Days):</span>
                                <span style={detailsValueStyle}>
                                    {officialTimeOut}
                                </span>
                            </div>
                        </div>
                    </div>

                    <table className="dtr-table">
                        <colgroup>
                            {colW.map((w, i) => (
                                <col key={i} style={{ width: w }} />
                            ))}
                        </colgroup>

                        <thead>
                            <tr>
                                <th style={cellStyle(0)} />

                                {[
                                    "AM IN",
                                    "AM OUT",
                                    "PM IN",
                                    "PM OUT",
                                    "OT IN",
                                    "OT OUT",
                                    "UNDERTIME",
                                ].map((heading, index) => (
                                    <th
                                        key={heading}
                                        style={{
                                            ...cellStyle(index + 1),
                                            borderBottom: "1px solid #222",
                                        }}
                                    >
                                        {heading}
                                    </th>
                                ))}
                            </tr>

                            <tr>
                                <th
                                    style={{
                                        ...cellStyle(0, { align: "left" }),
                                        paddingTop: "8px",
                                        paddingBottom: "8px",
                                        textTransform: "uppercase",
                                    }}
                                >
                                    {name}
                                </th>

                                <th colSpan={7} />
                            </tr>
                        </thead>

                        <tbody>
                            {allDates.map((d) => {
                                const iso = d.toISOString().split("T")[0];
                                const formatted = d.toLocaleDateString("en-US");
                                const weekday = d.toLocaleDateString("en-US", {
                                    weekday: "short",
                                });
                                const log = logsMap[iso] || {};

                                return (
                                    <tr key={iso}>
                                        <td
                                            style={cellStyle(0, {
                                                align: "left",
                                            })}
                                        >
                                            {formatted} {weekday}
                                        </td>

                                        {log.isTravelOrder ? (
                                            <td
                                                colSpan={7}
                                                style={{
                                                    ...cellStyle(1),
                                                    textAlign: "center",
                                                    fontWeight: "bold",
                                                }}
                                            >
                                                ON TRAVEL
                                            </td>
                                        ) : (
                                            <>
                                                <td style={cellStyle(1)}>
                                                    {formatLogTime(log.amIn)}
                                                </td>

                                                <td style={cellStyle(2)}>
                                                    {formatLogTime(log.amOut)}
                                                </td>

                                                <td style={cellStyle(3)}>
                                                    {formatLogTime(log.pmIn)}
                                                </td>

                                                <td style={cellStyle(4)}>
                                                    {formatLogTime(log.pmOut)}
                                                </td>

                                                <td style={cellStyle(5)}>
                                                    {formatLogTime(log.otIn)}
                                                </td>

                                                <td style={cellStyle(6)}>
                                                    {formatLogTime(log.otOut)}
                                                </td>

                                                <td style={cellStyle(7)}>
                                                    {log.undertime || ""}
                                                </td>
                                            </>
                                        )}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    <div
                        className="dtr-certification"
                        style={{
                            marginTop: "30px",
                            lineHeight: "15px",
                            textAlign: "center",
                        }}
                    >
                        <p
                            className="dtr-certification-copy"
                            style={{
                                margin: "0 0 50px",
                                fontSize: "14px",
                            }}
                        >
                            I certify on my honor that the above is true and
                            correct report of the hours <br /> worked/performed
                            record of which was made daily at the time of
                            arrival and departure <br /> from office.
                        </p>

                        <div
                            className="dtr-signature"
                            style={{
                                textAlign: "center",
                                fontSize: "18px",
                                marginBottom: 0,
                                lineHeight: 1.2,
                            }}
                        >
                            <div style={{ marginBottom: "4px" }}>
                                <strong>{name.toUpperCase()}</strong>
                            </div>

                            <div
                                style={{
                                    borderBottom: "1px solid black",
                                    width: "350px",
                                    margin: "0 auto 2px auto",
                                }}
                            />

                            <small
                                style={{
                                    display: "block",
                                    marginTop: "0",
                                }}
                            >
                                Printed Name and Signature of Employee
                            </small>
                        </div>

                        <div
                            className="dtr-signature"
                            style={{
                                textAlign: "center",
                                fontSize: "18px",
                                lineHeight: 1.2,
                                marginTop: "50px",
                            }}
                        >
                            <div style={{ marginBottom: "4px" }}>
                                <strong>
                                    {(
                                        signatory?.name ||
                                        "NO OFFICE HEAD ASSIGNED"
                                    ).toUpperCase()}
                                </strong>
                            </div>

                            <div
                                style={{
                                    borderBottom: "1px solid black",
                                    width: "350px",
                                    margin: "0 auto 2px auto",
                                }}
                            />

                            <small
                                style={{
                                    display: "block",
                                    marginTop: "0",
                                }}
                            >
                                {signatoryPosition}
                            </small>
                        </div>
                    </div>
                </div>

                <div
                    className="dtr-generated-footer"
                    style={{
                        position: "absolute",
                        right: 0,
                        bottom: 0,
                        left: 0,
                        fontSize: "12px",
                        textAlign: "left",
                        fontStyle: "italic",
                        fontFamily: "Times New Roman",
                    }}
                >
                    This Document is Generated from Project TALA.
                </div>
            </div>
        );
    },
);

export default DTRReport;
