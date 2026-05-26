import React from "react";
import { Button } from "@/Components/ui/button";
import { CustomDropdownCheckbox } from "@/components/dropdown-menu-main";

const TardyFilters = ({
    years,
    selectedYear,
    setSelectedYear,
    departments,
    selectedDepartment,
    setSelectedDepartment,
    onDownloadPDF,
}) => {
    return (
        <div className="flex items-center gap-2">
            <CustomDropdownCheckbox
                label="Select Year"
                items={years}
                selected={selectedYear}
                onChange={setSelectedYear}
                buttonVariant="blue"
            />
            <CustomDropdownCheckbox
                label="Select Department"
                items={departments}
                selected={selectedDepartment}
                onChange={setSelectedDepartment}
                buttonVariant="green"
            />
            <Button onClick={onDownloadPDF} variant="blueDark">
                Download PDF
            </Button>
        </div>
    );
};

export default TardyFilters;
