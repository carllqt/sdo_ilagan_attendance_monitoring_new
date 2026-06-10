import { router } from "@inertiajs/react";
import { closeDepartmentModalParams } from "../utils";

const useDepartmentModalActions = () => {
    const openDepartmentModal = (modal, params = {}) => {
        const query = new URLSearchParams(window.location.search);

        query.delete("head_id");
        query.delete("division_id");
        query.delete("division_name");
        query.delete("office_id");
        query.set("modal", modal);

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== "") {
                query.set(key, value);
            }
        });

        router.get(route("departmentmanagement"), Object.fromEntries(query), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    const closeDepartmentModal = () => {
        const query = new URLSearchParams(window.location.search);
        closeDepartmentModalParams(query);

        router.get(route("departmentmanagement"), Object.fromEntries(query), {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    return {
        closeDepartmentModal,
        openDepartmentModal,
    };
};

export default useDepartmentModalActions;
