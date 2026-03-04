"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import toast from "react-hot-toast";
import { Sun, Moon, Eye, EyeOff, Vote, Loader2 } from "lucide-react";
import api from "../../lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPwd, setShowPwd] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { theme, setTheme } = useTheme();
    const router = useRouter();

    useEffect(() => setMounted(true), []);

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

    const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

    return (
        <div className="relative min-h-screen flex items-center justify-center p-6 transition-colors duration-300 bg-gradient-to-br from-slate-100 via-indigo-50 to-purple-50 dark:from-slate-950 dark:via-indigo-950 dark:to-purple-950">
            {/* Decorative blobs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-24 -left-24 h-96 w-96 rounded-full bg-indigo-400/20 dark:bg-indigo-600/15 blur-3xl animate-pulse" />
                <div className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full bg-violet-400/20 dark:bg-violet-600/15 blur-3xl animate-pulse [animation-delay:2s]" />
            </div>

            {/* Theme toggle */}
            <div className="absolute top-4 right-4">
                {mounted && (
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={toggleTheme}
                        className="rounded-full border-border/50 bg-background/70 backdrop-blur-sm shadow-sm hover:bg-accent transition-all"
                        aria-label="Toggle theme"
                    >
                        {theme === "dark" ? (
                            <Sun className="h-4 w-4 text-yellow-500" />
                        ) : (
                            <Moon className="h-4 w-4 text-indigo-600" />
                        )}
                    </Button>
                )}
            </div>

            {/* Login card */}
            <Card className="relative w-full max-w-md border border-border/50 bg-background/80 backdrop-blur-xl shadow-2xl animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
                <CardHeader className="space-y-3 pb-4">
                    {/* Logo */}
                    <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-primary shadow-lg shadow-primary/25 mb-2">
                        <Vote className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight">Selamat datang</CardTitle>
                    <CardDescription>
                        Masuk ke akun <span className="font-medium text-primary">e-Vote</span> Anda
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={submit} className="space-y-5">
                        {/* Email */}
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
                                className="h-10"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-1.5">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPwd ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    required
                                    className="h-10 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPwd((s) => !s)}
                                    className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground transition-colors"
                                    aria-label={showPwd ? "Sembunyikan password" : "Tampilkan password"}
                                >
                                    {showPwd ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <Button type="submit" disabled={loading} className="w-full h-10 font-semibold">
                            {loading ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Memproses...
                                </>
                            ) : (
                                "Masuk"
                            )}
                        </Button>

                        {/* Divider + secondary actions */}
                        <div className="flex items-center gap-3">
                            <div className="flex-1 h-px bg-border" />
                            <span className="text-xs text-muted-foreground">atau</span>
                            <div className="flex-1 h-px bg-border" />
                        </div>

                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1 h-9 text-sm"
                                onClick={fillDemo}
                            >
                                Isi Demo
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                className="flex-1 h-9 text-sm"
                                onClick={() => { setEmail(""); setPassword(""); }}
                            >
                                Bersihkan
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
