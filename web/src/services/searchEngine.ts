import type { ExamPaper } from "../data/examsData";

// Taiwanese Exam Synonyms and Abbreviation Dictionary
const SYNONYMS: Record<string, string[]> = {
  "ai": ["人工智慧", "生成式", "機器學習", "prompt", "llm", "rag", "大數據"],
  "人工智慧": ["ai", "生成式", "機器學習", "prompt", "llm"],
  "計概": ["計算機概要", "計算機概論", "計算機大意", "資訊處理"],
  "計算機": ["計概", "計算機概要", "計算機概論", "計算機大意", "資訊處理"],
  "資處": ["資訊處理", "計算機"],
  "資訊": ["資訊處理", "計算機"],
  "法緒": ["法學緒論", "法學知識", "法學大意", "憲法"],
  "法學": ["法學大意", "法學知識", "法學緒論", "憲法", "行政法", "刑法", "法緒"],
  "憲法": ["中華民國憲法", "法學知識", "法學緒論"],
  "高普考": ["高等考試", "普通考試", "高考", "普考"],
  "高考": ["高等考試", "高考三級", "三等考試"],
  "普考": ["普通考試", "四等考試"],
  "初考": ["初等考試", "五等考試", "初等考"],
  "初等": ["初等考試", "五等考試", "初等考"],
  "特考": ["特種考試", "關務", "身障", "司法", "鐵路"],
  "關務": ["關務特考", "關務人員", "海關"],
  "司法": ["司法特考", "司法人員", "刑法", "法警", "監所"],
  "刑法": ["刑法概要", "司法人員", "司法"],
  "行政法": ["行政法概要", "普通考試", "高普考"],
  "行政學": ["行政學大意", "行政學概要", "初等考試", "普通考試"],
  "經濟": ["經濟學概要", "關務", "經建行政"],
  "國文": ["語文", "國語文", "作文", "測驗"],
  "英文": ["英語", "公民與英文", "法學知識與英文"],
  "淨零": ["淨零碳", "碳盤查", "碳管理", "esg", "節能減碳"],
  "碳": ["淨零碳", "碳盤查", "碳管理", "esg", "節能減碳"],
  "esg": ["淨零碳", "碳盤查", "節能減碳"],
};

/**
 * Normalizes query string: trims, lowercases, and replaces full-width characters.
 */
export function normalizeQuery(q: string): string {
  return q
    .trim()
    .toLowerCase()
    .replace(/[\uff01-\uff5e]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0xfee0))
    .replace(/\s+/g, " ");
}

/**
 * Expands a single search term with known synonyms.
 */
function expandTerm(term: string): string[] {
  const result = new Set<string>([term]);
  
  for (const [key, syns] of Object.entries(SYNONYMS)) {
    if (term === key || term.includes(key) || key.includes(term)) {
      syns.forEach((s) => result.add(s));
      result.add(key);
    }
  }

  return Array.from(result);
}

export interface SearchMatchResult {
  paper: ExamPaper;
  score: number;
}

/**
 * Intelligent Multi-Token & Multi-Field Search for Exam Papers.
 * Supports:
 * 1. Space-separated tokens (AND logic)
 * 2. Multi-field search (Subject, Exam Name, Session, Year ROC, Year Western, Category)
 * 3. Taiwanese exam synonyms and abbreviation expansion
 * 4. Relevance ranking (Title exact > prefix > contains > synonym match)
 */
export function searchExamPapers(papers: ExamPaper[], query: string): ExamPaper[] {
  const cleanQuery = normalizeQuery(query);
  if (!cleanQuery) return papers;

  const rawTokens = cleanQuery.split(" ").filter((t) => t.length > 0);
  if (rawTokens.length === 0) return papers;

  const scored: SearchMatchResult[] = [];

  for (const p of papers) {
    const subjectNorm = p.subject_name.toLowerCase();
    const examNorm = p.exam_name.toLowerCase();
    const sessionNorm = (p.session_name || "").toLowerCase();
    const yearRocStr = String(p.year_roc);
    const yearWestStr = String(p.year_western);
    const catStr = p.category_id.toLowerCase();

    // Composite searchable string
    const searchableText = `${subjectNorm} ${examNorm} ${sessionNorm} ${yearRocStr} ${yearWestStr} ${catStr} 民國${yearRocStr}年`;

    let totalScore = 0;
    let matchesAllTokens = true;

    for (const token of rawTokens) {
      const candidates = expandTerm(token);
      let tokenMatched = false;
      let tokenScore = 0;

      for (const cand of candidates) {
        if (subjectNorm === cand) {
          tokenScore = Math.max(tokenScore, 100);
          tokenMatched = true;
        } else if (subjectNorm.startsWith(cand)) {
          tokenScore = Math.max(tokenScore, 60);
          tokenMatched = true;
        } else if (subjectNorm.includes(cand)) {
          tokenScore = Math.max(tokenScore, 40);
          tokenMatched = true;
        } else if (examNorm.includes(cand)) {
          tokenScore = Math.max(tokenScore, 25);
          tokenMatched = true;
        } else if (sessionNorm.includes(cand)) {
          tokenScore = Math.max(tokenScore, 20);
          tokenMatched = true;
        } else if (searchableText.includes(cand)) {
          tokenScore = Math.max(tokenScore, 15);
          tokenMatched = true;
        }
      }

      if (!tokenMatched) {
        matchesAllTokens = false;
        break;
      }

      totalScore += tokenScore;
    }

    if (matchesAllTokens && totalScore > 0) {
      scored.push({ paper: p, score: totalScore });
    }
  }

  // Sort by highest relevance score descending
  scored.sort((a, b) => b.score - a.score);

  return scored.map((s) => s.paper);
}
