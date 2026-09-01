"use client";

import { useState, useEffect, useRef } from "react";
import { Port, CarrierInfo } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RouteBriefForm from "./RouteBriefForm";
import RouteBriefStatus from "./RouteBriefStatus";
import RouteBriefResult from "./RouteBriefResult";
import {
  requestRouteBrief,
  getRouteBriefStatus,
  getRouteBrief,
  RouteBriefRequest,
  RouteBriefResponse,
} from "@/lib/api/route-brief";
import { AlertTriangle, ArrowLeft } from "lucide-react";

interface RouteBriefClientProps {
  ports: Port[];
  carriers: CarrierInfo[];
}

type StepState = "form" | "generating" | "result" | "error";

export default function RouteBriefClient({
  ports,
  carriers,
}: RouteBriefClientProps) {
  const [step, setStep] = useState<StepState>("form");
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<RouteBriefResponse | null>(null);

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

      // The backend normally returns a "pending" record that requires polling
      // /status. If it ever comes back already completed, the POST response
      // still only carries { id, status }, so fetch the full record.
      if (response.status === "completed") {
        setResult(await getRouteBrief(response.id));
        setStep("result");
      } else {
        startPolling(response.id);
      }
    } catch (error: unknown) {
      setStep("error");
      const message =
        error instanceof Error
          ? error.message
          : "Failed to initialize Route Brief request.";
      setErrorMessage(message);
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
          // /status only carries { id, status } — fetch the full record so
          // brief_markdown, recommendation and risk_level are populated.
          setResult(await getRouteBrief(id));
          setStep("result");
        } else if (data.status === "failed") {
          if (pollingIntervalRef.current)
            clearInterval(pollingIntervalRef.current);
          setStep("error");
          setErrorMessage(
            data.error_message ||
              "AI intelligence engine failed to produce the route brief.",
          );
        }
        // else: still "pending" / "processing" — keep polling
      } catch (error: unknown) {
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
        <RouteBriefForm
          ports={ports}
          carriers={carriers}
          onSubmit={handleFormSubmit}
        />
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
      {step === "result" && result && (
        <RouteBriefResult data={result} onNewBrief={resetForm} />
      )}
    </div>
  );
}
