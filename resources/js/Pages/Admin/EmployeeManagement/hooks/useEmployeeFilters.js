import { useEffect, useState } from "react";
import { router } from "@inertiajs/react";
import {
    findOfficeByName,
    formatFingerprintRegistrationParam,
    formatSearchDisplay,
} from "../utils";

const useEmployeeFilters = ({
    filteredEmployees,
    limit,
    officeName,
    offices,
    isSchoolAdmin = false,
    search,
    selectedEmployee,
    selectedFingerprintEmployee,
    status,
}) => {
    const [searchInput, setSearchInput] = useState(
        formatSearchDisplay(search),
    );
    const [selectedOffice, setSelectedOffice] = useState(
        findOfficeByName(offices, officeName)?.id || "all",
    );
    const [statusFilter, setStatusFilter] = useState(status || "Active");
    const [employeesLoading, setEmployeesLoading] = useState(false);

    useEffect(() => {
        setSearchInput(formatSearchDisplay(search));
        setSelectedOffice(findOfficeByName(offices, officeName)?.id || "all");
        setStatusFilter(status || "Active");
    }, [search, officeName, status, offices]);

    const applyEmployeeFilters = ({
        searchValue = searchInput,
        statusValue = statusFilter,
        officeValue = selectedOffice,
        pageValue,
        limitValue = limit,
    } = {}) => {
        const query = {
            status: statusValue,
            limit: limitValue,
        };

        if (searchValue && searchValue.trim()) {
            query.search = searchValue.trim();
        }

        if (!isSchoolAdmin && officeValue !== "all") {
            const office = offices.find(
                (item) => Number(item.id) === Number(officeValue),
            );

            if (office) {
                query.office = office.name;
            }
        }

        if (pageValue && pageValue > 1) {
            query.page = pageValue;
        }

        if (selectedEmployee) {
            query.fingerprint_registration =
                formatFingerprintRegistrationParam(
                    selectedFingerprintEmployee ||
                        filteredEmployees.find(
                            (employee) =>
                                String(employee.id) ===
                                String(selectedEmployee),
                        ),
                ) || selectedEmployee;
        }

        router.get(route("employee-management"), query, {
            only: [
                "filteredEmployeesList",
                "search",
                "status",
                "officeName",
                "limit",
            ],
            preserveState: true,
            preserveScroll: true,
            replace: true,
            onStart: () => setEmployeesLoading(true),
            onFinish: () => setEmployeesLoading(false),
        });
    };

    return {
        applyEmployeeFilters,
        employeesLoading,
        searchInput,
        selectedOffice,
        setSearchInput,
        setSelectedOffice,
        setStatusFilter,
        statusFilter,
    };
};

export default useEmployeeFilters;

