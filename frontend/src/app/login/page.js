"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
    Eye,
    EyeOff,
    Vote,
    Loader2,
    ShieldCheck,
    Activity,
} from "lucide-react";
import api from "../../lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const router = useRouter();

    const submit = async (e) => {
        e?.preventDefault();
        if (!email || !password)
            return toast.error("Email dan password harus diisi");
        try {
            setLoading(true);
            const res = await api.post("/login", { email, password });
            if (res.data?.ok) {
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("email", res.data.email);
                toast.success("Login berhasil");
                router.push("/");
            } else {
                toast.error(res.data?.error || "Login gagal");
            }
        } catch (err) {
            toast.error(err?.response?.data || err.message);
        } finally {
            setLoading(false);
        }
    };

    const fillDemo = () => {
        setEmail("user1@gmail.com");
        setPassword("123");
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
            <div className="pointer-events-none absolute inset-0">
                <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />
                <div className="absolute right-[-140px] top-20 h-[28rem] w-[28rem] rounded-full bg-cyan-400/15 blur-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.04)_1px,_transparent_0)] bg-[length:32px_32px]" />
            </div>

            <header className="relative z-10 border-b border-white/10 bg-slate-950/70 backdrop-blur">
                <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-semibold text-lg">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse" />
                        <span>e-Vote Secure Access</span>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="border-white/20 text-slate-50 hover:border-white/40"
                        onClick={() => router.push("/")}>
                        Kembali ke insight
                    </Button>
                </div>
            </header>

            <main className="relative z-10 max-w-5xl mx-auto px-6 py-10 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-center">
                <div className="space-y-5">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400/10 text-emerald-200 border border-emerald-300/30 text-xs">
                        <span className="h-2 w-2 rounded-full bg-emerald-300 animate-pulse" />
                        Live status: validator aktif
                    </div>
                    <h1 className="text-3xl md:text-4xl font-semibold leading-tight">
                        Transparansi realtime, akses aman
                    </h1>
                    <p className="text-slate-200/80 max-w-2xl">
                        Login untuk mulai voting. Metrik publik tetap dapat
                        dipantau di landing tanpa login, menjaga kepercayaan dan
                        keterbukaan.
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 shadow-lg shadow-blue-900/15 flex items-start gap-3">
                            <div className="mt-1 text-blue-200">
                                <ShieldCheck className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-sm text-slate-200 font-semibold">
                                    Akses terlindungi
                                </div>
                                <p className="text-xs text-slate-400">
                                    Token disimpan lokal, validasi di backend.
                                </p>
                            </div>
                        </div>
                        <div className="rounded-2xl bg-white/5 border border-white/10 p-4 shadow-lg shadow-cyan-900/15 flex items-start gap-3">
                            <div className="mt-1 text-cyan-200">
                                <Activity className="h-5 w-5" />
                            </div>
                            <div>
                                <div className="text-sm text-slate-200 font-semibold">
                                    Sinkron dengan insight
                                </div>
                                <p className="text-xs text-slate-400">
                                    Konsisten dengan gaya landing realtime.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <Card className="relative border border-white/15 bg-white/5 backdrop-blur-xl shadow-2xl shadow-blue-900/30">
                    <CardHeader className="space-y-2 pb-4">
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-blue-600 shadow-lg shadow-blue-900/30">
                                <Vote className="h-5 w-5 text-white" />
                            </div>
                            <div>
                                <div className="text-xs uppercase tracking-[0.28em] text-blue-200/80">
                                    Login
                                </div>
                                <CardTitle className="text-xl font-semibold text-white">
                                    Masuk ke e-Vote
                                </CardTitle>
                            </div>
                        </div>
                        <CardDescription className="text-slate-300">
                            Gunakan kredensial terdaftar. Tidak punya akun?
                            Hubungi admin.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form onSubmit={submit} className="space-y-5">
                            <div className="space-y-1.5">
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="email@contoh.com"
                                    autoComplete="email"
                                    required
                                    className="h-10 bg-white/5 border-white/15 text-slate-50 placeholder:text-slate-400"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="password">Password</Label>
                                <div className="relative">
                                    <Input
                                        id="password"
                                        type={showPwd ? "text" : "password"}
                                        value={password}
                                        onChange={(e) =>
                                            setPassword(e.target.value)
                                        }
                                        placeholder="••••••••"
                                        autoComplete="current-password"
                                        required
                                        className="h-10 pr-10 bg-white/5 border-white/15 text-slate-50 placeholder:text-slate-400"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPwd((s) => !s)}
                                        className="absolute inset-y-0 right-0 flex items-center px-3 text-slate-400 hover:text-slate-100 transition-colors"
                                        aria-label={
                                            showPwd
                                                ? "Sembunyikan password"
                                                : "Tampilkan password"
                                        }>
                                        {showPwd ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                disabled={loading}
                                className="w-full h-10 font-semibold bg-blue-600 hover:bg-blue-500 text-white">
                                {loading ? (
                                    <>
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        Memproses...
                                    </>
                                ) : (
                                    "Masuk"
                                )}
                            </Button>

                            <div className="flex items-center gap-3">
                                <div className="flex-1 h-px bg-white/10" />
                                <span className="text-xs text-slate-400">
                                    atau
                                </span>
                                <div className="flex-1 h-px bg-white/10" />
                            </div>

                            <div className="flex gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="flex-1 h-9 text-sm border-white/20 text-slate-50 hover:border-white/40"
                                    onClick={fillDemo}>
                                    Isi Demo
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="flex-1 h-9 text-sm text-slate-300 hover:text-white"
                                    onClick={() => {
                                        setEmail("");
                                        setPassword("");
                                    }}>
                                    Bersihkan
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
