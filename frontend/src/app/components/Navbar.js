"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navLinks = [
    { href: "/candidates", label: "Kandidat", tone: "ghost" },
    { href: "/vote", label: "Vote Dashboard", tone: "ghost" },
    { href: "/history", label: "Histori", tone: "ghost" },
    { href: "/login", label: "Login", tone: "primary" },
];

function linkClass(tone) {
    if (tone === "primary") {
        return "px-3 py-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition";
    }
    return "px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/30 transition";
}

export default function SiteNavbar({ sticky = false, title = "ChainVote" }) {
    const pathname = usePathname();

    const isActive = (href) => {
        if (href === "/") return pathname === "/";
        return pathname.startsWith(href);
    };

    const renderClass = (link) => {
        const base = linkClass(link.tone);
        if (!isActive(link.href)) return base;
        if (link.tone === "primary") {
            return "px-3 py-1.5 rounded-lg bg-white text-slate-900 font-semibold shadow-sm shadow-blue-900/20";
        }
        return "px-3 py-1.5 rounded-lg border border-blue-400/70 text-white bg-blue-500/20 shadow-sm shadow-blue-900/30";
    };

    const headerClass = sticky
        ? "sticky top-0 z-20 border-b border-white/10 bg-slate-950/70 backdrop-blur"
        : "relative z-10 border-b border-white/10 bg-slate-950/70 backdrop-blur";

    return (
        <header className={headerClass}>
            <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                <Link
                    href="/"
                    className="flex items-center gap-2 font-semibold text-lg">
                    <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>{title}</span>
                </Link>
                <nav className="flex items-center gap-3 text-sm">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={renderClass(link)}>
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </header>
    );
}
