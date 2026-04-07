import StatusSwitchCell from "@/Components/StatusSwitchCell";
import { Button } from "@/components/ui/button";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import ConfirmPasswordDialog from "@/Components/ConfirmPasswordDialog";
import AddDepartmentHead from "./AddDepartmentHeadForm";

const ITEMS_PER_PAGE = 10;

const DepartmentHeadList = ({ dept_heads, queryParams: rawParams, employees,  assignedDepartments }) => {
    const queryParams = rawParams || {};
    const [openAdd, setOpenAdd] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = Math.ceil(dept_heads.length / ITEMS_PER_PAGE);
    const paginatedEmployees = dept_heads.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE,
    );
    const [heads, setHeads] = useState(dept_heads);

    const handlePageChange = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    return (
        <div>
            <AddDepartmentHead
                open={openAdd}
                setOpen={setOpenAdd}
                employees={employees}
                assignedDepartments={assignedDepartments}
            />
            <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold">
                        Department Head List
                    </h2>

                    <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={() => setOpenAdd(true)}
                >
                    + Add
                </Button>
                </div>
            <Table>
                <TableHeader>
                    <TableRow className="bg-blue-900 hover:bg-blue-800">
                        <TableHead className="text-center text-white">
                            Employee Name
                        </TableHead>
                        <TableHead className="text-center text-white">
                            Position
                        </TableHead>
                        <TableHead className="text-center text-white">
                            Department
                        </TableHead>
                        <TableHead className="text-center text-white">
                            Actions
                        </TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {paginatedEmployees.map((emp) => (
                        <TableRow key={emp.id} className="hover:bg-gray-100">
                            <TableCell className="text-center">
                                <div className="flex justify-center items-center gap-2">
                                    {emp.employee?.full_name}
                                </div>
                            </TableCell>

                            <TableCell className="text-center">
                                {emp.employee?.position}
                            </TableCell>

                            <TableCell className="text-center">
                                {emp.employee?.department}
                            </TableCell>
                            <TableCell className="flex justify-center gap-2">
                                <ConfirmPasswordDialog
                                    trigger={
                                        <Button
                                            variant="destructive"
                                            size="icon"
                                            className="rounded-full text-black hover:bg-red-400 hover:text-white"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    }
                                    title="Delete Department Head"
                                    description="You are about to permanently remove this department head assignment."
                                    itemLabel="Department Head"
                                    itemName={`${emp.head?.last_name}, ${emp.head?.first_name}`}
                                    note="Deleting this record may affect department assignment history and related references."
                                    action={route(
                                        "departmenthead.destroy",
                                        emp.id,
                                    )}
                                    method="delete"
                                    confirmText="Yes, Delete"
                                    processingText="Deleting..."
                                    danger={true}
                                />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            {/* Pagination */}
            {totalPages > 1 && (
                <Pagination className="my-2 justify-end">
                    <PaginationPrevious
                        disabled={currentPage === 1}
                        onClick={() => handlePageChange(currentPage - 1)}
                    />
                    <PaginationContent>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <PaginationItem key={i}>
                                <PaginationLink
                                    isActive={currentPage === i + 1}
                                    onClick={() => handlePageChange(i + 1)}
                                >
                                    {i + 1}
                                </PaginationLink>
                            </PaginationItem>
                        ))}
                    </PaginationContent>
                    <PaginationNext
                        disabled={currentPage === totalPages}
                        onClick={() => handlePageChange(currentPage + 1)}
                    />
                </Pagination>
            )}
        </div>
    );
};

export default DepartmentHeadList;
