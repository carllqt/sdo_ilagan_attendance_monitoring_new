import React from "react";

const box = (checked) => (
    <span
        style={{
            display: "inline-block",
            width: "10px",
            height: "10px",
            border: "1px solid #000",
            marginRight: "5px",
            textAlign: "center",
            lineHeight: "9px",
            fontSize: "9px",
            fontFamily: "Arial, sans-serif",
        }}
    >
        {checked ? "x" : ""}
    </span>
);

const line = (value = "", width = "150px") => (
    <span
        style={{
            display: "inline-block",
            minWidth: width,
            borderBottom: "1px solid #000",
            padding: "0 4px",
            lineHeight: 1.2,
        }}
    >
        {value}
    </span>
);

const cellStyle = {
    border: "1px solid #000",
    padding: "5px 6px",
    verticalAlign: "top",
};

const headerCellStyle = {
    ...cellStyle,
    padding: "3px 6px",
    fontWeight: "bold",
    textAlign: "center",
    backgroundColor: "#f7f7f7",
};

const leaveTypes = [
    "Vacation Leave",
    "Mandatory/Forced Leave",
    "Sick Leave",
    "Maternity Leave",
    "Paternity Leave",
    "Special Privilege Leave",
    "Solo Parent Leave",
    "Study Leave",
    "10-Day VAWC Leave",
    "Rehabilitation Privilege",
    "Special Leave Benefits for Women",
    "Special Emergency (Calamity) Leave",
    "Adoption Leave",
];

const ApplicationLeaveReport = React.forwardRef(
    (
        {
            officeDepartment = "",
            employeeName = "",
            dateOfFiling = "",
            position = "",
            salary = "",
            typeOfLeave = "",
            typeOfLeaveOther = "",
            leaveLocation = "",
            leaveLocationDetails = "",
            sickLeaveLocation = "",
            illness = "",
            womenIllness = "",
            studyLeavePurpose = "",
            otherPurpose = "",
            workingDays = "",
            inclusiveDates = "",
            commutation = "",
        },
        ref,
    ) => {
        const nameParts = String(employeeName).trim().split(/\s+/);
        const firstName = nameParts.length > 1 ? nameParts[0] : "";
        const lastName =
            nameParts.length > 1
                ? nameParts.slice(1).join(" ")
                : employeeName;

        return (
            <div
                ref={ref}
                style={{
                    width: "794px",
                    minHeight: "1123px",
                    backgroundColor: "#fff",
                    color: "#000",
                    fontFamily: "Arial, Helvetica, sans-serif",
                    fontSize: "10.5px",
                    padding: "22px 50px",
                    boxSizing: "border-box",
                    margin: "0 auto",
                }}
            >
                <div style={{ fontSize: "10px", fontStyle: "italic" }}>
                    Civil Service Form No. 6
                    <br />
                    Revised 2020
                </div>

                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: "90px 1fr 90px",
                        alignItems: "center",
                        marginTop: "8px",
                    }}
                >
                    <img
                        src="/img/logo.png"
                        alt="Logo"
                        style={{
                            width: "58px",
                            justifySelf: "center",
                        }}
                    />
                    <div
                        style={{
                            textAlign: "center",
                            lineHeight: 1.15,
                        }}
                    >
                        <div
                            style={{
                                fontFamily: "OldEnglish",
                                fontSize: "13px",
                            }}
                        >
                            Republic of the Philippines
                        </div>
                        <div
                            style={{
                                fontFamily: "OldEnglish",
                                fontSize: "20px",
                                fontWeight: "bold",
                            }}
                        >
                            Department of Education
                        </div>
                        <div style={{ fontSize: "10px", fontWeight: "bold" }}>
                            SCHOOLS DIVISION OFFICE - CITY OF ILAGAN
                        </div>
                        <div style={{ fontSize: "9px" }}>
                            INHS Compound, Claravall St., San Vicente, City of
                            Ilagan, Isabela
                        </div>
                        <div
                            style={{
                                marginTop: "5px",
                                fontSize: "20px",
                                fontWeight: "bold",
                                letterSpacing: 0,
                            }}
                        >
                            APPLICATION FOR LEAVE
                        </div>
                    </div>
                    <div />
                </div>

                <table
                    style={{
                        width: "100%",
                        marginTop: "5px",
                        borderCollapse: "collapse",
                        tableLayout: "fixed",
                    }}
                >
                    <tbody>
                        <tr>
                            <td style={{ ...cellStyle, width: "34%" }}>
                                1. OFFICE/DEPARTMENT
                                <br />
                                {line(officeDepartment, "180px")}
                            </td>
                            <td style={{ ...cellStyle, width: "44%" }}>
                                2. NAME
                                <span style={{ marginLeft: "35px" }}>
                                    (Last)
                                </span>
                                <span style={{ marginLeft: "58px" }}>
                                    (First)
                                </span>
                                <span style={{ marginLeft: "55px" }}>
                                    (Middle)
                                </span>
                                <br />
                                {line(lastName, "92px")} {line(firstName, "92px")}{" "}
                                {line("", "78px")}
                            </td>
                            <td style={cellStyle}>5. SALARY {line(salary, "72px")}</td>
                        </tr>
                        <tr>
                            <td style={cellStyle}>
                                3. DATE OF FILING {line(dateOfFiling, "120px")}
                            </td>
                            <td colSpan={2} style={cellStyle}>
                                4. POSITION {line(position, "245px")}
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={3} style={headerCellStyle}>
                                6. DETAILS OF APPLICATION
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2} style={{ ...cellStyle, width: "50%" }}>
                                <b>6.A TYPE OF LEAVE TO BE AVAILED OF</b>
                                <div style={{ marginTop: "8px", lineHeight: 1.55 }}>
                                    {leaveTypes.map((leaveType) => (
                                        <div key={leaveType}>
                                            {box(typeOfLeave === leaveType)}
                                            {leaveType}
                                        </div>
                                    ))}
                                    <div style={{ marginTop: "18px" }}>
                                        Others: {line(typeOfLeaveOther, "210px")}
                                    </div>
                                </div>
                            </td>
                            <td style={cellStyle}>
                                <b>6.B DETAILS OF LEAVE</b>
                                <div style={{ marginTop: "8px", lineHeight: 1.55 }}>
                                    <i>
                                        In case of Vacation/Special Privilege
                                        Leave:
                                    </i>
                                    <div>
                                        {box(leaveLocation === "within_philippines")}
                                        Within the Philippines{" "}
                                        {line(
                                            leaveLocation ===
                                                "within_philippines"
                                                ? leaveLocationDetails
                                                : "",
                                            "110px",
                                        )}
                                    </div>
                                    <div>
                                        {box(leaveLocation === "abroad")}
                                        Abroad (Specify){" "}
                                        {line(
                                            leaveLocation === "abroad"
                                                ? leaveLocationDetails
                                                : "",
                                            "132px",
                                        )}
                                    </div>

                                    <div style={{ marginTop: "7px" }}>
                                        <i>In case of Sick Leave:</i>
                                    </div>
                                    <div>
                                        {box(sickLeaveLocation === "in_hospital")}
                                        In Hospital (Specify Illness){" "}
                                        {line(
                                            sickLeaveLocation === "in_hospital"
                                                ? illness
                                                : "",
                                            "92px",
                                        )}
                                    </div>
                                    <div>
                                        {box(sickLeaveLocation === "out_patient")}
                                        Out Patient (Specify Illness){" "}
                                        {line(
                                            sickLeaveLocation === "out_patient"
                                                ? illness
                                                : "",
                                            "92px",
                                        )}
                                    </div>

                                    <div style={{ marginTop: "7px" }}>
                                        <i>
                                            In case of Special Leave Benefits
                                            for Women:
                                        </i>
                                    </div>
                                    <div>
                                        (Specify Illness){" "}
                                        {line(womenIllness, "145px")}
                                    </div>

                                    <div style={{ marginTop: "7px" }}>
                                        <i>In case of Study Leave:</i>
                                    </div>
                                    <div>
                                        {box(
                                            studyLeavePurpose ===
                                                "masters_degree",
                                        )}
                                        Completion of Master's Degree
                                    </div>
                                    <div>
                                        {box(
                                            studyLeavePurpose ===
                                                "bar_board_review",
                                        )}
                                        BAR/Board Examination Review
                                    </div>

                                    <div style={{ marginTop: "5px" }}>
                                        <i>Other purpose:</i>
                                    </div>
                                    <div>
                                        {box(otherPurpose === "monetization")}
                                        Monetization of Leave Credits
                                    </div>
                                    <div>
                                        {box(otherPurpose === "terminal_leave")}
                                        Terminal Leave
                                    </div>
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2} style={cellStyle}>
                                <b>6.C NUMBER OF WORKING DAYS APPLIED FOR</b>
                                <br />
                                {line(workingDays, "220px")}
                                <br />
                                <br />
                                <b>INCLUSIVE DATES</b>
                                <br />
                                {line(inclusiveDates, "260px")}
                            </td>
                            <td style={cellStyle}>
                                <b>6.D COMMUTATION</b>
                                <div style={{ marginTop: "10px" }}>
                                    {box(commutation === "not_requested")}
                                    Not Requested
                                </div>
                                <div>{box(commutation === "requested")}Requested</div>
                                <div
                                    style={{
                                        marginTop: "26px",
                                        textAlign: "center",
                                    }}
                                >
                                    {line("", "210px")}
                                    <br />
                                    (Signature of Applicant)
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={3} style={headerCellStyle}>
                                7. DETAILS OF ACTION ON APPLICATION
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2} style={cellStyle}>
                                <b>7.A CERTIFICATION OF LEAVE CREDITS</b>
                                <div style={{ textAlign: "center", marginTop: "8px" }}>
                                    As of {line("", "150px")}
                                </div>
                                <table
                                    style={{
                                        width: "78%",
                                        margin: "8px auto 18px",
                                        borderCollapse: "collapse",
                                        tableLayout: "fixed",
                                    }}
                                >
                                    <tbody>
                                        <tr>
                                            <td style={cellStyle} />
                                            <td style={cellStyle}>
                                                Vacation Leave
                                            </td>
                                            <td style={cellStyle}>Sick Leave</td>
                                        </tr>
                                        <tr>
                                            <td style={cellStyle}>
                                                <i>Total Earned</i>
                                            </td>
                                            <td style={cellStyle} />
                                            <td style={cellStyle} />
                                        </tr>
                                        <tr>
                                            <td style={cellStyle}>
                                                <i>Less this application</i>
                                            </td>
                                            <td style={cellStyle} />
                                            <td style={cellStyle} />
                                        </tr>
                                        <tr>
                                            <td style={cellStyle}>
                                                <i>Balance</i>
                                            </td>
                                            <td style={cellStyle} />
                                            <td style={cellStyle} />
                                        </tr>
                                    </tbody>
                                </table>
                                {line("", "330px")}
                            </td>
                            <td style={cellStyle}>
                                <b>7.B RECOMMENDATION</b>
                                <div style={{ marginTop: "12px" }}>
                                    {box(false)}For approval
                                </div>
                                <div>
                                    {box(false)}For disapproval due to{" "}
                                    {line("", "115px")}
                                </div>
                                <div style={{ marginTop: "48px", textAlign: "center" }}>
                                    <b>
                                        <u>MARY ANN M. BELTRAN, LIB, PhD.</u>
                                    </b>
                                    <br />
                                    Administrative Officer V
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td colSpan={2} style={{ ...cellStyle, height: "90px" }}>
                                <b>7.C APPROVED FOR</b>
                                <div style={{ marginTop: "6px", marginLeft: "18px" }}>
                                    {line("", "70px")} days with pay
                                    <br />
                                    {line("", "70px")} days without pay
                                    <br />
                                    {line("", "70px")} others (Specify)
                                </div>
                            </td>
                            <td style={cellStyle}>
                                <b>7.D DISAPPROVED DUE TO:</b>
                                <br />
                                {line("", "250px")}
                                <br />
                                {line("", "250px")}
                                <br />
                                {line("", "250px")}
                            </td>
                        </tr>
                        <tr>
                            <td
                                colSpan={3}
                                style={{
                                    ...cellStyle,
                                    height: "105px",
                                    textAlign: "center",
                                    verticalAlign: "bottom",
                                    paddingBottom: "12px",
                                }}
                            >
                                <b>
                                    <u>CHERYL R. RAMIRO, PhD, CESO VI</u>
                                </b>
                                <br />
                                ASSISTANT SCHOOLS DIVISION SUPERINTENDENT
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        );
    },
);

export default ApplicationLeaveReport;
