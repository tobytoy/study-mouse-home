import { useState, useEffect, type FC } from "react";
import { 
  ArrowLeft, 
  ArrowRight, 
  CheckCircle2, 
  XCircle,
} from "lucide-react";
import type { ExamPaper, ExamQuestion } from "../data/examsData";
import { MouseMascot } from "./MouseMascot";
import { recordMistake, resolveMistake } from "../services/mistakeService";

interface QuizViewProps {
  paper: ExamPaper;
  questions: ExamQuestion[];
  onBack: () => void;
  onFinishQuiz: (results: QuizResult) => void;
  userId?: string;
}

export interface QuizResult {
  paper: ExamPaper;
  total: number;
  answeredCount: number;
  correctCount: number;
  score: number;
  userAnswers: Record<number, string>;
  timeSpentSeconds: number;
}

export const QuizView: FC<QuizViewProps> = ({
  paper,
  questions,
  onBack,
  onFinishQuiz,
  userId,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [isExamMode, setIsExamMode] = useState(false);
  const [startTime] = useState<number>(Date.now());
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, [startTime]);

  const currentQ = questions[currentIndex];
  if (!currentQ) {
    return (
      <div className="p-8 text-center bg-white rounded-3xl m-4 border-2 border-amber-100">
        <p className="text-amber-800 font-bold mb-3">此試卷尚無題目資料 🐭</p>
        <button 
          onClick={onBack} 
          className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-2xl shadow-sm shadow-amber-200"
        >
          返回題庫大廳
        </button>
      </div>
    );
  }

  const selectedAnswer = userAnswers[currentQ.question_no];
  const isAnswered = selectedAnswer !== undefined;
  const isCorrect = selectedAnswer === currentQ.answer;

  const handleSelectOption = (key: string) => {
    setUserAnswers(prev => ({ ...prev, [currentQ.question_no]: key }));
    if (key === currentQ.answer) {
      resolveMistake(paper.id, currentQ.question_no, userId);
    } else {
      recordMistake(paper, currentQ, key, userId);
    }
  };

  const handleFinish = () => {
    let correct = 0;
    questions.forEach(q => {
      const choice = userAnswers[q.question_no];
      if (choice === q.answer) {
        correct++;
      } else if (choice) {
        recordMistake(paper, q, choice, userId);
      }
    });
    const total = questions.length;
    const score = total > 0 ? Math.round((correct / total) * 100) : 0;

    onFinishQuiz({
      paper,
      total,
      answeredCount: Object.keys(userAnswers).length,
      correctCount: correct,
      score,
      userAnswers,
      timeSpentSeconds: elapsedTime,
    });
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const progressPercent = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 pb-28">
      {/* Top Controls & Timer */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <button
          onClick={onBack}
          className="px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-slate-700 border border-amber-200/80 shadow-2xs transition flex items-center gap-1.5 text-xs font-bold active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-amber-600" />
          <span>回大廳</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Mode Pill Toggle */}
          <div className="bg-amber-100/70 p-1 rounded-2xl flex text-[11px] font-bold border border-amber-200/50">
            <button
              onClick={() => setIsExamMode(false)}
              className={`px-3 py-1 rounded-xl transition ${
                !isExamMode 
                  ? "bg-white text-amber-800 shadow-xs" 
                  : "text-amber-700/70 hover:text-amber-900"
              }`}
            >
              即時刷題 🧀
            </button>
            <button
              onClick={() => setIsExamMode(true)}
              className={`px-3 py-1 rounded-xl transition ${
                isExamMode 
                  ? "bg-white text-amber-800 shadow-xs" 
                  : "text-amber-700/70 hover:text-amber-900"
              }`}
            >
              模擬計分 ⏱️
            </button>
          </div>

          <div className="text-xs font-mono font-black text-amber-800 bg-amber-100/90 px-2.5 py-1 rounded-xl border border-amber-200">
            {formatTimer(elapsedTime)}
          </div>
        </div>
      </div>

      {/* Cute Cheese Trail Progress Bar */}
      <div className="mb-4 bg-white/90 backdrop-blur-xs rounded-2xl p-3 border-2 border-amber-100 shadow-2xs">
        <div className="flex items-center justify-between text-xs font-bold text-slate-600 mb-2">
          <span className="truncate max-w-[200px] text-amber-900 font-extrabold flex items-center gap-1">
            <span>📖</span> {paper.subject_name}
          </span>
          <span className="text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
            第 {currentIndex + 1} / {questions.length} 題
          </span>
        </div>

        {/* Trail with Moving Mouse */}
        <div className="relative w-full h-3 bg-amber-100/80 rounded-full overflow-visible flex items-center">
          <div 
            className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
          {/* Walking Mouse on Progress Point */}
          <div 
            className="absolute -top-3.5 transform -translate-x-1/2 transition-all duration-300 text-base select-none pointer-events-none drop-shadow-xs"
            style={{ left: `${Math.min(95, Math.max(5, progressPercent))}%` }}
          >
            🐭
          </div>
          {/* Target Cheese at the end */}
          <span className="absolute -right-1 text-sm pointer-events-none">
            🧀
          </span>
        </div>
      </div>

      {/* Mascot Cute Motivation Bubble */}
      <div className="mb-4">
        {!isExamMode && isAnswered ? (
          <MouseMascot
            mood={isCorrect ? "celebrate" : "comfort"}
            size={48}
            speechText={
              isCorrect 
                ? "太棒了！答對了！鼠鼠獎勵你一塊香濃芝士！🧀✨" 
                : "別灰心！這題觀念很關鍵，鼠鼠陪你一起看懂解析！🐾"
            }
          />
        ) : (
          <MouseMascot
            mood="thinking"
            size={48}
            speechText="專注看題！鼠鼠相信你可以全部答對的！加油！💪"
          />
        )}
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-3xl shadow-sm shadow-amber-100/80 border-2 border-amber-100/80 p-5 sm:p-6 mb-4">
        {/* Tags & Question Number */}
        <div className="flex items-center gap-1.5 flex-wrap mb-3.5">
          <span className="text-xs font-black bg-gradient-to-r from-amber-400 to-orange-400 text-white px-2.5 py-0.5 rounded-full shadow-2xs">
            第 {currentQ.question_no} 題
          </span>
          {currentQ.tags?.map((t) => (
            <span key={t} className="text-[10px] font-bold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full border border-purple-200">
              #{t}
            </span>
          ))}
          <span className="text-[11px] font-bold text-amber-700/60 ml-auto bg-amber-50 px-2 py-0.5 rounded-full">
            配分 2.0 分
          </span>
        </div>

        {/* Stem */}
        <div className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed whitespace-pre-line mb-6 select-text">
          {currentQ.stem}
        </div>

        {/* Options */}
        <div className="space-y-3">
          {currentQ.options.map((opt) => {
            const isSelected = selectedAnswer === opt.key;
            const isAnswerKey = currentQ.answer === opt.key;

            let btnStyle = "border-amber-100 bg-amber-50/20 hover:bg-amber-50/60 text-slate-800 hover:border-amber-300";
            let badgeStyle = "bg-amber-100/80 text-amber-900 border-amber-200";

            if (isExamMode) {
              if (isSelected) {
                btnStyle = "border-amber-500 bg-amber-50 text-amber-950 font-bold ring-2 ring-amber-400/30";
                badgeStyle = "bg-amber-500 text-white border-amber-500";
              }
            } else {
              // Practice Mode Immediate Feedback
              if (isAnswered) {
                if (isAnswerKey) {
                  btnStyle = "border-emerald-400 bg-emerald-50 text-emerald-950 font-bold ring-2 ring-emerald-400/30";
                  badgeStyle = "bg-emerald-500 text-white border-emerald-500";
                } else if (isSelected && !isAnswerKey) {
                  btnStyle = "border-rose-300 bg-rose-50 text-rose-950 font-bold ring-2 ring-rose-300/30";
                  badgeStyle = "bg-rose-500 text-white border-rose-500";
                } else {
                  btnStyle = "border-slate-100 bg-slate-50/40 text-slate-400 opacity-60";
                }
              }
            }

            return (
              <button
                key={opt.key}
                onClick={() => handleSelectOption(opt.key)}
                className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3.5 text-xs sm:text-sm leading-relaxed select-none active:scale-[0.98] ${btnStyle}`}
              >
                <span className={`w-7 h-7 rounded-xl font-black flex items-center justify-center shrink-0 border text-xs shadow-2xs ${badgeStyle}`}>
                  {opt.key}
                </span>
                <span className="flex-1 pt-0.5">{opt.text}</span>
                {!isExamMode && isAnswered && isAnswerKey && (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 animate-bounce" />
                )}
                {!isExamMode && isAnswered && isSelected && !isAnswerKey && (
                  <XCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                )}
              </button>
            );
          })}
        </div>

        {/* Immediate Feedback Box (Practice Mode Only) */}
        {!isExamMode && isAnswered && (
          <div className="mt-5 pt-4 border-t-2 border-dashed border-amber-100 animate-in fade-in zoom-in-95 duration-200">
            <div className={`p-4 rounded-2xl text-xs sm:text-sm border-2 ${
              isCorrect 
                ? "bg-emerald-50 text-emerald-950 border-emerald-200" 
                : "bg-rose-50 text-rose-950 border-rose-200"
            }`}>
              <div className="flex items-center justify-between font-extrabold mb-1.5">
                <span className="flex items-center gap-1.5">
                  {isCorrect ? "🎉 恭喜答對！" : "❌ 哎呀答錯了！"}
                </span>
                <span className="bg-white/80 px-2.5 py-0.5 rounded-full border text-xs font-mono font-bold">
                  官方標準答案：{currentQ.answer}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                {currentQ.explanation || "該題答案來自考選部或主辦單位官方標準答案。建議仔細比對各選項核心概念！"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-amber-50/95 backdrop-blur-md border-t-2 border-amber-200/60 py-3.5 px-4 z-30 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="flex-1 py-3 px-3 rounded-2xl bg-white border-2 border-amber-200 text-amber-900 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none active:scale-95 transition"
          >
            <ArrowLeft className="w-4 h-4 text-amber-600" />
            <span>上一題</span>
          </button>

          {currentIndex === questions.length - 1 ? (
            <button
              onClick={handleFinish}
              className="flex-1 py-3 px-3 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-emerald-200 active:scale-95 transition"
            >
              <span>交卷算分 🧀</span>
              <CheckCircle2 className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setCurrentIndex(prev => Math.min(questions.length - 1, prev + 1))}
              className="flex-1 py-3 px-3 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 text-white font-black text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-amber-200 active:scale-95 transition"
            >
              <span>下一題</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
