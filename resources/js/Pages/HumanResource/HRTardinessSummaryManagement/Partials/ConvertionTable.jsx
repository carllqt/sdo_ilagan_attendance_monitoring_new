import React from "react";
import { Clock3, Timer } from "lucide-react";

import { Button } from "@/Components/ui/button";
import InputError from "@/Components/InputError";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import useConvertionTable from "../hooks/useConvertionTable";
import ConvertionTableDialog from "./ConvertionTableDialog";

const ConvertionTable = ({
    conversionHours = [],
    conversionMinutes = [],
    editConvertionModal = null,
}) => {
    const {
        editModal,
        hourTable,
        hoursPage,
        minuteTable,
        minutesPage,
    } = useConvertionTable({
        conversionHours,
        conversionMinutes,
        editConvertionModal,
    });

    const renderRows = (items, valueKey, emptyMessage) =>
        items.length > 0 ? (
            items.map((item) => (
                <TableRow key={item.id || `${valueKey}-${item[valueKey]}`}>
                    <TableCell className="p-3 text-center font-medium text-slate-800">
                        {item[valueKey]}
                    </TableCell>
                    <TableCell className="p-3 text-center text-slate-700">
                        {Number(item.equivalent_days || 0).toFixed(3)}
                    </TableCell>
                </TableRow>
            ))
        ) : (
            <TableRow>
                <TableCell
                    colSpan="2"
                    className="p-5 text-center text-sm text-gray-500"
                >
                    {emptyMessage}
                </TableCell>
            </TableRow>
        );

    const renderConversionTable = ({
        title,
        icon,
        table,
        valueKey,
        valueLabel,
        emptyMessage,
        pageIndex = 0,
        className = "",
    }) => (
        <div
            className={`overflow-hidden rounded-lg border border-slate-200 ${className}`}
        >
            <div className="flex items-center justify-between gap-3 border-b bg-slate-50 px-4 py-3">
                <div className="flex items-center gap-2">
                    {icon}
                    <span className="text-sm font-semibold text-slate-800">
                        {title}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <ConvertionTableDialog
                        title={title}
                        items={table.allItems}
                        valueKey={valueKey}
                        valueLabel={valueLabel}
                        emptyMessage={emptyMessage}
                        disabled={!table.hasMoreRows}
                        splitAt={valueKey === "minutes" ? 30 : null}
                        onOpenEdit={editModal.openEditModal}
                    />
                </div>
            </div>
            <div className="overflow-x-auto">
                <Table className="w-full min-w-[320px] table-fixed">
                    <TableHeader>
                        <TableRow className="bg-blue-900 hover:bg-blue-800">
                            <TableHead className="w-1/2 text-center text-white">
                                {valueLabel}
                            </TableHead>
                            <TableHead className="w-1/2 text-center text-white">
                                Equivalent Days
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody
                        key={`${valueKey}-${pageIndex}`}
                        className="animate-in fade-in"
                        style={{ animationDuration: "2s" }}
                    >
                        {renderRows(
                            table.visibleItems,
                            valueKey,
                            emptyMessage,
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );

    return (
        <div className="mb-4 rounded-2xl border border-blue-100 bg-white p-4 shadow-lg">
            <div className="mb-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <h2 className="text-lg font-bold text-slate-900">
                        Convertion Table
                    </h2>
                    <p className="text-sm text-gray-500">
                        Current equivalent day values
                    </p>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                {renderConversionTable({
                    title: "Hours",
                    icon: <Clock3 className="h-4 w-4 text-blue-700" />,
                    table: hourTable,
                    valueKey: "hours",
                    valueLabel: "Hours",
                    emptyMessage: "No conversion hours found.",
                    pageIndex: hoursPage,
                })}
                {renderConversionTable({
                    title: "Minutes",
                    icon: <Timer className="h-4 w-4 text-blue-700" />,
                    table: minuteTable,
                    valueKey: "minutes",
                    valueLabel: "Minutes",
                    emptyMessage: "No conversion minutes found.",
                    pageIndex: minutesPage,
                })}
            </div>

            <Dialog
                open={!!editConvertionModal}
                onOpenChange={(open) => !open && editModal.closeEditModal()}
            >
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            Edit {editConvertionModal?.title} Convertion
                        </DialogTitle>
                        <DialogDescription>
                            Update the equivalent day value for this row.
                        </DialogDescription>
                    </DialogHeader>

                    <form
                        onSubmit={editModal.handleUpdateConvertion}
                        className="space-y-4"
                    >
                        <label className="grid gap-2 text-sm font-medium text-slate-700">
                            {editConvertionModal?.value_label || "Value"}
                            <Input
                                type="number"
                                value={editConvertionModal?.value ?? ""}
                                disabled
                                className="bg-slate-50 font-semibold text-slate-900 disabled:cursor-not-allowed disabled:opacity-100 disabled:text-slate-900"
                            />
                        </label>
                        <label className="grid gap-2 text-sm font-medium text-slate-700">
                            Equivalent Days
                            <Input
                                type="number"
                                step="0.001"
                                min="0"
                                value={editModal.data.equivalent_days}
                                onChange={(event) =>
                                    editModal.setData(
                                        "equivalent_days",
                                        event.target.value,
                                    )
                                }
                            />
                            <InputError
                                message={editModal.errors.equivalent_days}
                                className="mt-1"
                            />
                        </label>

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={editModal.closeEditModal}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700"
                                disabled={editModal.processing}
                            >
                                {editModal.processing
                                    ? "Saving..."
                                    : "Save Changes"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ConvertionTable;
