import type { FC } from "react";
import { Sparkles, User } from "lucide-react";
import type { LineUserProfile } from "../services/liffService";
import type { AccessStatus } from "../services/accessService";

interface NavbarProps {
  user: LineUserProfile;
  accessStatus: AccessStatus;
  onOpenApply: () => void;
  onBackToHome: () => void;
  onOpenMistakes: () => void;
  mistakeCount?: number;
  totalQuestions?: number;
}

export const Navbar: FC<NavbarProps> = ({
  user,
  onOpenApply,
  onBackToHome,
  onOpenMistakes,
  mistakeCount = 0,
  totalQuestions = 1314,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-amber-50/90 backdrop-blur-md border-b-2 border-amber-200/60 shadow-xs">
      <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Brand Logo & Mascot */}
        <button
          onClick={onBackToHome}
          className="flex items-center gap-2.5 text-left focus:outline-hidden group active:scale-95 transition transform"
        >
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-orange-400 to-rose-400 flex items-center justify-center text-white shadow-sm shadow-amber-200 text-xl font-bold group-hover:rotate-6 transition">
            🐭
          </div>
          <div>
            <div className="flex items-center gap-1.5 font-black text-slate-900 text-base leading-tight">
              <span className="bg-gradient-to-r from-amber-600 via-rose-600 to-purple-600 bg-clip-text text-transparent">
                Study Mouse
              </span>
              <span className="text-[10px] font-extrabold bg-amber-200/80 text-amber-900 px-2 py-0.5 rounded-full shadow-2xs">
                🧀 考鼠
              </span>
            </div>
            <span className="text-[11px] font-medium text-amber-800/70 block leading-tight">
              芝士就是力量 · 隨身刷題
            </span>
          </div>
        </button>

        {/* Right Status & Profile */}
        <div className="flex items-center gap-2">
          {/* Cheese Inventory Badge */}
          <div className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/90 text-amber-700 border border-amber-200 shadow-2xs">
            <span>🧀</span>
            <span>{totalQuestions} 題在庫</span>
          </div>

          {/* Mistake Notebook Button */}
          <button
            onClick={onOpenMistakes}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 hover:bg-white text-rose-700 border border-rose-200 shadow-2xs font-extrabold text-xs transition active:scale-95"
          >
            <span>📕</span>
            <span className="hidden xs:inline">錯題本</span>
            {mistakeCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
                {mistakeCount}
              </span>
            )}
          </button>

          {/* User Profile / Stage 2 Application */}
          <button
            onClick={onOpenApply}
            className="flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full bg-white/80 hover:bg-white border border-amber-200/80 shadow-2xs transition active:scale-95"
          >
            {user.pictureUrl ? (
              <img
                src={user.pictureUrl}
                alt={user.displayName}
                className="w-6 h-6 rounded-full ring-2 ring-amber-300 object-cover"
              />
            ) : (
              <div className="w-6 h-6 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-xs">
                <User className="w-3.5 h-3.5" />
              </div>
            )}
            <span className="text-xs font-bold text-slate-700 max-w-[70px] truncate">
              {user.displayName}
            </span>
            <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
          </button>
        </div>
      </div>
    </header>
  );
};
