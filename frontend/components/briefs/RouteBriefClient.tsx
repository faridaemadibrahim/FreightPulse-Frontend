"use client";

import { useState, useEffect, useRef } from "react";
import { Port } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RouteBriefForm from "./RouteBriefForm";
import RouteBriefStatus from "./RouteBriefStatus";
import RouteBriefResult from "./RouteBriefResult";
import routeBriefMock from "@/mocks/route-brief-result.json";
import { RouteBriefResultData } from "@/lib/types";
import {
  requestRouteBrief,
  getRouteBriefStatus,
  RouteBriefRequest,
  RouteBriefDetailResponse,
} from "@/lib/api/route-brief";
import { AlertTriangle, ArrowLeft } from "lucide-react";

interface RouteBriefClientProps {
  ports: Port[];
}

type StepState = "form" | "generating" | "result" | "error";

export default function RouteBriefClient({ ports }: RouteBriefClientProps) {
  const [step, setStep] = useState<StepState>("form");
  const [errorMessage, setErrorMessage] = useState("");
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

  // Track metadata for display in the loader steps
  const [activeRequest, setActiveRequest] = useState<RouteBriefRequest | null>(
    null,
  );
  const [currentStepIndex, setCurrentStepIndex] = useState(1); // 1 to 4

  const handleFormSubmit = async (request: RouteBriefRequest) => {
    setStep("generating");
    setActiveRequest(request);
    setCurrentStepIndex(1);
    setErrorMessage("");

    try {
      const response = await requestRouteBrief(request);
      startPolling(response.brief_id);
    } catch (error: any) {
      setStep("error");
      setErrorMessage(
        error.message || "Failed to initialize Route Brief request.",
      );
    }
  };

  const startPolling = (id: string) => {
    let attempts = 0;
    const maxAttempts = 30; // Max 60 seconds (30 * 2s)

    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    pollingIntervalRef.current = setInterval(async () => {
      attempts++;
      if (attempts > maxAttempts) {
        setStep("error");
        setErrorMessage("Request timed out. AI generation took too long.");
        if (pollingIntervalRef.current)
          clearInterval(pollingIntervalRef.current);
        return;
      }

      // Update local loading steps simulating progress over attempts
      if (attempts === 2) {
        setCurrentStepIndex(2);
      } else if (attempts === 4) {
        setCurrentStepIndex(3);
      } else if (attempts === 6) {
        setCurrentStepIndex(4);
      }

      try {
        const data = await getRouteBriefStatus(id);

        if (data.status === "completed") {
          if (pollingIntervalRef.current)
            clearInterval(pollingIntervalRef.current);
          setResult(data as RouteBriefDetailResponse);
          setStep("result");
        } else if (data.status === "failed") {
          if (pollingIntervalRef.current)
            clearInterval(pollingIntervalRef.current);
          setStep("error");
          setErrorMessage(
            "AI intelligence engine failed to produce the route brief.",
          );
        }
        // TODO: once backend confirms the real status values, add the
        // matching branch(es) here (e.g. "pending" / "processing").
      } catch (error: any) {
        // Log error but keep polling in case it's a temporary connection issue
        console.warn("Polling status error:", error);
      }
    }, 2000);
  };

  const resetForm = () => {
    setStep("form");
    setResult(null);
    setErrorMessage("");
    setActiveRequest(null);
    setCurrentStepIndex(1);
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
  };

  const getPortName = (code: string) => {
    const port = ports.find((p) => p.code === code || p.name === code);
    return port ? port.name : code;
  };

  return (
    <div className="w-full">
      {/* 1. Form Step */}
      {step === "form" && (
        <RouteBriefForm ports={ports} onSubmit={handleFormSubmit} />
      )}

      {/* 2. Generating / Loader Step */}
      {step === "generating" && activeRequest && (
        <RouteBriefStatus
          origin={activeRequest.origin}
          destination={activeRequest.destination}
          cargoType={activeRequest.cargo_type}
          currentStepIndex={currentStepIndex}
          getPortName={getPortName}
        />
      )}

      {/* 3. Error Step */}
      {step === "error" && (
        <Card className="max-w-md mx-auto p-8 border border-rose-200 dark:border-rose-900/30 bg-rose-50/10 flex flex-col items-center text-center space-y-5 shadow-xs">
          <div className="p-3 bg-rose-100 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-full">
            <AlertTriangle className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-foreground">
              Generation Failed
            </h3>
            <p className="text-sm text-muted-foreground">{errorMessage}</p>
          </div>
          <Button
            onClick={resetForm}
            className="mt-2 bg-foreground text-background hover:opacity-90"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Try again
          </Button>
        </Card>
      )}

      {/* 4. Display Results Step */}
      {/* NOTE: currently always shows mock data regardless of `result`,
          since /route-brief isn't live on the backend yet.
          Once it is, swap `routeBriefMock` for `result` here
          (after unifying RouteBriefDetailResponse / RouteBriefResultData). */}
      {step === "result" && (
        <RouteBriefResult
          data={routeBriefMock as RouteBriefResultData}
          onNewBrief={resetForm}
        />
      )}
    </div>
  );
}
