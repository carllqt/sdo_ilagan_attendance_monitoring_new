import React, { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Building2, AlertTriangle, SquarePen, Trash2 } from "lucide-react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";
import AddDepartmentModal from "./AddDepartmentModal";

ChartJS.register(ArcElement, Tooltip, Legend);

const ITEMS_PER_PAGE = 5;

const DepartmentList = ({ departments = [], dept_heads }) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [openDepartmentAddmodal, setopenDepartmentAddmodal] = useState(false);

    const totalPages = Math.ceil(departments.length / ITEMS_PER_PAGE);

    const paginatedDepartments = departments.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
    );

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const getPagination = () => {
        const pages = [];

        if (totalPages <= 4) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            pages.push(1);

            if (currentPage > 2) {
                pages.push("...");
            }

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);

            for (let i = start; i <= end; i++) {
                pages.push(i);
            }

            if (currentPage < totalPages - 1) {
                pages.push("...");
            }

            pages.push(totalPages);
        }

        return pages;
    };

    const totalEntries = departments.length;
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endIndex = Math.min(currentPage * ITEMS_PER_PAGE, departments.length);

    const assignedCount = departments.filter((d) =>
        dept_heads.some((h) => h.employee?.department_id === d.id),
    ).length;

    const missingDepartments = departments.filter(
        (d) => !dept_heads.some((h) => h.employee?.department_id === d.id),
    );

    const coverage = Math.round(
        (assignedCount / (departments.length || 1)) * 100,
    );
    const chartData = {
        labels: ["Assigned", "Missing"],
        datasets: [
            {
                data: [assignedCount, missingDepartments.length],
                backgroundColor: ["#3b82f6", "#e5e7eb"],
                borderWidth: 0,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,

        cutout: "65%",

        animation: {
            animateRotate: true,
            animateScale: true,
            duration: 1000,
            easing: "easeOutCubic",
        },

        plugins: {
            legend: { display: false },
        },
    };

    const [chartReady, setChartReady] = useState(false);

    React.useEffect(() => {
        setTimeout(() => setChartReady(true), 200);
    }, []);

    return (
        <div className="flex gap-6">
            {/* LEFT SIDE: TABLE ONLY */}
            <div className="w-[55%] rounded-xl p-4 border-2 shadow-lg ">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-lg font-bold">Department List</h2>
                        <p className="text-sm text-gray-500">
                            Manage all departments
                        </p>
                    </div>

                    {/* ✅ THIS BUTTON STAYS HERE ONLY */}
                    <Button
                        onClick={() => setopenDepartmentAddmodal(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        + Add Department
                    </Button>
                </div>
                <AddDepartmentModal
                    open={openDepartmentAddmodal}
                    setOpen={setopenDepartmentAddmodal}
                />
                <div className="overflow-x-auto border rounded-lg">
                    <Table className="w-full table-fixed">
                        <TableHeader>
                            <TableRow className="bg-blue-900 hover:bg-blue-800">
                                <TableHead className="text-white p-3 w-[60%]">
                                    Department Name
                                </TableHead>

                                <TableHead className="text-white p-3 w-[30%] text-center">
                                    Actions
                                </TableHead>
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {paginatedDepartments.length > 0 ? (
                                paginatedDepartments.map((dept) => (
                                    <TableRow key={dept.id}>
                                        <TableCell className="p-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-200">
                                                    <Building2 className="w-4 h-4 text-blue-600" />
                                                </div>
                                                <span>{dept.name}</span>
                                            </div>
                                        </TableCell>

                                        <TableCell className="p-3 text-center">
                                            <div className="flex justify-center gap-5">
                                                {/* EDIT */}
                                                <Button className="w-8 h-8 flex items-center justify-center rounded-full bg-blue-600 text-blue-100 hover:bg-blue-800 hover:text-white transition">
                                                    <SquarePen className="w-4 h-4" />
                                                </Button>

                                                <Button className="w-8 h-8 flex items-center justify-center rounded-full bg-red-200 text-red-600 hover:bg-red-600 hover:text-white transition">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell
                                        colSpan="2"
                                        className="p-5 text-center text-gray-500"
                                    >
                                        No Departments Found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* PAGINATION */}
                <div className="flex items-center mt-4">
                    <div className="text-sm text-gray-500">
                        Showing {startIndex} to {endIndex} of {totalEntries}
                    </div>

                    <div className="ml-auto">
                        {totalPages > 1 && (
                            <Pagination>
                                <PaginationPrevious
                                    onClick={() =>
                                        handlePageChange(currentPage - 1)
                                    }
                                />

                                <PaginationContent>
                                    {getPagination().map((item, index) => (
                                        <PaginationItem key={index}>
                                            {item === "..." ? (
                                                <span className="px-2 text-gray-400">
                                                    ...
                                                </span>
                                            ) : (
                                                <PaginationLink
                                                    isActive={
                                                        currentPage === item
                                                    }
                                                    onClick={() =>
                                                        handlePageChange(item)
                                                    }
                                                >
                                                    {item}
                                                </PaginationLink>
                                            )}
                                        </PaginationItem>
                                    ))}
                                </PaginationContent>

                                <PaginationNext
                                    onClick={() =>
                                        handlePageChange(currentPage + 1)
                                    }
                                />
                            </Pagination>
                        )}
                    </div>
                </div>
            </div>

            <div className="w-[50%] space-y-6">
                {/* 🔷 TOP ROW */}
                <div className="grid grid-cols-1 lg:grid-cols-[40%_60%] gap-4">
                    {/* TOTAL CARD */}
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 shadow-sm flex justify-between items-start">
                        <div>
                            <span className="text-s  font-bold mb-2 block">
                                Total Departments
                            </span>
                            <h2 className="text-3xl font-bold text-gray-800 leading-none">
                                {departments.length}
                            </h2>
                        </div>

                        <div className="bg-blue-500/10 p-3 rounded-xl">
                            <Building2 className="text-blue-600 w-5 h-5" />
                        </div>
                    </div>

                    {/* COVERAGE CARD */}
                    <div className="p-5 rounded-2xl bg-white border shadow-sm">
                        <p className="text-xs text-gray-500 font-medium mb-3">
                            Department Head Coverage
                        </p>

                        <div className="flex items-center gap-5">
                            {/* DONUT */}
                            <div className="relative w-28 h-28">
                                <div className="w-full h-full">
                                    <Doughnut
                                        data={
                                            chartReady
                                                ? chartData
                                                : {
                                                      ...chartData,
                                                      datasets: [
                                                          {
                                                              ...chartData
                                                                  .datasets[0],
                                                              data: [0, 0],
                                                          },
                                                      ],
                                                  }
                                        }
                                        options={chartOptions}
                                    />
                                </div>

                                {/* CENTER TEXT */}
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-sm font-semibold text-gray-700">
                                        {coverage}%
                                    </span>
                                </div>
                            </div>

                            {/* LEGEND */}
                            <div className="text-sm space-y-2">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 bg-blue-500 rounded-full"></span>
                                    <span className="text-gray-600">
                                        Assigned
                                    </span>
                                    <span className="font-semibold text-gray-800">
                                        ({assignedCount})
                                    </span>
                                </div>

                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 bg-gray-300 rounded-full"></span>
                                    <span className="text-gray-600">
                                        Missing
                                    </span>
                                    <span className="font-semibold text-gray-800">
                                        ({missingDepartments.length})
                                    </span>
                                </div>

                                <p className="text-xs text-gray-400 pt-1">
                                    {assignedCount} of {departments.length}{" "}
                                    departments covered
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* 🔴 MISSING DEPARTMENTS */}
                <div className="p-6 rounded-2xl border border-red-200 bg-gradient-to-br from-red-50 to-red-100 shadow-sm">
                    {/* HEADER */}
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="text-red-500 w-4 h-4" />
                        </div>

                        <h3 className="font-semibold text-red-600">
                            Missing Departments
                        </h3>
                    </div>

                    <p className="text-sm text-red-500 mb-4">
                        These departments don’t have assigned heads yet.
                    </p>

                    {/* PILLS */}
                    <div className="flex flex-wrap gap-2 mb-5">
                        {missingDepartments.map((dept) => (
                            <span
                                key={dept.id}
                                className="px-3 py-1 text-xs font-medium bg-white border border-red-200 text-red-600 rounded-full shadow-sm"
                            >
                                {dept.name}
                            </span>
                        ))}
                    </div>

                    {/* BUTTON */}
                    <button className="px-4 py-2 text-sm font-medium bg-red-500 text-white rounded-lg hover:bg-red-600 transition shadow-sm">
                        Assign Now
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DepartmentList;
