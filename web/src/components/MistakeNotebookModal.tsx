import { useState, type FC } from "react";
import { X, CheckCircle2, Trash2 } from "lucide-react";
import { 
  type MistakeItem, 
  resolveMistake, 
  clearAllMistakes 
} from "../services/mistakeService";
import { MouseMascot } from "./MouseMascot";

interface MistakeNotebookModalProps {
  isOpen: boolean;
  onClose: () => void;
  mistakes: MistakeItem[];
  onMistakesUpdated: (items: MistakeItem[]) => void;
  userId?: string;
}

export const MistakeNotebookModal: FC<MistakeNotebookModalProps> = ({
  isOpen,
  onClose,
  mistakes,
  onMistakesUpdated,
  userId,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const handlePracticeAnswer = async (item: MistakeItem, choiceKey: string) => {
    setSelectedAnswers(prev => ({ ...prev, [item.id]: choiceKey }));
    if (choiceKey === item.answer) {
      // Solved correctly! Remove from mistake book
      await resolveMistake(item.paperId, item.questionNo, userId);
      const updated = mistakes.filter(m => m.id !== item.id);
      onMistakesUpdated(updated);
    }
  };

  const handleRemoveSingle = async (item: MistakeItem) => {
    await resolveMistake(item.paperId, item.questionNo, userId);
    const updated = mistakes.filter(m => m.id !== item.id);
    onMistakesUpdated(updated);
  };

  const handleClearAll = () => {
    if (window.confirm("確定要清空所有錯題記錄嗎？")) {
      clearAllMistakes();
      onMistakesUpdated([]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl max-h-[90vh] bg-[#FFFDF9] rounded-3xl shadow-2xl border-4 border-amber-200 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b-2 border-amber-100 bg-amber-50/80 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📕</span>
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>專屬錯題本</span>
                <span className="text-xs bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-bold">
                  {mistakes.length} 題待複習
                </span>
              </h3>
              <p className="text-[11px] font-medium text-amber-800/70">
                自動收錄做錯的考題 · 重新答對即修復芝士 🧀
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {mistakes.length > 0 && (
              <button
                onClick={handleClearAll}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition text-xs flex items-center gap-1 font-bold"
                title="清空錯題本"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-amber-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {mistakes.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="flex justify-center mb-4">
                <MouseMascot mood="celebrate" size={76} />
              </div>
              <h4 className="text-lg font-black text-amber-900 mb-1">
                太厲害了！錯題本空空如也！
              </h4>
              <p className="text-xs text-amber-700/80 max-w-xs mx-auto leading-relaxed">
                你目前所有的做題都是完美全對！繼續保持，把整座題庫的芝士全部吃下肚！🧀🎉
              </p>
            </div>
          ) : (
            mistakes.map((item, index) => {
              const currentChoice = selectedAnswers[item.id];
              const isResolved = currentChoice === item.answer;

              return (
                <div 
                  key={item.id} 
                  className={`bg-white rounded-2xl border-2 p-4 sm:p-5 shadow-xs transition-all ${
                    isResolved 
                      ? "border-emerald-300 bg-emerald-50/40" 
                      : "border-amber-100/90 hover:border-amber-200"
                  }`}
                >
                  {/* Item Header */}
                  <div className="flex items-center justify-between gap-2 mb-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
                        #{index + 1}
                      </span>
                      <span className="font-bold text-slate-700 truncate max-w-[180px]">
                        {item.subjectName}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 text-[11px]">
                      <span className="font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                        錯 {item.wrongCount} 次
                      </span>
                      <button
                        onClick={() => handleRemoveSingle(item)}
                        className="text-slate-400 hover:text-slate-600 p-1"
                        title="標記為已掌握"
                      >
                        <CheckCircle2 className="w-4 h-4 text-slate-300 hover:text-emerald-600 transition" />
                      </button>
                    </div>
                  </div>

                  {/* Stem */}
                  <div className="text-xs sm:text-sm font-bold text-slate-900 leading-relaxed mb-3 select-text">
                    第 {item.questionNo} 題：{item.stem}
                  </div>

                  {/* Interactive Options */}
                  <div className="space-y-1.5 mb-3">
                    {item.options.map((opt) => {
                      const isUserChoice = item.userChoice === opt.key;
                      const isCorrect = item.answer === opt.key;
                      const hasRepracticed = currentChoice === opt.key;

                      let rowClass = "border-slate-100 bg-slate-50/50 text-slate-700 hover:bg-amber-50/40";
                      if (hasRepracticed) {
                        rowClass = isCorrect 
                          ? "border-emerald-400 bg-emerald-50 text-emerald-950 font-bold" 
                          : "border-rose-300 bg-rose-50 text-rose-950 font-bold";
                      } else if (isUserChoice) {
                        rowClass = "border-rose-200 bg-rose-50/40 text-rose-900";
                      }

                      return (
                        <button
                          key={opt.key}
                          onClick={() => handlePracticeAnswer(item, opt.key)}
                          className={`w-full text-left p-2.5 rounded-xl border transition flex items-start gap-2.5 text-xs select-none active:scale-[0.99] ${rowClass}`}
                        >
                          <span className={`w-5 h-5 rounded-md font-bold flex items-center justify-center shrink-0 border text-[11px] ${
                            hasRepracticed && isCorrect 
                              ? "bg-emerald-600 text-white border-emerald-600" 
                              : isUserChoice 
                              ? "bg-rose-100 text-rose-700 border-rose-200" 
                              : "bg-white text-slate-600 border-slate-200"
                          }`}>
                            {opt.key}
                          </span>
                          <span className="flex-1 pt-0.5 leading-snug">{opt.text}</span>
                          {isUserChoice && !hasRepracticed && (
                            <span className="text-[10px] text-rose-500 font-bold self-center shrink-0">
                              (上次選錯)
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Explanation / Answer Reveal */}
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/60 text-xs">
                    <div className="flex items-center justify-between font-bold text-amber-950 mb-1">
                      <span>官方標準答案：【{item.answer}】</span>
                    </div>
                    <p className="text-[11px] text-slate-600 leading-relaxed">
                      {item.explanation || "該題答案來自考選部或主辦單位官方解答。點擊上方正確選項即可修復並移除此錯題！"}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t-2 border-amber-100 bg-white/90 flex items-center justify-between gap-3 shrink-0">
          <span className="text-xs text-slate-500 font-medium">
            💡 只要點擊正確選項，該題就會自動從錯題本修復移除！
          </span>
          <button
            onClick={onClose}
            className="py-2 px-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-black shadow-xs transition active:scale-95"
          >
            關閉錯題本
          </button>
        </div>
      </div>
    </div>
  );
};
