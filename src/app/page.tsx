"use client";

import { ChangeEvent, DragEvent, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Image as ImageIcon,
  ScanSearch,
  Upload,
  XCircle,
} from "lucide-react";

type Product = {
  sku: string;
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  row?: number;
};
type Result = {
  success: boolean;
  filename: string;
  mode: string;
  image: { width: number; height: number };
  compliance_score: number;
  expected_facings: number;
  detected_facings: number;
  matched_facings: number;
  missing_products: {
    sku: string;
    expected: number;
    actual: number;
    shortage: number;
  }[];
  wrong_products: { sku: string }[];
  extra_products: { sku: string; actual: number }[];
  facings: { sku: string; expected: number; actual: number; status: string }[];
  products: Product[];
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const score = result?.compliance_score ?? 0;
  const scoreLabel = useMemo(
    () =>
      score >= 90
        ? "Excellent"
        : score >= 75
          ? "Good"
          : score >= 50
            ? "Needs attention"
            : "Critical",
    [score],
  );

  function chooseFile(next: File | null) {
    if (!next) return;
    if (!next.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }
    setError("");
    setResult(null);
    setFile(next);
    setPreview(URL.createObjectURL(next));
  }

  function onInput(e: ChangeEvent<HTMLInputElement>) {
    chooseFile(e.target.files?.[0] ?? null);
  }
  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    chooseFile(e.dataTransfer.files?.[0] ?? null);
  }

  async function analyze() {
    if (!file) {
      setError("Upload a shelf image first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const form = new FormData();
      form.append("image", file);
      const response = await fetch(`${API}/api/analyze`, {
        method: "POST",
        body: form,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Analysis failed");
      setResult(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to analyze image.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f5f8fb]">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex h-[72px] max-w-[1480px] items-center justify-between px-5 md:px-8">
          <div className="flex items-center gap-3">
            <div className="grid size-10 place-items-center rounded-xl bg-[#084c94] text-white">
              <ScanSearch size={22} />
            </div>
            <div>
              <div className="text-lg font-extrabold tracking-tight">
                Planogram AI
              </div>
              <div className="text-[11px] font-semibold uppercase tracking-[.18em] text-slate-400">
                Shelf intelligence
              </div>
            </div>
          </div>
          <div className="hidden rounded-full bg-slate-100 px-4 py-2 text-xs font-bold text-slate-600 sm:block">
            AI Compliance Scanner
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-[1480px] px-4 py-7 md:px-8">
        <div className="mb-7">
          <p className="mb-1 text-sm font-bold text-[#084c94]">
            PLANOGRAM RECOGNITION
          </p>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 md:text-4xl">
            Check your shelf against the planogram.
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
            Upload a store shelf photo and the AI will identify products, count
            facings, and calculate planogram compliance.
          </p>
        </div>

        <section className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,55,90,.06)] md:p-7">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="font-extrabold text-slate-900">Shelf image</h2>
                <p className="text-xs text-slate-400">
                  JPG, PNG or WEBP · max 15 MB
                </p>
              </div>
              {file && (
                <button
                  onClick={() => {
                    setFile(null);
                    setPreview("");
                    setResult(null);
                  }}
                  className="rounded-full p-2 text-slate-400 hover:bg-slate-100"
                >
                  <XCircle size={19} />
                </button>
              )}
            </div>
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              className="relative overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50"
            >
              {preview ? (
                <div className="relative min-h-[350px]">
                  <img
                    src={preview}
                    alt="Shelf preview"
                    className="h-[420px] w-full object-contain bg-slate-100"
                  />
                  <div className="absolute bottom-3 left-3 rounded-lg bg-black/70 px-3 py-2 text-xs font-bold text-white">
                    {file?.name}
                  </div>
                </div>
              ) : (
                <label className="flex min-h-[350px] cursor-pointer flex-col items-center justify-center px-8 text-center">
                  <div className="mb-4 grid size-16 place-items-center rounded-2xl bg-white text-[#084c94] shadow-sm">
                    <Upload size={26} />
                  </div>
                  <div className="font-bold text-slate-800">
                    Drop shelf image here
                  </div>
                  <div className="mt-1 text-sm text-slate-400">
                    or click to browse
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={onInput}
                  />
                </label>
              )}
            </div>
            {error && (
              <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-semibold text-red-600">
                {error}
              </div>
            )}
            <button
              disabled={loading || !file}
              onClick={analyze}
              className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#084c94] font-bold text-white transition hover:bg-[#063d78] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading ? (
                "Analyzing shelf…"
              ) : (
                <>
                  Analyze planogram <ChevronRight size={18} />
                </>
              )}
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                ["Compliance", `${score}%`, scoreLabel],
                ["Expected", result?.expected_facings ?? "—", "facings"],
                ["Detected", result?.detected_facings ?? "—", "facings"],
                ["Matched", result?.matched_facings ?? "—", "facings"],
              ].map(([a, b, c]) => (
                <div
                  key={a}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="text-xs font-bold text-slate-400">{a}</div>
                  <div className="mt-2 text-2xl font-black text-slate-900">
                    {b}
                  </div>
                  <div className="text-[11px] font-semibold text-slate-400">
                    {c}
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_12px_40px_rgba(15,55,90,.06)] md:p-7">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-extrabold text-slate-900">
                    Recognition result
                  </h2>
                  <p className="text-xs text-slate-400">
                    {result
                      ? `Detection engine: ${result.mode.toUpperCase()}`
                      : "Analysis output will appear here"}
                  </p>
                </div>
                {result && (
                  <div
                    className={`rounded-full px-3 py-1 text-xs font-extrabold ${score >= 75 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}
                  >
                    {scoreLabel}
                  </div>
                )}
              </div>
              {!result ? (
                <div className="grid min-h-[330px] place-items-center text-center">
                  <div>
                    <div className="mx-auto mb-3 grid size-14 place-items-center rounded-2xl bg-slate-50 text-slate-300">
                      <ImageIcon size={25} />
                    </div>
                    <p className="font-bold text-slate-500">No analysis yet</p>
                    <p className="mt-1 text-xs text-slate-400">
                      Upload an image and click Analyze planogram.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mt-6 space-y-5">
                  <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-[#084c94] transition-all"
                      style={{ width: `${score}%` }}
                    />
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <Finding
                      icon={<AlertTriangle size={17} />}
                      title="Missing"
                      value={result.missing_products.reduce(
                        (n, x) => n + x.shortage,
                        0,
                      )}
                      tone="amber"
                    />
                    <Finding
                      icon={<XCircle size={17} />}
                      title="Extra / wrong"
                      value={result.extra_products.reduce(
                        (n, x) => n + x.actual,
                        0,
                      )}
                      tone="red"
                    />
                    <Finding
                      icon={<CheckCircle2 size={17} />}
                      title="Matched"
                      value={result.matched_facings}
                      tone="green"
                    />
                  </div>
                  <div>
                    <h3 className="mb-3 text-sm font-extrabold">
                      SKU facing analysis
                    </h3>
                    <div className="overflow-hidden rounded-xl border border-slate-100">
                      <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 text-xs text-slate-400">
                          <tr>
                            <th className="px-4 py-3">SKU</th>
                            <th>Expected</th>
                            <th>Actual</th>
                            <th>Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {result.facings.map((x) => (
                            <tr
                              key={x.sku}
                              className="border-t border-slate-100"
                            >
                              <td className="px-4 py-3 font-bold">{x.sku}</td>
                              <td>{x.expected}</td>
                              <td>{x.actual}</td>
                              <td>
                                <span
                                  className={
                                    x.status === "OK"
                                      ? "text-emerald-600"
                                      : "text-amber-600"
                                  }
                                >
                                  {x.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  {result.missing_products.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-sm font-extrabold">
                        Missing products
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {result.missing_products.map((x) => (
                          <span
                            key={x.sku}
                            className="rounded-lg bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700"
                          >
                            {x.sku}: {x.shortage} missing
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        <footer className="py-8 text-center text-xs text-slate-400">
          Planogram AI · Vision-based retail execution MVP
        </footer>
      </div>
    </main>
  );
}

function Finding({
  icon,
  title,
  value,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  value: number;
  tone: "amber" | "red" | "green";
}) {
  const classes =
    tone === "green"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "red"
        ? "bg-red-50 text-red-700"
        : "bg-amber-50 text-amber-700";
  return (
    <div className={`rounded-xl p-4 ${classes}`}>
      <div className="flex items-center gap-2 text-xs font-bold">
        {icon}
        {title}
      </div>
      <div className="mt-1 text-2xl font-black">{value}</div>
    </div>
  );
}
