import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { sortEmployeesAlphabetically } from "@/lib/utils";

const useAssignHeadEmployees = ({
    open,
    requestParam,
    search,
    targetId,
}) => {
    const [employees, setEmployees] = useState([]);
    const [employeeTotal, setEmployeeTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const requestRef = useRef(0);

    useEffect(() => {
        if (!open || !targetId) {
            setEmployees([]);
            setEmployeeTotal(0);
            setLoading(false);
            return;
        }

        const requestId = requestRef.current + 1;
        requestRef.current = requestId;
        setLoading(true);

        const timeout = setTimeout(() => {
            axios
                .get(route("department.employees"), {
                    params: {
                        [requestParam]: targetId,
                        search: search.trim(),
                    },
                })
                .then((response) => {
                    if (requestRef.current !== requestId) return;

                    setEmployees(
                        sortEmployeesAlphabetically(response.data?.data || []),
                    );
                    setEmployeeTotal(response.data?.total || 0);
                })
                .catch(() => {
                    if (requestRef.current !== requestId) return;

                    setEmployees([]);
                    setEmployeeTotal(0);
                })
                .finally(() => {
                    if (requestRef.current !== requestId) return;

                    setLoading(false);
                });
        }, 250);

        return () => clearTimeout(timeout);
    }, [open, targetId, search, requestParam]);

    return {
        employees,
        employeeTotal,
        loading,
    };
};

export default useAssignHeadEmployees;
