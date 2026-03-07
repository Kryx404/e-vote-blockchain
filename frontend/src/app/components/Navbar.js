"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

const navLinks = [
    { href: "/candidates", label: "Kandidat", tone: "ghost" },
    { href: "/vote", label: "Vote Dashboard", tone: "ghost" },
    { href: "/history", label: "Histori", tone: "ghost" },
];

export default function SiteNavbar({ sticky = true, title = "ChainVote" }) {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const onScroll = () => setIsScrolled(window.scrollY > 12);
        onScroll();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
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
                            className={`flex items-center w-full transition-all ${
                                isScrolled
                                    ? "justify-end gap-2"
                                    : "justify-center gap-3"
                            }`}>
                            {navLinks.map((link) => {
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
                        <Link
                            href="/login"
                            className="px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition font-semibold shadow-sm shadow-blue-900/25">
                            Login
                        </Link>
                    </div>
                </div>
            </header>
            <div
                aria-hidden
                className="transition-all duration-300 ease-out"
                style={{ height: isScrolled ? "64px" : "84px" }}
            />
        </>
    );
}
