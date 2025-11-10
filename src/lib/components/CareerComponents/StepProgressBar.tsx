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
  onStepClick?: (step: number) => void;
}

export default function StepProgressBar({ currentStep, onStepClick }: StepProgressBarProps) {
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

  const getProgressBarStyle = (step: Step, index: number) => {
    if (step.isCompleted) {
      // Completed - full gradient
      return {
        background: "linear-gradient(90deg, #fccec0 0%, #ebacc9 33%, #ceb6da 66%, #9fcaed 100%)",
      };
    } else if (step.isActive && index < steps.length - 1) {
      // In progress - half gradient, half gray
      return {
        background: "linear-gradient(90deg, #fccec0 0%, #ebacc9 33%, #ceb6da 66%, #9fcaed 100%) 0 0 / 50% 100% no-repeat, #d9d9d9",
      };
    } else {
      // Pending - gray
      return {
        background: "#d9d9d9",
      };
    }
  };

  const getStepIconStyle = (step: Step) => {
    if (step.isCompleted) {
      return {
        background: "linear-gradient(135deg, #fccec0 0%, #ebacc9 33%, #ceb6da 66%, #9fcaed 100%)",
        border: "none",
      };
    } else if (step.isActive) {
      return {
        background: "#FFFFFF",
        border: "2px solid #9fcaed",
      };
    } else {
      return {
        background: "#d9d9d9",
        border: "none",
      };
    }
  };

  return (
    <div style={{ marginBottom: "2.5rem", padding: "0", width: "100%" }}>
      {/* Step Progress Bar */}
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* Step Icons and Progress Bars Row */}
        <div style={{ display: "flex", gap: "32px", alignItems: "center" }}>
          {steps.map((step, index) => (
            <React.Fragment key={step.number}>
              {/* Step Circle */}
              <div
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                  transition: "all 0.3s",
                  ...getStepIconStyle(step),
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
                      background: "linear-gradient(135deg, #fccec0 0%, #ebacc9 33%, #ceb6da 66%, #9fcaed 100%)",
                    }}
                  ></div>
                ) : null}
              </div>

              {/* Progress Bar (except after last step) */}
              {index < steps.length - 1 && (
                <div
                  style={{
                    flex: 1,
                    height: "6px",
                    borderRadius: "10px",
                    transition: "all 0.3s",
                    ...getProgressBarStyle(step, index),
                  }}
                ></div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Labels Row */}
        <div style={{ display: "flex", justifyContent: "space-between", width: "100%" }}>
          {steps.map((step) => (
            <span
              key={`label-${step.number}`}
              onClick={() => {
                // Only allow clicking on completed steps or current step
                if ((step.isCompleted || step.isActive) && onStepClick) {
                  onStepClick(step.number);
                }
              }}
              style={{
                flex: 1,
                fontSize: "12px",
                fontWeight: step.isActive || step.isCompleted ? 700 : 400,
                lineHeight: "16px",
                color: step.isActive || step.isCompleted ? "#181d27" : "#a4a7ae",
                textAlign: "left",
                whiteSpace: "normal",
                wordWrap: "break-word",
                maxWidth: "200px",
                cursor: (step.isCompleted || step.isActive) && onStepClick ? "pointer" : "default",
                transition: "opacity 0.2s",
                opacity: 1,
              }}
              onMouseEnter={(e) => {
                if ((step.isCompleted || step.isActive) && onStepClick) {
                  e.currentTarget.style.opacity = "0.7";
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
            >
              {step.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
