import React, { useState, useEffect, useRef } from "react";
import { Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DepartmentHeadList from "./Partials/DepartmentHeadList";
import SchoolAdminList from "./Partials/SchoolAdminList";

const SchoolandDepartmentHead = ({
    dept_heads = [],
    school_admins = [], // 🔥 ADD THIS
    queryParams = {},
    employees,
    assignedDepartments
}) => {
    return (
        <AuthenticatedLayout header="School Admin and Department Head Management">
            <Head title="AMS" />

            <main>
                <div className="rounded-xl p-4 mt-4 border-2 border-blue-100 shadow-lg">

                    <DepartmentHeadList
                        dept_heads={dept_heads}
                        queryParams={queryParams}
                        employees={employees}
                        assignedDepartments={assignedDepartments}
                    />
                </div>

                <div className="rounded-xl p-4 mt-4 border-2 border-blue-100 shadow-lg">

                    <SchoolAdminList
                        school_admins={school_admins}
                        employees={employees}
                    />
                </div>
            </main>
        </AuthenticatedLayout>
    );
};

export default SchoolandDepartmentHead;
