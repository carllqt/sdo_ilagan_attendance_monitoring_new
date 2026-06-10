"use client";

import React, { useState } from "react";
import { usePage, Link } from "@inertiajs/react";
import {
    CalendarDays,
    ChevronDown,
    ChevronRight,
    Archive,
    CalendarClock,
    ChartColumn,
    ArrowLeftRight,
    UserCircle,
    UserCog,
    LogOut,
    User,
    MapPin,
    LandPlot,
    Building2,
    Calculator,
    ClipboardList,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar";

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import ApplicationLogo from "./ApplicationLogo";
import EmployeeAvatar from "./EmployeeAvatar";
import { getEmployeeName } from "@/lib/utils";

export function AppSidebar({ active, user, ...props }) {
    const [isAdminOpen, setAdminOpen] = useState(true);
    const [isHROpen, setHROpen] = useState(true);

    const { url, props: pageProps } = usePage();
    const authUser = user || pageProps.auth?.user;
    const employee = authUser?.employee;
    const employeeName =
        getEmployeeName(employee) || authUser?.email || "Administrator";
    const stationName = employee?.station?.name || "No Station";
    const roleLabel = employee?.position || "Administrator";
    const userRoles = authUser?.roles || [];
    const isSdoAdmin = userRoles.includes("sdo_admin");
    const isSchoolAdmin = userRoles.includes("school_admin");

    return (
        <Sidebar {...props}>
            <SidebarHeader className="bg-blue-700 p-0">
                <div className="px-5 py-4 pb-5">
                    <div className="border-b border-blue-400 ">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton size="lg" asChild>
                                    <Link
                                        href="/"
                                        className="flex items-center gap-4 py-11 text-white w-full"
                                    >
                                        <div className="flex size-11 aspect-square items-center justify-center text-primary-foreground">
                                            <ApplicationLogo className="h-11 w-auto" />
                                        </div>
                                        <div className="flex flex-col gap-0.5 leading-tight text-white">
                                            <span className="text-[14px] font-semibold tracking-tight">
                                                TimeVault
                                            </span>
                                            <span className="text-[9px] font-medium uppercase tracking-wide opacity-80 leading-[1rem]">
                                                Securing Attendance and
                                                Tardiness Data with Biometrics
                                            </span>
                                        </div>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="bg-blue-700 text-white p-0">
                <div className="px-5">
                    <div className="border-b border-blue-400 pb-5">
                        <div className="flex items-center gap-2 text-sm font-semibold text-left text-white px-3 py-2 rounded-md">
                            <MapPin className="h-5 w-5 text-blue-200" />
                            {stationName}
                        </div>
                    </div>
                </div>
                <SidebarGroup>
                    <SidebarMenu>
                        {/* Administrator */}
                        <SidebarMenuItem>
                            <Button
                                variant="ghost"
                                className="w-full justify-between px-3 py-2 text-left font-semibold hover:bg-blue-900 hover:text-blue-100"
                                onClick={() => setAdminOpen(!isAdminOpen)}
                            >
                                <span className="flex items-center gap-2">
                                    <UserCog className="h-5 w-5" />
                                    Administrator
                                </span>
                                {isAdminOpen ? (
                                    <ChevronDown className="h-4 w-4" />
                                ) : (
                                    <ChevronRight className="h-4 w-4" />
                                )}
                            </Button>

                            {isAdminOpen && (
                                <SidebarMenuSub>
                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton
                                            asChild
                                            isActive={
                                                active === "employeemanagement"
                                            }
                                        >
                                            <Link
                                                href={route(
                                                    "employeemanagement",
                                                )}
                                                className="flex items-center gap-2 text-xs text-white hover:bg-blue-900 hover:text-blue-100"
                                            >
                                                <UserCog
                                                    className={`h-4 w-4 ${
                                                        active ===
                                                        "employeemanagement"
                                                            ? "!text-black"
                                                            : "!text-white"
                                                    }`}
                                                />
                                                Employee Management
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>

                                    {isSdoAdmin && (
                                        <SidebarMenuSubItem>
                                            <SidebarMenuSubButton
                                                asChild
                                                isActive={
                                                    active ===
                                                    "departmentmanagement"
                                                }
                                            >
                                                <Link
                                                    href={route(
                                                        "departmentmanagement",
                                                    )}
                                                    className="flex items-center gap-2 text-xs text-white hover:bg-blue-900 hover:text-blue-100"
                                                >
                                                    <Building2
                                                        className={`h-4 w-4 ${
                                                            active ===
                                                            "departmentmanagement"
                                                                ? "!text-black"
                                                                : "!text-white"
                                                        }`}
                                                    />
                                                    Organization Management
                                                </Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    )}

                                    {isSdoAdmin && (
                                        <SidebarMenuSubItem>
                                            <SidebarMenuSubButton
                                                asChild
                                                isActive={
                                                    active ===
                                                    "stationmanagement"
                                                }
                                            >
                                                <Link
                                                    href={route(
                                                        "stationmanagement",
                                                    )}
                                                    className="flex items-center gap-2 text-xs text-white hover:bg-blue-900 hover:text-blue-100"
                                                >
                                                    <LandPlot
                                                        className={`h-4 w-4 ${
                                                            active ===
                                                            "stationmanagement"
                                                                ? "!text-black"
                                                                : "!text-white"
                                                        }`}
                                                    />
                                                    Station Management
                                                </Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    )}

                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton
                                            asChild
                                            isActive={
                                                active ===
                                                "attendancemanagement"
                                            }
                                        >
                                            <Link
                                                href={route(
                                                    "attendancemanagement",
                                                )}
                                                className="flex items-center gap-2 text-xs text-white hover:bg-blue-900 hover:text-blue-100"
                                            >
                                                <CalendarDays
                                                    className={`h-4 w-4 ${
                                                        active ===
                                                        "attendancemanagement"
                                                            ? "!text-black"
                                                            : "!text-white"
                                                    }`}
                                                />
                                                Attendance Management
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>

                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton
                                            asChild
                                            isActive={url.startsWith(
                                                "/dailytimerecord",
                                            )}
                                        >
                                            <Link
                                                href={route("dailytimerecord")}
                                                className="flex items-center gap-2 text-xs text-white hover:bg-blue-900 hover:text-blue-100 h-8"
                                            >
                                                <CalendarClock
                                                    className={`h-4 w-4 ${
                                                        url.startsWith(
                                                            "/dailytimerecord",
                                                        )
                                                            ? "!text-black"
                                                            : "!text-white"
                                                    }`}
                                                />
                                                Daily Time Record Management
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>

                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton
                                            asChild
                                            isActive={url.startsWith(
                                                "/tardinesssummary",
                                            )}
                                        >
                                            <Link
                                                href={route("tardinesssummary")}
                                                className="flex items-center gap-2 text-xs text-white hover:bg-blue-900 hover:text-blue-100"
                                            >
                                                <ChartColumn
                                                    className={`h-4 w-4 ${
                                                        active ===
                                                        "tardinesssummary"
                                                            ? "!text-black"
                                                            : "!text-white"
                                                    }`}
                                                />
                                                Tardiness Summary
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>

                                    <SidebarMenuSubItem>
                                        <SidebarMenuSubButton
                                            asChild
                                            isActive={
                                                active ===
                                                "slip-monitoring.index"
                                            }
                                        >
                                            <Link
                                                href={route(
                                                    "slip-monitoring.index",
                                                )}
                                                className="flex items-center gap-2 text-xs text-white hover:bg-blue-900 hover:text-blue-100"
                                            >
                                                <ClipboardList
                                                    className={`h-4 w-4 ${
                                                        active ===
                                                        "slip-monitoring.index"
                                                            ? "!text-black"
                                                            : "!text-white"
                                                    }`}
                                                />
                                                Slip Monitoring
                                            </Link>
                                        </SidebarMenuSubButton>
                                    </SidebarMenuSubItem>

                                    {isSchoolAdmin && (
                                        <>
                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton
                                                    asChild
                                                    isActive={
                                                        active ===
                                                        "tardinessconvertion"
                                                    }
                                                >
                                                    <Link
                                                        href={route(
                                                            "tardinessconvertion",
                                                        )}
                                                        className="flex items-center gap-2 text-xs text-white hover:bg-blue-900 hover:text-blue-100 h-8"
                                                    >
                                                        <ArrowLeftRight
                                                            className={`h-4 w-4 ${
                                                                active ===
                                                                "tardinessconvertion"
                                                                    ? "!text-black"
                                                                    : "!text-white"
                                                            }`}
                                                        />
                                                        Tardiness Summary /
                                                        Convertion Management
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>

                                            <SidebarMenuSubItem>
                                                <SidebarMenuSubButton
                                                    asChild
                                                    isActive={
                                                        active ===
                                                        "converted-tardiness-record"
                                                    }
                                                >
                                                    <Link
                                                        href={route(
                                                            "converted-tardiness-record",
                                                        )}
                                                        className="flex min-h-8 items-start gap-2 py-1 text-xs hover:bg-blue-900 [&>span:last-child]:!overflow-visible [&>span:last-child]:!whitespace-normal [&>span:last-child]:!text-clip"
                                                    >
                                                        <Archive
                                                            className={`mt-0.5 h-4 w-4 ${
                                                                active ===
                                                                    "converted-tardiness-record" ||
                                                                active ===
                                                                    "converted-tardiness-record.batch"
                                                                    ? "!text-black"
                                                                    : "!text-white"
                                                            }`}
                                                        />
                                                        <span
                                                            className={`min-w-0 flex-1 leading-4 ${
                                                                active ===
                                                                    "converted-tardiness-record" ||
                                                                active ===
                                                                    "converted-tardiness-record.batch"
                                                                    ? "!text-black"
                                                                    : "!text-white"
                                                            }`}
                                                        >
                                                            Converted Tardiness
                                                            Record Management
                                                        </span>
                                                    </Link>
                                                </SidebarMenuSubButton>
                                            </SidebarMenuSubItem>
                                        </>
                                    )}
                                </SidebarMenuSub>
                            )}
                        </SidebarMenuItem>

                        {!isSchoolAdmin && (
                            <SidebarMenuItem>
                                <Button
                                    variant="ghost"
                                    className="w-full justify-between px-3 py-2 text-left font-semibold hover:bg-blue-900 hover:text-blue-100"
                                    onClick={() => setHROpen(!isHROpen)}
                                >
                                    <span className="flex items-center gap-2">
                                        <UserCircle className="h-5 w-5" />
                                        Human Resource
                                    </span>
                                    {isHROpen ? (
                                        <ChevronDown className="h-4 w-4" />
                                    ) : (
                                        <ChevronRight className="h-4 w-4" />
                                    )}
                                </Button>

                                {isHROpen && (
                                    <SidebarMenuSub>
                                        <SidebarMenuSubItem>
                                            <SidebarMenuSubButton
                                                asChild
                                                isActive={
                                                    active ===
                                                    "tardinessconvertion"
                                                }
                                            >
                                                <Link
                                                    href={route(
                                                        "tardinessconvertion",
                                                    )}
                                                    className="flex items-center gap-2 text-xs text-white hover:bg-blue-900 hover:text-blue-100 h-8"
                                                >
                                                    <Calculator
                                                        className={`h-4 w-4 ${
                                                            active ===
                                                            "tardinessconvertion"
                                                                ? "!text-black"
                                                                : "!text-white"
                                                        }`}
                                                    />
                                                    Tardiness Summary /
                                                    Convertion Management
                                                </Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>

                                        <SidebarMenuSubItem>
                                            <SidebarMenuSubButton
                                                asChild
                                                isActive={
                                                    active ===
                                                    "converted-tardiness-record"
                                                }
                                            >
                                                <Link
                                                    href={route(
                                                        "converted-tardiness-record",
                                                    )}
                                                    className="flex min-h-8 items-start gap-2 py-1 text-xs text-white hover:bg-blue-900 hover:text-blue-100 [&>span:last-child]:!overflow-visible [&>span:last-child]:!whitespace-normal [&>span:last-child]:!text-clip"
                                                >
                                                    <Archive
                                                            className={`mt-0.5 h-4 w-4 ${
                                                            active ===
                                                                "converted-tardiness-record" ||
                                                            active ===
                                                                "converted-tardiness-record.batch"
                                                                ? "!text-black"
                                                                : "!text-white"
                                                        }`}
                                                    />
                                                    <span
                                                            className={`min-w-0 flex-1 leading-4 ${
                                                            active ===
                                                                "converted-tardiness-record" ||
                                                            active ===
                                                                "converted-tardiness-record.batch"
                                                                ? "!text-black"
                                                                : "!text-white"
                                                        }`}
                                                    >
                                                        Converted Tardiness
                                                        Record Management
                                                    </span>
                                                </Link>
                                            </SidebarMenuSubButton>
                                        </SidebarMenuSubItem>
                                    </SidebarMenuSub>
                                )}
                            </SidebarMenuItem>
                        )}
                    </SidebarMenu>
                </SidebarGroup>

                {authUser && (
                    <SidebarFooter className="mt-auto border-t border-blue-400/80 px-5 py-4">
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            className="h-auto w-full justify-start gap-3 rounded-md px-2 py-2 text-left hover:bg-blue-900 hover:text-blue-100"
                                        >
                                            <EmployeeAvatar
                                                employee={employee}
                                                name={employeeName}
                                                className="h-10 w-10"
                                            />
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-sm font-semibold text-white">
                                                    {employeeName}
                                                </span>
                                                <span className="block truncate text-[11px] text-blue-100/85">
                                                    {roleLabel}
                                                </span>
                                                {authUser.email && (
                                                    <span className="block truncate text-[10px] text-blue-100/70">
                                                        {authUser.email}
                                                    </span>
                                                )}
                                            </span>
                                        </Button>
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent align="start">
                                        <DropdownMenuItem asChild>
                                            <Link
                                                href={route("profile.edit")}
                                                className="flex items-center gap-2"
                                            >
                                                <User className="h-4 w-4" />
                                                Profile
                                            </Link>
                                        </DropdownMenuItem>

                                        <DropdownMenuItem asChild>
                                            <Link
                                                href={route("logout")}
                                                method="post"
                                                as="button"
                                                className="flex items-center gap-2 w-full text-left"
                                            >
                                                <LogOut className="h-4 w-4" />
                                                Log Out
                                            </Link>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarFooter>
                )}
            </SidebarContent>
        </Sidebar>
    );
}

export default AppSidebar;
