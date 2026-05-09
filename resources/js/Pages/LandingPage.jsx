import React from "react";
import { Head, Link } from "@inertiajs/react";
import {
    ArrowRight,
    BarChart3,
    CheckCircle2,
    Clock3,
    FileCheck2,
    LogIn,
    MapPinned,
    Plane,
    ShieldCheck,
} from "lucide-react";
import ApplicationLogo from "@/Components/ApplicationLogo";

const services = [
    {
        title: "Travel Order",
        description:
            "Prepare, submit, and monitor official travel requests from one secure workspace.",
        routeName: "travelorder",
        icon: Plane,
        accent: "bg-blue-600 text-white",
    },
    {
        title: "Locator Slip",
        description:
            "Create locator slips and keep employee movement records organized and traceable.",
        routeName: "locator-slips",
        icon: MapPinned,
        accent: "bg-emerald-600 text-white",
    },
];

const highlights = [
    { label: "Attendance monitoring", icon: Clock3 },
    { label: "Biometric-based records", icon: ShieldCheck },
    { label: "Document processing", icon: FileCheck2 },
];

export default function LandingPage() {
    return (
        <>
            <Head title="TimeVault" />

            <main className="min-h-screen bg-slate-50 text-slate-950">
                <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
                    <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
                        <Link
                            href={route("landing")}
                            className="flex items-center gap-3"
                        >
                            <ApplicationLogo className="h-12 w-auto" />
                            <div className="leading-tight">
                                <p className="text-lg font-bold text-blue-700">
                                    TimeVault
                                </p>
                                <p className="text-xs font-medium text-slate-500">
                                    SDO Ilagan Attendance Monitoring
                                </p>
                            </div>
                        </Link>

                        <Link
                            href={route("login")}
                            className="inline-flex h-11 items-center gap-2 rounded-lg bg-blue-700 px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800"
                        >
                            <LogIn className="h-4 w-4" />
                            Login
                        </Link>
                    </div>
                </header>

                <section className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-7xl items-center gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:py-14">
                    <div>
                        <div className="mb-6 inline-flex items-center gap-2 rounded-lg border border-blue-100 bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700">
                            <CheckCircle2 className="h-4 w-4" />
                            Smart workforce and attendance management platform
                        </div>

                        <h1 className="max-w-3xl text-4xl font-black leading-tight text-slate-950 sm:text-5xl lg:text-6xl">
                            Manage attendance, locator slips, travel orders, and
                            employee movement through one centralized digital
                            system.
                        </h1>

                        <p className="mt-6 max-w-2xl text-base leading-8 text-slate-600 sm:text-lg">
                            TimeVault streamlines attendance monitoring,
                            fingerprint-based logging, employee tracking,
                            locator slip processing, and official travel
                            management for SDO Ilagan through a faster, more
                            secure, and fully modernized workflow.
                        </p>
                        <div className="mt-8 grid max-w-2xl gap-4 sm:grid-cols-3">
                            {highlights.map(({ label, icon: Icon }) => (
                                <div
                                    key={label}
                                    className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
                                >
                                    <Icon className="h-5 w-5 text-blue-700" />
                                    <p className="mt-3 text-sm font-semibold leading-5 text-slate-700">
                                        {label}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-10 grid max-w-3xl gap-4 md:grid-cols-2">
                            {services.map(
                                ({
                                    title,
                                    description,
                                    routeName,
                                    icon: Icon,
                                    accent,
                                }) => (
                                    <Link
                                        key={title}
                                        href={route(routeName)}
                                        className="group rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                                    >
                                        <div className="flex items-start justify-between gap-4">
                                            <div
                                                className={`flex h-12 w-12 items-center justify-center rounded-lg ${accent}`}
                                            >
                                                <Icon className="h-6 w-6" />
                                            </div>

                                            <ArrowRight className="mt-2 h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-700" />
                                        </div>

                                        <h2 className="mt-5 text-xl font-bold text-slate-950">
                                            {title}
                                        </h2>
                                        <p className="mt-2 text-sm leading-6 text-slate-600">
                                            {description}
                                        </p>
                                    </Link>
                                ),
                            )}
                        </div>
                    </div>

                    <div className="relative min-h-[520px] overflow-hidden rounded-lg border border-slate-200 bg-slate-900 shadow-xl">
                        <img
                            src="/sdo-pic.jpg"
                            alt="SDO Ilagan office"
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/10" />

                        <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
                            <div className="mb-5 inline-flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-sm font-semibold text-white backdrop-blur">
                                <BarChart3 className="h-4 w-4" />
                                Workforce overview
                            </div>

                            <div className="grid gap-3">
                                <div className="rounded-lg bg-white/95 p-4 shadow-sm">
                                    <p className="text-sm font-semibold text-slate-500">
                                        Attendance Monitoring
                                    </p>
                                    <p className="mt-1 text-lg font-bold text-slate-950">
                                        Daily logs and tardiness tracking
                                    </p>
                                </div>

                                <div className="grid gap-3 sm:grid-cols-2">
                                    <div className="rounded-lg bg-white/95 p-4 shadow-sm">
                                        <p className="text-sm font-semibold text-slate-500">
                                            Travel Order
                                        </p>
                                        <p className="mt-1 font-bold text-slate-950">
                                            Official request records
                                        </p>
                                    </div>

                                    <div className="rounded-lg bg-white/95 p-4 shadow-sm">
                                        <p className="text-sm font-semibold text-slate-500">
                                            Locator Slip
                                        </p>
                                        <p className="mt-1 font-bold text-slate-950">
                                            Movement documentation
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>
        </>
    );
}
