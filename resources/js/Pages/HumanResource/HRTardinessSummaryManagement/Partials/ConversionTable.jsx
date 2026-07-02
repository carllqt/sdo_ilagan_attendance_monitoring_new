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
import useConversionTable from "../hooks/useConversionTable";
import ConversionTableDialog from "./ConversionTableDialog";

const ConversionTable = ({
    conversionHours = [],
    conversionMinutes = [],
    editConversionModal = null,
}) => {
    const { editModal, hourTable, hoursPage, minuteTable, minutesPage } =
        useConversionTable({
            conversionHours,
            conversionMinutes,
            editConversionModal,
        });
    const editTone = editConversionModal?.type === "minutes" ? "green" : "blue";
    const editIcon =
        editTone === "green" ? (
            <Timer className="h-5 w-5" />
        ) : (
            <Clock3 className="h-5 w-5" />
        );

    const renderRows = (items, valueKey, emptyMessage) =>
        items.length > 0 ? (
            <>
                {items.map((item) => (
                    <TableRow key={item.id || `${valueKey}-${item[valueKey]}`}>
                        <TableCell className="p-3 text-center font-medium text-slate-800">
                            {item[valueKey]}
                        </TableCell>
                        <TableCell className="p-3 text-center text-slate-700">
                            {Number(item.equivalent_days || 0).toFixed(3)}
                        </TableCell>
                    </TableRow>
                ))}
            </>
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
        tone = "blue",
    }) => (
        <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between gap-3 border-b bg-white px-4 py-3">
                <div className="flex items-center gap-2">
                    <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg border ${
                            tone === "green"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-blue-200 bg-blue-50 text-blue-700"
                        }`}
                    >
                        {icon}
                    </div>
                    <span className="text-sm font-semibold text-slate-800">
                        {title}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <ConversionTableDialog
                        title={title}
                        items={table.allItems}
                        valueKey={valueKey}
                        valueLabel={valueLabel}
                        emptyMessage={emptyMessage}
                        disabled={!table.hasMoreRows}
                        splitAt={valueKey === "minutes" ? 30 : null}
                        onOpenEdit={editModal.openEditModal}
                        tone={tone}
                        icon={icon}
                    />
                </div>
            </div>
            <div className="overflow-x-auto">
                <Table className="w-full min-w-[320px] table-fixed">
                    <TableHeader>
                        <TableRow
                            className={
                                tone === "green"
                                    ? "bg-teal-900 hover:bg-teal-900"
                                    : "bg-blue-900 hover:bg-blue-900"
                            }
                        >
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
                        {renderRows(table.visibleItems, valueKey, emptyMessage)}
                    </TableBody>
                </Table>
            </div>
        </div>
    );

    return (
        <div className="rounded-2xl border border-blue-100 bg-white p-4 shadow-[0_12px_32px_rgba(15,23,42,0.08)]">
            <div className="mb-4 flex items-center justify-between gap-4">
                <div className="min-w-0">
                    <h2 className="text-l font-bold text-slate-900">
                        Conversion Table
                    </h2>
                    <p className="text-sm text-gray-500">
                    Current equivalent day values
                    </p>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                {renderConversionTable({
                    title: "Hours",
                    icon: <Clock3 className="h-4 w-4" />,
                    table: hourTable,
                    valueKey: "hours",
                    valueLabel: "Hours",
                    emptyMessage: "No conversion hours found.",
                    pageIndex: hoursPage,
                    tone: "blue",
                })}
                {renderConversionTable({
                    title: "Minutes",
                    icon: <Timer className="h-4 w-4" />,
                    table: minuteTable,
                    valueKey: "minutes",
                    valueLabel: "Minutes",
                    emptyMessage: "No conversion minutes found.",
                    pageIndex: minutesPage,
                    tone: "green",
                })}
            </div>

            <Dialog
                open={!!editConversionModal}
                onOpenChange={(open) => !open && editModal.closeEditModal()}
            >
                <DialogContent className="max-w-md overflow-hidden rounded-2xl p-0">
                    <div
                        className={`px-5 py-4 text-white ${
                            editTone === "green"
                                ? "bg-emerald-600"
                                : "bg-blue-700"
                        }`}
                    >
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-white">
                                {editIcon}
                                Edit {editConversionModal?.title} Conversion
                            </DialogTitle>
                            <DialogDescription
                                className={
                                    editTone === "green"
                                        ? "text-emerald-50"
                                        : "text-blue-100"
                                }
                            >
                                Update the equivalent day value for this row.
                            </DialogDescription>
                        </DialogHeader>
                    </div>

                    <form
                        onSubmit={editModal.handleUpdateConversion}
                        className="space-y-4 px-5 pb-5 pt-4"
                    >
                        <label className="grid gap-2 text-sm font-medium text-slate-700">
                            {editConversionModal?.value_label || "Value"}
                            <Input
                                type="number"
                                value={editConversionModal?.value ?? ""}
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
                                disabled={editModal.processing}
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
                                disabled={editModal.processing}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className={
                                    editTone === "green"
                                        ? "bg-emerald-600 hover:bg-emerald-700"
                                        : "bg-blue-600 hover:bg-blue-700"
                                }
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

export default ConversionTable;
