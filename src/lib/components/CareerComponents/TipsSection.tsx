"use client";

import React from "react";

interface Tip {
  title: string;
  description: string;
}

interface TipsSectionProps {
  step?: number;
}

const tipsByStep: Record<number, Tip[]> = {
  1: [
    {
      title: "Use clear, standard job titles",
      description: "for better searchability (e.g., \"Software Engineer\" instead of \"Code Ninja\" or \"Tech Rockstar\")."
    },
    {
      title: "Avoid abbreviations",
      description: "or internal role codes that applicants may not understand (e.g., use \"QA Engineer\" instead of \"QE II\" or \"QA-TL\")."
    },
    {
      title: "Keep it concise",
      description: "— job titles should be no more than a few words (2—4 max), avoiding fluff or marketing terms."
    }
  ],
  2: [
    {
      title: "Add a Secret Prompt",
      description: "to fine-tune how Jia scores and evaluates submitted CVs."
    },
    {
      title: "Add Pre-Screening questions",
      description: "to collect key details such as notice period, work setup, or salary expectations to guide your review and candidate discussions."
    }
  ],
  3: [
    {
      title: "Add a Secret Prompt",
      description: "to fine-tune how Jia scores and evaluates the interview responses."
    },
    {
      title: "Use \"Generate Questions\"",
      description: "to quickly create tailored interview questions, then refine or mix them with your own for balanced results."
    }
  ],
  4: [
    {
      title: "Review all details",
      description: "carefully before publishing. You can edit any section by clicking the Edit button."
    },
    {
      title: "Save as Unpublished",
      description: "if you want to review later, or click Publish to make the job live immediately."
    }
  ]
};

export default function TipsSection({ step = 1 }: TipsSectionProps) {
  const tips = tipsByStep[step] || tipsByStep[1];

  return (
    <div style={{ 
      backgroundColor: "#F9FAFB", 
      borderRadius: "12px", 
      padding: "24px",
      marginBottom: "16px"
    }}>
      {/* Tips Header */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "24px" }}>
        <div style={{ 
          width: "40px", 
          height: "40px", 
          borderRadius: "50%", 
          background: "linear-gradient(135deg, #E0C3FC 0%, #8EC5FC 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <i className="la la-lightbulb" style={{ color: "#FFFFFF", fontSize: 20 }}></i>
        </div>
        <h3 style={{ fontSize: "20px", fontWeight: 600, color: "#111827", margin: 0 }}>
          Tips
        </h3>
      </div>

      {/* Tips Content */}
      <div style={{ 
        backgroundColor: "#FFFFFF", 
        borderRadius: "8px", 
        padding: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "20px"
      }}>
        {tips.map((tip, index) => (
          <div key={index}>
            <p style={{ 
              fontSize: "14px", 
              lineHeight: "1.6", 
              color: "#374151", 
              margin: 0 
            }}>
              <span style={{ fontWeight: 600, color: "#111827" }}>{tip.title}</span>
              {" "}
              <span style={{ color: "#6B7280" }}>
                {tip.description}
              </span>
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
