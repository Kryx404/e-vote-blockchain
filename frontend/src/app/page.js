"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
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

    useEffect(() => {
        const t = localStorage.getItem("token");
        const e = localStorage.getItem("email");
        if (!t) {
            router.push("/login");
        } else {
            setEmail(e);
        }
    }, [router]);

    // Tambah: fungsi logout
    const handleLogout = () => {
        try {
            localStorage.removeItem("token");
            localStorage.removeItem("email");
        } catch {}
        setEmail("");
        toast.success("Logged out");
        router.push("/login");
    };

    const commit = async () => {
        if (!credId || !choice)
            return toast.error("Isi CredID dan Choice dulu");
        try {
            setLoading(true);
            const r = await api.post("/vote/commit", {
                cred_id: credId,
                choice: choice,
            });
            setSalt(r.data.salt);
            toast.success("Commit OK. Simpan salt: " + r.data.salt);
        } catch (e) {
            toast.error(e?.response?.data || e.message);
        } finally {
            setLoading(false);
        }
    };

    const reveal = async () => {
        if (!credId || !choice || !salt)
            return toast.error("CredID, Choice dan Salt harus diisi");
        try {
            setLoading(true);
            await api.post("/vote/reveal", {
                cred_id: credId,
                salt: salt,
                choice: choice,
            });
            toast.success("Reveal OK");
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

                <label className="block text-sm font-medium">CredID</label>
                <input
                    className="mt-1 mb-3 block w-full rounded border px-3 py-2 focus:outline-none focus:ring"
                    placeholder="masukkan cred id..."
                    value={credId}
                    onChange={(e) => setCredId(e.target.value)}
                />

                <label className="block text-sm font-medium">Choice</label>
                <select
                    className="mt-1 mb-3 block w-32 rounded border px-3 py-2"
                    value={choice}
                    onChange={(e) => setChoice(e.target.value)}>
                    <option value="A">A</option>
                    <option value="B">B</option>
                </select>

                <div className="flex gap-2 mb-4">
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
                        onClick={commit}
                        disabled={loading}>
                        Commit
                    </button>
                    <button
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-60"
                        onClick={reveal}
                        disabled={loading || !salt}>
                        Reveal
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
