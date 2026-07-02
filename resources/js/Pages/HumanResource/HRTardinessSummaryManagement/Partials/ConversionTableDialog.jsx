import React from "react";
import { SquarePen } from "lucide-react";

import { Button } from "@/Components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const ConversionTableDialog = ({
    title,
    items = [],
    valueKey,
    valueLabel,
    emptyMessage,
    disabled = false,
    splitAt = null,
    onOpenEdit,
    tone = "blue",
    icon = null,
}) => {
    const isGreen = tone === "green";

    const renderRows = (rows) =>
        rows.length > 0 ? (
            <>
                {rows.map((item) => (
                    <TableRow key={item.id || `${valueKey}-${item[valueKey]}`}>
                        <TableCell className="p-3 text-center font-medium text-slate-800">
                            {item[valueKey]}
                        </TableCell>
                        <TableCell className="p-3 text-center text-slate-700">
                            {Number(item.equivalent_days || 0).toFixed(3)}
                        </TableCell>
                        <TableCell className="p-3 text-center">
                            <Button
                                type="button"
                                size="sm"
                                className={`mx-auto flex h-7 min-w-[68px] items-center justify-center gap-1 border bg-white px-2 text-xs ${
                                    isGreen
                                        ? "border-emerald-600 text-emerald-600 hover:bg-emerald-600 hover:text-white"
                                        : "border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                                }`}
                                onClick={() => onOpenEdit?.(item, valueKey)}
                                title={`Edit ${title} Conversion`}
                            >
                                <SquarePen className="h-3.5 w-3.5" />
                                Edit
                            </Button>
                        </TableCell>
                    </TableRow>
                ))}
            </>
        ) : (
            <TableRow>
                <TableCell
                    colSpan="3"
                    className="p-5 text-center text-sm text-gray-500"
                >
                    {emptyMessage}
                </TableCell>
            </TableRow>
        );

    const renderTable = (rows) => (
        <div className="overflow-hidden rounded-lg border border-slate-200">
            <div className="overflow-x-auto">
                <Table className="w-full min-w-[260px] table-fixed">
                    <TableHeader>
                        <TableRow
                            className={
                                isGreen
                                    ? "bg-teal-900 hover:bg-teal-900"
                                    : "bg-blue-900 hover:bg-blue-800"
                            }
                        >
                            <TableHead className="w-[40%] text-center text-white">
                                {valueLabel}
                            </TableHead>
                            <TableHead className="w-[40%] text-center text-white">
                                Equivalent Days
                            </TableHead>
                            <TableHead className="w-[20%] text-center text-white">
                                Action
                            </TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>{renderRows(rows)}</TableBody>
                </Table>
            </div>
        </div>
    );

    const leftItems = splitAt ? items.slice(0, splitAt) : items;
    const rightItems = splitAt ? items.slice(splitAt) : [];
    const dialogWidthClass = valueKey === "minutes" ? "max-w-6xl" : "max-w-5xl";

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button
                    type="button"
                    variant="outline"
                    className={`h-8 px-3 text-xs ${
                        isGreen
                            ? "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                            : "border-blue-200 text-blue-700 hover:bg-blue-50"
                    }`}
                    disabled={disabled}
                >
                    See more
                </Button>
            </DialogTrigger>
            <DialogContent
                className={`max-h-[88vh] ${dialogWidthClass} overflow-hidden rounded-2xl p-0`}
            >
                <div
                    className={`px-5 py-4 text-white ${
                        isGreen ? "bg-emerald-600" : "bg-blue-700"
                    }`}
                >
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-white">
                            {icon}
                            {title} Conversion Table
                        </DialogTitle>
                        <DialogDescription
                            className={
                                isGreen ? "text-emerald-50" : "text-blue-100"
                            }
                        >
                            Complete {title.toLowerCase()} equivalent day
                            values.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="max-h-[calc(88vh-5.5rem)] overflow-y-auto px-5 pb-5 pt-1">
                    {splitAt ? (
                        <div className="grid gap-4 lg:grid-cols-2">
                            {renderTable(leftItems)}
                            {renderTable(rightItems)}
                        </div>
                    ) : (
                        renderTable(items)
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ConversionTableDialog;
