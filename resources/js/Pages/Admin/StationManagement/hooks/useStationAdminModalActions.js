import { router } from "@inertiajs/react";

const useStationAdminModalActions = () => {
    const openAssignModal = (station) => {
        const params = new URLSearchParams(window.location.search);

        params.delete("admin_id");
        params.set("modal", "station-admin");
        params.set(
            "station_id",
            station.source === "sdo" ? station.station_id : station.id,
        );
        params.set(
            "station_role",
            station.source === "sdo" ? station.role : "school_admin",
        );
        params.set("station_source", station.source || "station");

        router.get(route("station-management"), Object.fromEntries(params), {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const closeAssignModal = () => {
        const params = new URLSearchParams(window.location.search);

        params.delete("modal");
        params.delete("admin_id");
        params.delete("station_id");
        params.delete("station_role");
        params.delete("station_source");

        router.get(route("station-management"), Object.fromEntries(params), {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const openRemoveAdminModal = (admin) => {
        const params = new URLSearchParams(window.location.search);

        params.delete("station_id");
        params.delete("station_role");
        params.delete("station_source");
        params.set("modal", "remove-station-admin");
        params.set("admin_id", admin.id);

        router.get(route("station-management"), Object.fromEntries(params), {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    const closeRemoveAdminModal = () => {
        const params = new URLSearchParams(window.location.search);

        params.delete("modal");
        params.delete("admin_id");
        params.delete("station_id");
        params.delete("station_role");
        params.delete("station_source");

        router.get(route("station-management"), Object.fromEntries(params), {
            preserveScroll: true,
            preserveState: true,
            replace: true,
        });
    };

    return {
        closeAssignModal,
        closeRemoveAdminModal,
        openAssignModal,
        openRemoveAdminModal,
    };
};

export default useStationAdminModalActions;
