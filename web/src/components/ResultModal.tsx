import type { FC } from "react";
import { RotateCcw, Share2 } from "lucide-react";
import type { QuizResult } from "./QuizView";
import { sendLineFlexMessage } from "../services/liffService";
import { MouseMascot } from "./MouseMascot";

interface ResultModalProps {
  result: QuizResult | null;
  onClose: () => void;
  onRetry: () => void;
  onOpenMistakes?: () => void;
}

export const ResultModal: FC<ResultModalProps> = ({
  result,
  onClose,
  onRetry,
  onOpenMistakes,
}) => {
  if (!result) return null;

  const { paper, total, correctCount, score, timeSpentSeconds } = result;
  const isPass = score >= 60;

  // Cute title based on score
  const getCheeseTitle = (s: number) => {
    if (s >= 90) return { title: "🧀 傳奇芝士大宗師", badge: "🎓 滿分衝刺" };
    if (s >= 80) return { title: "🧀 頂級金牌芝士鼠", badge: "✨ 實力拔尖" };
    if (s >= 60) return { title: "🧀 合格進修小考鼠", badge: "🐾 穩健及格" };
    return { title: "🧀 儲備蓄能小幼鼠", badge: "🌱 再刷一把" };
  };

  const { title: cheeseTitle, badge: cheeseBadge } = getCheeseTitle(score);

  const handleShareLine = async () => {
    const textMessage = `🐭【Study Mouse 考鼠刷題快測】\n我在《${paper.subject_name}》獲得了 ${score} 分！\n榮獲頭銜：${cheeseTitle}\n答對題數：${correctCount} / ${total} 題\n耗時：${Math.floor(timeSpentSeconds / 60)}分${timeSpentSeconds % 60}秒\n\n快來跟鼠鼠一起吃芝士刷真題！🧀`;
    
    await sendLineFlexMessage([
      {
        type: "text",
        text: textMessage,
      },
    ]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border-4 border-amber-200 p-6 overflow-hidden text-center">
        {/* Cute Mascot with Cap */}
        <div className="flex justify-center mb-3">
          <MouseMascot 
            mood={isPass ? "celebrate" : "comfort"} 
            size={72}
            speechText={isPass ? "太厲害了！你根本是考題天才！🎉" : "沒關係！多刷幾次就全記住了！🐾"}
          />
        </div>

        {/* Title & Badge */}
        <div className="inline-flex items-center gap-1 text-xs font-black px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 mb-2">
          {cheeseBadge}
        </div>
        <h3 className="text-xl font-black text-slate-900 mb-1">
          {cheeseTitle}
        </h3>
        <p className="text-xs font-medium text-slate-500 mb-5 line-clamp-1">
          {paper.subject_name}
        </p>

        {/* Big Cute Score Box */}
        <div className="bg-gradient-to-b from-amber-50 to-orange-50 border-2 border-amber-200 rounded-3xl p-5 mb-5 shadow-inner">
          <div className="flex items-baseline justify-center gap-1 font-mono">
            <span className="text-6xl font-black text-amber-900 tracking-tight">
              {score}
            </span>
            <span className="text-lg font-black text-amber-600">分</span>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-amber-200/60 text-xs">
            <div>
              <div className="text-amber-800/70 text-[10px] font-bold mb-0.5">答對題數</div>
              <div className="font-black text-emerald-600 font-mono text-sm">
                {correctCount} 題
              </div>
            </div>
            <div>
              <div className="text-amber-800/70 text-[10px] font-bold mb-0.5">答錯題數</div>
              <div className="font-black text-rose-500 font-mono text-sm">
                {total - correctCount} 題
              </div>
            </div>
            <div>
              <div className="text-amber-800/70 text-[10px] font-bold mb-0.5">作答時間</div>
              <div className="font-black text-slate-700 font-mono text-sm">
                {Math.floor(timeSpentSeconds / 60)}分{timeSpentSeconds % 60}秒
              </div>
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleShareLine}
            className="w-full py-3.5 px-4 bg-[#06C755] hover:bg-[#05b34c] text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-md shadow-emerald-200 active:scale-95 transition"
          >
            <Share2 className="w-4 h-4" />
            <span>炫耀成績至 LINE 好友 / 群組 🧀</span>
          </button>
          {total - correctCount > 0 && onOpenMistakes && (
            <button
              onClick={() => {
                onClose();
                onOpenMistakes();
              }}
              className="w-full py-3 px-4 bg-rose-50 hover:bg-rose-100 text-rose-800 border-2 border-rose-200 rounded-2xl text-xs font-black flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <span>📕 檢視本次做錯的 {total - correctCount} 題</span>
            </button>
          )}


          <div className="flex gap-2">
            <button
              onClick={onRetry}
              className="flex-1 py-3 px-3 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>重新再戰</span>
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-3 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition active:scale-95"
            >
              <span>回題庫大廳</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
