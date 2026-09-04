import { useState, useEffect } from "react";
import { Navbar } from "./components/Navbar";
import { PaperCard } from "./components/PaperCard";
import { QuizView, type QuizResult } from "./components/QuizView";
import { ApplicationModal } from "./components/ApplicationModal";
import { ResultModal } from "./components/ResultModal";
import { MouseMascot } from "./components/MouseMascot";
import { MistakeNotebookModal } from "./components/MistakeNotebookModal";
import { getLocalMistakes, type MistakeItem } from "./services/mistakeService";
import { getFavoritePaperIds, toggleFavoritePaperId } from "./services/favoritesService";
import { searchExamPapers } from "./services/searchEngine";
import { 
  CATEGORIES, 
  PAPERS, 
  QUESTIONS_BY_PAPER, 
  type ExamPaper 
} from "./data/examsData";
import { initLiff, type LineUserProfile } from "./services/liffService";
import { 
  checkUserAccessStatus, 
  type AccessApplication, 
  type AccessStatus 
} from "./services/accessService";
import { Search, Sparkles } from "lucide-react";

export default function App() {
  const [user, setUser] = useState<LineUserProfile>({
    userId: "U_LOCAL_USER",
    displayName: "考友",
    isMock: true,
  });
  const [accessStatus, setAccessStatus] = useState<AccessStatus>("APPROVED");
  const [application, setApplication] = useState<AccessApplication | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [mistakes, setMistakes] = useState<MistakeItem[]>([]);
  const [isMistakeModalOpen, setIsMistakeModalOpen] = useState(false);
  const [favoritePaperIds, setFavoritePaperIds] = useState<string[]>([]);



  // Active quiz state
  const [selectedPaper, setSelectedPaper] = useState<ExamPaper | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  // Filter state
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const liffId = import.meta.env.VITE_LIFF_ID || "";
    initLiff(liffId).then(async (profile) => {
      setUser(profile);
      const { status, application: app } = await checkUserAccessStatus(profile.userId);
      if (status === "NONE" && profile.isMock) {
        setAccessStatus("APPROVED");
      } else {
        setAccessStatus(status);
      }
      setApplication(app);
      setMistakes(getLocalMistakes());
      setFavoritePaperIds(getFavoritePaperIds());
    });
  }, []);

  const totalQuestions = Object.values(QUESTIONS_BY_PAPER).reduce((acc, q) => acc + q.length, 0);
  // 1. Filter by category or favorites
  const categoryFiltered = PAPERS.filter((p) => {
    if (selectedCategory === "favorites") {
      return favoritePaperIds.includes(p.id);
    }
    if (selectedCategory !== "all") {
      return p.category_id === selectedCategory;
    }
    return true;
  });

  // 2. Intelligent Multi-token & Synonym search engine
  const filteredPapers = searchExamPapers(categoryFiltered, searchQuery);

  const handleToggleFavorite = (paperId: string) => {
    const { newFavorites } = toggleFavoritePaperId(paperId);
    setFavoritePaperIds(newFavorites);
  };

  const handleSelectPaper = (paper: ExamPaper) => {
    setSelectedPaper(paper);
  };

  const handleFinishQuiz = (result: QuizResult) => {
    setQuizResult(result);
    setMistakes(getLocalMistakes());
  };

  const handleRetryQuiz = () => {
    setQuizResult(null);
  };

  const handleOpenMistakes = () => {
    setMistakes(getLocalMistakes());
    setIsMistakeModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FFFDF9] text-slate-900 flex flex-col font-sans selection:bg-amber-200">
      {/* Navigation */}
      <Navbar
        user={user}
        accessStatus={accessStatus}
        onOpenApply={() => setIsApplyModalOpen(true)}
        onOpenMistakes={handleOpenMistakes}
        mistakeCount={mistakes.length}
        onBackToHome={() => {
          setSelectedPaper(null);
          setQuizResult(null);
        }}
        totalQuestions={totalQuestions}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {selectedPaper ? (
          /* Active Quiz Engine */
          <QuizView
            paper={selectedPaper}
            questions={QUESTIONS_BY_PAPER[selectedPaper.id] || []}
            onBack={() => setSelectedPaper(null)}
            onFinishQuiz={handleFinishQuiz}
            userId={user.userId}
          />
        ) : (
          /* Exam Catalog Home */
          <div className="max-w-3xl mx-auto px-4 py-6">
            {/* Cute Warm Banner */}
            <div className="relative overflow-hidden bg-gradient-to-br from-amber-400 via-orange-400 to-rose-400 rounded-3xl text-white p-6 shadow-lg shadow-amber-200/60 mb-6">
              <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-amber-50 text-xs font-black backdrop-blur-md mb-2.5 shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-200" />
                    已收錄 {totalQuestions} 道官方考古真題！
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-1.5 drop-shadow-xs">
                    哈囉！今天吃了幾塊芝士？🧀
                  </h2>
                  <p className="text-xs font-medium text-amber-50 max-w-sm leading-relaxed">
                    Study Mouse 陪你隨手刷考題！完整官方解答與解析，通勤排隊單手輕鬆複習～
                  </p>
                </div>

                {/* Big Cheerful Mouse */}
                <div className="self-center sm:self-auto shrink-0 drop-shadow-md">
                  <MouseMascot mood="celebrate" size={76} />
                </div>
              </div>

              {/* Decorative bubbles */}
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/15 rounded-full blur-xl pointer-events-none" />
              <div className="absolute left-1/3 -top-10 w-28 h-28 bg-yellow-300/20 rounded-full blur-xl pointer-events-none" />
            </div>

            {/* Search & Category Filter */}
            <div className="space-y-3 mb-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-amber-700/50 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜尋想練習的科目或關鍵字 (如：AI、大數據、法學、計算機)..."
                  className="w-full text-xs sm:text-sm pl-11 pr-4 py-3 bg-white/90 rounded-2xl border-2 border-amber-200/80 shadow-xs focus:outline-hidden focus:border-amber-400 focus:ring-3 focus:ring-amber-200/50 text-slate-800 placeholder:text-slate-400 transition"
                />
              </div>

              {/* Chunky Bubbly Category Pills */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-3.5 py-2 rounded-2xl font-black transition-all transform active:scale-95 whitespace-nowrap shadow-2xs ${
                    selectedCategory === "all"
                      ? "bg-amber-500 text-white shadow-md shadow-amber-200"
                      : "bg-white text-slate-700 border-2 border-amber-100 hover:border-amber-300"
                  }`}
                >
                  🧀 全部考題 ({PAPERS.length})
                </button>
                {/* Favorites Tab */}
                <button
                  onClick={() => setSelectedCategory("favorites")}
                  className={`px-3.5 py-2 rounded-2xl font-black transition-all transform active:scale-95 whitespace-nowrap shadow-2xs flex items-center gap-1.5 ${
                    selectedCategory === "favorites"
                      ? "bg-rose-500 text-white shadow-md shadow-rose-200"
                      : "bg-white text-rose-700 border-2 border-rose-100 hover:border-rose-300"
                  }`}
                >
                  <span>⭐ 我的最愛</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    selectedCategory === "favorites" ? "bg-white/20 text-white" : "bg-rose-100 text-rose-800"
                  }`}>
                    {favoritePaperIds.length}
                  </span>
                </button>
                {CATEGORIES.map((cat) => {
                  const count = PAPERS.filter(p => p.category_id === cat.id).length;
                  if (count === 0) return null;
                  const isAi = cat.id === "ipas";
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`px-3.5 py-2 rounded-2xl font-black transition-all transform active:scale-95 whitespace-nowrap shadow-2xs ${
                        selectedCategory === cat.id
                          ? "bg-amber-500 text-white shadow-md shadow-amber-200"
                          : "bg-white text-slate-700 border-2 border-amber-100 hover:border-amber-300"
                      }`}
                    >
                      {isAi ? "🤖 " : "📜 "}
                      {cat.name.replace(/（.*）/, "")} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Papers Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredPapers.map((paper) => (
                <PaperCard
                  key={paper.id}
                  paper={paper}
                  onSelect={handleSelectPaper}
                  isFavorite={favoritePaperIds.includes(paper.id)}
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>

            {filteredPapers.length === 0 && (
              <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-amber-200 p-8">
                <div className="text-3xl mb-2">🐭🔍</div>
                <p className="text-xs font-bold text-amber-800 mb-1">找不到相關試卷</p>
                <p className="text-[11px] text-slate-400">請嘗試換個關鍵字搜尋看看！</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modals */}
      <ApplicationModal
        isOpen={isApplyModalOpen}
        onClose={() => setIsApplyModalOpen(false)}
        user={user}
        currentApp={application}
        onStatusChanged={(status, app) => {
          setAccessStatus(status);
          setApplication(app);
        }}
      />

      <ResultModal
        result={quizResult}
        onClose={() => setQuizResult(null)}
        onRetry={handleRetryQuiz}
        onOpenMistakes={handleOpenMistakes}
      />

      <MistakeNotebookModal
        isOpen={isMistakeModalOpen}
        onClose={() => {
          setIsMistakeModalOpen(false);
          setMistakes(getLocalMistakes());
        }}
        mistakes={mistakes}
        onMistakesUpdated={(items) => setMistakes(items)}
        userId={user.userId}
      />
    </div>
  );
}
