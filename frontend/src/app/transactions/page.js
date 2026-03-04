"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";

const PAGE_SIZE = 10;

function Badge({ text }) {
    return (
        <span className="px-2 py-1 rounded-full text-[11px] bg-white/5 border border-white/10 text-slate-200">
            {text}
        </span>
    );
}

function Row({ item }) {
    return (
        <div className="grid grid-cols-[1fr_120px_120px_100px] items-center gap-4 text-sm text-slate-200 px-3 py-2 rounded-xl bg-white/5 border border-white/5">
            <div className="truncate">
                <div className="font-semibold text-slate-50">{item.title}</div>
                <div className="text-xs text-slate-400">{item.meta}</div>
            </div>
            <div className="text-xs text-slate-300">{item.time}</div>
            <div className="text-xs text-slate-300">{item.date}</div>
            <div className="flex justify-end">
                <Badge text={item.tag} />
            </div>
        </div>
    );
}

export default function TransactionsPage() {
    const [data, setData] = useState([]);
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);

    useEffect(() => {
        const seed = [];
        const tags = ["Commit", "Reveal"];
        const users = [
            "user1@gmail.com",
            "user2@gmail.com",
            "user3@gmail.com",
            "user4@gmail.com",
            "user5@gmail.com",
        ];
        const baseDate = "2026-03-05";
        for (let i = 0; i < 32; i++) {
            const user = users[i % users.length];
            const tag = tags[i % 2];
            seed.push({
                id: i + 1,
                title: `${tag} vote`,
                meta: user,
                time: `${9 + (i % 6)}:0${i % 2 === 0 ? "2" : "7"}`,
                date: baseDate,
                tag,
            });
        }
        setData(seed);
    }, []);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return data;
        return data.filter((d) =>
            [d.title, d.meta, d.tag, d.time, d.date].some((v) =>
                v.toLowerCase().includes(q),
            ),
        );
    }, [data, query]);

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    const safePage = Math.min(page, totalPages);
    const start = (safePage - 1) * PAGE_SIZE;
    const pageItems = filtered.slice(start, start + PAGE_SIZE);

    const prev = () => setPage((p) => Math.max(1, p - 1));
    const next = () => setPage((p) => Math.min(totalPages, p + 1));

    useEffect(() => {
        if (page > totalPages) setPage(1);
    }, [totalPages, page]);

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
                <div className="absolute right-[-140px] top-28 h-[28rem] w-[28rem] rounded-full bg-cyan-400/15 blur-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.04)_1px,_transparent_0)] bg-[length:32px_32px]" />
            </div>

            <header className="relative z-10 border-b border-white/10 bg-slate-950/70 backdrop-blur">
                <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold text-lg">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>Riwayat Transaksi</span>
                    </div>
                    <Link
                        href="/"
                        className="px-3 py-1.5 rounded-lg border border-white/15 text-slate-50 hover:border-white/35 transition">
                        Kembali ke insight
                    </Link>
                </div>
            </header>

            <main className="relative z-10 max-w-6xl mx-auto px-6 py-10 flex flex-col gap-8">
                <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between flex-wrap gap-3">
                        <div>
                            <p className="text-xs uppercase tracking-[0.32em] text-blue-200/70">
                                Transparan
                            </p>
                            <h1 className="text-2xl font-semibold">
                                Semua transaksi commit / reveal
                            </h1>
                            <p className="text-slate-300 text-sm">
                                Mock data — siap disambungkan ke endpoint
                                backend.
                            </p>
                        </div>
                        <div className="flex items-center gap-2 rounded-xl bg-white/5 border border-white/10 px-3 py-2 shadow-lg shadow-blue-900/20">
                            <Search className="h-4 w-4 text-slate-300" />
                            <input
                                value={query}
                                onChange={(e) => {
                                    setQuery(e.target.value);
                                    setPage(1);
                                }}
                                placeholder="Cari email/tag/waktu"
                                className="bg-transparent outline-none text-sm text-slate-50 placeholder:text-slate-500"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    {pageItems.map((item) => (
                        <Row key={item.id} item={item} />
                    ))}
                    {pageItems.length === 0 && (
                        <div className="text-sm text-slate-400 text-center py-6 border border-dashed border-white/10 rounded-2xl">
                            Tidak ada transaksi yang cocok.
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between flex-wrap gap-3 text-sm text-slate-300">
                    <div>
                        Menampilkan {pageItems.length} dari {filtered.length}{" "}
                        transaksi
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={prev}
                            disabled={safePage === 1}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/15 text-slate-50 hover:border-white/35 disabled:opacity-50">
                            <ChevronLeft className="h-4 w-4" /> Prev
                        </button>
                        <span className="text-xs text-slate-400">
                            Hal {safePage} / {totalPages}
                        </span>
                        <button
                            onClick={next}
                            disabled={safePage === totalPages}
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-white/15 text-slate-50 hover:border-white/35 disabled:opacity-50">
                            Next <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
}
