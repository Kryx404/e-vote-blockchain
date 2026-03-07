"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { clearAuth, readAuth } from "@/lib/auth";

const navLinks = [
    { href: "/candidates", label: "Kandidat", tone: "ghost" },
    {
        href: "/vote",
        label: "Vote Dashboard",
        tone: "ghost",
        requiresAuth: true,
    },
    { href: "/history", label: "Histori", tone: "ghost" },
];

export default function SiteNavbar({ sticky = true, title = "ChainVote" }) {
    const pathname = usePathname();
    const router = useRouter();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [auth, setAuth] = useState({ token: null, email: null });
    const [hydrated, setHydrated] = useState(false);
    const isAuthed = Boolean(auth.token);

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 12);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    useEffect(() => {
        const syncAuth = () => setAuth(readAuth());
        syncAuth();
        setHydrated(true);
        window.addEventListener("storage", syncAuth);
        return () => window.removeEventListener("storage", syncAuth);
    }, []);

    const isActive = (href) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    const headerClass = `${
        sticky ? "fixed top-0 inset-x-0 z-40" : "relative z-10"
    } border-b border-white/10 bg-slate-950/80 backdrop-blur transition-all duration-300 ease-out ${
        isScrolled ? "py-1.5 shadow-lg shadow-slate-900/30" : "py-3"
    }`;

    const visibleLinks = navLinks.filter(
        (link) => !link.requiresAuth || isAuthed,
    );

    const handleLogout = () => {
        clearAuth();
        setAuth(readAuth());
        setIsMenuOpen(false);
        router.push("/");
    };

    return (
        <>
            <header className={headerClass}>
                <div
                    className={`${
                        isScrolled ? "max-w-6xl px-4" : "max-w-screen-2xl px-6"
                    } mx-auto flex items-center gap-3 transition-all duration-300 ease-out`}>
                    <Link
                        href="/"
                        className={`flex items-center gap-2 font-semibold transition-all ${
                            isScrolled ? "text-sm" : "text-lg"
                        }`}>
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>{title}</span>
                    </Link>

                    <div className="flex-1 flex items-center transition-all duration-300 ease-out">
                        <nav
                            className={`hidden md:flex items-center w-full transition-all ${
                                isScrolled
                                    ? "justify-end gap-2"
                                    : "justify-center gap-3"
                            }`}>
                            {visibleLinks.map((link) => {
                                const active = isActive(link.href);
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className="group relative px-3 py-2">
                                        <span
                                            className={`text-sm font-medium transition-colors ${
                                                active
                                                    ? "text-white"
                                                    : "text-slate-300 group-hover:text-white"
                                            }`}>
                                            {link.label}
                                        </span>
                                        <span
                                            className={`pointer-events-none absolute left-3 right-3 -bottom-1 h-[2px] rounded-full transition-all duration-300 ease-out ${
                                                active
                                                    ? "opacity-100 scale-100 bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400 shadow-[0_0_12px_rgba(56,189,248,0.5)]"
                                                    : "opacity-0 scale-50 bg-white/40 group-hover:opacity-70 group-hover:scale-100"
                                            }`}
                                        />
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="flex items-center gap-2">
                        {isAuthed ? (
                            <button
                                type="button"
                                onClick={handleLogout}
                                className="hidden md:inline-flex px-3 py-1.5 rounded-lg bg-red-600 border border-white/20 text-slate-50 hover:border-white/35 transition font-semibold">
                                Logout
                            </button>
                        ) : (
                            <Link
                                href="/login"
                                className="hidden md:inline-flex px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition font-semibold shadow-sm shadow-blue-900/25">
                                Login
                            </Link>
                        )}
                        <button
                            type="button"
                            aria-label="Toggle menu"
                            onClick={() => setIsMenuOpen((v) => !v)}
                            className="md:hidden inline-flex h-10 w-10 flex-col items-center justify-center gap-1 rounded-lg border border-white/15 bg-white/5 text-white transition hover:border-white/30">
                            <span
                                className={`block h-0.5 w-5 rounded-full bg-white transition-transform duration-300 ${
                                    isMenuOpen
                                        ? "translate-y-1.5 rotate-45"
                                        : "-translate-y-1"
                                }`}
                            />
                            <span
                                className={`block h-0.5 w-5 rounded-full bg-white transition-all duration-300 ${
                                    isMenuOpen ? "opacity-0" : "opacity-80"
                                }`}
                            />
                            <span
                                className={`block h-0.5 w-5 rounded-full bg-white transition-transform duration-300 ${
                                    isMenuOpen
                                        ? "-translate-y-1.5 -rotate-45"
                                        : "translate-y-1"
                                }`}
                            />
                        </button>
                    </div>
                </div>

                {isMenuOpen && (
                    <div className="md:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur px-6 pb-4 pt-2 shadow-lg shadow-slate-900/30 transition-all duration-300">
                        <div className="flex flex-col gap-2">
                            {visibleLinks.map((link) => {
                                const active = isActive(link.href);
                                return (
                                    <Link
                                        key={link.href}
                                        href={link.href}
                                        className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition ${
                                            active
                                                ? "text-white bg-white/10"
                                                : "text-slate-200 hover:text-white hover:bg-white/5"
                                        }`}>
                                        <span>{link.label}</span>
                                        <span
                                            className={`h-1.5 w-16 rounded-full transition-all ${
                                                active
                                                    ? "bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-400"
                                                    : "bg-white/10"
                                            }`}
                                        />
                                    </Link>
                                );
                            })}
                            {isAuthed ? (
                                <button
                                    type="button"
                                    onClick={handleLogout}
                                    className="mt-1 inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold border border-white/20 text-slate-50 hover:border-white/35 transition">
                                    Logout
                                </button>
                            ) : (
                                <Link
                                    href="/login"
                                    className="mt-1 inline-flex items-center justify-center rounded-xl px-3 py-2 text-sm font-semibold bg-blue-600 text-white hover:bg-blue-500 transition shadow-sm shadow-blue-900/25">
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>
                )}
            </header>
            <div
                aria-hidden
                className="transition-all duration-300 ease-out"
                style={{ height: isScrolled ? "64px" : "84px" }}
            />
        </>
    );
}
