"use client";

import React from "react";

interface Step {
  number: number;
  label: string;
  isActive: boolean;
  isCompleted: boolean;
}

interface StepProgressBarProps {
  currentStep: number;
}

export default function StepProgressBar({ currentStep }: StepProgressBarProps) {
  const steps: Step[] = [
    {
      number: 1,
      label: "Career Details & Team Access",
      isActive: currentStep === 1,
      isCompleted: currentStep > 1,
    },
    {
      number: 2,
      label: "CV Review & Pre-screening",
      isActive: currentStep === 2,
      isCompleted: currentStep > 2,
    },
    {
      number: 3,
      label: "AI Interview Setup",
      isActive: currentStep === 3,
      isCompleted: currentStep > 3,
    },
    {
      number: 4,
      label: "Review Career",
      isActive: currentStep === 4,
      isCompleted: currentStep > 4,
    },
  ];

  return (
    <div style={{ marginBottom: "2.5rem", padding: "0", width: "100%" }}>
      {/* Step Progress Bar */}
      <div style={{ position: "relative", width: "100%" }}>
        {/* Progress Lines Container */}
        <div style={{ position: "absolute", top: "9px", left: "0", right: "0", display: "flex", alignItems: "center", zIndex: 1, paddingLeft: "10px", paddingRight: "10px" }}>
          {steps.map((step, index) => (
            index < steps.length - 1 && (
              <div
                key={`line-${step.number}`}
                style={{
                  flex: 1,
                  height: "2px",
                  backgroundColor: step.isCompleted ? "#000000" : "#D1D5DB",
                }}
              ></div>
            )
          ))}
        </div>

        {/* Steps Container */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", position: "relative", width: "100%", zIndex: 2 }}>
          {steps.map((step) => (
            <div key={step.number} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
              {/* Step Circle */}
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: "10px",
                  transition: "all 0.3s",
                  backgroundColor: step.isCompleted 
                    ? "#000000" 
                    : step.isActive 
                    ? "#FFFFFF" 
                    : "#E5E7EB",
                  border: step.isActive ? "2px solid #000000" : "none",
                }}
              >
                {step.isCompleted ? (
                  <i className="la la-check" style={{ fontSize: 10, fontWeight: "bold", color: "#FFFFFF" }}></i>
                ) : step.isActive ? (
                  <div
                    style={{
                      width: "6px",
                      height: "6px",
                      borderRadius: "50%",
                      backgroundColor: "#000000",
                    }}
                  ></div>
                ) : null}
              </div>
              
              {/* Step Label */}
              <span
                style={{
                  fontSize: "12px",
                  textAlign: "center",
                  width: "100%",
                  color: step.isActive || step.isCompleted ? "#111827" : "#9CA3AF",
                  fontWeight: step.isActive || step.isCompleted ? 600 : 400,
                  lineHeight: "1.4",
                  whiteSpace: "normal",
                  wordWrap: "break-word",
                }}
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
