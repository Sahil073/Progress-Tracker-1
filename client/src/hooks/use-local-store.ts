import { useState, useEffect, useCallback } from "react";
import { type Question } from "@shared/schema";
import confetti from "canvas-confetti";

const STORAGE_KEY = "coding-sheet-tracker-v1";

export function useLocalStore() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setQuestions(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load from local storage", e);
    }
    setIsInitialized(true);
  }, []);

  // Save to local storage whenever questions change
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
    }
  }, [questions, isInitialized]);

  const addQuestions = useCallback((newQuestions: Question[]) => {
    setQuestions((prev) => {
      // Avoid duplicates based on Title + Link
      const existingIds = new Set(prev.map((q) => `${q.title}-${q.link}`));
      const filteredNew = newQuestions.filter(
        (q) => !existingIds.has(`${q.title}-${q.link}`)
      );
      return [...prev, ...filteredNew];
    });
  }, []);

  const toggleQuestion = useCallback((index: number) => {
    setQuestions((prev) => {
      const newQuestions = [...prev];
      const wasCompleted = newQuestions[index].completed;
      newQuestions[index] = {
        ...newQuestions[index],
        completed: !wasCompleted,
      };

      // Trigger confetti if marking as completed and it was the last one (or significant milestone)
      if (!wasCompleted) {
        // Check if all are now completed
        const allCompleted = newQuestions.every((q) => q.completed);
        if (allCompleted && newQuestions.length > 0) {
           confetti({
             particleCount: 150,
             spread: 70,
             origin: { y: 0.6 },
             colors: ['#3b82f6', '#8b5cf6', '#10b981']
           });
        }
      }

      return newQuestions;
    });
  }, []);

  const deleteQuestion = useCallback((index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clearAll = useCallback(() => {
    if (confirm("Are you sure you want to clear all data? This cannot be undone.")) {
      setQuestions([]);
    }
  }, []);

  return {
    questions,
    addQuestions,
    toggleQuestion,
    deleteQuestion,
    clearAll,
    isInitialized,
  };
}
