import { useEffect, useMemo, useState } from "react";
import { router } from "@inertiajs/react";
import useAssignHeadEmployees from "./useAssignHeadEmployees";

const useAssignHeadForm = ({
    collection,
    idKey,
    open,
    preselectedId = null,
    requestParam,
    setOpen,
    storePayloadKey,
    storeRoute,
}) => {
    const [targetId, setTargetId] = useState("");
    const [employeeId, setEmployeeId] = useState("");
    const [search, setSearch] = useState("");
    const { employees, employeeTotal, loading } = useAssignHeadEmployees({
        open,
        requestParam,
        search,
        targetId,
    });
    const selectedTarget = useMemo(
        () =>
            collection.find(
                (item) => String(item[idKey]) === String(targetId),
            ),
        [collection, idKey, targetId],
    );
    const selectedEmployee = useMemo(
        () => employees.find((employee) => String(employee.id) === String(employeeId)),
        [employees, employeeId],
    );
    const canSubmit = Boolean(employeeId && targetId);

    useEffect(() => {
        if (open) {
            setTargetId(preselectedId || "");
            setEmployeeId("");
            setSearch("");
        }
    }, [open, preselectedId]);

    const handleSubmit = (event) => {
        event.preventDefault();
        if (!canSubmit) return;

        router.post(
            route(storeRoute),
            {
                employee_id: employeeId,
                [storePayloadKey]: targetId,
            },
            { onSuccess: () => setOpen(false) },
        );
    };

    return {
        canSubmit,
        employeeId,
        employees,
        employeeTotal,
        handleSubmit,
        loading,
        search,
        selectedEmployee,
        selectedTarget,
        setEmployeeId,
        setSearch,
        targetId,
    };
};

export default useAssignHeadForm;

