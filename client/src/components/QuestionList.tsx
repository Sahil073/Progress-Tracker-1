import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type Question } from "@shared/schema";
import { Check, Trash2, ExternalLink, Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuestionListProps {
  questions: Question[];
  onToggle: (index: number) => void;
  onDelete: (index: number) => void;
}

export function QuestionList({ questions, onToggle, onDelete }: QuestionListProps) {
  const [filter, setFilter] = useState<"all" | "completed" | "pending">("all");
  const [search, setSearch] = useState("");

  const filteredQuestions = questions
    .map((q, i) => ({ ...q, originalIndex: i }))
    .filter((q) => {
      const matchesSearch = q.title.toLowerCase().includes(search.toLowerCase()) || 
                            q.category?.toLowerCase().includes(search.toLowerCase());
      const matchesFilter =
        filter === "all"
          ? true
          : filter === "completed"
          ? q.completed
          : !q.completed;
      return matchesSearch && matchesFilter;
    });

  if (questions.length === 0) {
    return (
      <div className="text-center py-24 px-4">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Filter className="w-8 h-8 text-muted-foreground/50" />
        </div>
        <h3 className="text-xl font-bold text-foreground">No questions yet</h3>
        <p className="text-muted-foreground mt-2 max-w-sm mx-auto">
          Import a sheet from Excel or GitHub to get started tracking your progress.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search questions..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-background border border-border focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
        </div>

        <div className="flex gap-2 p-1 bg-muted/50 rounded-lg">
          {(["all", "pending", "completed"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-1.5 rounded-md text-sm font-medium transition-all capitalize",
                filter === f
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredQuestions.map((q) => (
            <motion.div
              key={`${q.title}-${q.originalIndex}`}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className={cn(
                "group relative flex items-center gap-4 p-4 rounded-xl border transition-all duration-200",
                q.completed 
                  ? "bg-primary/5 border-primary/20" 
                  : "bg-card border-border hover:border-primary/30 hover:shadow-md"
              )}
            >
              <button
                onClick={() => onToggle(q.originalIndex)}
                className={cn(
                  "flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-300",
                  q.completed
                    ? "bg-primary border-primary text-primary-foreground scale-110"
                    : "border-muted-foreground/30 hover:border-primary text-transparent"
                )}
              >
                <Check className="w-3.5 h-3.5" strokeWidth={3} />
              </button>

              <div className="flex-grow min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className={cn(
                    "font-medium text-base truncate transition-all duration-300",
                    q.completed ? "text-muted-foreground line-through decoration-primary/30" : "text-foreground"
                  )}>
                    {q.title}
                  </h4>
                  {q.category && (
                    <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-secondary text-secondary-foreground">
                      {q.category}
                    </span>
                  )}
                </div>
                {q.link && (
                  <a
                    href={q.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primary hover:text-primary/80 hover:underline inline-flex items-center gap-1 transition-colors"
                  >
                    View Problem <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <button
                onClick={() => onDelete(q.originalIndex)}
                className="opacity-0 group-hover:opacity-100 p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg transition-all"
                title="Delete question"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {filteredQuestions.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            No questions match your filter.
          </div>
        )}
      </div>
    </div>
  );
}
