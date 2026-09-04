import { supabase } from "./supabaseClient";
import type { ExamPaper, ExamQuestion } from "../data/examsData";

export interface MistakeItem {
  id: string; // unique key: paperId:questionNo
  paperId: string;
  questionNo: number;
  subjectName: string;
  examName: string;
  stem: string;
  options: Array<{ key: string; text: string }>;
  answer: string;
  userChoice: string;
  explanation?: string | null;
  tags?: string[];
  wrongCount: number;
  lastWrongAt: string;
}

const STORAGE_KEY = "studymouse_mistakes";

export function getLocalMistakes(): MistakeItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn("Failed to load mistakes from storage", e);
  }
  return [];
}

export function saveLocalMistakes(items: MistakeItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.warn("Failed to save mistakes to storage", e);
  }
}

export async function recordMistake(
  paper: ExamPaper,
  question: ExamQuestion,
  userChoice: string,
  lineUserId?: string
): Promise<void> {
  const mistakes = getLocalMistakes();
  const id = `${paper.id}:${question.question_no}`;
  const now = new Date().toISOString();

  const existingIdx = mistakes.findIndex(m => m.id === id);
  if (existingIdx >= 0) {
    mistakes[existingIdx].wrongCount += 1;
    mistakes[existingIdx].userChoice = userChoice;
    mistakes[existingIdx].lastWrongAt = now;
  } else {
    mistakes.unshift({
      id,
      paperId: paper.id,
      questionNo: question.question_no,
      subjectName: paper.subject_name,
      examName: paper.exam_name,
      stem: question.stem,
      options: question.options,
      answer: question.answer || "",
      userChoice,
      explanation: question.explanation,
      tags: question.tags,
      wrongCount: 1,
      lastWrongAt: now,
    });
  }

  saveLocalMistakes(mistakes);

  // Sync to Supabase if connected
  if (supabase && lineUserId) {
    try {
      // Find member UUID by lineUserId
      const { data: member } = await supabase
        .from("members")
        .select("id")
        .eq("line_user_id", lineUserId)
        .maybeSingle();

      if (member) {
        await supabase.from("member_study_progress").upsert({
          member_id: member.id,
          paper_id: paper.id,
          question_no: question.question_no,
          selected_answer: userChoice,
          is_correct: false,
          wrong_count: (existingIdx >= 0 ? mistakes[existingIdx].wrongCount : 1),
          last_answered_at: now,
        }, { onConflict: "member_id,paper_id,question_no" });
      }
    } catch (e) {
      console.warn("[MistakeService] Supabase sync failed:", e);
    }
  }
}

export async function resolveMistake(
  paperId: string,
  questionNo: number,
  lineUserId?: string
): Promise<void> {
  const mistakes = getLocalMistakes();
  const id = `${paperId}:${questionNo}`;
  const filtered = mistakes.filter(m => m.id !== id);
  saveLocalMistakes(filtered);

  if (supabase && lineUserId) {
    try {
      const { data: member } = await supabase
        .from("members")
        .select("id")
        .eq("line_user_id", lineUserId)
        .maybeSingle();

      if (member) {
        await supabase.from("member_study_progress").upsert({
          member_id: member.id,
          paper_id: paperId,
          question_no: questionNo,
          is_correct: true,
          last_answered_at: new Date().toISOString(),
        }, { onConflict: "member_id,paper_id,question_no" });
      }
    } catch (e) {
      console.warn("[MistakeService] Supabase resolve failed:", e);
    }
  }
}

export function clearAllMistakes(): void {
  localStorage.removeItem(STORAGE_KEY);
}
