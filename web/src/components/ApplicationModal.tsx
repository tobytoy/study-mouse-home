import { useState, type FC, type FormEvent } from "react";
import { Check, Clock, Copy, ShieldCheck, X } from "lucide-react";
import type { AccessApplication, AccessStatus } from "../services/accessService";
import { saveLocalApplication, submitAccessApplication } from "../services/accessService";
import type { LineUserProfile } from "../services/liffService";

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: LineUserProfile;
  currentApp: AccessApplication | null;
  onStatusChanged: (status: AccessStatus, app: AccessApplication) => void;
}

export const ApplicationModal: FC<ApplicationModalProps> = ({
  isOpen,
  onClose,
  user,
  currentApp,
  onStatusChanged,
}) => {
  const [targetExam, setTargetExam] = useState("全部題庫無限制開通 (全科 VIP)");
  const [purpose, setPurpose] = useState("備考刷題與實力診斷");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const app = await submitAccessApplication({
        userId: user.userId,
        displayName: user.displayName,
        targetExam,
        purpose,
      });
      onStatusChanged("PENDING", app);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyTicket = (ticket: string) => {
    navigator.clipboard.writeText(ticket);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDevApprove = () => {
    if (currentApp) {
      const approved: AccessApplication = {
        ...currentApp,
        status: "APPROVED",
        approvedAt: new Date().toISOString(),
      };
      saveLocalApplication(approved);
      onStatusChanged("APPROVED", approved);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              考題庫權限審核管理
            </h3>
            <p className="text-xs text-slate-500">
              維護題庫伺服器負載與公平使用配額
            </p>
          </div>
        </div>

        {/* Existing Application Status Card */}
        {currentApp ? (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border bg-slate-50 border-slate-200 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">申請單號</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-bold text-indigo-600">
                    {currentApp.ticketId}
                  </span>
                  <button
                    onClick={() => handleCopyTicket(currentApp.ticketId)}
                    className="p-1 rounded-sm text-slate-400 hover:text-slate-600"
                    title="複製單號"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">審核狀態</span>
                {currentApp.status === "APPROVED" ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    已核准開通
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                    <Clock className="w-3 h-3 animate-spin" />
                    管理員審核中
                  </span>
                )}
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">申請類別</span>
                <span className="font-medium text-slate-800">
                  {currentApp.targetExam}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500 font-medium">申請人 LINE</span>
                <span className="text-slate-700">{currentApp.displayName}</span>
              </div>
            </div>

            <p className="text-xs text-slate-500 leading-relaxed bg-amber-50/70 p-3 rounded-lg border border-amber-100 text-amber-800">
              💡 申請已同步至 Google Sheet，管理員可於 LINE Bot 直接核准。若在測試環境，可點擊下方快速核准。
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleDevApprove}
                className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
              >
                測試環境：立即核准開通
              </button>
              <button
                onClick={onClose}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                關閉
              </button>
            </div>
          </div>
        ) : (
          /* New Application Form */
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                LINE 帳號識別
              </label>
              <input
                type="text"
                disabled
                value={`${user.displayName} (${user.userId.slice(0, 10)}...)`}
                className="w-full text-xs px-3 py-2 bg-slate-100 rounded-lg text-slate-500 border border-slate-200"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                預計應考 / 準備目標
              </label>
              <select
                value={targetExam}
                onChange={(e) => setTargetExam(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800"
              >
                <option value="全部題庫無限制開通 (全科 VIP)">
                  🌟 全部題庫無限制開通 (全科 VIP · 42卷 2009題)
                </option>
                <option value="iPAS AI 應用規劃師 (初級/中級)">
                  🤖 經濟部 iPAS · AI 應用規劃師 (初級/中級 · 12卷 584題)
                </option>
                <option value="iPAS 淨零碳規劃管理師 (初級)">
                  🌱 經濟部 iPAS · 淨零碳規劃管理師 (初級 · 2卷 100題)
                </option>
                <option value="國考 資訊科技類科 (計算機概要/大意)">
                  💻 考選部 國家考試 · 資訊科技類科 (高普/關務/鐵路 · 8卷 320題)
                </option>
                <option value="國考 法律與司法類科 (法學大意/憲法/刑法)">
                  ⚖️ 考選部 國家考試 · 法律司法類科 (法大/憲法/刑法 · 11卷 545題)
                </option>
                <option value="國考 行政經濟語文 (行政學/經濟學/國英)">
                  📜 考選部 國家考試 · 行政經濟語文 (行大/經濟/國英 · 9卷 460題)
                </option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                申請用途說明
              </label>
              <input
                type="text"
                required
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="例如：2026 下半年參加能力鑑定證照衝刺"
                className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white text-slate-800"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50"
              >
                {isSubmitting ? "送出申請中..." : "送出開通申請"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
              >
                稍後
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
