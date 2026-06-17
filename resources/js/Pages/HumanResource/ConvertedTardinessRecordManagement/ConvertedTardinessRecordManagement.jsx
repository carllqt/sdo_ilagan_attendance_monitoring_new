import React from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import BatchConvertedHistory from "./Partials/BatchConvertedHistory";
import ConvertedEmployeeList from "./Partials/ConvertedEmployeeList";

const ConvertedTardinessRecordManagement = ({
    records = {},
    batchHistory = {},
    selectedBatch = null,
    search = "",
    year,
    years = [],
}) => (
    <AuthenticatedLayout header="Converted Tardiness Record Management">
        <Head title="Converted Tardiness Record Management" />

        <main className="space-y-5">
            <div>
                <BatchConvertedHistory
                    batches={batchHistory}
                    records={records}
                    selectedBatch={selectedBatch}
                />
            </div>
            <div>
                <ConvertedEmployeeList
                    records={records}
                    search={search}
                    year={year}
                    years={years}
                />
            </div>
        </main>
    </AuthenticatedLayout>
);

export default ConvertedTardinessRecordManagement;
