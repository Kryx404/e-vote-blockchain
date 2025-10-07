"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import api from "../../lib/api";

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

    const fillDemo = (n = 1) => {
        setEmail(`user${n}@gmail.com`);
        setPassword("123");
    };

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
            <form
                onSubmit={submit}
                className="w-full max-w-md bg-white shadow-lg rounded-lg p-6 space-y-4">
                <h2 className="text-2xl font-semibold text-gray-800">
                    Sign in
                </h2>
                <p className="text-sm text-gray-500">
                    Masuk dengan email dan password.
                </p>

                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700">
                        Email
                    </label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="email@email.com"
                        className={`mt-1 block w-full rounded border-gray-200 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                            email ? "text-black" : "text-gray-500"
                        }`}
                        required
                    />
                </div>

                <div>
                    <label
                        htmlFor="password"
                        className="block text-sm font-medium text-gray-700">
                        Password
                    </label>
                    <div className="relative mt-1">
                        <input
                            id="password"
                            type={showPwd ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className={`mt-1 block w-full rounded border-gray-200 shadow-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400 ${
                            password ? "text-black" : "text-gray-500"
                        }`}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPwd((s) => !s)}
                            className="absolute inset-y-0 right-0 px-3 text-sm text-gray-500"
                            aria-label={
                                showPwd ? "Hide password" : "Show password"
                            }>
                            {showPwd ? "Hide" : "Show"}
                        </button>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="text-sm">
                        <button
                            type="button"
                            onClick={() => fillDemo(1)}
                            className="text-indigo-600 hover:underline">
                            Fill demo
                        </button>
                    </div>
                    
                </div>

                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-60">
                        {loading ? "Loading..." : "Login"}
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setEmail("");
                            setPassword("");
                        }}
                        className="bg-gray-100 text-gray-500 px-4 py-2 rounded">
                        Clear
                    </button>
                </div>

                {/* <p className="text-xs text-gray-400 text-center">
                    Dengan masuk kamu setuju bahwa ini demo saja — jangan
                    gunakan data sensitif.
                </p> */}
            </form>
        </div>
    );
}
