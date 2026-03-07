"use client";
import Link from "next/link";
import SiteNavbar from "../components/Navbar";
import ParallaxGlow from "../components/ParallaxGlow";
import ScrollReveal from "../components/ScrollReveal";

const candidates = [
    {
        id: "cand-a",
        order: 1,
        name: "Kandidat A",
        tagline: "Transparansi anggaran & digitalisasi layanan",
        vision: "Membangun tata kelola yang akuntabel dengan dashboard layanan publik yang mudah diakses dan diaudit.",
        mission: [
            "Audit terbuka triwulanan untuk semua pos anggaran",
            "Otomasi layanan publik dengan SLA yang jelas",
            "Rilis data keterbukaan informasi secara real-time",
        ],
        experience: "5 tahun memimpin proyek transformasi digital",
        hero: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1200&q=80",
    },
    {
        id: "cand-b",
        order: 2,
        name: "Kandidat B",
        tagline: "Inklusi sosial & pemberdayaan komunitas",
        vision: "Memperluas partisipasi warga lewat program pendidikan, kesehatan, dan dukungan UMKM yang terukur.",
        mission: [
            "Program dana mikro untuk 1.000 UMKM baru",
            "Klinik keliling di 20 titik prioritas",
            "Beasiswa vokasi untuk talenta muda daerah",
        ],
        experience: "8 tahun di organisasi sosial dan koperasi",
        hero: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=80",
    },
    {
        id: "cand-c",
        order: 3,
        name: "Kandidat C",
        tagline: "Infrastruktur hijau & mobilitas cerdas",
        vision: "Mendorong kota rendah emisi dengan transportasi hijau dan tata lalu lintas berbasis data.",
        mission: [
            "Fase bus listrik di koridor padat",
            "Penambahan ruang hijau kota sebanyak 15%",
            "Sensor lalu lintas adaptif di 30 persimpangan",
        ],
        experience: "6 tahun perencana kota dan transportasi",
        hero: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80",
    },
];

function CheckIcon() {
    return (
        <svg
            aria-hidden
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            className="h-4 w-4 text-emerald-300">
            <path
                fill="currentColor"
                d="M8.2 13.6 4.6 10l1.4-1.4 2.2 2.2 5-5L14.6 7l-6.4 6.6Z"
            />
        </svg>
    );
}

function Badge({ text }) {
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] bg-white/10 border border-white/15 text-slate-100">
            {text}
        </span>
    );
}

export default function CandidatesPage() {
    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-50">
            <ParallaxGlow />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,_rgba(255,255,255,0.04)_1px,_transparent_0)] bg-[length:32px_32px]" />

            <SiteNavbar />

            <main className="relative z-10 max-w-6xl mx-auto px-6 py-10 flex flex-col gap-8">
                <ScrollReveal>
                    <div>
                        <p className="text-xs uppercase tracking-[0.32em] text-blue-200/70">
                            Transparan
                        </p>
                        <h1 className="text-3xl font-semibold">
                            Kenali kandidat sebelum memilih
                        </h1>
                        <p className="text-slate-300 text-sm mt-2">
                            Data masih mock — sambungkan ke backend untuk
                            menampilkan profil resmi dan statistik dukungan.
                        </p>
                    </div>
                </ScrollReveal>

                <div className="space-y-8">
                    {candidates.map((cand, idx) => (
                        <ScrollReveal key={cand.id} delay={idx * 0.08}>
                            <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-blue-900/20">
                                <div className="relative h-64 sm:h-72">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center"
                                        style={{
                                            backgroundImage: `linear-gradient(110deg, rgba(72, 40, 140, 0.82) 0%, rgba(29, 53, 136, 0.78) 40%, rgba(21, 36, 82, 0.55) 65%), url(${cand.hero})`,
                                        }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#0b1224]/20 to-[#060b18]" />
                                    <div className="relative flex h-full items-end p-6">
                                        <div className="space-y-2 max-w-2xl">
                                            <Badge
                                                text={`Kandidat #${cand.order}`}
                                            />
                                            <h2 className="text-3xl sm:text-4xl font-semibold text-white">
                                                {cand.name}
                                            </h2>
                                            <p className="text-slate-100 text-sm sm:text-base">
                                                {cand.tagline}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-6 md:grid-cols-[1.6fr_1fr] p-6 bg-slate-950/70">
                                    <div className="space-y-4">
                                        <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-blue-950/40 to-blue-900/30 p-4">
                                            <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.28em] uppercase text-blue-100">
                                                <span className="h-1 w-8 rounded-full bg-blue-400" />{" "}
                                                Visi
                                            </div>
                                            <p className="mt-2 text-sm text-slate-100 leading-relaxed">
                                                {cand.vision}
                                            </p>
                                        </div>

                                        <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                            <div className="flex items-center gap-2 text-xs font-semibold tracking-[0.28em] uppercase text-slate-200">
                                                <span className="h-1 w-8 rounded-full bg-purple-400" />{" "}
                                                Misi
                                            </div>
                                            <ul className="mt-3 space-y-3">
                                                {cand.mission.map((item) => (
                                                    <li
                                                        key={item}
                                                        className="flex items-start gap-3 text-sm text-slate-100">
                                                        <div className="mt-1">
                                                            <CheckIcon />
                                                        </div>
                                                        <span className="leading-relaxed">
                                                            {item}
                                                        </span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-5 shadow-lg shadow-blue-900/10">
                                        <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-slate-200">
                                            <div className="text-xs uppercase tracking-[0.2em] text-slate-400">
                                                Pengalaman
                                            </div>
                                            <div className="mt-1">
                                                {cand.experience}
                                            </div>
                                        </div>
                                        <div className="text-sm text-slate-300">
                                            Statistik dukungan akan tampil saat
                                            data backend atau WebSocket siap.
                                        </div>
                                        <div className="flex flex-col sm:flex-row gap-2 text-sm">
                                            <Link
                                                href="/vote"
                                                className="flex-1 text-center px-4 py-2.5 rounded-lg bg-blue-600 text-white hover:bg-blue-500 transition">
                                                Pilih kandidat ini
                                            </Link>
                                            <Link
                                                href="/transactions"
                                                className="flex-1 text-center px-4 py-2.5 rounded-lg border border-white/15 text-slate-50 hover:border-white/35 transition">
                                                Lihat aktivitas
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </ScrollReveal>
                    ))}
                </div>
            </main>
        </div>
    );
}
