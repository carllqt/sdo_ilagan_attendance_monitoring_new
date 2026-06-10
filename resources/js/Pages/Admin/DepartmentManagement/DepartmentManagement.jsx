import React from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DepartmentHeadList from "./Partials/DepartmentHeadList";
import DivisionHeadList from "./Partials/DivisionHeadList";
import DepartmentList from "./Partials/DepartmentList";
import { Building2 } from "lucide-react";

const DepartmentManagement = ({
    office_heads = [],
    divisions = [],
    divisionList = {},
    divisionHeadRows = {},
    offices = [],
    officeList = {},
    officeHeadRows = {},
    office_search = "",
    officeLimit,
    officeHeadLimit,
    divisionPage,
    divisionLimit,
    divisionHeadLimit,
    addDivisionModal = false,
    addOfficeModal = false,
    editDivisionModal = null,
    editOfficeModal = null,
    deleteOfficeModal = null,
    assignOfficeHeadModal = null,
    assignDivisionHeadModal = null,
    deleteOfficeHeadModal = null,
    deleteDivisionHeadModal = null,
}) => {
    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center gap-5">
                    <Building2 className="w-5 h-5 text-blue-600" />
                    <span>Organization Management</span>
                </div>
            }
        >
            <Head title="Organization Management" />

            <main>
                <div className="mb-5">
                    <DepartmentList
                        office_heads={office_heads}
                        divisions={divisions}
                        offices={offices}
                        officeList={officeList}
                        officeLimit={officeLimit}
                        divisionList={divisionList}
                        divisionPage={divisionPage}
                        divisionLimit={divisionLimit}
                        addDivisionModal={addDivisionModal}
                        addOfficeModal={addOfficeModal}
                        editDivisionModal={editDivisionModal}
                        editOfficeModal={editOfficeModal}
                        deleteOfficeModal={deleteOfficeModal}
                    />
                </div>

                <div className="mt-5 space-y-5 rounded-xl p-4 border-2 shadow-lg">
                    <DivisionHeadList
                        divisions={divisions}
                        divisionHeadRows={divisionHeadRows}
                        divisionHeadLimit={divisionHeadLimit}
                        assignDivisionHeadModal={assignDivisionHeadModal}
                        deleteDivisionHeadModal={deleteDivisionHeadModal}
                    />
                </div>
                <div className="mt-5 space-y-5 rounded-xl p-4 border-2 shadow-lg">
                    <DepartmentHeadList
                        offices={offices}
                        officeHeadLimit={officeHeadLimit}
                        officeHeadRows={officeHeadRows}
                        assignOfficeHeadModal={assignOfficeHeadModal}
                        deleteOfficeHeadModal={deleteOfficeHeadModal}
                        officeSearch={office_search}
                    />
                </div>
            </main>
        </AuthenticatedLayout>
    );
};

export default DepartmentManagement;
