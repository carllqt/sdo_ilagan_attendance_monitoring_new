import ApplicationLogo from "@/Components/ApplicationLogo";
import FloatingInput from "@/Components/floating-input";
import InputError from "@/Components/InputError";
import { Button } from "@/Components/ui/button";
import { Checkbox } from "@/Components/ui/checkbox";
import { Link } from "@inertiajs/react";
import { Eye, EyeOff, Lock, LogIn, Mail } from "lucide-react";

import DocumentRequestButtons from "./DocumentRequestButtons";

const loginFloatingInputClassName =
    "[&>div>div]:!border-slate-300/80 [&>div>div]:!bg-white [&>div>div]:focus-within:!border-[#1f55ff] [&>div>div]:focus-within:!ring-4 [&>div>div]:focus-within:!ring-blue-100/80 [&_input]:!h-7 [&_input]:!text-slate-800 [&_label]:!bg-white [&>div>div>svg]:!h-[18px] [&>div>div>svg]:!w-[18px] [&>div>div>svg]:!text-blue-500/80";

const LoginFormSection = ({
    status,
    canResetPassword,
    showPassword,
    onTogglePassword,
    loginForm,
    onOpenDocumentRequest,
}) => {
    const { data, setData, processing, errors, submit } = loginForm;

    return (
        <div className="relative flex min-h-0 flex-col items-center justify-center bg-[linear-gradient(135deg,rgba(255,255,255,0.96),rgba(247,249,255,0.92))] p-0 shadow-[inset_0_1px_0_rgba(255,255,255,0.86)] backdrop-blur-md lg:min-h-[590px] lg:px-14 lg:py-12">
            <svg
                className="pointer-events-none absolute right-6 top-7 hidden h-28 w-32 text-indigo-300/35 sm:block"
                viewBox="0 0 128 112"
                fill="none"
                aria-hidden="true"
            >
                <defs>
                    <pattern
                        id="rightPanelDots"
                        width="13"
                        height="13"
                        patternUnits="userSpaceOnUse"
                    >
                        <circle
                            cx="2"
                            cy="2"
                            r="1.35"
                            fill="rgba(99,102,241,0.34)"
                        />
                    </pattern>
                    <clipPath id="rightDotTriangle">
                        <path d="M30 0H128V92Z" />
                    </clipPath>
                </defs>
                <rect
                    width="128"
                    height="112"
                    fill="url(#rightPanelDots)"
                    clipPath="url(#rightDotTriangle)"
                />
            </svg>

            <div className="relative z-10 w-full max-w-[390px]">
                <div className="relative overflow-hidden border-b border-white/20 bg-[linear-gradient(140deg,#020730_0%,#0c115e_48%,#391888_100%)] p-5 text-center text-white shadow-[0_0_22px_rgba(167,139,250,0.14),inset_0_1px_0_rgba(255,255,255,0.13)] ring-1 ring-violet-200/10 lg:hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_0%,rgba(255,255,255,0.10),transparent_31%),radial-gradient(circle_at_86%_94%,rgba(167,139,250,0.14),transparent_38%)]" />
                    <div className="absolute -left-8 top-0 h-32 w-2/3 rounded-full bg-white/[0.06] blur-3xl" />
                    <img
                        src="/img/olddepedlogo.png"
                        alt="DepEd Logo"
                        className="relative z-10 mx-auto mb-4 w-36 object-contain drop-shadow-[0_10px_18px_rgba(5,10,70,0.22)]"
                    />
                    <h1 className="relative z-10 text-2xl font-black tracking-tight">
                        Project TALA
                    </h1>
                    <p className="relative z-10 mx-auto mt-2 max-w-xs text-sm font-medium leading-relaxed text-white/90">
                        Time and Attendance Logging System with Automated
                        Tardiness Computation
                    </p>
                    <div className="relative z-10 mx-auto mt-4 h-1 w-28 rounded-full bg-[linear-gradient(90deg,transparent,#4de8ff,#f472ff,transparent)] shadow-[0_0_18px_rgba(216,180,254,0.78)]" />
                    <DocumentRequestButtons
                        onOpenDocumentRequest={onOpenDocumentRequest}
                        containerClassName="relative z-10 mt-5 grid grid-cols-2 gap-2"
                        buttonClassName="flex h-10 items-center justify-center gap-1.5 rounded-xl border border-white/25 bg-white/10 px-2 text-xs font-bold text-white backdrop-blur-md transition hover:bg-white/15"
                        iconClassName="h-3.5 w-3.5"
                    />
                </div>

                <div className="bg-transparent px-4 py-5 sm:px-6 sm:py-7 lg:p-0">
                    <div className="mb-4 flex w-full flex-col items-center justify-center text-center sm:mb-7 lg:mb-8">
                        <ApplicationLogo className="mx-auto h-20 w-auto object-contain" />
                        <h2 className="mt-1 text-lg font-black text-slate-900 sm:mt-2 sm:text-xl lg:mt-4 lg:text-2xl">
                            Welcome Back! {"\uD83D\uDC4B"}
                        </h2>
                        <p className="text-xs font-medium text-slate-500 sm:text-sm">
                            Sign in to continue to your account
                        </p>
                    </div>

                    {status && (
                        <div className="mb-4 rounded-xl border border-emerald-100 bg-emerald-50 px-3 py-2.5 text-center text-xs font-medium text-emerald-700 sm:mb-5 sm:px-4 sm:py-3 sm:text-sm">
                            {status}
                        </div>
                    )}

                    <form
                        onSubmit={submit}
                        className="space-y-3.5 sm:space-y-4 lg:space-y-5"
                    >
                        <div>
                            <div className={loginFloatingInputClassName}>
                                <FloatingInput
                                    label="Email Address"
                                    icon={Mail}
                                    name="email"
                                    type="email"
                                    value={data.email}
                                    autoComplete="username"
                                    autoFocus
                                    onChange={(e) =>
                                        setData("email", e.target.value)
                                    }
                                />
                            </div>
                            <InputError
                                message={errors.email}
                                className="mt-1.5 !text-[11px] sm:mt-2 sm:!text-xs"
                            />
                        </div>

                        <div>
                            <div className="relative">
                                <div className={loginFloatingInputClassName}>
                                    <FloatingInput
                                        label="Password"
                                        icon={Lock}
                                        name="password"
                                        type={
                                            showPassword ? "text" : "password"
                                        }
                                        value={data.password}
                                        autoComplete="current-password"
                                        inputClassName="pr-8"
                                        onChange={(e) =>
                                            setData("password", e.target.value)
                                        }
                                    />
                                </div>
                                <button
                                    type="button"
                                    onClick={onTogglePassword}
                                    className="absolute right-2 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-blue-50 hover:text-[#1f55ff]"
                                    aria-label={
                                        showPassword
                                            ? "Hide password"
                                            : "Show password"
                                    }
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    ) : (
                                        <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    )}
                                </button>
                            </div>
                            <InputError
                                message={errors.password}
                                className="mt-1.5 !text-[11px] sm:mt-2 sm:!text-xs"
                            />
                        </div>

                        <label
                            htmlFor="remember"
                            className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-slate-700 sm:gap-2 sm:text-sm"
                        >
                            <Checkbox
                                id="remember"
                                name="remember"
                                checked={data.remember}
                                onCheckedChange={(checked) =>
                                    setData("remember", checked === true)
                                }
                            />
                            <span>Remember me</span>
                            {canResetPassword && (
                                <Link
                                    href={route("password.request")}
                                    className="ml-auto text-xs font-bold text-[#1f55ff] transition hover:text-[#2c20d9] sm:text-sm"
                                >
                                    Forgot password?
                                </Link>
                            )}
                        </label>

                        <Button
                            variant="blue"
                            disabled={processing}
                            className="h-10 w-full rounded-lg bg-[linear-gradient(135deg,#075fff,#3024df)] text-xs font-black shadow-[0_12px_24px_rgba(37,99,235,0.28)] transition hover:translate-y-[-1px] hover:shadow-[0_16px_28px_rgba(37,99,235,0.34)] sm:h-11 sm:text-sm lg:h-12"
                        >
                            <LogIn className="mr-1.5 h-3.5 w-3.5 sm:mr-2 sm:h-4 sm:w-4" />
                            Sign In
                        </Button>
                    </form>

                    <div className="mt-4 text-center text-[9px] font-medium leading-relaxed text-slate-400 sm:mt-6 sm:text-[11px] lg:mt-8 lg:text-xs">
                        &copy; 2025 Isabela State University &mdash; Ilagan
                        Campus
                        <br />
                        All Rights Reserved
                        <br />
                        Developed by Reycarl Medico
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginFormSection;
