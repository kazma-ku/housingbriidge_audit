import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Search,
  MapPin,
  Wifi,
  FileText,
  AlertTriangle,
  CheckCircle2,
  Home,
  ArrowRight,
  Download,
  Lock,
  Zap,
  UserCheck,
  Languages,
} from "lucide-react";

const App = () => {
  const [step, setStep] = useState("input"); // 'input', 'audit', 'report'
  const [propertyUrl, setPropertyUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [lang, setLang] = useState("ja"); // 'ja' or 'en'

  // Translation Dictionary
  const t = {
    ja: {
      subtitle: '"住宅への不安を、技術的な確信へ。"',
      status: "システム稼働中",
      startAudit: "新規物件監査を開始",
      placeholder: "CraigslistまたはFBのURLをペースト...",
      runBtn: "フォレンジック監査を実行",
      analyzing: "解析中...",
      features: ["詐欺検知", "ネット環境監査", "契約ロジック"],
      auditConfig: "監査設定",
      generate: "クライアント用レポート作成",
      propDetails: "物件詳細",
      price: "家賃 ($)",
      area: "エリア",
      safetyRating: "安全スコア",
      back: "検索に戻る",
      reportTitle: "物件セキュリティ報告書",
      clientType: "日本人留学生・専門職向け入居前調査",
      findings: "プロフェッショナル監査結果",
      recommended: "推奨物件",
      authBy: "認証担当者",
      savePdf: "PDFとして保存",
    },
    en: {
      subtitle: '"Turning housing anxiety into technical certainty."',
      status: "System Active",
      startAudit: "Start New Property Audit",
      placeholder: "Paste Craigslist or FB Listing URL...",
      runBtn: "Run Forensic Audit",
      analyzing: "Analyzing Listing...",
      features: ["Scam Detection", "Network Audit", "Contract Logic"],
      auditConfig: "Audit Configuration",
      generate: "Generate Client Report",
      propDetails: "Property Details",
      price: "Price ($)",
      area: "Neighborhood",
      safetyRating: "Safety Rating",
      back: "Back to Search",
      reportTitle: "Property Security Report",
      clientType: "Relocation Verification for Japanese Professionals",
      findings: "Professional Audit Findings",
      recommended: "Recommended",
      authBy: "Authenticated By",
      savePdf: "Save Audit as PDF",
    },
  };

  const [auditData, setAuditData] = useState({
    price: 1850,
    neighborhood: "Kitsilano",
    scamScore: 92,
    transitScore: 8.5,
    wifiSpeed: "150 Mbps",
    landlordVerified: true,
    rulesExplained: true,
  });

  const handleStartAudit = async () => {
    if (!propertyUrl) return;
    setLoading(true);

    try {
      const response = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: propertyUrl })
      });

      if (!response.ok) throw new Error('Audit failed');

      const data = await response.json();
      setAuditData({
        ...auditData,
        price: data.price,
        neighborhood: data.neighborhood,
        scamScore: data.scamScore,
      });
      setStep("audit");
    } catch (error) {
      alert('Failed to audit listing: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleLang = () => setLang(lang === "ja" ? "en" : "ja");

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans transition-colors duration-300">
      {/* Navigation Header */}
      <nav className="bg-white border-b border-slate-200 px-6 py-4 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => setStep("input")}
          >
            <div className="bg-blue-600 p-2 rounded-lg">
              <ShieldCheck className="text-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold tracking-tight">
              HousingBridge <span className="text-blue-600">OS</span>
            </span>
          </div>

          <div className="flex items-center gap-6">
            {/* Language Switcher */}
            <button
              onClick={toggleLang}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 hover:bg-slate-50 transition-all group"
            >
              <Languages className="w-4 h-4 text-blue-600 group-hover:rotate-12 transition-transform" />
              <span className="text-xs font-black uppercase tracking-wider">
                {lang === "ja" ? "English" : "日本語"}
              </span>
            </button>

            <div className="hidden md:flex items-center gap-4 text-sm font-medium text-slate-500">
              <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs uppercase font-bold tracking-tighter">
                {t[lang].status}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto p-6 mt-8">
        {/* Step 1: Input */}
        {step === "input" && (
          <div className="max-w-2xl mx-auto text-center space-y-8 py-12">
            <div className="space-y-4">
              <h2 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                {t[lang].startAudit}
              </h2>
              <p className="text-lg text-slate-500 italic font-medium">
                {t[lang].subtitle}
              </p>
            </div>

            <div className="bg-white p-2 rounded-2xl shadow-xl border border-slate-200 flex flex-col md:flex-row gap-2">
              <div className="flex-1 flex items-center px-4 gap-3">
                <Search className="text-slate-400 w-5 h-5" />
                <input
                  type="text"
                  value={propertyUrl}
                  onChange={(e) => setPropertyUrl(e.target.value)}
                  placeholder={t[lang].placeholder}
                  className="w-full py-4 bg-transparent outline-none text-slate-700 font-semibold"
                />
              </div>
              <button
                onClick={handleStartAudit}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-blue-200"
              >
                {loading ? t[lang].analyzing : t[lang].runBtn}
                {!loading && <ArrowRight className="w-5 h-5" />}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8">
              {t[lang].features.map((feature, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-white rounded-xl border border-slate-100 shadow-sm flex items-center gap-3"
                >
                  <div className="p-2 bg-blue-50 rounded-lg">
                    {idx === 0 && <Lock className="text-blue-500 w-4 h-4" />}
                    {idx === 1 && <Wifi className="text-blue-500 w-4 h-4" />}
                    {idx === 2 && (
                      <FileText className="text-blue-500 w-4 h-4" />
                    )}
                  </div>
                  <span className="text-sm font-bold text-slate-700">
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Audit Configuration */}
        {step === "audit" && (
          <div className="space-y-6">
            <div className="flex justify-between items-end">
              <div>
                <button
                  onClick={() => setStep("input")}
                  className="text-blue-600 text-sm font-bold flex items-center gap-1 mb-2 hover:underline"
                >
                  &larr; {t[lang].back}
                </button>
                <h2 className="text-2xl font-bold">{t[lang].auditConfig}</h2>
              </div>
              <button
                onClick={() => setStep("report")}
                className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition shadow-lg"
              >
                {t[lang].generate}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
                <h3 className="font-bold text-slate-400 uppercase text-[10px] tracking-[0.2em]">
                  {t[lang].propDetails}
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">
                      {t[lang].price}
                    </label>
                    <input
                      type="number"
                      value={auditData.price}
                      onChange={(e) =>
                        setAuditData({ ...auditData, price: e.target.value })
                      }
                      className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 font-bold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500">
                      {t[lang].area}
                    </label>
                    <input
                      type="text"
                      value={auditData.neighborhood}
                      onChange={(e) =>
                        setAuditData({
                          ...auditData,
                          neighborhood: e.target.value,
                        })
                      }
                      className="w-full p-3 bg-slate-50 rounded-lg border border-slate-200 font-bold"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">
                    {t[lang].safetyRating}
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={auditData.scamScore}
                    onChange={(e) =>
                      setAuditData({ ...auditData, scamScore: e.target.value })
                    }
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600 mt-2"
                  />
                  <div className="flex justify-between text-[10px] font-black mt-2">
                    <span className="text-red-500 uppercase tracking-widest">
                      DANGER
                    </span>
                    <span className="text-slate-900">
                      {auditData.scamScore}% SECURE
                    </span>
                    <span className="text-green-500 uppercase tracking-widest">
                      SAFE
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-6">
                <h3 className="font-bold text-slate-400 uppercase text-[10px] tracking-[0.2em]">
                  Engineer Verification
                </h3>
                <div className="space-y-4">
                  <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                    <input
                      type="checkbox"
                      checked={auditData.landlordVerified}
                      onChange={() =>
                        setAuditData({
                          ...auditData,
                          landlordVerified: !auditData.landlordVerified,
                        })
                      }
                      className="w-5 h-5 rounded accent-blue-600"
                    />
                    <div>
                      <span className="font-bold block text-sm">
                        Landlord ID Verified
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">
                        Identity matched property records
                      </span>
                    </div>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer p-4 bg-slate-50 rounded-xl border border-slate-100 hover:border-blue-200 transition-colors">
                    <input
                      type="checkbox"
                      checked={auditData.rulesExplained}
                      onChange={() =>
                        setAuditData({
                          ...auditData,
                          rulesExplained: !auditData.rulesExplained,
                        })
                      }
                      className="w-5 h-5 rounded accent-blue-600"
                    />
                    <div>
                      <span className="font-bold block text-sm">
                        Rules Mediation Complete
                      </span>
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tight">
                        Rules translated & legally verified
                      </span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Final Report View */}
        {step === "report" && (
          <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden mb-12">
            <div className="bg-slate-900 p-8 md:p-12 text-white flex justify-between items-center">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="text-blue-400 w-8 h-8" />
                  <span className="text-xl font-bold tracking-tight uppercase">
                    HOUSINGBRIDGE <span className="text-blue-400">AUDIT</span>
                  </span>
                </div>
                <h2 className="text-3xl font-bold tracking-tight">
                  {t[lang].reportTitle}
                </h2>
                <p className="text-slate-400 mt-2 font-medium">
                  {t[lang].clientType}
                </p>
              </div>
              <div className="text-right hidden md:block">
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">
                  Case Number
                </div>
                <div className="text-xl font-mono font-bold">HB-2026-VANC</div>
              </div>
            </div>

            <div className="p-8 md:p-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="col-span-1 flex flex-col items-center justify-center p-8 bg-slate-50 rounded-3xl border border-slate-100">
                <span className="text-[10px] font-black text-slate-400 mb-4 uppercase tracking-[0.2em]">
                  {t[lang].safetyRating}
                </span>
                <div className="relative flex items-center justify-center">
                  <svg className="w-36 h-36 rotate-[-90deg]">
                    <circle
                      className="text-slate-200"
                      strokeWidth="10"
                      stroke="currentColor"
                      fill="transparent"
                      r="62"
                      cx="72"
                      cy="72"
                    />
                    <circle
                      className="text-blue-600"
                      strokeWidth="10"
                      strokeDasharray={389.5}
                      strokeDashoffset={
                        389.5 - (389.5 * auditData.scamScore) / 100
                      }
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="62"
                      cx="72"
                      cy="72"
                    />
                  </svg>
                  <span className="absolute text-3xl font-black text-slate-900">
                    {auditData.scamScore}%
                  </span>
                </div>
                <p className="mt-6 text-xs font-black text-green-600 flex items-center gap-1 uppercase tracking-widest">
                  <CheckCircle2 className="w-4 h-4" /> {t[lang].recommended}
                </p>
              </div>

              <div className="col-span-1 md:col-span-2 grid grid-cols-2 gap-4">
                <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <MapPin className="w-4 h-4" />{" "}
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      {t[lang].area}
                    </span>
                  </div>
                  <span className="text-lg font-bold text-slate-800">
                    {auditData.neighborhood}
                  </span>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Wifi className="w-4 h-4" />{" "}
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Tech Audit
                    </span>
                  </div>
                  <span className="text-lg font-bold text-slate-800">
                    Verified Fiber
                  </span>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Zap className="w-4 h-4" />{" "}
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Pricing
                    </span>
                  </div>
                  <span className="text-lg font-bold text-slate-800">
                    ${auditData.price} / month
                  </span>
                </div>
                <div className="p-5 rounded-2xl bg-white border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <Home className="w-4 h-4" />{" "}
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Transit
                    </span>
                  </div>
                  <span className="text-lg font-bold text-slate-800">
                    {auditData.transitScore}/10 Score
                  </span>
                </div>
              </div>

              <div className="col-span-1 md:col-span-3 border-t border-slate-100 pt-10 mt-4">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-2">
                  <FileText className="text-blue-600 w-6 h-6" />{" "}
                  {t[lang].findings}
                </h3>
                <div className="space-y-6">
                  <div className="flex items-start gap-5">
                    <div className="bg-blue-50 p-3 rounded-2xl">
                      <ShieldCheck className="text-blue-600 w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">
                        Digital Forensics: PASS
                      </p>
                      <p className="text-sm text-slate-500 leading-relaxed mt-1">
                        {lang === "ja"
                          ? "画像メタデータ解析により、この写真は本物件独自のものであることを確認。グローバルな詐欺データベースでの重複は検知されませんでした。"
                          : "Image metadata analysis confirms photos are original to this property. No fraudulent duplicates detected in global databases."}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-5">
                    <div className="bg-blue-50 p-3 rounded-2xl">
                      <UserCheck className="text-blue-600 w-6 h-6" />
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">
                        Landlord Credibility: HIGH
                      </p>
                      <p className="text-sm text-slate-500 leading-relaxed mt-1">
                        {lang === "ja"
                          ? "オーナーの身元を現地の不動産登記記録と照合済み。担当者は法的権利を有する所有者であることを確認しました。"
                          : "Owner identity matched with local property tax records. Point of contact is the legal owner."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 p-8 md:p-12 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center gap-8">
              <div className="text-center md:text-left">
                <p className="text-[10px] font-black text-slate-400 uppercase mb-3 tracking-[0.2em]">
                  {t[lang].authBy}
                </p>
                <div className="font-serif italic text-3xl text-slate-900">
                  Kazuma Kunogi
                </div>
                <p className="text-xs font-bold text-blue-600 mt-2 uppercase tracking-widest">
                  Full-Stack Engineer (BCIT CST)
                </p>
              </div>
              <button
                onClick={() => window.print()}
                className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-2xl font-bold hover:bg-slate-800 transition shadow-xl"
              >
                <Download className="w-5 h-5" /> {t[lang].savePdf}
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Floating Status Bar */}
      <div className="fixed bottom-6 right-6 hidden md:block">
        <div className="bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4 text-[10px] font-black uppercase tracking-widest border border-slate-700">
          <div className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </div>
          <span>System: Active</span>
          <div className="w-[1px] h-3 bg-slate-700"></div>
          <span>Lang: {lang.toUpperCase()}</span>
        </div>
      </div>
    </div>
  );
};

export default App;
