"use client";

import { useState, useEffect, useRef } from "react";
import { Port } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import RouteBriefForm from "./RouteBriefForm";
import {
  requestRouteBrief,
  getRouteBriefStatus,
  RouteBriefRequest,
  RouteBriefDetailResponse,
} from "@/lib/api/route-brief";
import {
  Loader2,
  AlertTriangle,
  ArrowLeft,
  FileDown,
  CheckCircle,
  Clock,
  ExternalLink,
} from "lucide-react";

interface RouteBriefClientProps {
  ports: Port[];
}

type StepState = "form" | "generating" | "result" | "error";

export default function RouteBriefClient({ ports }: RouteBriefClientProps) {
  const [step, setStep] = useState<StepState>("form");
  const [loadingText, setLoadingText] = useState("Submitting request...");
  const [errorMessage, setErrorMessage] = useState("");
  const [briefId, setBriefId] = useState<string>("");
  const [result, setResult] = useState<RouteBriefDetailResponse | null>(null);

  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clear polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const handleFormSubmit = async (request: RouteBriefRequest) => {
    setStep("generating");
    setLoadingText("Initializing AI route intelligence engine...");
    setErrorMessage("");

    try {
      const response = await requestRouteBrief(request);
      setBriefId(response.brief_id);

      // Start status polling
      startPolling(response.brief_id);
    } catch (error: any) {
      setStep("error");
      setErrorMessage(error.message || "Failed to initialize Route Brief request.");
    }
  };

  const startPolling = (id: string) => {
    let attempts = 0;
    const maxAttempts = 30; // Max 60 seconds (30 * 2s)

    // Clear previous if any
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    setLoadingText("AI is generating report (usually ready in under 30s)...");

    pollingIntervalRef.current = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        setStep("error");
        setErrorMessage("Request timed out. AI generation took too long.");
        if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
        return;
      }

      try {
        const data = await getRouteBriefStatus(id);

        if (data.status === "processing") {
          setLoadingText("Synthesizing freight rates and carrier signals...");
        } else if (data.status === "completed") {
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          setResult(data as RouteBriefDetailResponse);
          setStep("result");
        } else if (data.status === "failed") {
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          setStep("error");
          setErrorMessage("AI intelligence engine failed to produce the route brief.");
        }
      } catch (error: any) {
        // Log error but keep polling in case it's a temporary connection issue
        console.warn("Polling status error:", error);
      }
    }, 2000);
  };

  const resetForm = () => {
    setStep("form");
    setResult(null);
    setBriefId("");
    setErrorMessage("");
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
  };

  const downloadPdfSimulate = () => {
    alert("Downloading PDF document... (Simulation)");
  };

  // Helper colors for recommendations and risk levels
  const getRecColor = (rec: string) => {
    switch (rec) {
      case "ship_now":
        return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30";
      case "reroute":
        return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30";
      default:
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/30";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "low":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
      case "medium":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      default:
        return "bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400";
    }
  };

  return (
    <div className="w-full">
      {/* 1. Form Step */}
      {step === "form" && (
        <RouteBriefForm ports={ports} onSubmit={handleFormSubmit} />
      )}

      {/* 2. Generating / Loader Step */}
      {step === "generating" && (
        <Card className="max-w-xl mx-auto p-12 border border-border flex flex-col items-center justify-center text-center space-y-6 shadow-sm">
          <div className="relative flex items-center justify-center">
            <div className="h-16 w-16 rounded-full border-4 border-blue-100 dark:border-blue-950 animate-pulse" />
            <Loader2 className="h-8 w-8 text-blue-600 dark:text-blue-400 animate-spin absolute" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Generating Route Brief</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              {loadingText}
            </p>
          </div>
          <div className="w-full max-w-xs bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full animate-[progress_15s_ease-out_infinite]" style={{ width: "85%" }} />
          </div>
        </Card>
      )}

      {/* 3. Error Step */}
      {step === "error" && (
        <Card className="max-w-md mx-auto p-8 border border-rose-200 dark:border-rose-900/30 bg-rose-50/10 flex flex-col items-center text-center space-y-5 shadow-xs">
          <div className="p-3 bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-full">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">Generation Failed</h3>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
          </div>
          <Button onClick={resetForm} className="mt-2 bg-foreground text-background hover:opacity-90">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Try again
          </Button>
        </Card>
      )}

      {/* 4. Display Results Step */}
      {step === "result" && result && (
        <div className="space-y-6 max-w-5xl mx-auto">
          {/* Top navigation controls */}
          <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between border-b pb-5">
            <Button variant="ghost" onClick={resetForm} className="w-fit">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Generate another brief
            </Button>

            <div className="flex flex-wrap gap-2">
              <Button onClick={downloadPdfSimulate} variant="outline" className="flex items-center gap-2">
                <FileDown className="h-4 w-4" />
                Download PDF
              </Button>
            </div>
          </div>

          {/* Metadata Badges Card */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 border border-border flex items-center gap-4">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-muted-foreground">
                <Clock className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <span className="text-xs text-muted-foreground block font-medium">Brief ID</span>
                <span className="text-sm font-semibold tracking-mono">{result.brief_id}</span>
              </div>
            </Card>

            <Card className="p-4 border border-border flex items-center gap-4">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-muted-foreground">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div className="space-y-0.5 w-full">
                <span className="text-xs text-muted-foreground block font-medium">Recommendation</span>
                <Badge variant="outline" className={`px-2.5 py-0.5 text-xs font-semibold uppercase ${getRecColor(result.recommendation)}`}>
                  {result.recommendation.replace("_", " ")}
                </Badge>
              </div>
            </Card>

            <Card className="p-4 border border-border flex items-center gap-4">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-muted-foreground">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="space-y-0.5 w-full">
                <span className="text-xs text-muted-foreground block font-medium">Risk Level</span>
                <Badge variant="secondary" className={`px-2.5 py-0.5 text-xs font-semibold uppercase ${getRiskColor(result.risk_level)}`}>
                  {result.risk_level} Risk
                </Badge>
              </div>
            </Card>
          </div>

          {/* Document Content */}
          <Card className="border border-border">
            <CardContent className="p-8 prose prose-slate dark:prose-invert max-w-none">
              {/* Simple Markdown Parser/Display */}
              <div className="whitespace-pre-wrap font-sans text-sm md:text-base leading-relaxed text-foreground/90 space-y-4">
                {result.brief_markdown.split("\n\n").map((paragraph, index) => {
                  if (paragraph.startsWith("# ")) {
                    return (
                      <h1 key={index} className="text-2xl md:text-3xl font-extrabold text-foreground border-b pb-2 pt-4">
                        {paragraph.replace("# ", "")}
                      </h1>
                    );
                  }
                  if (paragraph.startsWith("## ")) {
                    return (
                      <h2 key={index} className="text-lg md:text-xl font-bold text-foreground pt-4 flex items-center gap-2">
                        {paragraph.replace("## ", "")}
                      </h2>
                    );
                  }
                  if (paragraph.startsWith("- ")) {
                    return (
                      <ul key={index} className="list-disc pl-5 space-y-1.5 my-2">
                        {paragraph.split("\n").map((li, lIdx) => (
                          <li key={lIdx} className="text-muted-foreground">
                            {li.replace("- ", "")}
                          </li>
                        ))}
                      </ul>
                    );
                  }
                  return (
                    <p key={index} className="text-muted-foreground md:leading-loose">
                      {paragraph}
                    </p>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
