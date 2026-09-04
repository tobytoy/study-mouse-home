import type { FC } from "react";
import { ArrowRight, Heart } from "lucide-react";
import type { ExamPaper } from "../data/examsData";

interface PaperCardProps {
  paper: ExamPaper;
  onSelect: (paper: ExamPaper) => void;
  isFavorite?: boolean;
  onToggleFavorite?: (paperId: string) => void;
}

export const PaperCard: FC<PaperCardProps> = ({ 
  paper, 
  onSelect, 
  isFavorite = false, 
  onToggleFavorite 
}) => {
  const isAiExam = paper.category_id === "ipas";

  return (
    <div className="bg-white/90 backdrop-blur-xs rounded-3xl border-2 border-amber-100 hover:border-amber-300 p-5 shadow-xs hover:shadow-md hover:shadow-amber-100/50 transition-all duration-200 flex flex-col justify-between group">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <span 
            className={`text-[10px] font-black px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs ${
              isAiExam 
                ? "bg-purple-100 text-purple-800 border border-purple-200" 
                : "bg-blue-100 text-blue-800 border border-blue-200"
            }`}
          >
            {isAiExam ? "🤖 iPAS AI" : "📜 國家考試"}
          </span>
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-bold text-amber-800/60 bg-amber-50 px-2 py-0.5 rounded-full">
              民國{paper.year_roc}年
            </span>
            {onToggleFavorite && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(paper.id);
                }}
                className={`p-1 rounded-full transition active:scale-90 ${
                  isFavorite 
                    ? "text-rose-500 bg-rose-50 border border-rose-200 shadow-2xs" 
                    : "text-slate-300 hover:text-rose-400 hover:bg-rose-50/50"
                }`}
                title={isFavorite ? "從我的最愛移除" : "加入我的最愛"}
              >
                <Heart className={`w-3.5 h-3.5 ${isFavorite ? "fill-rose-500 text-rose-500" : ""}`} />
              </button>
            )}
          </div>
        </div>
        {/* Subject Name */}
        <h4 className="font-extrabold text-slate-900 text-base mb-1 group-hover:text-amber-600 transition">
          {paper.subject_name}
        </h4>
        <p className="text-xs font-medium text-slate-500 line-clamp-1 mb-4">
          {paper.exam_name} {paper.session_name ? `· ${paper.session_name}` : ""}
        </p>
      </div>

      {/* Footer Info & Action */}
      <div className="pt-3 border-t border-amber-100/80 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 px-2 py-0.5 rounded-lg border border-amber-200/60 text-[11px]">
            🧀 {paper.question_count} 題
          </span>
        </div>

        <button
          onClick={() => onSelect(paper)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black shadow-sm shadow-amber-200 active:scale-95 transition transform"
        >
          <span>開始刷題</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
