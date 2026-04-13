import React, { useState, useEffect, useRef } from "react";
import { Head, router } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import DepartmentHeadList from "./Partials/DepartmentHeadList";
import DepartmentList from "./Partials/DepartmentList";

const DepartmentHead = ({
    dept_heads = [],
    employees = [],
    assignedDepartments = [],
    departments = [],
}) => {
    return (
        <AuthenticatedLayout header="School Admin and Department Head Management">
            <Head title="AMS" />

            <main>
                <div className="mb-5">
                    <DepartmentList
                        dept_heads={dept_heads}
                        departments={departments}
                    />
                </div>
                <div className="rounded-xl p-4 border-2  shadow-lg">
                    <DepartmentHeadList
                        dept_heads={dept_heads}
                        employees={employees}
                        assignedDepartments={assignedDepartments}
                        departments={departments}
                    />
                </div>
            </main>
        </AuthenticatedLayout>
    );
};

export default DepartmentHead;
