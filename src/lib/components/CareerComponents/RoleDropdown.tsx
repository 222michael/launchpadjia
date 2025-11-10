"use client";

import React, { useState, useRef, useEffect } from "react";

interface Role {
  value: string;
  label: string;
  description: string;
}

interface RoleDropdownProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const roles: Role[] = [
  {
    value: "Job Owner",
    label: "Job Owner",
    description: "Leads the hiring process for assigned jobs. Has access with all career settings.",
  },
  {
    value: "Contributor",
    label: "Contributor",
    description: "Helps evaluate candidates and assist with hiring tasks. Can move candidates through the pipeline, but cannot change any career settings.",
  },
  {
    value: "Reviewer",
    label: "Reviewer",
    description: "Reviews candidates and provides feedback. Can only view candidate profiles and comment.",
  },
];

export default function RoleDropdown({ value, onChange, disabled = false }: RoleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedRole = roles.find((role) => role.value === value);

  return (
    <div ref={dropdownRef} style={{ position: "relative", minWidth: "150px" }}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        style={{
          width: "100%",
          padding: "8px 12px",
          fontSize: "14px",
          color: disabled ? "#9CA3AF" : "#111827",
          backgroundColor: disabled ? "#F9FAFB" : "#FFFFFF",
          border: "1px solid #D1D5DB",
          borderRadius: "8px",
          cursor: disabled ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          textAlign: "left",
        }}
      >
        <span>{selectedRole?.label || value}</span>
        <i className={`la la-angle-${isOpen ? 'up' : 'down'}`} style={{ fontSize: 16 }}></i>
      </button>

      {isOpen && !disabled && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 4px)",
            left: 0,
            right: 0,
            backgroundColor: "#FFFFFF",
            border: "1px solid #D1D5DB",
            borderRadius: "8px",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
            zIndex: 20,
            minWidth: "400px",
          }}
        >
          {roles.map((role) => (
            <div
              key={role.value}
              onClick={() => {
                onChange(role.value);
                setIsOpen(false);
              }}
              style={{
                padding: "16px",
                cursor: "pointer",
                borderBottom: role.value !== roles[roles.length - 1].value ? "1px solid #F3F4F6" : "none",
                backgroundColor: value === role.value ? "#EFF6FF" : "transparent",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => {
                if (value !== role.value) {
                  e.currentTarget.style.backgroundColor = "#F9FAFB";
                }
              }}
              onMouseLeave={(e) => {
                if (value !== role.value) {
                  e.currentTarget.style.backgroundColor = "transparent";
                } else {
                  e.currentTarget.style.backgroundColor = "#EFF6FF";
                }
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "4px" }}>
                <span style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
                  {role.label}
                </span>
                {value === role.value && (
                  <i className="la la-check" style={{ fontSize: 18, color: "#3B82F6" }}></i>
                )}
              </div>
              <p style={{ fontSize: "13px", color: "#6B7280", margin: 0, lineHeight: "1.5" }}>
                {role.description}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
