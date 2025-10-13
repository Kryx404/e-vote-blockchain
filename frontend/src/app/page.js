"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Swal from "sweetalert2";
import api from "../lib/api";
const base = "/api/v1";

export default function Home() {
    const router = useRouter();
    const [credId, setCredId] = useState("");
    const [choice, setChoice] = useState("A");
    const [salt, setSalt] = useState("");
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [email, setEmail] = useState("");
    const [hasCommitted, setHasCommitted] = useState(false);
    const [statusLoading, setStatusLoading] = useState(true); // Status loading state

    useEffect(() => {
        const checkStatusWithToken = async (retryCount = 0) => {
            // set true hanya saat first try
            if (retryCount === 0) setStatusLoading(true);

            const token = localStorage.getItem("token");
            if (!token) {
                router.push("/login");
                return;
            }

            try {
                console.log(`Cek status on-chain (try ${retryCount + 1})`);
                // pakai timeout lebih pendek untuk status (override axios timeout)
                const res = await api.get(`/vote/status?_t=${Date.now()}`, {
                    timeout: 3000,
                });
                console.log("Status response:", res.data);
                if (res?.data?.ok) {
                    setHasCommitted(!!res.data.committed);
                    // segera hentikan loading setelah dapat hasil
                    setStatusLoading(false);
                    return;
                }
            } catch (err) {
                console.warn(
                    "Cek status error:",
                    err?.response?.data || err?.message,
                );
                // jika masih bisa retry, lakukan background retry singkat
                if (retryCount < 2) {
                    setTimeout(() => checkStatusWithToken(retryCount + 1), 800);
                    return;
                }
            } finally {
                // pastikan loading dimatikan setelah beberapa percobaan
                setStatusLoading(false);
            }
        };

        // jalankan segera (hapus delay 500ms)
        const t = localStorage.getItem("token");
        const e = localStorage.getItem("email");
        if (!t) {
            router.push("/login");
            return;
        }
        setEmail(e);
        checkStatusWithToken();

        const handleFocus = () => {
            if (document.visibilityState === "visible") checkStatusWithToken();
        };
        document.addEventListener("visibilitychange", handleFocus);
        return () =>
            document.removeEventListener("visibilitychange", handleFocus);
    }, [router]);

    // Logout handler
    const handleLogout = () => {
        try {
            localStorage.removeItem("token");
            localStorage.removeItem("email");
        } catch {}
        setEmail("");
        setHasCommitted(false);
        setStatusLoading(true);
        toast.success("Logged out");
        router.push("/login");
    };

    const commit = async () => {
        if (statusLoading) {
            toast.error("Sedang memeriksa status, tunggu sebentar");
            return;
        }

        if (hasCommitted) {
            toast.error("Sudah commit on-chain - tidak bisa commit lagi");
            return;
        }

        if (!choice) {
            toast.error("Pilih choice dulu");
            return;
        }

        // SweetAlert confirmation popup
        const result = await Swal.fire({
            title: "Konfirmasi Pilihan",
            html: `
                <div style="text-align: center; padding: 20px;">
                    <div style="font-size: 18px; margin-bottom: 15px;">
                        Apakah Anda yakin memilih:
                    </div>
                    <div style="font-size: 32px; font-weight: bold; color: #3085d6; margin-bottom: 15px;">
                        ${choice}
                    </div>
                    <div style="font-size: 14px; color: #666;">
                        Setelah konfirmasi, sistem akan otomatis melakukan commit dan reveal
                    </div>
                </div>
            `,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Ya, saya yakin!",
            cancelButtonText: "Batal",
            reverseButtons: true,
            customClass: {
                popup: "swal-wide",
            },
        });

        // Jika user membatalkan, keluar dari fungsi
        if (!result.isConfirmed) {
            return;
        }

        try {
            setLoading(true);

            // Double-check status before trying commit
            const statusRes = await api.get(`/vote/status?_t=${Date.now()}`);
            if (statusRes?.data?.ok && statusRes.data.committed) {
                setHasCommitted(true);
                toast.error("Sudah commit on-chain");
                return;
            }

            // Proceed with commit if not already committed
            const r = await api.post("/vote/commit", { choice });
            if (r?.data?.ok) {
                setSalt(r.data.salt);
                setHasCommitted(true);
                toast.success("Commit OK. Simpan salt: " + r.data.salt);

                // Show success popup dan auto reveal
                Swal.fire({
                    title: "Commit Berhasil!",
                    html: `
                        <div style="text-align: center;">
                            <div style="margin-bottom: 15px;">✅ Vote Anda berhasil di-commit</div>
                            <div style="margin-bottom: 15px;">🔐 Salt: <code>${r.data.salt}</code></div>
                            <div style="color: #666;">Sedang melakukan auto reveal...</div>
                        </div>
                    `,
                    icon: "success",
                    timer: 3000,
                    timerProgressBar: true,
                    showConfirmButton: false,
                });

                // Auto reveal setelah commit berhasil
                setTimeout(async () => {
                    try {
                        await autoReveal(r.data.salt, choice);
                    } catch (error) {
                        console.error("Auto reveal failed:", error);
                        toast.error("Auto reveal gagal, silakan reveal manual");
                    }
                }, 1500); // Delay 1.5 detik untuk memberikan waktu commit selesai
            } else {
                toast.error(r?.data?.error || "Commit gagal");
                if (r?.data?.committed) {
                    setHasCommitted(true);
                }
            }
        } catch (e) {
            const msg = e?.response?.data || e?.message || "Commit gagal";
            toast.error(msg);
            if (e?.response?.status === 400) {
                setHasCommitted(true);
            }
        } finally {
            setLoading(false);
        }
    };

    // Fungsi auto reveal
    const autoReveal = async (saltValue, choiceValue) => {
        try {
            const r = await api.post("/vote/reveal", {
                salt: saltValue,
                choice: choiceValue,
            });

            if (r?.data?.ok) {
                // Show final success popup
                Swal.fire({
                    title: "Vote Selesai!",
                    html: `
                        <div style="text-align: center;">
                            <div style="font-size: 24px; margin-bottom: 15px;">🎉</div>
                            <div style="margin-bottom: 10px;">✅ Commit berhasil</div>
                            <div style="margin-bottom: 15px;">✅ Reveal berhasil</div>
                            <div style="color: #666; font-size: 14px;">
                                Vote Anda sudah tercatat di blockchain!
                            </div>
                        </div>
                    `,
                    icon: "success",
                    timer: 4000,
                    timerProgressBar: true,
                    showConfirmButton: false,
                });
                toast.success("Auto Reveal berhasil! Vote selesai 🎉");
            } else {
                toast.error(r?.data?.error || "Auto Reveal gagal");
            }
        } catch (e) {
            toast.error(
                "Auto Reveal error: " + (e?.response?.data || e.message),
            );
            throw e; // Re-throw untuk handling di commit()
        }
    };

    const reveal = async () => {
        if (statusLoading)
            return toast.error("Sedang memeriksa status, tunggu sebentar");
        if (!choice || !salt) return toast.error("Choice dan Salt harus diisi");
        if (!hasCommitted) return toast.error("Kamu harus commit dulu");
        try {
            setLoading(true);
            const r = await api.post("/vote/reveal", {
                salt,
                choice,
            });
            if (r?.data?.ok) {
                toast.success("Reveal OK");
            } else {
                toast.error(r?.data?.error || "Reveal gagal");
            }
        } catch (e) {
            toast.error(e?.response?.data || e.message);
        } finally {
            setLoading(false);
        }
    };

    const getTally = async () => {
        try {
            setLoading(true);
            const r = await api.get("/tally");
            const b64 = r.data?.result?.response?.value || "";
            setResult(b64 ? JSON.parse(atob(b64)) : r.data);
            toast.success("Tally diperbarui");
        } catch (e) {
            toast.error(e?.response?.data || e.message);
        } finally {
            setLoading(false);
        }
    };

    const copySalt = async () => {
        try {
            await navigator.clipboard.writeText(salt);
            toast.success("Salt disalin ke clipboard");
        } catch {
            toast.error("Gagal menyalin");
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <div className="w-full max-w-xl bg-white shadow-md rounded-lg p-6 text-black">
                {/* Header */}
                <div className="flex justify-between items-center mb-4">
                    <h1 className="text-2xl font-semibold">Blockchain demo</h1>
                    <div className="text-sm">
                        {email && <span className="mr-3">Hi, {email}</span>}
                        <button
                            onClick={handleLogout}
                            className="text-xs underline">
                            Logout
                        </button>
                    </div>
                </div>

                {/* Choice selector */}
                <label className="block text-sm font-medium">Choice</label>
                <select
                    className="mt-1 mb-3 block w-32 rounded border px-3 py-2"
                    value={choice}
                    onChange={(e) => setChoice(e.target.value)}>
                    <option value="A">A</option>
                    <option value="B">B</option>
                </select>

                {/* Status indicator */}
                <div className="mb-3 text-sm">
                    {statusLoading ? (
                        <span className="text-gray-500">
                            <span className="inline-block mr-2 w-4 h-4 border-2 border-t-transparent border-gray-500 rounded-full animate-spin"></span>
                            Memeriksa status voting...
                        </span>
                    ) : hasCommitted ? (
                        <span className="text-green-600">
                            Status: Sudah commit (on-chain)
                        </span>
                    ) : (
                        <span className="text-gray-600">
                            Status: Belum commit
                        </span>
                    )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 mb-4">
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
                        onClick={commit}
                        disabled={loading || hasCommitted || statusLoading}>
                        Commit
                    </button>
                   
                    <button
                        className="bg-gray-700 text-white px-4 py-2 rounded hover:bg-gray-800 disabled:opacity-60"
                        onClick={getTally}
                        disabled={loading}>
                        Get Tally
                    </button>
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium">
                        Salt (simpan)
                    </label>
                    <div className="flex gap-2 mt-1">
                        <input
                            className="flex-1 rounded border px-3 py-2"
                            value={salt}
                            onChange={(e) => setSalt(e.target.value)}
                            placeholder="salt akan terisi setelah commit"
                        />
                        <button
                            className="bg-indigo-600 text-white px-3 py-2 rounded hover:bg-indigo-700"
                            onClick={copySalt}
                            disabled={!salt}>
                            Copy
                        </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">
                        Result / Tally
                    </label>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto max-h-48">
                        {result
                            ? JSON.stringify(result, null, 2)
                            : "Belum ada hasil"}
                    </pre>
                </div>
            </div>
        </div>
    );
}
