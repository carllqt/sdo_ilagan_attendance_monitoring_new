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

const ConvertionTableDialog = ({
    title,
    items = [],
    valueKey,
    valueLabel,
    emptyMessage,
    disabled = false,
    splitAt = null,
    onOpenEdit,
}) => {
    const renderRows = (rows) =>
        rows.length > 0 ? (
            rows.map((item) => (
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
                            className="mx-auto flex h-7 min-w-[68px] items-center justify-center gap-1 border border-blue-600 bg-white px-2 text-xs text-blue-600 hover:bg-blue-600 hover:text-white"
                            onClick={() => onOpenEdit?.(item, valueKey)}
                            title={`Edit ${title} Convertion`}
                        >
                            <SquarePen className="h-3.5 w-3.5" />
                            Edit
                        </Button>
                    </TableCell>
                </TableRow>
            ))
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
                        <TableRow className="bg-blue-900 hover:bg-blue-800">
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
                    className="h-8 border-blue-200 px-3 text-xs text-blue-700 hover:bg-blue-50"
                    disabled={disabled}
                >
                    See more
                </Button>
            </DialogTrigger>
            <DialogContent
                className={`max-h-[88vh] ${dialogWidthClass} overflow-y-auto`}
            >
                <DialogHeader>
                    <DialogTitle>{title} Convertion Table</DialogTitle>
                    <DialogDescription>
                        Complete {title.toLowerCase()} equivalent day values.
                    </DialogDescription>
                </DialogHeader>

                {splitAt ? (
                    <div className="grid gap-4 lg:grid-cols-2">
                        {renderTable(leftItems)}
                        {renderTable(rightItems)}
                    </div>
                ) : (
                    renderTable(items)
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ConvertionTableDialog;
