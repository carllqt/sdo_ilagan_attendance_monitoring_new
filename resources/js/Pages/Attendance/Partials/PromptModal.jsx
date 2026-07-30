import React from "react";
import { Button } from "@/components/ui/button";
import EmployeeAvatar from "@/Components/EmployeeAvatar";

const PromptModal = ({
    employee,
    message,
    secondaryLabel,
    primaryLabel,
    onSecondary,
    onPrimary,
}) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
        <div className="w-full max-w-md overflow-hidden rounded-[1.35rem] border border-white/25 bg-[linear-gradient(135deg,rgba(255,255,255,0.12),rgba(120,119,255,0.18))] text-white shadow-[0_0_28px_rgba(167,139,250,0.20),0_24px_80px_rgba(2,6,47,0.42),inset_0_1px_0_rgba(255,255,255,0.22)] ring-1 ring-violet-200/10 backdrop-blur-md">
            <div className="flex items-center gap-5 border-b border-white/20 px-6 py-5">
                <EmployeeAvatar
                    employee={employee}
                    name={`${employee.first_name || ""} ${employee.last_name || ""}`}
                    className="h-24 w-24 ring-4 ring-white/20 shadow-xl"
                />
                <div className="min-w-0">
                    <h2 className="text-xl font-black leading-tight">
                        {employee.first_name} {employee.last_name}
                    </h2>
                    <p className="mt-1 text-sm font-semibold text-blue-100">
                        Confirm attendance action
                    </p>
                </div>
            </div>
            <div className="space-y-5 p-6">
                <p className="text-center text-sm font-semibold leading-relaxed text-blue-50">
                    {message}
                </p>
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        className="h-12 border-white/30 bg-white/10 px-3 font-bold text-white hover:bg-white/20 hover:text-white"
                        onClick={onSecondary}
                    >
                        {secondaryLabel}
                    </Button>
                    <Button
                        type="button"
                        className="h-12 bg-white px-3 font-bold text-[#141b6d] shadow-lg hover:bg-blue-50"
                        onClick={onPrimary}
                    >
                        {primaryLabel}
                    </Button>
                </div>
            </div>
        </div>
    </div>
);

export default PromptModal;
