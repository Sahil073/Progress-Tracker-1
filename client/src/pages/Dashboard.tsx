import { useState, useRef } from "react";
import { useParseExcel, useParseGithub } from "@/hooks/use-parser";
import { useLocalStore } from "@/hooks/use-local-store";
import { ImportCard } from "@/components/ImportCard";
import { QuestionList } from "@/components/QuestionList";
import { ProgressBar } from "@/components/ProgressBar";
import { Button } from "@/components/ui/button"; // Assuming shadcn button available or we'll style one
import { useToast } from "@/hooks/use-toast";
import { FileSpreadsheet, Github, Upload, Loader2, Trash, CheckCircle2, LayoutDashboard } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const { toast } = useToast();
  const {
    questions,
    addQuestions,
    toggleQuestion,
    deleteQuestion,
    clearAll,
    isInitialized,
  } = useLocalStore();

  const [importMode, setImportMode] = useState<"none" | "excel" | "github">("none");
  const [githubUrl, setGithubUrl] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const excelMutation = useParseExcel();
  const githubMutation = useParseGithub();

  const total = questions.length;
  const completed = questions.filter((q) => q.completed).length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleExcelUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast({
      title: "Parsing Excel file...",
      description: "Please wait while we process your sheet.",
    });

    excelMutation.mutate(file, {
      onSuccess: (data) => {
        addQuestions(data);
        toast({
          title: "Import Successful",
          description: `Added ${data.length} questions from Excel.`,
        });
        setImportMode("none");
        if (fileInputRef.current) fileInputRef.current.value = "";
      },
      onError: (error) => {
        toast({
          variant: "destructive",
          title: "Import Failed",
          description: error.message,
        });
      },
    });
  };

  const handleGithubImport = () => {
    if (!githubUrl) return;

    toast({
      title: "Fetching from GitHub...",
      description: "This might take a moment.",
    });

    githubMutation.mutate(
      { url: githubUrl },
      {
        onSuccess: (data) => {
          addQuestions(data);
          toast({
            title: "Import Successful",
            description: `Added ${data.length} questions from GitHub.`,
          });
          setGithubUrl("");
          setImportMode("none");
        },
        onError: (error) => {
          toast({
            variant: "destructive",
            title: "Import Failed",
            description: error.message,
          });
        },
      }
    );
  };

  if (!isInitialized) return null; // Avoid flash of empty state

  return (
    <div className="min-h-screen bg-background text-foreground font-sans pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold font-display tracking-tight">SheetTracker</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col items-end mr-2">
              <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Progress</span>
              <span className="text-sm font-bold">{percentage}% Done</span>
            </div>
            {questions.length > 0 && (
              <button
                onClick={clearAll}
                className="p-2 text-muted-foreground hover:text-destructive transition-colors rounded-md hover:bg-destructive/10"
                title="Clear all data"
              >
                <Trash className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8 space-y-12">
        {/* Progress Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-end mb-2">
            <h2 className="text-2xl font-bold font-display">Your Progress</h2>
            <span className="text-sm font-medium text-primary">
              {completed} / {total} Questions
            </span>
          </div>
          <ProgressBar total={total} completed={completed} />
        </section>

        {/* Import Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold font-display">Add Questions</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImportCard
              title="Import Excel Sheet"
              description="Upload .xlsx or .csv files with question titles and links."
              icon={<FileSpreadsheet className="w-6 h-6" />}
              active={importMode === "excel"}
              onClick={() => setImportMode(importMode === "excel" ? "none" : "excel")}
            />
            
            <ImportCard
              title="Import from GitHub"
              description="Paste a link to a README.md or file containing a question list."
              icon={<Github className="w-6 h-6" />}
              active={importMode === "github"}
              onClick={() => setImportMode(importMode === "github" ? "none" : "github")}
            />
          </div>

          {/* Import Forms */}
          <div className="mt-6">
            {importMode === "excel" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-card border border-border rounded-xl p-8 text-center"
              >
                <div className="max-w-md mx-auto space-y-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                    <Upload className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-bold">Upload your sheet</h3>
                  <p className="text-sm text-muted-foreground">
                    Ensure your Excel file has columns for "Title" and "Link".
                  </p>
                  
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleExcelUpload}
                  />
                  
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={excelMutation.isPending}
                    className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 transition-all flex items-center justify-center gap-2"
                  >
                    {excelMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Processing...
                      </>
                    ) : (
                      "Select File"
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {importMode === "github" && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="bg-card border border-border rounded-xl p-8"
              >
                <div className="max-w-md mx-auto space-y-4">
                  <h3 className="text-lg font-bold text-center">Enter GitHub URL</h3>
                  <p className="text-sm text-muted-foreground text-center">
                    We'll try to parse question lists from the file content.
                  </p>
                  
                  <div className="space-y-2">
                    <input
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/user/repo/blob/main/README.md"
                      className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition-all"
                    />
                  </div>

                  <button
                    onClick={handleGithubImport}
                    disabled={githubMutation.isPending || !githubUrl}
                    className="w-full py-3 px-4 bg-primary text-primary-foreground font-semibold rounded-xl shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:transform-none transition-all flex items-center justify-center gap-2"
                  >
                    {githubMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" /> Fetching...
                      </>
                    ) : (
                      "Import Questions"
                    )}
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </section>

        {/* Questions List */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <LayoutDashboard className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold font-display">Your Sheet</h2>
          </div>
          
          <QuestionList
            questions={questions}
            onToggle={toggleQuestion}
            onDelete={deleteQuestion}
          />
        </section>
      </main>
    </div>
  );
}
