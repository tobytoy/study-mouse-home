import type { FC } from "react";

interface MouseMascotProps {
  mood?: "happy" | "thinking" | "celebrate" | "comfort";
  speechText?: string;
  size?: number;
}

export const MouseMascot: FC<MouseMascotProps> = ({
  mood = "happy",
  speechText,
  size = 56,
}) => {
  return (
    <div className="flex items-center gap-2.5">
      {/* Adorable Vector Mouse Mascot */}
      <div 
        className="relative shrink-0 select-none animate-bounce duration-1000"
        style={{ width: size, height: size }}
      >
        <svg
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          {/* Left Ear */}
          <circle cx="26" cy="28" r="18" fill="#F87171" opacity="0.3" />
          <circle cx="26" cy="28" r="15" fill="#FED7AA" />
          <circle cx="26" cy="28" r="9" fill="#F472B6" opacity="0.6" />

          {/* Right Ear */}
          <circle cx="74" cy="28" r="18" fill="#F87171" opacity="0.3" />
          <circle cx="74" cy="28" r="15" fill="#FED7AA" />
          <circle cx="74" cy="28" r="9" fill="#F472B6" opacity="0.6" />

          {/* Mouse Head */}
          <circle cx="50" cy="56" r="32" fill="#FED7AA" />
          <ellipse cx="50" cy="62" rx="22" ry="16" fill="#FFFBEB" />

          {/* Cheeks Blush */}
          <circle cx="30" cy="62" r="6" fill="#FB7185" opacity="0.4" />
          <circle cx="70" cy="62" r="6" fill="#FB7185" opacity="0.4" />

          {/* Eyes based on mood */}
          {mood === "celebrate" ? (
            <>
              {/* Crescent squinting joyful eyes */}
              <path d="M36 50 C38 46 44 46 46 50" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M54 50 C56 46 62 46 64 50" stroke="#1E293B" strokeWidth="3.5" strokeLinecap="round" />
            </>
          ) : mood === "thinking" ? (
            <>
              <circle cx="41" cy="48" r="4" fill="#1E293B" />
              <circle cx="43" cy="46" r="1.5" fill="#FFFFFF" />
              <circle cx="59" cy="47" r="4" fill="#1E293B" />
              <circle cx="61" cy="45" r="1.5" fill="#FFFFFF" />
            </>
          ) : (
            <>
              {/* Big sparkling eyes */}
              <circle cx="40" cy="50" r="4.5" fill="#1E293B" />
              <circle cx="42" cy="48" r="1.8" fill="#FFFFFF" />
              <circle cx="60" cy="50" r="4.5" fill="#1E293B" />
              <circle cx="62" cy="48" r="1.8" fill="#FFFFFF" />
            </>
          )}

          {/* Nose */}
          <ellipse cx="50" cy="57" rx="3.5" ry="2.5" fill="#E11D48" />

          {/* Mouth */}
          {mood === "celebrate" ? (
            <path d="M44 63 Q50 71 56 63" stroke="#1E293B" strokeWidth="3" strokeLinecap="round" fill="#F43F5E" />
          ) : (
            <path d="M45 61 Q50 67 55 61" stroke="#1E293B" strokeWidth="2.5" strokeLinecap="round" />
          )}

          {/* Whiskers */}
          <line x1="20" y1="58" x2="10" y2="56" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
          <line x1="21" y1="64" x2="11" y2="67" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
          <line x1="80" y1="58" x2="90" y2="56" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
          <line x1="79" y1="64" x2="89" y2="67" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />

          {/* Mini Graduation Hat or Cheese Prop */}
          {mood === "celebrate" ? (
            <g transform="translate(30, 8) rotate(-10)">
              <polygon points="20,0 40,8 20,16 0,8" fill="#4F46E5" />
              <rect x="10" y="10" width="20" height="7" fill="#3730A3" rx="2" />
              <line x1="20" y1="8" x2="35" y2="18" stroke="#FBBF24" strokeWidth="2" />
              <circle cx="35" cy="18" r="2.5" fill="#F59E0B" />
            </g>
          ) : (
            /* Tiny Cheese on head */
            <g transform="translate(56, 16) rotate(15) scale(0.6)">
              <polygon points="10,0 30,10 10,25" fill="#FBBF24" />
              <circle cx="15" cy="10" r="2" fill="#D97706" opacity="0.6" />
              <circle cx="18" cy="17" r="1.5" fill="#D97706" opacity="0.6" />
            </g>
          )}
        </svg>
      </div>

      {/* Speech Bubble */}
      {speechText && (
        <div className="relative bg-white/95 backdrop-blur-xs px-3.5 py-2 rounded-2xl border-2 border-amber-200/80 shadow-xs shadow-amber-100 text-xs font-bold text-slate-700 max-w-[240px] leading-snug animate-in fade-in zoom-in-95 duration-200">
          {speechText}
          <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-3 h-3 bg-white border-l-2 border-b-2 border-amber-200/80 transform rotate-45" />
        </div>
      )}
    </div>
  );
};
