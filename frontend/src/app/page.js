"use client";
import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Navbar from "./components/Navbar";

const COLORS = {
    accent: "#2563eb",
    accentSoft: "#dbeafe",
    good: "#16a34a",
    warn: "#f59e0b",
};

function Sparkline({ points }) {
    if (!points.length) return null;
    const width = 420;
    const height = 120;
    const minY = Math.min(...points.map((p) => p.y));
    const maxY = Math.max(...points.map((p) => p.y));
    const range = Math.max(1, maxY - minY);

    const path = points
        .map((p, idx) => {
            const x = (idx / Math.max(1, points.length - 1)) * width;
            const y = height - ((p.y - minY) / range) * height;
            return `${idx === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
        })
        .join(" ");

    const last = points[points.length - 1];
    const lastX = width;
    const lastY = height - ((last.y - minY) / range) * height;

    return (
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-32">
            <defs>
                <linearGradient id="lineFill" x1="0" y1="0" x2="0" y2="1">
                    <stop
                        offset="0%"
                        stopColor={COLORS.accent}
                        stopOpacity="0.35"
                    />
                    <stop
                        offset="100%"
                        stopColor={COLORS.accent}
                        stopOpacity="0"
                    />
                </linearGradient>
            </defs>
            <path
                d={`${path} L${lastX},${height} L0,${height} Z`}
                fill="url(#lineFill)"
            />
            <path
                d={path}
                fill="none"
                stroke={COLORS.accent}
                strokeWidth="3"
                strokeLinecap="round"
            />
            <circle
                cx={lastX}
                cy={lastY}
                r="4"
                fill={COLORS.accent}
                stroke="white"
                strokeWidth="2"
            />
        </svg>
    );
}

function Bar({ label, value, color }) {
    const pct = Math.round(value * 100);
    return (
        <div className="flex items-center gap-3">
            <div className="w-16 text-sm text-gray-600">{label}</div>
            <div className="flex-1 h-3 rounded-full bg-gray-200 overflow-hidden">
                <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: color }}
                    aria-label={`${label} ${pct}%`}
                />
            </div>
            <div className="w-12 text-sm font-semibold text-gray-800 text-right">
                {pct}%
            </div>
        </div>
    );
}

function ThinBar({ label, value, max = 100, color = COLORS.accent }) {
    const pct = Math.min(100, Math.round((value / max) * 100));
    return (
        <div className="flex items-center gap-3 text-slate-200">
            <div className="w-28 text-xs text-slate-400">{label}</div>
            <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden border border-white/5">
                <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, background: color }}
                    aria-label={`${label} ${value}`}
                />
            </div>
            <div className="w-10 text-right text-xs text-slate-300">
                {value}
            </div>
        </div>
    );
}

function DotList({ items }) {
    return (
        <div className="space-y-3">
            {items.map((item, idx) => (
                <div
                    key={idx}
                    className="flex items-start gap-3 text-sm text-slate-200">
                    <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blue-400" />
                    <div className="flex-1">
                        <div className="font-semibold text-slate-50">
                            {item.title}
                        </div>
                        <div className="text-xs text-slate-400">
                            {item.time} · {item.meta}
                        </div>
                    </div>
                    <div className="text-xs text-slate-300 bg-white/5 border border-white/10 px-2 py-1 rounded-full">
                        {item.tag}
                    </div>
                </div>
            ))}
        </div>
    );
}

function PeakChart({ data }) {
    if (!data.length) return null;
    const max = Math.max(...data.map((d) => d.value), 1);
    return (
        <div className="flex items-end gap-4 h-44">
            {data.map((d) => {
                const height = Math.max(8, Math.round((d.value / max) * 140));
                return (
                    <div
                        key={d.label}
                        className="flex flex-col items-center gap-2 text-xs text-slate-300">
                        <div
                            className="w-10 rounded-t-lg bg-gradient-to-t from-blue-500/60 via-blue-400/70 to-cyan-300/80 border border-white/10 shadow-lg shadow-blue-900/30"
                            style={{ height }}
                            aria-label={`${d.label} ${d.value}`}
                        />
                        <div className="text-slate-200 font-semibold">
                            {d.value}
                        </div>
                        <div className="text-[11px] text-slate-400 text-center leading-tight">
                            {d.label}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

export default function Home() {
    const [series, setSeries] = useState([]);
    const [snapshot, setSnapshot] = useState({
        turnout: 0.42,
        throughput: 28,
        latency: 1.6,
        choiceA: 0.54,
        choiceB: 0.46,
    });
    const [history, setHistory] = useState([]);
    const [peakHours, setPeakHours] = useState([]);
    const [candidateMoments, setCandidateMoments] = useState([]);

    useEffect(() => {
        const seed = () => {
            const now = Date.now();
            const base = 42;
            const seeded = Array.from({ length: 20 }, (_, i) => ({
                ts: now - (19 - i) * 1000,
                y: base + i * 0.2,
            }));
            setSeries(seeded);
        };

        const seedHistory = () => {
            setHistory([
                {
                    title: "Commit vote",
                    time: "10:02",
                    meta: "user1@gmail.com",
                    tag: "Commit",
                },
                {
                    title: "Reveal vote",
                    time: "10:04",
                    meta: "user1@gmail.com",
                    tag: "Reveal",
                },
                {
                    title: "Commit vote",
                    time: "10:15",
                    meta: "user2@gmail.com",
                    tag: "Commit",
                },
                {
                    title: "Reveal vote",
                    time: "10:17",
                    meta: "user2@gmail.com",
                    tag: "Reveal",
                },
                {
                    title: "Commit vote",
                    time: "10:33",
                    meta: "user3@gmail.com",
                    tag: "Commit",
                },
            ]);
        };

        const seedPeaks = () => {
            setPeakHours([
                { label: "09:00-10:00", value: 42 },
                { label: "10:00-11:00", value: 78 },
                { label: "11:00-12:00", value: 51 },
                { label: "12:00-13:00", value: 63 },
                { label: "13:00-14:00", value: 48 },
            ]);
        };

        const seedCandidateMoments = () => {
            setCandidateMoments([
                {
                    name: "Pilihan A",
                    color: COLORS.accent,
                    slots: [
                        { label: "09:00", value: 12 },
                        { label: "10:00", value: 28 },
                        { label: "11:00", value: 19 },
                        { label: "12:00", value: 24 },
                    ],
                },
                {
                    name: "Pilihan B",
                    color: COLORS.warn,
                    slots: [
                        { label: "09:00", value: 9 },
                        { label: "10:00", value: 33 },
                        { label: "11:00", value: 22 },
                        { label: "12:00", value: 18 },
                    ],
                },
            ]);
        };

        seed();
        seedHistory();
        seedPeaks();
        seedCandidateMoments();

        const id = setInterval(() => {
            setSeries((prev) => {
                const current = prev.length ? prev[prev.length - 1].y : 50;
                const nextY = Math.max(
                    5,
                    Math.min(95, current + (Math.random() - 0.5) * 6),
                );
                const next = [...prev.slice(-19), { ts: Date.now(), y: nextY }];
                return next;
            });
            setSnapshot((prev) => {
                const jitter = () => (Math.random() - 0.5) * 0.02;
                let choiceA = Math.min(
                    0.85,
                    Math.max(0.15, prev.choiceA + jitter()),
                );
                let choiceB = 1 - choiceA;
                const turnout = Math.min(
                    1,
                    Math.max(0.1, prev.turnout + jitter()),
                );
                const throughput = Math.max(
                    5,
                    Math.min(120, prev.throughput + (Math.random() - 0.5) * 5),
                );
                const latency = Math.max(
                    0.6,
                    Math.min(3, prev.latency + (Math.random() - 0.5) * 0.1),
                );
                return { choiceA, choiceB, turnout, throughput, latency };
            });
        }, 1400);
        return () => clearInterval(id);
    }, []);

    const lastValue = useMemo(
        () => series[series.length - 1]?.y ?? 0,
        [series],
    );

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-32 -top-24 h-96 w-96 rounded-full bg-blue-500/25 blur-3xl" />
                <div className="absolute right-[-120px] top-40 h-96 w-96 rounded-full bg-cyan-400/20 blur-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.04)_1px,_transparent_0)] bg-[length:32px_32px]" />
            </div>

            <Navbar sticky />

            <main className="relative z-10 max-w-6xl mx-auto px-6 py-12 flex flex-col gap-10">
                <section className="grid gap-8 lg:grid-cols-[1.35fr_1fr] items-start">
                    <div className="p-7 rounded-3xl bg-white/5 border border-white/10 shadow-2xl shadow-blue-900/20">
                        <p className="text-xs uppercase tracking-[0.35em] text-blue-200/70">
                            Live preview
                        </p>
                        <h1 className="mt-3 text-3xl md:text-4xl font-semibold leading-tight">
                            Insight realtime sebelum login
                        </h1>
                        <p className="mt-3 text-slate-200/80 max-w-2xl">
                            Perlihatkan transparansi: pengguna publik dapat
                            melihat performa dan distribusi suara secara
                            langsung sebelum masuk. Saat data riil siap, tinggal
                            hubungkan ke endpoint backend atau WebSocket.
                        </p>
                        <div className="flex flex-wrap items-center gap-3 mt-6">
                            <Link
                                href="/login"
                                className="px-4 py-2.5 rounded-xl bg-blue-600 text-white font-semibold shadow-lg shadow-blue-900/40 hover:bg-blue-500 transition">
                                Login untuk berpartisipasi
                            </Link>
                            <Link
                                href="/vote"
                                className="px-4 py-2.5 rounded-xl border border-white/15 text-slate-50 hover:border-white/35 transition">
                                Buka dashboard vote
                            </Link>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400/10 text-emerald-200 text-xs border border-emerald-300/30">
                                <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                                Streaming mock · 1.4s
                            </div>
                        </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 shadow-lg shadow-blue-900/10">
                            <div className="text-sm text-slate-300">
                                TPS (tx per detik)
                            </div>
                            <div className="mt-1 text-3xl font-semibold text-white">
                                {snapshot.throughput.toFixed(0)}
                                <span className="text-sm text-slate-300 ml-1">
                                    tx/s
                                </span>
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                                Simulasi fluktuasi ±5 tx/s
                            </div>
                        </div>
                        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 shadow-lg shadow-cyan-900/10">
                            <div className="text-sm text-slate-300">
                                Latensi komit
                            </div>
                            <div className="mt-1 text-3xl font-semibold text-white">
                                {snapshot.latency.toFixed(2)}
                                <span className="text-sm text-slate-300 ml-1">
                                    detik
                                </span>
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                                Pembaruan tiap 1.4s (mock)
                            </div>
                        </div>
                        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 shadow-lg shadow-emerald-900/10">
                            <div className="text-sm text-slate-300">
                                Partisipasi sementara
                            </div>
                            <div className="mt-1 text-3xl font-semibold text-white">
                                {(snapshot.turnout * 100).toFixed(1)}%
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                                Belum terhubung data riil
                            </div>
                        </div>
                        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 shadow-lg shadow-amber-900/10">
                            <div className="text-sm text-slate-300">Status</div>
                            <div className="mt-1 text-lg font-semibold text-amber-200">
                                Mode demonstrasi
                            </div>
                            <div className="text-xs text-slate-400 mt-1">
                                Ganti ke API/WebSocket saat siap
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
                    <div className="rounded-3xl bg-white/5 border border-white/10 p-6 shadow-2xl shadow-blue-900/20">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <div className="text-sm text-slate-300">
                                    Throughput validator
                                </div>
                                <div className="text-lg font-semibold text-white">
                                    {lastValue.toFixed(1)} tx/s
                                </div>
                            </div>
                            <span className="px-2.5 py-1 rounded-full text-xs bg-blue-500/20 text-blue-100 border border-blue-300/30">
                                Mock stream
                            </span>
                        </div>
                        <Sparkline
                            points={series.map((p) => ({ x: p.ts, y: p.y }))}
                        />
                        <div className="text-xs text-slate-400 mt-3">
                            Ganti dengan data WebSocket/polling dari backend
                            ketika endpoint sudah tersedia.
                        </div>
                    </div>

                    <div className="rounded-3xl bg-white/5 border border-white/10 p-6 shadow-2xl shadow-amber-900/15 flex flex-col gap-4">
                        <div className="flex justify-between items-center">
                            <div>
                                <div className="text-sm text-slate-300">
                                    Distribusi pilihan
                                </div>
                                <div className="text-lg font-semibold text-white">
                                    Live mock
                                </div>
                            </div>
                            <div className="text-xs text-slate-400">
                                Total 100%
                            </div>
                        </div>
                        <Bar
                            label="Pilihan A"
                            value={snapshot.choiceA}
                            color={COLORS.accent}
                        />
                        <Bar
                            label="Pilihan B"
                            value={snapshot.choiceB}
                            color={COLORS.warn}
                        />
                        <div className="grid grid-cols-2 gap-3 text-sm text-slate-200/90">
                            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                                <div className="text-xs text-slate-400">
                                    Pilihan A
                                </div>
                                <div className="text-xl font-semibold text-white">
                                    {(snapshot.choiceA * 100).toFixed(1)}%
                                </div>
                            </div>
                            <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
                                <div className="text-xs text-slate-400">
                                    Pilihan B
                                </div>
                                <div className="text-xl font-semibold text-white">
                                    {(snapshot.choiceB * 100).toFixed(1)}%
                                </div>
                            </div>
                        </div>
                        <div className="text-xs text-slate-400">
                            Saat data riil tersedia, mapping-kan ke hasil tally
                            backend untuk transparansi publik.
                        </div>
                    </div>
                </section>

                <section className="rounded-3xl bg-white/5 border border-white/10 p-6 shadow-2xl shadow-emerald-900/15">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <div className="text-sm text-slate-300">
                                Kapan tiap kandidat dipilih
                            </div>
                            <div className="text-lg font-semibold text-white">
                                Distribusi waktu per kandidat
                            </div>
                        </div>
                        <div className="text-xs text-slate-400">
                            Mock, siap ganti data riil
                        </div>
                    </div>
                    <div className="grid gap-4 md:grid-cols-2">
                        {candidateMoments.map((cand) => (
                            <div
                                key={cand.name}
                                className="rounded-2xl bg-white/5 border border-white/10 p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2 text-slate-50 font-semibold">
                                        <span
                                            className="h-2.5 w-2.5 rounded-full"
                                            style={{ background: cand.color }}
                                        />
                                        {cand.name}
                                    </div>
                                    <span className="text-xs text-slate-400">
                                        Jumlah per jam
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    {cand.slots.map((s) => (
                                        <ThinBar
                                            key={s.label}
                                            label={s.label}
                                            value={s.value}
                                            max={40}
                                            color={cand.color}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="rounded-3xl bg-white/5 border border-white/10 p-6 shadow-2xl shadow-cyan-900/15">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <div className="text-sm text-slate-300">
                                Puncak waktu pemilihan
                            </div>
                            <div className="text-lg font-semibold text-white">
                                Grafik interval tersibuk
                            </div>
                        </div>
                        <div className="text-xs text-slate-400">
                            Jumlah transaksi per jam
                        </div>
                    </div>
                    <PeakChart data={peakHours} />
                </section>

                <section className="grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 shadow-lg shadow-blue-900/10">
                        <div className="text-sm text-slate-300">Transparan</div>
                        <div className="text-lg font-semibold text-white">
                            Publik bisa pantau langsung
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                            Optimalkan trust dengan membuka metrik performa
                            sebelum login.
                        </p>
                    </div>
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 shadow-lg shadow-emerald-900/10">
                        <div className="text-sm text-slate-300">Realtime</div>
                        <div className="text-lg font-semibold text-white">
                            Mock bisa diganti API
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                            Hubungkan ke REST polling atau WebSocket sesuai
                            pipeline data.
                        </p>
                    </div>
                    <div className="rounded-2xl bg-white/5 border border-white/10 p-4 shadow-lg shadow-amber-900/10">
                        <div className="text-sm text-slate-300">
                            Siap produksi
                        </div>
                        <div className="text-lg font-semibold text-white">
                            UI sudah responsif
                        </div>
                        <p className="mt-1 text-xs text-slate-400">
                            Layout responsif untuk desktop & mobile, siap
                            dipakai di landing.
                        </p>
                    </div>
                </section>

                <section className="rounded-3xl bg-white/5 border border-white/10 p-6 shadow-2xl shadow-blue-900/15">
                    <div className="flex justify-between items-center mb-4">
                        <div>
                            <div className="text-sm text-slate-300">
                                Riwayat transaksi
                            </div>
                            <div className="text-lg font-semibold text-white">
                                Commit & reveal terbaru
                            </div>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400">
                            <span>Urut waktu naik</span>
                            <Link
                                href="/transactions"
                                className="px-3 py-1.5 rounded-lg border border-white/15 text-slate-50 hover:border-white/35 transition">
                                Lainnya
                            </Link>
                        </div>
                    </div>
                    <DotList items={history.slice(0, 5)} />
                </section>
            </main>
        </div>
    );
}
