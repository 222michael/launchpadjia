"use client";
import axios from "axios";
import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import InterviewQuestionGeneratorV2 from "./InterviewQuestionGeneratorV2";
import { useAppContext } from "../../context/AppContext";
import DirectInterviewLinkV2 from "./DirectInterviewLinkV2";
import CareerForm from "./CareerForm";
import CareerLink from "./CareerLink";
import TeamAccessSection from "./TeamAccessSection";
import SafeHTML from "../common/SafeHTML";

export default function JobDescription({ formData, setFormData, editModal, isEditing, setIsEditing, handleCancelEdit }: { formData: any, setFormData: (formData: any) => void, editModal: boolean, isEditing: boolean, setIsEditing: (isEditing: boolean) => void, handleCancelEdit: () => void }) {
    const { user } = useAppContext();
    const [showEditModal, setShowEditModal] = useState(false);

    useEffect(() => {
        if (editModal) {
            setShowEditModal(true);
        }
    }, [editModal]);

    const handleEdit = () => {
        setShowEditModal(true);
    }

    async function updateCareer() {
      const userInfoSlice = {
        image: user.image,
        name: user.name,
        email: user.email,
      };
        const input = {
            _id: formData._id,
            jobTitle: formData.jobTitle,
            updatedAt: Date.now(),
            questions: formData.questions,
            status: formData.status,
            screeningSetting: formData.screeningSetting,
            requireVideo: formData.requireVideo,
            description: formData.description,
            lastEditedBy: userInfoSlice,
            createdBy: userInfoSlice,
        };

        Swal.fire({
            title: "Updating career...",
            text: "Please wait while we update the career...",
            allowOutsideClick: false,
        });

        try {
            const response = await axios.post("/api/update-career", input);
            
            if (response.status === 200) {
                Swal.fire({
                    title: "Success",
                    text: "Career updated successfully",
                    icon: "success",
                    allowOutsideClick: false,
                }).then(() => {
                   setIsEditing(false);
                   window.location.reload();
                });
            }
        } catch (error) {
            Swal.fire({
                title: "Error",
                text: "Failed to update career",
                icon: "error",
                allowOutsideClick: false,
            });
        }
    }

    async function deleteCareer() {
        Swal.fire({
          title: "Are you sure?",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#3085d6",
          cancelButtonColor: "#d33",
          confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
          if (result.isConfirmed) {
            Swal.fire({
              title: "Deleting career...",
              text: "Please wait while we delete the career...",
              allowOutsideClick: false,
              showConfirmButton: false,
              willOpen: () => {
                Swal.showLoading();
              },
            });
    
            try {
              const response = await axios.post("/api/delete-career", {
                id: formData._id,
              });
    
              if (response.data.success) {
                Swal.fire({
                  title: "Deleted!",
                  text: "The career has been deleted.",
                  icon: "success",
                  allowOutsideClick: false,
                }).then(() => {
                  window.location.href = "/recruiter-dashboard/careers";
                });
              } else {
                Swal.fire({
                  title: "Error!",
                  text: response.data.error || "Failed to delete the career",
                  icon: "error",
                });
              }
            } catch (error) {
              console.error("Error deleting career:", error);
              Swal.fire({
                title: "Error!",
                text: "An error occurred while deleting the career",
                icon: "error",
              });
            }
          }
        });
      }

    return (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="thread-set">
                <div className="left-thread">
                    <div style={{ 
                        backgroundColor: "#F8F9FC", 
                        borderRadius: "12px", 
                        padding: "20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px"
                    }}>
                        {/* Header */}
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                                <i className="la la-angle-down" style={{ fontSize: 20, color: "#717680" }} />
                                <h3 style={{ 
                                    fontSize: "18px", 
                                    fontWeight: 700, 
                                    color: "#181D27",
                                    margin: 0
                                }}>
                                    Career Details & Team Access
                                </h3>
                            </div>
                            <button 
                                style={{ 
                                    background: "#FFFFFF", 
                                    border: "1px solid #E9EAEB",
                                    borderRadius: "50%",
                                    width: "40px",
                                    height: "40px",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    cursor: "pointer",
                                    transition: "all 0.2s"
                                }}
                                onClick={handleEdit}
                                onMouseOver={(e) => e.currentTarget.style.background = "#F8F9FC"}
                                onMouseOut={(e) => e.currentTarget.style.background = "#FFFFFF"}
                            >
                                <i className="la la-pen" style={{ fontSize: 16, color: "#535862" }} />
                            </button>
                        </div>

                        {/* Content */}
                        <div style={{ 
                            display: "flex", 
                            flexDirection: "column", 
                            gap: "20px",
                            backgroundColor: "#FFFFFF",
                            borderRadius: "8px",
                            padding: "16px"
                        }}>
                                {/* Job Title */}
                                <div>
                                    <label style={{ fontSize: 14, color: "#6B7280", fontWeight: 500, display: "block", marginBottom: "8px" }}>
                                        Job Title
                                    </label>
                                    <div style={{ fontSize: 16, color: "#181D27", fontWeight: 500 }}>
                                        {formData.jobTitle || "-"}
                                    </div>
                                </div>

                                {/* Employment Type and Work Arrangement */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                                    <div>
                                        <label style={{ fontSize: 14, color: "#6B7280", fontWeight: 500, display: "block", marginBottom: "8px" }}>
                                            Employment Type
                                        </label>
                                        <div style={{ fontSize: 16, color: "#181D27", fontWeight: 500 }}>
                                            {formData.employmentType || "-"}
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 14, color: "#6B7280", fontWeight: 500, display: "block", marginBottom: "8px" }}>
                                            Work Arrangement
                                        </label>
                                        <div style={{ fontSize: 16, color: "#181D27", fontWeight: 500 }}>
                                            {formData.workSetup || "-"}
                                        </div>
                                    </div>
                                </div>

                                {/* Country, State/Province, City */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
                                    <div>
                                        <label style={{ fontSize: 14, color: "#6B7280", fontWeight: 500, display: "block", marginBottom: "8px" }}>
                                            Country
                                        </label>
                                        <div style={{ fontSize: 16, color: "#181D27", fontWeight: 500 }}>
                                            {formData.country || "Philippines"}
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 14, color: "#6B7280", fontWeight: 500, display: "block", marginBottom: "8px" }}>
                                            State / Province
                                        </label>
                                        <div style={{ fontSize: 16, color: "#181D27", fontWeight: 500 }}>
                                            {formData.province || "-"}
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 14, color: "#6B7280", fontWeight: 500, display: "block", marginBottom: "8px" }}>
                                            City
                                        </label>
                                        <div style={{ fontSize: 16, color: "#181D27", fontWeight: 500 }}>
                                            {formData.location || "-"}
                                        </div>
                                    </div>
                                </div>

                                {/* Minimum and Maximum Salary */}
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                                    <div>
                                        <label style={{ fontSize: 14, color: "#6B7280", fontWeight: 500, display: "block", marginBottom: "8px" }}>
                                            Minimum Salary
                                        </label>
                                        <div style={{ fontSize: 16, color: "#181D27", fontWeight: 500 }}>
                                            {formData.salaryNegotiable ? "Negotiable" : (formData.minimumSalary || "-")}
                                        </div>
                                    </div>
                                    <div>
                                        <label style={{ fontSize: 14, color: "#6B7280", fontWeight: 500, display: "block", marginBottom: "8px" }}>
                                            Maximum Salary
                                        </label>
                                        <div style={{ fontSize: 16, color: "#181D27", fontWeight: 500 }}>
                                            {formData.salaryNegotiable ? "Negotiable" : (formData.maximumSalary || "-")}
                                        </div>
                                    </div>
                                </div>

                                {/* Job Description */}
                                <div>
                                    <label style={{ fontSize: 14, color: "#6B7280", fontWeight: 500, display: "block", marginBottom: "8px" }}>
                                        Job Description
                                    </label>
                                    <div style={{ fontSize: 14, color: "#181D27", lineHeight: "1.6" }}>
                                        {isEditing ? (
                                            <textarea 
                                                className="form-control" 
                                                placeholder="Job Description" 
                                                value={formData.description} 
                                                onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                                            />
                                        ) : (
                                            <SafeHTML html={formData.description} level="rich" />
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    {isEditing && 
                    <div style={{ display: "flex", justifyContent: "center", gap: 16, alignItems: "center", marginBottom: "16px", width: "100%" }}>
                         <button className="button-primary" style={{ width: "50%" }} onClick={handleCancelEdit}>Cancel</button>
                        <button className="button-primary" style={{ width: "50%" }} onClick={updateCareer}>Save Changes</button>
                    </div>}

                    {/* CV Review & Pre-Screening Questions Section */}
                    <div style={{ 
                        backgroundColor: "#F8F9FC", 
                        borderRadius: "12px", 
                        padding: "20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px"
                    }}>
                        {/* Header */}
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "100%" }}>
                            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                                <i className="la la-angle-down" style={{ fontSize: 20, color: "#717680" }} />
                                <h3 style={{ 
                                    fontSize: "18px", 
                                    fontWeight: 700, 
                                    color: "#181D27",
                                    margin: 0
                                }}>
                                    CV Review & Pre-Screening Questions
                                </h3>
                            </div>
                        </div>

                        {/* Content */}
                        <div style={{ 
                            display: "flex", 
                            flexDirection: "column", 
                            gap: "20px",
                            backgroundColor: "#FFFFFF",
                            borderRadius: "8px",
                            padding: "16px"
                        }}>
                            {/* CV Screening */}
                            <div>
                                <h4 style={{ fontSize: 18, fontWeight: 600, color: "#181D27", marginBottom: "12px", margin: 0 }}>
                                    CV Screening
                                </h4>
                                <div style={{ fontSize: 16, color: "#6B7280", marginTop: "12px" }}>
                                    Automatically endorse candidates who are{" "}
                                    <span style={{ 
                                        backgroundColor: "#EFF6FF", 
                                        color: "#2563EB", 
                                        padding: "4px 12px", 
                                        borderRadius: "6px",
                                        fontWeight: 600,
                                        fontSize: 16
                                    }}>
                                        {formData.screeningSetting || "Good Fit"}
                                    </span>
                                    {" "}and above
                                </div>
                            </div>

                            {/* CV Secret Prompt */}
                            {formData.secretPrompt && formData.secretPrompt.trim() && (
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "12px" }}>
                                        <i className="la la-magic" style={{ fontSize: 20, color: "#A855F7" }} />
                                        <h4 style={{ fontSize: 18, fontWeight: 600, color: "#181D27", margin: 0 }}>
                                            CV Secret Prompt
                                        </h4>
                                    </div>
                                    <ul style={{ margin: 0, paddingLeft: "20px", color: "#6B7280", fontSize: 16, lineHeight: "1.8" }}>
                                        {formData.secretPrompt.split('\n').filter(line => line.trim()).map((line, index) => (
                                            <li key={index}>{line.trim()}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Pre-Screening Questions */}
                            {formData.preScreeningQuestions && formData.preScreeningQuestions.length > 0 && (
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "12px" }}>
                                        <h4 style={{ fontSize: 18, fontWeight: 600, color: "#181D27", margin: 0 }}>
                                            Pre-Screening Questions
                                        </h4>
                                        <span style={{ 
                                            backgroundColor: "#F3F4F6", 
                                            color: "#6B7280", 
                                            padding: "4px 12px", 
                                            borderRadius: "12px",
                                            fontSize: 16,
                                            fontWeight: 600
                                        }}>
                                            {formData.preScreeningQuestions.length}
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                        {formData.preScreeningQuestions.map((question, index) => (
                                            <div key={index} style={{ paddingBottom: index < formData.preScreeningQuestions.length - 1 ? "16px" : "0", borderBottom: index < formData.preScreeningQuestions.length - 1 ? "1px solid #F3F4F6" : "none" }}>
                                                <div style={{ fontSize: 16, fontWeight: 600, color: "#181D27", marginBottom: "8px" }}>
                                                    {index + 1}. {question.question}
                                                </div>
                                                {question.type === "dropdown" && question.options && (
                                                    <ul style={{ margin: 0, paddingLeft: "20px", color: "#6B7280", fontSize: 16, lineHeight: "1.6" }}>
                                                        {question.options.map((option, optIndex) => (
                                                            <li key={optIndex}>{option}</li>
                                                        ))}
                                                    </ul>
                                                )}
                                                {question.type === "range" && question.preferredAnswer && (
                                                    <div style={{ color: "#6B7280", fontSize: 16, fontStyle: "italic" }}>
                                                        Preferred: {question.preferredAnswer}
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(!formData.preScreeningQuestions || formData.preScreeningQuestions.length === 0) && !formData.secretPrompt && (
                                <div style={{ textAlign: "center", color: "#9CA3AF", fontSize: 14, padding: "16px 0" }}>
                                    No CV screening settings or pre-screening questions configured
                                </div>
                            )}
                        </div>
                    </div>

                    {/* AI Interview Setup Section */}
                    <div style={{ 
                        backgroundColor: "#F8F9FC", 
                        borderRadius: "12px", 
                        padding: "20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px"
                    }}>
                        {/* Header */}
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", width: "100%" }}>
                            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8 }}>
                                <i className="la la-angle-down" style={{ fontSize: 20, color: "#717680" }} />
                                <h3 style={{ 
                                    fontSize: "18px", 
                                    fontWeight: 700, 
                                    color: "#181D27",
                                    margin: 0
                                }}>
                                    AI Interview Setup
                                </h3>
                            </div>
                        </div>

                        {/* Content */}
                        <div style={{ 
                            display: "flex", 
                            flexDirection: "column", 
                            gap: "20px",
                            backgroundColor: "#FFFFFF",
                            borderRadius: "8px",
                            padding: "16px"
                        }}>
                            {/* AI Interview Screening */}
                            <div>
                                <h4 style={{ fontSize: 18, fontWeight: 600, color: "#181D27", marginBottom: "12px", margin: 0 }}>
                                    AI Interview Screening
                                </h4>
                                <div style={{ fontSize: 16, color: "#6B7280", marginTop: "12px" }}>
                                    Automatically endorse candidates who are{" "}
                                    <span style={{ 
                                        backgroundColor: "#EFF6FF", 
                                        color: "#2563EB", 
                                        padding: "4px 12px", 
                                        borderRadius: "6px",
                                        fontWeight: 600,
                                        fontSize: 16
                                    }}>
                                        {formData.aiInterviewScreening || "Good Fit"}
                                    </span>
                                    {" "}and above
                                </div>
                            </div>

                            {/* Require Video on Interview */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <h4 style={{ fontSize: 18, fontWeight: 600, color: "#181D27", margin: 0 }}>
                                    Require Video on Interview
                                </h4>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <span style={{ fontSize: 16, color: "#6B7280", fontWeight: 500 }}>
                                        {formData.requireVideo ? "Yes" : "No"}
                                    </span>
                                    {formData.requireVideo && (
                                        <i className="la la-check-circle" style={{ fontSize: 22, color: "#10B981" }} />
                                    )}
                                </div>
                            </div>

                            {/* AI Interview Secret Prompt */}
                            {formData.aiInterviewSecretPrompt && formData.aiInterviewSecretPrompt.trim() && (
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "12px" }}>
                                        <i className="la la-magic" style={{ fontSize: 20, color: "#A855F7" }} />
                                        <h4 style={{ fontSize: 18, fontWeight: 600, color: "#181D27", margin: 0 }}>
                                            AI Interview Secret Prompt
                                        </h4>
                                    </div>
                                    <ul style={{ margin: 0, paddingLeft: "20px", color: "#6B7280", fontSize: 16, lineHeight: "1.8" }}>
                                        {formData.aiInterviewSecretPrompt.split('\n').filter(line => line.trim()).map((line, index) => (
                                            <li key={index}>{line.trim()}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Interview Questions */}
                            {formData.questions && formData.questions.length > 0 && (
                                <div>
                                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: "12px" }}>
                                        <h4 style={{ fontSize: 18, fontWeight: 600, color: "#181D27", margin: 0 }}>
                                            Interview Questions
                                        </h4>
                                        <span style={{ 
                                            backgroundColor: "#F3F4F6", 
                                            color: "#6B7280", 
                                            padding: "4px 12px", 
                                            borderRadius: "12px",
                                            fontSize: 16,
                                            fontWeight: 600
                                        }}>
                                            {formData.questions.reduce((acc, group) => acc + (group.questions?.length || 0), 0)}
                                        </span>
                                    </div>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                                        {formData.questions.map((questionGroup, groupIndex) => (
                                            questionGroup.questions && questionGroup.questions.length > 0 && (
                                                <div key={groupIndex}>
                                                    <h5 style={{ fontSize: 16, fontWeight: 600, color: "#181D27", margin: "0 0 8px 0" }}>
                                                        {questionGroup.category}
                                                    </h5>
                                                    <ol style={{ margin: 0, paddingLeft: "20px", color: "#6B7280", fontSize: 16, lineHeight: "1.8" }}>
                                                        {questionGroup.questions.map((question, qIndex) => (
                                                            <li key={qIndex}>{question.question || question}</li>
                                                        ))}
                                                    </ol>
                                                </div>
                                            )
                                        ))}
                                    </div>
                                </div>
                            )}

                            {(!formData.questions || formData.questions.length === 0) && !formData.aiInterviewSecretPrompt && (
                                <div style={{ textAlign: "center", color: "#9CA3AF", fontSize: 14, padding: "16px 0" }}>
                                    No AI interview settings or questions configured
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="right-thread">
                    <TeamAccessSection teamMembers={formData.teamMembers} />
                    <CareerLink career={formData} />
                    <DirectInterviewLinkV2 formData={formData} setFormData={setFormData} />
                    <div style={{ 
                        backgroundColor: "#F8F9FC", 
                        borderRadius: "12px", 
                        padding: "20px",
                        display: "flex",
                        flexDirection: "column",
                        gap: "16px"
                    }}>
                        {/* Header */}
                        <h3 style={{ 
                            fontSize: "18px", 
                            fontWeight: 700, 
                            color: "#181D27",
                            margin: 0
                        }}>
                            Advanced Settings
                        </h3>
                            
                        {/* Content */}
                        <div style={{ 
                            display: "flex", 
                            flexDirection: "column", 
                            gap: "12px",
                            backgroundColor: "#FFFFFF",
                            borderRadius: "8px",
                            padding: "16px",
                            alignItems: "center"
                        }}>
                            <button 
                                onClick={() => {
                                    deleteCareer();
                                }}
                                style={{ 
                                    display: "flex", 
                                    flexDirection: "row", 
                                    alignItems: "center", 
                                    justifyContent: "center", 
                                    gap: 8,
                                    backgroundColor: "#FFFFFF", 
                                    color: "#B32318", 
                                    borderRadius: "8px", 
                                    padding: "10px 16px", 
                                    border: "1px solid #FECDCA", 
                                    cursor: "pointer", 
                                    fontWeight: 600, 
                                    fontSize: 14,
                                    width: "100%"
                                }}
                            >
                                <i className="la la-trash" style={{ color: "#B32318", fontSize: 16 }}></i>
                                <span>Delete this career</span>
                            </button>
                            <span style={{ 
                                fontSize: "14px", 
                                color: "#6B7280", 
                                textAlign: "center",
                                fontWeight: 500
                            }}>
                                Be careful, this action cannot be undone.
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            {showEditModal && (
                <div
                className="modal show fade-in-bottom"
                style={{
                  display: "block",
                  background: "rgba(0,0,0,0.45)",
                  position: "fixed",
                  top: 0,
                  left: 0,
                  width: "100vw",
                  height: "100vh",
                  zIndex: 1050,
                }}
                >
                    <div
                    style={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: "100vh",
                        width: "100vw",
                    }}>
                   
                    <div className="modal-content" style={{ overflowY: "scroll", height: "100vh", width: "90vw", background: "#fff", border: `1.5px solid #E9EAEB`, borderRadius: 14, boxShadow: "0 8px 32px rgba(30,32,60,0.18)", padding: "24px" }}>
                      <CareerForm career={formData} formType="edit" setShowEditModal={setShowEditModal} />
                    </div>
                  </div>
                </div>
            )}
        </div>
    )
}

function ScreeningSettingButton(props) {
    const { onSelectSetting, screeningSetting } = props;
    const [dropdownOpen, setDropdownOpen] = useState(false);
     // Setting List icons
    const settingList = [
        {
        name: "Good Fit and above",
        icon: "la la-check",
        },
        {
        name: "Only Strong Fit",
        icon: "la la-check-double",
        },
        {
        name: "No Automatic Promotion",
        icon: "la la-times",
        },
    ];
    return (
        <div className="dropdown w-100">
        <button
          className="dropdown-btn fade-in-bottom"
          style={{ width: "100%" }}
          type="button"
          onClick={() => setDropdownOpen((v) => !v)}
        >
          <span>
            <i
              className={
                settingList.find(
                  (setting) => setting.name === screeningSetting
                )?.icon
              }
            ></i>{" "}
            {screeningSetting}
          </span>
          <i className="la la-angle-down ml-10"></i>
        </button>
        <div
          className={`dropdown-menu w-100 mt-1 org-dropdown-anim${
            dropdownOpen ? " show" : ""
          }`}
          style={{
            padding: "10px",
          }}
        >
          {settingList.map((setting, index) => (
            <div style={{ borderBottom: "1px solid #ddd" }} key={index}>
              <button
                className={`dropdown-item d-flex align-items-center${
                  screeningSetting === setting.name
                    ? " bg-primary text-white active-org"
                    : ""
                }`}
                style={{
                  minWidth: 220,
                  borderRadius: screeningSetting === setting.name ? 0 : 10,
                  overflow: "hidden",
                  paddingBottom: 10,
                  paddingTop: 10,
                }}
                onClick={() => {
                  onSelectSetting(setting.name);
                  setDropdownOpen(false);
                }}
              >
                <i className={setting.icon}></i> {setting.name}
              </button>
            </div>
          ))}
        </div>
      </div>
    )
}