import { useEffect, useRef, useState } from "react";
import { useReactToPrint } from "react-to-print";

const legalDtrPageStyle = `
    @page { size: 8.5in 13in; margin: 0; }
    @media print {
        html, body {
            width: 8.5in !important;
            min-height: 13in !important;
            margin: 0 !important;
            padding: 0 !important;
        }
        body { print-color-adjust: exact; -webkit-print-color-adjust: exact; }
        #dtr-print-content {
            position: static !important;
            top: auto !important;
            left: auto !important;
            width: 8.5in !important;
            min-height: 13in !important;
            box-sizing: border-box;
            padding: 0.5in;
            -webkit-text-size-adjust: 100% !important;
            text-size-adjust: 100% !important;
        }
        #dtr-print-content * {
            -webkit-text-size-adjust: 100% !important;
            text-size-adjust: 100% !important;
        }
    }
`;

export const signatoryChoices = [
    { value: "office_head", label: "Office Head" },
    { value: "division_head", label: "Division Head" },
];

export const employeeDepartment = (employee) =>
    employee?.department || employee?.office?.name || "No Department";

const fallbackSignatory = (employee) => ({
    name: "Loading signatory...",
    position: "Signatory",
    office: employeeDepartment(employee),
    employee: null,
    type: "office_head",
    missing: true,
});

const employeeSignatory = (employee, employeeData) =>
    employeeData[employee.id]?.signatory || fallbackSignatory(employee);

export const resolveSignatory = (employee, employeeData, signatoryType) => {
    const data = employeeData[employee.id];

    return (
        data?.signatories?.[signatoryType] ||
        employeeSignatory(employee, employeeData)
    );
};

export const signatoryKey = (signatory) =>
    signatory?.employee?.id
        ? `employee:${signatory.employee.id}`
        : [
              signatory?.label,
              signatory?.name,
              signatory?.position,
              signatory?.office,
          ].join("|");

const usePrintDialog = ({
    initialEmployeeData,
    onClose,
    open,
    selectedEmployees,
    selectedMonth,
    selectedYear,
}) => {
    const initialEmployee = selectedEmployees[0] || {};
    const [isGenerating, setIsGenerating] = useState(false);
    const [employeeData, setEmployeeData] = useState(initialEmployeeData);
    const [signatoryType, setSignatoryType] = useState(
        initialEmployeeData[initialEmployee.id]?.signatory?.type ||
            "office_head",
    );
    const printContainerRef = useRef(null);
    const printDtr = useReactToPrint({
        contentRef: printContainerRef,
        documentTitle: "Daily_Time_Record",
        pageStyle: legalDtrPageStyle,
    });
    const printEmployees = selectedEmployees;
    const firstEmployee = printEmployees[0] || {};
    const selectedEmployeeData = employeeData[firstEmployee.id];
    const defaultSignatoryType =
        employeeData[firstEmployee.id]?.signatory?.type;
    const isLoadingEmployeeData = printEmployees.some(
        (employee) => !employeeData[employee.id],
    );
    const isSignatoryLoading =
        open && firstEmployee.id && !selectedEmployeeData;
    const selectedSignatoryKey = signatoryKey(
        resolveSignatory(firstEmployee, employeeData, signatoryType),
    );
    const visibleSignatoryChoices = signatoryChoices
        .map((choice) => ({
            choice,
            signatory: resolveSignatory(
                firstEmployee,
                employeeData,
                choice.value,
            ),
        }))
        .filter((item, index, items) => {
            const key = signatoryKey(item.signatory);
            const defaultIndex = items.findIndex(
                (other) =>
                    signatoryKey(other.signatory) === key &&
                    other.choice.value === defaultSignatoryType,
            );
            const firstIndex =
                defaultIndex >= 0
                    ? defaultIndex
                    : items.findIndex(
                          (other) => signatoryKey(other.signatory) === key,
                      );

            return index === firstIndex;
        });

    useEffect(() => {
        if (!open) return;

        setEmployeeData((current) => ({
            ...current,
            ...initialEmployeeData,
        }));
    }, [open, initialEmployeeData]);

    useEffect(() => {
        if (!open) return;
        if (!["office_head", "division_head"].includes(defaultSignatoryType)) {
            return;
        }

        setSignatoryType(defaultSignatoryType);
    }, [open, defaultSignatoryType]);

    const handleDownloadPDF = async () => {
        setIsGenerating(true);

        printDtr();

        setIsGenerating(false);
        onClose();
    };

    return {
        employeeData,
        firstEmployee,
        handleDownloadPDF,
        isGenerating,
        isLoadingEmployeeData,
        isSignatoryLoading,
        printContainerRef,
        printEmployees,
        selectedSignatoryKey,
        setSignatoryType,
        signatoryType,
        visibleSignatoryChoices,
    };
};

export default usePrintDialog;
