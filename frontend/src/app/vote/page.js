"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
    ArrowRight,
    CheckCircle2,
    Loader2,
    Lock,
    ShieldCheck,
    Sparkles,
} from "lucide-react";
import Navbar from "../components/Navbar";
import ParallaxGlow from "../components/ParallaxGlow";
import ScrollReveal from "../components/ScrollReveal";
import api from "@/lib/api";

const candidates = [
    {
        id: "cand-a",
        name: "Kandidat A",
        tagline: "Ekonomi digital & inovasi pendidikan",
        agenda: [
            "Skill workshop gratis 100k orang",
            "Platform e-learning terpadu nasional",
            "Inkubator startup dengan venture capital",
        ],
        color: "from-blue-600/70 via-blue-500/70 to-cyan-400/70",
    },
    {
        id: "cand-b",
        name: "Kandidat B",
        tagline: "Inklusi sosial & pemberdayaan komunitas",
        agenda: [
            "Program dana mikro UMKM",
            "Klinik keliling prioritas",
            "Beasiswa vokasi untuk talenta muda",
        ],
        color: "from-emerald-600/70 via-emerald-500/70 to-green-400/70",
    },
    {
        id: "cand-c",
        name: "Kandidat C",
        tagline: "Infrastruktur hijau & mobilitas cerdas",
        agenda: [
            "Fase bus listrik",
            "Penambahan ruang hijau 15%",
            "Sensor lalu lintas adaptif",
        ],
        color: "from-purple-600/70 via-indigo-500/70 to-blue-400/70",
    },
];

function StatusBadge({ icon: Icon, text, tone = "info" }) {
    const toneClass = {
        info: "bg-white/5 text-slate-200 border-white/15",
        success: "bg-emerald-500/15 text-emerald-100 border-emerald-400/30",
        warn: "bg-amber-500/15 text-amber-100 border-amber-400/30",
    }[tone];
    return (
        <span
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs ${toneClass}`}>
            {Icon ? <Icon className="h-4 w-4" /> : null}
            {text}
        </span>
    );
}

function CandidateCard({ data, selected, onSelect }) {
    const active = selected === data.id;
    return (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-blue-900/20 flex flex-col gap-3">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <div className="text-xs uppercase tracking-[0.28em] text-slate-300">
                        Kandidat
                    </div>
                    <div className="text-xl font-semibold text-white">
                        {data.name}
                    </div>
                    <div className="text-sm text-slate-300 mt-1">
                        {data.tagline}
                    </div>
                </div>
                <div
                    className={`h-12 w-12 rounded-xl bg-gradient-to-br ${data.color} border border-white/20 flex items-center justify-center text-white font-semibold`}
                    aria-hidden>
                    {data.name.slice(-1)}
                </div>
            </div>
            <div className="space-y-2 text-sm text-slate-200">
                {data.agenda.map((point) => (
                    <div
                        key={point}
                        className="flex items-start gap-2 text-slate-200">
                        <span className="mt-1 h-1.5 w-1.5 rounded-full bg-white/70" />
                        <span>{point}</span>
                    </div>
                ))}
            </div>
            <button
                type="button"
                onClick={() => onSelect(data.id)}
                className={`mt-auto inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition border ${
                    active
                        ? "bg-blue-600 text-white border-blue-500"
                        : "border-white/15 text-slate-50 hover:border-white/35"
                }`}>
                {active ? "Dipilih" : "Pilih kandidat"}
                {active ? (
                    <CheckCircle2 className="h-4 w-4" />
                ) : (
                    <ArrowRight className="h-4 w-4" />
                )}
            </button>
        </div>
    );
}

function StageItem({ label, active, done, icon: Icon }) {
    return (
        <div
            className={`flex items-center gap-3 rounded-xl border px-3 py-2 text-sm transition ${
                done
                    ? "border-emerald-300/40 bg-emerald-500/10 text-emerald-100"
                    : active
                      ? "border-blue-300/40 bg-blue-500/10 text-blue-100"
                      : "border-white/15 bg-white/5 text-slate-200"
            }`}>
            <div
                className={`h-9 w-9 rounded-lg flex items-center justify-center border ${
                    done
                        ? "border-emerald-300/50 bg-emerald-500/20"
                        : active
                          ? "border-blue-300/50 bg-blue-500/20"
                          : "border-white/15 bg-white/5"
                }`}>
                <Icon className="h-4 w-4" />
            </div>
            <div className="flex-1 font-medium">{label}</div>
            {done ? (
                <span className="text-xs text-emerald-100">Selesai</span>
            ) : active ? (
                <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
        </div>
    );
}

export default function VotePage() {
    const router = useRouter();
    // checkingAuth tetap true hingga status on-chain selesai dicek
    const [checkingAuth, setCheckingAuth] = useState(true);
    const [selected, setSelected] = useState(null);
    const [loadingStage, setLoadingStage] = useState(null);
    const [committed, setCommitted] = useState(false);
    const [revealed, setRevealed] = useState(false);
    const [salt, setSalt] = useState("");
    const [tally, setTally] = useState(null);
    const [statusLoading, setStatusLoading] = useState(false);
    const [hasVoted, setHasVoted] = useState(null); // null = belum tahu dari chain
    const [userEmail, setUserEmail] = useState(null);
    const alertedRef = useRef(false);

    const voteKey = (email) => (email ? `hasVoted:${email}` : null);
    const readStoredVote = (email) => {
        const key = voteKey(email);
        if (!key || typeof window === "undefined") return false;
        return localStorage.getItem(key) === "true";
    };
    const writeStoredVote = (email, value) => {
        const key = voteKey(email);
        if (!key || typeof window === "undefined") return;
        if (value) {
            localStorage.setItem(key, "true");
        } else {
            localStorage.removeItem(key);
        }
    };

    const unauthorized = (err) =>
        err?.response?.status === 401 || err?.response?.status === 403;

    // refreshStatus hanya untuk tombol "Segarkan status", bukan initial load
    const refreshStatus = async (emailOverride = null) => {
        const emailToUse = emailOverride ?? userEmail;
        try {
            setStatusLoading(true);
            const res = await api.get("/vote/status");
            const committedOnChain = Boolean(res.data?.committed);
            if (committedOnChain) {
                setCommitted(true);
                setHasVoted(true);
                writeStoredVote(emailToUse, true);
            } else {
                setHasVoted(false);
                if (emailToUse) writeStoredVote(emailToUse, false);
            }
            if (res.data?.revealed) setRevealed(true);
        } catch (err) {
            if (unauthorized(err)) {
                toast.error("Sesi berakhir, silakan login ulang");
                router.replace("/login?next=/vote");
                return;
            }
            const msg = err?.response?.data || err.message;
            toast.error(typeof msg === "string" ? msg : "Gagal cek status");
        } finally {
            setStatusLoading(false);
        }
    };

    const refreshTally = async () => {
        try {
            const res = await api.get("/tally");
            setTally(res.data);
        } catch (err) {
            const msg = err?.response?.data || err.message;
            toast.error(typeof msg === "string" ? msg : "Gagal ambil tally");
        }
    };

    useEffect(() => {
        if (typeof window === "undefined") return;
        const token = localStorage.getItem("token");
        if (!token) {
            router.replace("/login?next=/vote");
            return;
        }
        const email = localStorage.getItem("email") || null;
        setUserEmail(email);

        // Cek status on-chain dulu, baru tampilkan halaman
        const init = async () => {
            // Jika cache lokal sudah ada (di-set saat login), langsung tampilkan
            if (readStoredVote(email)) {
                setHasVoted(true);
                setCheckingAuth(false); // tampilkan halaman segera
                alertedRef.current = true;
                // Tetap sync dengan backend di background (non-blocking)
                api.get("/vote/status").then((res) => {
                    if (res.data?.committed) {
                        setCommitted(true);
                        setRevealed(Boolean(res.data?.revealed));
                    }
                }).catch(() => {/* abaikan error background */});
                return;
            }
            try {
                const res = await api.get("/vote/status");
                const committedOnChain = Boolean(res.data?.committed);
                if (committedOnChain) {
                    setCommitted(true);
                    setHasVoted(true);
                    writeStoredVote(email, true);
                    if (!alertedRef.current) {
                        toast.success(
                            "Anda sudah melakukan vote. Hanya 1 kali per user.",
                        );
                        alertedRef.current = true;
                    }
                } else {
                    setHasVoted(false);
                }
                if (res.data?.revealed) setRevealed(true);
            } catch (err) {
                if (
                    err?.response?.status === 401 ||
                    err?.response?.status === 403
                ) {
                    toast.error("Sesi berakhir, silakan login ulang");
                    router.replace("/login?next=/vote");
                    return;
                }
                setHasVoted(false);
                toast.error("Gagal cek status voting dari blockchain");
            } finally {
                setCheckingAuth(false);
            }
        };

        init();
        refreshTally();
    }, [router]);

    const submitVote = async () => {
        if (!selected) {
            toast.error("Pilih kandidat terlebih dulu");
            return;
        }
        if (hasVoted) {
            toast.error("Anda sudah melakukan vote. Hanya 1 kali per user.");
            return;
        }
        try {
            setLoadingStage("commit");
            const commitRes = await api.post("/vote/commit", {
                choice: selected,
            });
            const nextSalt = commitRes.data?.salt || "demo_salt";
            setSalt(nextSalt);
            setCommitted(true);
            setHasVoted(true);
            writeStoredVote(userEmail, true);
            toast.success("Commit berhasil");

            setLoadingStage("reveal");
            await api.post("/vote/reveal", {
                choice: selected,
                salt: nextSalt,
            });
            setRevealed(true);
            toast.success("Reveal berhasil");
            refreshTally();
        } catch (err) {
            if (unauthorized(err)) {
                toast.error("Sesi berakhir, silakan login ulang");
                router.replace("/login?next=/vote");
                return;
            }
            const msg = err?.response?.data || err.message;
            toast.error(typeof msg === "string" ? msg : "Vote gagal");
        } finally {
            setLoadingStage(null);
        }
    };

    const tallyText = useMemo(() => {
        if (!tally) return "Belum ada data";
        try {
            const raw = tally?.result?.response?.value;
            if (raw) {
                const decoded = atob(raw);
                return decoded || "Belum ada data";
            }
            return JSON.stringify(tally, null, 2);
        } catch (err) {
            return JSON.stringify(tally, null, 2);
        }
    }, [tally]);

    if (checkingAuth) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-50">
                <div className="flex flex-col items-center gap-3 text-sm text-slate-200">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-400" />
                    <span>Memeriksa status voting...</span>
                    <span className="text-xs text-slate-400">
                        Menghubungi blockchain...
                    </span>
                </div>
            </div>
        );
    }

    // Tampilan khusus jika sudah pernah voting
    if (hasVoted) {
        return (
            <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-x-hidden">
                <ParallaxGlow />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.04)_1px,_transparent_0)] bg-[length:32px_32px]" />
                <Navbar />
                <main className="relative z-10 max-w-6xl mx-auto px-6 py-10 flex items-center justify-center min-h-[80vh]">
                    <div className="rounded-3xl border border-emerald-400/30 bg-emerald-500/10 shadow-2xl shadow-emerald-900/30 p-10 flex flex-col items-center gap-5 max-w-md w-full text-center">
                        <div className="h-16 w-16 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center">
                            <CheckCircle2 className="h-8 w-8 text-emerald-300" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-semibold text-emerald-100">
                                Suara Anda Sudah Tercatat
                            </h2>
                            <p className="text-sm text-emerald-200/70 mt-2">
                                Anda sudah melakukan voting. Setiap user hanya
                                diperbolehkan 1 kali vote dan tidak dapat
                                diubah.
                            </p>
                        </div>
                        <div className="w-full rounded-xl border border-emerald-300/30 bg-emerald-500/10 px-4 py-3 text-xs text-emerald-200 flex items-center gap-2">
                            <ShieldCheck className="h-4 w-4 shrink-0" />
                            Status ini diverifikasi langsung dari blockchain.
                        </div>
                        <button
                            type="button"
                            onClick={refreshStatus}
                            disabled={statusLoading}
                            className="text-xs text-blue-200 hover:text-white border border-white/15 px-4 py-2 rounded-lg transition disabled:opacity-50">
                            {statusLoading
                                ? "Memeriksa..."
                                : "Verifikasi ulang"}
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-50 relative overflow-x-hidden">
            <ParallaxGlow />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.04)_1px,_transparent_0)] bg-[length:32px_32px]" />

            <Navbar />

            <main className="relative z-10 max-w-6xl mx-auto px-6 py-10 flex flex-col gap-10">
                <ScrollReveal>
                    <section className="rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-blue-900/20 p-6 flex flex-col gap-4">
                        <div className="flex flex-wrap items-center justify-between gap-3">
                            <div>
                                <p className="text-xs uppercase tracking-[0.32em] text-blue-200/70">
                                    Voting
                                </p>
                                <h1 className="text-3xl font-semibold">
                                    Pilih kandidat dan kirim suara
                                </h1>
                                <p className="text-slate-300 text-sm mt-2 max-w-2xl">
                                    Halaman ini hanya untuk user yang sudah
                                    login. Proses commit dan reveal dikirim ke
                                    backend menggunakan token yang tersimpan di
                                    browser.
                                </p>
                            </div>
                            <div className="flex flex-wrap items-center gap-2">
                                <StatusBadge
                                    icon={ShieldCheck}
                                    text="Autentikasi aktif"
                                    tone="success"
                                />
                                <StatusBadge
                                    icon={Lock}
                                    text={
                                        committed
                                            ? "Commit tersimpan"
                                            : "Belum commit"
                                    }
                                    tone={committed ? "success" : "info"}
                                />
                                <StatusBadge
                                    icon={Sparkles}
                                    text={
                                        revealed
                                            ? "Sudah reveal"
                                            : "Menunggu reveal"
                                    }
                                    tone={revealed ? "success" : "info"}
                                />
                            </div>
                        </div>
                    </section>
                </ScrollReveal>

                <ScrollReveal delay={0.06}>
                    <section className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-slate-300">
                                    Pilih kandidat
                                </div>
                                <button
                                    type="button"
                                    onClick={refreshStatus}
                                    className="text-xs text-blue-200 hover:text-white border border-white/15 px-3 py-1.5 rounded-lg">
                                    {statusLoading
                                        ? "Mengecek..."
                                        : "Segarkan status"}
                                </button>
                            </div>
                            <div className="grid gap-4 md:grid-cols-2">
                                {candidates.map((cand) => (
                                    <CandidateCard
                                        key={cand.id}
                                        data={cand}
                                        selected={selected}
                                        onSelect={setSelected}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-blue-900/20 flex flex-col gap-4">
                            <div className="flex items-center gap-2 text-sm text-slate-200 font-semibold">
                                <div className="h-9 w-9 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-900/40">
                                    <Lock className="h-4 w-4" />
                                </div>
                                Kirim suara
                            </div>
                            <div className="space-y-2 text-sm text-slate-300">
                                <p>
                                    Kandidat dipilih:{" "}
                                    <span className="font-semibold text-white">
                                        {selected
                                            ? candidates.find(
                                                  (c) => c.id === selected,
                                              )?.name
                                            : "Belum dipilih"}
                                    </span>
                                </p>
                                <p>
                                    Token tersimpan akan dikirim sebagai
                                    Authorization header.
                                </p>
                                {salt ? (
                                    <p className="text-xs text-slate-400">
                                        Salt terakhir: {salt}
                                    </p>
                                ) : null}
                            </div>
                            <div className="space-y-3">
                                <StageItem
                                    label="Commit vote"
                                    active={loadingStage === "commit"}
                                    done={committed}
                                    icon={ShieldCheck}
                                />
                                <StageItem
                                    label="Reveal vote"
                                    active={loadingStage === "reveal"}
                                    done={revealed}
                                    icon={CheckCircle2}
                                />
                                {hasVoted ? (
                                    <div className="rounded-lg border border-emerald-300/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
                                        Anda sudah melakukan vote. Pengiriman
                                        dinonaktifkan (1x per user).
                                    </div>
                                ) : null}
                            </div>
                            <button
                                type="button"
                                onClick={submitVote}
                                disabled={
                                    loadingStage !== null ||
                                    !selected ||
                                    hasVoted !== false ||
                                    statusLoading
                                }
                                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 text-white font-semibold px-4 py-2.5 hover:bg-blue-500 transition disabled:opacity-60">
                                {loadingStage ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        {loadingStage === "commit"
                                            ? "Mengirim commit..."
                                            : "Mengirim reveal..."}
                                    </>
                                ) : hasVoted ? (
                                    "Sudah voting"
                                ) : statusLoading || hasVoted === null ? (
                                    "Memeriksa status..."
                                ) : (
                                    "Commit & Reveal"
                                )}
                            </button>
                        </div>
                    </section>
                </ScrollReveal>

                <ScrollReveal delay={0.1}>
                    <section className="grid gap-4 md:grid-cols-[1.2fr_1fr]">
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4 shadow-lg shadow-blue-900/20">
                            <div className="flex items-center justify-between gap-2">
                                <div className="text-sm font-semibold text-white">
                                    Snapshot hasil (tally)
                                </div>
                                <button
                                    type="button"
                                    onClick={refreshTally}
                                    className="text-xs text-blue-200 hover:text-white border border-white/15 px-3 py-1.5 rounded-lg">
                                    Segarkan tally
                                </button>
                            </div>
                            <pre className="mt-3 rounded-xl bg-slate-900/70 border border-white/10 p-3 text-xs text-slate-200 overflow-x-auto whitespace-pre-wrap">
                                {tallyText}
                            </pre>
                        </div>
                        <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-blue-900/40 via-slate-900/60 to-slate-900/70 p-4 shadow-lg shadow-blue-900/25">
                            <div className="flex items-center gap-2 text-sm font-semibold text-white">
                                <Sparkles className="h-4 w-4" />
                                Tips cepat
                            </div>
                            <ul className="mt-3 space-y-2 text-sm text-slate-200 list-disc list-inside">
                                <li>
                                    Setiap user hanya boleh satu kali commit.
                                </li>
                                <li>Reveal otomatis setelah commit sukses.</li>
                                <li>
                                    Jika token kedaluwarsa, login ulang untuk
                                    mengirim suara.
                                </li>
                            </ul>
                        </div>
                    </section>
                </ScrollReveal>
            </main>
        </div>
    );
}
