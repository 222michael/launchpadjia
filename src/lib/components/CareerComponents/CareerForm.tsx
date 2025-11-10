"use client"

import { useEffect, useRef, useState } from "react";
import InterviewQuestionGeneratorV2 from "./InterviewQuestionGeneratorV2";
import RichTextEditor from "@/lib/components/CareerComponents/RichTextEditor";
import CustomDropdown from "@/lib/components/CareerComponents/CustomDropdown";
import philippineCitiesAndProvinces from "../../../../public/philippines-locations.json";
import { candidateActionToast, errorToast } from "@/lib/Utils";
import { useAppContext } from "@/lib/context/AppContext";
import axios from "axios";
import CareerActionModal from "./CareerActionModal";
import FullScreenLoadingAnimation from "./FullScreenLoadingAnimation";
import StepProgressBar from "./StepProgressBar";
import TipsSection from "./TipsSection";
import RoleDropdown from "./RoleDropdown";
  // Setting List icons
  const screeningSettingList = [
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
const workSetupOptions = [
    {
        name: "Fully Remote",
    },
    {
        name: "Onsite",
    },
    {
        name: "Hybrid",
    },
];

const employmentTypeOptions = [
    {
        name: "Full-Time",
    },
    {
        name: "Part-Time",
    },
];

export default function CareerForm({ career, formType, setShowEditModal }: { career?: any, formType: string, setShowEditModal?: (show: boolean) => void }) {
    const { user, orgID } = useAppContext();
    const [currentStep, setCurrentStep] = useState(1);
    const [jobTitle, setJobTitle] = useState(career?.jobTitle || "");
    const [description, setDescription] = useState(career?.description || "");
    const [showMemberDropdown, setShowMemberDropdown] = useState(false);
    const [memberSearch, setMemberSearch] = useState("");
    const [orgMembers, setOrgMembers] = useState([]);
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [workSetup, setWorkSetup] = useState(career?.workSetup || "");
    const [workSetupRemarks, setWorkSetupRemarks] = useState(career?.workSetupRemarks || "");
    const [screeningSetting, setScreeningSetting] = useState(career?.screeningSetting || "Good Fit and above");
    const [employmentType, setEmploymentType] = useState(career?.employmentType || "Full-Time");
    const [requireVideo, setRequireVideo] = useState(career?.requireVideo || true);
    const [secretPrompt, setSecretPrompt] = useState(career?.secretPrompt || "");
    const [showSecretPromptTooltip, setShowSecretPromptTooltip] = useState(false);
    const [preScreeningQuestions, setPreScreeningQuestions] = useState(career?.preScreeningQuestions || []);
    const [showCustomQuestionForm, setShowCustomQuestionForm] = useState(false);
    const [customQuestion, setCustomQuestion] = useState("");
    const [customQuestionType, setCustomQuestionType] = useState("dropdown");
    const [customQuestionOptions, setCustomQuestionOptions] = useState(["Option 1"]);
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);
    const [aiInterviewSecretPrompt, setAiInterviewSecretPrompt] = useState(career?.aiInterviewSecretPrompt || "");
    const [aiInterviewScreening, setAiInterviewScreening] = useState(career?.aiInterviewScreening || "Good Fit and above");
    const [showValidationError, setShowValidationError] = useState(false);
    const [addingQuestionToCategoryId, setAddingQuestionToCategoryId] = useState<number | null>(null);
    const [newQuestionText, setNewQuestionText] = useState("");
    const [salaryNegotiable, setSalaryNegotiable] = useState(career?.salaryNegotiable || true);
    const [minimumSalary, setMinimumSalary] = useState(career?.minimumSalary || "");
    const [maximumSalary, setMaximumSalary] = useState(career?.maximumSalary || "");
    const [questions, setQuestions] = useState(career?.questions || [
      {
        id: 1,
        category: "CV Validation / Experience",
        questionCountToAsk: null,
        questions: [],
      },
      {
        id: 2,
        category: "Technical",
        questionCountToAsk: null,
        questions: [],
      },
      {
        id: 3,
        category: "Behavioral",
        questionCountToAsk: null,
        questions: [],
      },
      {
        id: 4,
        category: "Analytical",
        questionCountToAsk: null,
        questions: [],
      },
      {
        id: 5,
        category: "Others",
        questionCountToAsk: null,
        questions: [],
      },
    ]);
    const [country, setCountry] = useState(career?.country || "Philippines");
    const [province, setProvince] = useState(career?.province ||"");
    const [city, setCity] = useState(career?.location || "");
    const [provinceList, setProvinceList] = useState([]);
    const [cityList, setCityList] = useState([]);
    const [showSaveModal, setShowSaveModal] = useState("");
    const [isSavingCareer, setIsSavingCareer] = useState(false);
    const savingCareerRef = useRef(false);
    const [hasDraft, setHasDraft] = useState(false);
    const [showDraftModal, setShowDraftModal] = useState(false);
    const [isLoadingDraft, setIsLoadingDraft] = useState(true);
    const [isSavingDraft, setIsSavingDraft] = useState(false);
    const [generatingQuestionsForCategory, setGeneratingQuestionsForCategory] = useState<number | null>(null);
    const [isGeneratingAllQuestions, setIsGeneratingAllQuestions] = useState(false);

    const isFormValid = () => {
        // For step 1, only validate basic career information
        if (currentStep === 1) {
            return jobTitle?.trim().length > 0 && description?.trim().length > 0 && workSetup?.trim().length > 0;
        }
        // For step 2 - all fields are optional
        if (currentStep === 2) {
            return true;
        }
        // For step 3 - require at least 5 interview questions total
        if (currentStep === 3) {
            const totalQuestions = questions.reduce((sum, category) => sum + category.questions.length, 0);
            return totalQuestions >= 5;
        }
        // For final save (step 4 - Review Career), validate everything including questions
        return jobTitle?.trim().length > 0 && description?.trim().length > 0 && questions.some((q) => q.questions.length > 0) && workSetup?.trim().length > 0;
    }

    // Draft Management Functions
    const saveDraft = async () => {
        if (!orgID || !user?.email) return;
        
        setIsSavingDraft(true);
        try {
            const draftData = {
                jobTitle,
                description,
                workSetup,
                workSetupRemarks,
                employmentType,
                country,
                province,
                city,
                salaryNegotiable,
                minimumSalary,
                maximumSalary,
                selectedMembers,
                preScreeningQuestions,
                screeningSetting,
                requireVideo,
                secretPrompt,
                aiInterviewSecretPrompt,
                aiInterviewScreening,
                questions,
            };

            if (formType === "edit" && career?._id) {
                // For edit mode, update the career directly with current step
                await axios.post("/api/update-career", {
                    _id: career._id,
                    ...draftData,
                    currentStep,
                    updatedAt: Date.now(),
                });
            } else if (formType === "add") {
                // For add mode, use draft system
                await axios.post("/api/save-career-draft", {
                    orgID,
                    userEmail: user.email,
                    draftData,
                    currentStep,
                });
            }
        } catch (error) {
            console.error("Error saving draft:", error);
        } finally {
            setIsSavingDraft(false);
        }
    };

    const loadDraft = async () => {
        if (!orgID || !user?.email || formType !== "add") {
            setIsLoadingDraft(false);
            return;
        }

        try {
            const response = await axios.get("/api/save-career-draft", {
                params: { orgID, userEmail: user.email },
            });

            if (response.data.draft) {
                setHasDraft(true);
                setShowDraftModal(true);
            }
        } catch (error) {
            console.error("Error loading draft:", error);
        } finally {
            setIsLoadingDraft(false);
        }
    };

    const resumeFromDraft = async () => {
        try {
            const response = await axios.get("/api/save-career-draft", {
                params: { orgID, userEmail: user.email },
            });

            if (response.data.draft) {
                const { draftData, currentStep: savedStep } = response.data.draft;
                
                // Restore all form data
                setJobTitle(draftData.jobTitle || "");
                setDescription(draftData.description || "");
                setWorkSetup(draftData.workSetup || "");
                setWorkSetupRemarks(draftData.workSetupRemarks || "");
                setEmploymentType(draftData.employmentType || "Full-Time");
                setCountry(draftData.country || "Philippines");
                setProvince(draftData.province || "");
                setCity(draftData.city || "");
                setSalaryNegotiable(draftData.salaryNegotiable ?? true);
                setMinimumSalary(draftData.minimumSalary || "");
                setMaximumSalary(draftData.maximumSalary || "");
                setSelectedMembers(draftData.selectedMembers || []);
                setPreScreeningQuestions(draftData.preScreeningQuestions || []);
                setScreeningSetting(draftData.screeningSetting || "Good Fit and above");
                setRequireVideo(draftData.requireVideo ?? true);
                setSecretPrompt(draftData.secretPrompt || "");
                setAiInterviewSecretPrompt(draftData.aiInterviewSecretPrompt || "");
                setAiInterviewScreening(draftData.aiInterviewScreening || "Good Fit and above");
                setQuestions(draftData.questions || questions);
                setCurrentStep(savedStep || 1);

                candidateActionToast("Draft loaded successfully", 1500, <i className="la la-check-circle" style={{ color: "#039855", fontSize: 32 }}></i>);
            }
        } catch (error) {
            console.error("Error resuming draft:", error);
            errorToast("Failed to load draft", 1500);
        } finally {
            setShowDraftModal(false);
        }
    };

    const deleteDraft = async () => {
        if (!orgID || !user?.email) return;

        try {
            await axios.delete("/api/save-career-draft", {
                params: { orgID, userEmail: user.email },
            });
        } catch (error) {
            console.error("Error deleting draft:", error);
        }
    };

    const generateQuestionsForCategory = async (categoryId: number, categoryName: string) => {
        if (!jobTitle || !description) {
            errorToast("Please fill in job title and description first", 1500);
            return;
        }

        setGeneratingQuestionsForCategory(categoryId);
        try {
            const categoryIndex = questions.findIndex((q) => q.id === categoryId);
            const existingQuestions = questions[categoryIndex]?.questions || [];

            const response = await axios.post("/api/generate-interview-questions", {
                jobTitle,
                description,
                category: categoryName,
                existingQuestions,
            });

            if (response.data.questions && response.data.questions.length > 0) {
                const updated = [...questions];
                updated[categoryIndex].questions = [
                    ...existingQuestions,
                    ...response.data.questions,
                ];
                setQuestions(updated);
                candidateActionToast(
                    `Generated ${response.data.questions.length} questions for ${categoryName}`,
                    1500,
                    <i className="la la-check-circle" style={{ color: "#039855", fontSize: 32 }}></i>
                );
            }
        } catch (error) {
            console.error("Error generating questions:", error);
            errorToast("Failed to generate questions", 1500);
        } finally {
            setGeneratingQuestionsForCategory(null);
        }
    };

    const generateAllQuestions = async () => {
        if (!jobTitle || !description) {
            errorToast("Please fill in job title and description first", 1500);
            return;
        }

        setIsGeneratingAllQuestions(true);
        try {
            const promises = questions.map(async (category) => {
                const existingQuestions = category.questions || [];
                const response = await axios.post("/api/generate-interview-questions", {
                    jobTitle,
                    description,
                    category: category.category,
                    existingQuestions,
                });
                return {
                    categoryId: category.id,
                    questions: response.data.questions || [],
                };
            });

            const results = await Promise.all(promises);
            const updated = [...questions];
            
            results.forEach((result) => {
                const categoryIndex = updated.findIndex((q) => q.id === result.categoryId);
                if (categoryIndex !== -1) {
                    updated[categoryIndex].questions = [
                        ...(updated[categoryIndex].questions || []),
                        ...result.questions,
                    ];
                }
            });

            setQuestions(updated);
            const totalGenerated = results.reduce((sum, r) => sum + r.questions.length, 0);
            candidateActionToast(
                `Generated ${totalGenerated} questions across all categories`,
                1500,
                <i className="la la-check-circle" style={{ color: "#039855", fontSize: 32 }}></i>
            );
        } catch (error) {
            console.error("Error generating all questions:", error);
            errorToast("Failed to generate questions", 1500);
        } finally {
            setIsGeneratingAllQuestions(false);
        }
    };

    // Load draft on mount
    useEffect(() => {
        if (formType === "add" && orgID && user?.email) {
            loadDraft();
        } else {
            setIsLoadingDraft(false);
        }
    }, [formType, orgID, user?.email]);

    // Auto-save draft when step changes (for both add and edit modes)
    useEffect(() => {
        if ((formType === "add" || formType === "edit") && !isLoadingDraft && currentStep > 1 && orgID && user?.email) {
            saveDraft();
        }
    }, [currentStep, formType, isLoadingDraft, orgID, user?.email]);

    // Load current step from career data when editing
    useEffect(() => {
        if (formType === "edit" && career?.currentStep) {
            setCurrentStep(career.currentStep);
        }
    }, [formType, career]);

    const updateCareer = async (status: string) => {
        if (Number(minimumSalary) && Number(maximumSalary) && Number(minimumSalary) > Number(maximumSalary)) {
            errorToast("Minimum salary cannot be greater than maximum salary", 1300);
            return;
        }
        let userInfoSlice = {
            image: user.image,
            name: user.name,
            email: user.email,
        };
        const updatedCareer = {
            _id: career._id,
            jobTitle,
            description,
            workSetup,
            workSetupRemarks,
            questions,
            lastEditedBy: userInfoSlice,
            status,
            updatedAt: Date.now(),
            screeningSetting,
            requireVideo,
            salaryNegotiable,
            minimumSalary: isNaN(Number(minimumSalary)) ? null : Number(minimumSalary),
            maximumSalary: isNaN(Number(maximumSalary)) ? null : Number(maximumSalary),
            country,
            province,
            // Backwards compatibility
            location: city,
            employmentType,
            secretPrompt,
            preScreeningQuestions,
            aiInterviewSecretPrompt,
            aiInterviewScreening,
            teamMembers: selectedMembers,
        }
        try {
            setIsSavingCareer(true);
            const response = await axios.post("/api/update-career", updatedCareer);
            if (response.status === 200) {
                candidateActionToast(
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginLeft: 8 }}>
                        <span style={{ fontSize: 14, fontWeight: 700, color: "#181D27" }}>Career updated</span>
                    </div>,
                    1300,
                <i className="la la-check-circle" style={{ color: "#039855", fontSize: 32 }}></i>)
                setTimeout(() => {
                    window.location.href = `/recruiter-dashboard/careers/manage/${career._id}`;
                }, 1300);
            }
        } catch (error) {
            console.error(error);
            errorToast("Failed to update career", 1300);
        } finally {
            setIsSavingCareer(false);
        }
    }

  
    const confirmSaveCareer = (status: string) => {
        if (Number(minimumSalary) && Number(maximumSalary) && Number(minimumSalary) > Number(maximumSalary)) {
        errorToast("Minimum salary cannot be greater than maximum salary", 1300);
        return;
        }

        setShowSaveModal(status);
    }

    const saveCareer = async (status: string) => {
        setShowSaveModal("");
        if (!status) {
          return;
        }

        if (!savingCareerRef.current) {
        setIsSavingCareer(true);
        savingCareerRef.current = true;
        let userInfoSlice = {
            image: user.image,
            name: user.name,
            email: user.email,
        };
        const career = {
            jobTitle,
            description,
            workSetup,
            workSetupRemarks,
            questions,
            lastEditedBy: userInfoSlice,
            createdBy: userInfoSlice,
            screeningSetting,
            orgID,
            requireVideo,
            salaryNegotiable,
            minimumSalary: isNaN(Number(minimumSalary)) ? null : Number(minimumSalary),
            maximumSalary: isNaN(Number(maximumSalary)) ? null : Number(maximumSalary),
            country,
            province,
            // Backwards compatibility
            location: city,
            status,
            employmentType,
            secretPrompt,
            preScreeningQuestions,
            aiInterviewSecretPrompt,
            aiInterviewScreening,
            teamMembers: selectedMembers,
        }

        try {
            console.log("Sending career data:", career);
            const response = await axios.post("/api/add-career", career);
            if (response.status === 200) {
            // Delete draft after successful save
            await deleteDraft();
            
            candidateActionToast(
                <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 8, marginLeft: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#181D27" }}>Career added {status === "active" ? "and published" : ""}</span>
                </div>,
                1300, 
            <i className="la la-check-circle" style={{ color: "#039855", fontSize: 32 }}></i>)
            setTimeout(() => {
                window.location.href = `/recruiter-dashboard/careers`;
            }, 1300);
            }
        } catch (error: any) {
            console.error("Error adding career:", error);
            console.error("Error response:", error.response?.data);
            errorToast(error.response?.data?.message || "Failed to add career", 1300);
        } finally {
            savingCareerRef.current = false;
            setIsSavingCareer(false);
        }
      }
    }

    useEffect(() => {
        const parseProvinces = () => {
          setProvinceList(philippineCitiesAndProvinces.provinces);
          const defaultProvince = philippineCitiesAndProvinces.provinces[0];
          if (!career?.province) {
            setProvince(defaultProvince.name);
          }
          const cities = philippineCitiesAndProvinces.cities.filter((city) => city.province === defaultProvince.key);
          setCityList(cities);
          if (!career?.location) {
            setCity(cities[0].name);
          }
        }
        parseProvinces();
      },[career])

    useEffect(() => {
        const fetchOrgMembers = async () => {
          if (orgID) {
            try {
              const response = await axios.post("/api/fetch-members", { orgID });
              if (response.status === 200) {
                setOrgMembers(response.data.members || []);
              }
            } catch (error) {
              console.error("Error fetching members:", error);
            }
          }
        };
        fetchOrgMembers();
      }, [orgID])

    useEffect(() => {
        // Reset validation error when questions are added
        if (showValidationError && isFormValid()) {
          setShowValidationError(false);
        }
      }, [questions, showValidationError])

    return (
        <div className="col">
        {(formType === "add" || formType === "edit") ? (<div style={{ marginBottom: "35px", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
              <h1 style={{ fontSize: "24px", fontWeight: 550, color: "#111827" }}>{formType === "edit" ? "Edit career" : "Add new career"}</h1>
              <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px" }}>
                  <button
                  disabled={!isFormValid() || isSavingCareer}
                   style={{ width: "fit-content", color: "#414651", background: "#fff", border: "1px solid #D5D7DA", padding: "10px 20px", borderRadius: "8px", cursor: !isFormValid() || isSavingCareer ? "not-allowed" : "pointer", whiteSpace: "nowrap", fontSize: "14px", fontWeight: 500 }} onClick={() => {
                    confirmSaveCareer("inactive");
                      }}>
                          Save as Unpublished
                  </button>
                  <button 
                  disabled={!isFormValid() || isSavingCareer}
                  style={{ width: "fit-content", background: !isFormValid() || isSavingCareer ? "#D5D7DA" : "black", color: "#fff", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: !isFormValid() || isSavingCareer ? "not-allowed" : "pointer", whiteSpace: "nowrap", fontSize: "14px", fontWeight: 500, display: "flex", alignItems: "center", gap: "8px" }} onClick={() => {
                    if (currentStep < 4) {
                      if (isFormValid()) {
                        setCurrentStep(currentStep + 1);
                        setShowValidationError(false);
                      } else {
                        setShowValidationError(true);
                      }
                    } else {
                      confirmSaveCareer("active");
                    }
                  }}>
                      Save and Continue
                      <i className="la la-arrow-right" style={{ fontSize: 16 }}></i>
                  </button>
                </div>
        </div>) : (
            <div style={{ marginBottom: "35px", display: "flex", flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <h1 style={{ fontSize: "24px", fontWeight: 550, color: "#111827" }}>Edit Career Details</h1>
            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px" }}>
                <button
                 style={{ width: "fit-content", color: "#414651", background: "#fff", border: "1px solid #D5D7DA", padding: "8px 16px", borderRadius: "60px", cursor: "pointer", whiteSpace: "nowrap" }} onClick={() => {
                  setShowEditModal?.(false);
                    }}>
                        Cancel
                </button>
                <button
                  disabled={!isFormValid() || isSavingCareer}
                   style={{ width: "fit-content", color: "#414651", background: "#fff", border: "1px solid #D5D7DA", padding: "8px 16px", borderRadius: "60px", cursor: !isFormValid() || isSavingCareer ? "not-allowed" : "pointer", whiteSpace: "nowrap" }} onClick={() => {
                    updateCareer("inactive");
                    }}>
                          Save Changes as Unpublished
                  </button>
                  <button 
                  disabled={!isFormValid() || isSavingCareer}
                  style={{ width: "fit-content", background: !isFormValid() || isSavingCareer ? "#D5D7DA" : "black", color: "#fff", border: "1px solid #E9EAEB", padding: "8px 16px", borderRadius: "60px", cursor: !isFormValid() || isSavingCareer ? "not-allowed" : "pointer", whiteSpace: "nowrap"}} onClick={() => {
                    updateCareer("active");
                  }}>
                    <i className="la la-check-circle" style={{ color: "#fff", fontSize: 20, marginRight: 8 }}></i>
                      Save Changes as Published
                  </button>
              </div>
       </div>
        )}
        
        {/* Step Progress Bar - Show for both "add" and "edit" form types */}
        {(formType === "add" || formType === "edit") && (
          <StepProgressBar 
            currentStep={currentStep} 
            onStepClick={(step) => setCurrentStep(step)} 
          />
        )}
        
        <div style={{ display: "flex", flexDirection: "row", justifyContent: "space-between", width: "100%", gap: 16, alignItems: "flex-start", marginTop: 16 }}>
        <div style={{ width: "75%", display: "flex", flexDirection: "column", gap: 24 }}>
          
          {/* Step 1: Career Details & Team Access */}
          {currentStep === 1 && (
          <>
          <div style={{ backgroundColor: "#F9FAFB", borderRadius: "12px", padding: "24px" }}>
            {/* Section Title */}
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#111827", marginBottom: "20px" }}>
              1. Career Information
            </h2>

            {/* White Card Container */}
            <div style={{ backgroundColor: "#FFFFFF", borderRadius: "8px", padding: "24px", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)" }}>
              {/* Basic Information */}
              <div style={{ marginBottom: "32px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#374151", marginBottom: "20px" }}>
                Basic Information
              </h3>
              
              <div style={{ marginBottom: "16px" }}>
                <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#6B7280", marginBottom: "8px" }}>
                  Job Title
                </label>
                <input
                  type="text"
                  value={jobTitle}
                  className="form-control"
                  placeholder="Enter job title"
                  onChange={(e) => setJobTitle(e.target.value || "")}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    fontSize: "14px",
                    border: "1px solid #D1D5DB",
                    borderRadius: "8px",
                  }}
                />
              </div>
            </div>

            {/* Work Setting */}
            <div style={{ marginBottom: "32px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#374151", marginBottom: "20px" }}>
                Work Setting
              </h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#6B7280", marginBottom: "8px" }}>
                    Employment Type
                  </label>
                  <CustomDropdown
                    onSelectSetting={setEmploymentType}
                    screeningSetting={employmentType}
                    settingList={employmentTypeOptions}
                    placeholder="Choose employment type"
                  />
                </div>
                
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#6B7280", marginBottom: "8px" }}>
                    Arrangement
                  </label>
                  <CustomDropdown
                    onSelectSetting={setWorkSetup}
                    screeningSetting={workSetup}
                    settingList={workSetupOptions}
                    placeholder="Choose work arrangement"
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div style={{ marginBottom: "32px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#374151", marginBottom: "20px" }}>
                Location
              </h3>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#6B7280", marginBottom: "8px" }}>
                    Country
                  </label>
                  <CustomDropdown
                    onSelectSetting={setCountry}
                    screeningSetting={country}
                    settingList={[{ name: "Philippines" }]}
                    placeholder="Philippines"
                  />
                </div>
                
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#6B7280", marginBottom: "8px" }}>
                    State / Province
                  </label>
                  <CustomDropdown
                    onSelectSetting={(province) => {
                      setProvince(province);
                      const provinceObj = provinceList.find((p) => p.name === province);
                      const cities = philippineCitiesAndProvinces.cities.filter((city) => city.province === provinceObj.key);
                      setCityList(cities);
                      setCity(cities[0].name);
                    }}
                    screeningSetting={province}
                    settingList={provinceList}
                    placeholder="Choose state / province"
                  />
                </div>
                
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#6B7280", marginBottom: "8px" }}>
                    City
                  </label>
                  <CustomDropdown
                    onSelectSetting={setCity}
                    screeningSetting={city}
                    settingList={cityList}
                    placeholder="Choose city"
                  />
                </div>
              </div>
            </div>

            {/* Salary */}
            <div style={{ marginBottom: "0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#374151", margin: 0 }}>
                  Salary
                </h3>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={salaryNegotiable}
                      onChange={() => setSalaryNegotiable(!salaryNegotiable)}
                    />
                    <span className="slider round"></span>
                  </label>
                  <span style={{ fontSize: "14px", color: "#6B7280" }}>
                    {salaryNegotiable ? "Negotiable" : "Fixed"}
                  </span>
                </div>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#6B7280", marginBottom: "8px" }}>
                    Minimum Salary
                  </label>
                  <div style={{ position: "relative" }}>
                    <span style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#9CA3AF",
                      fontSize: "14px",
                      pointerEvents: "none",
                    }}>
                      ₱
                    </span>
                    <input
                      type="number"
                      value={minimumSalary}
                      onChange={(e) => setMinimumSalary(e.target.value || "")}
                      placeholder="0"
                      min={0}
                      className="form-control"
                      style={{
                        width: "100%",
                        paddingTop: "10px",
                        paddingBottom: "10px",
                        paddingLeft: "36px",
                        paddingRight: "60px",
                        fontSize: "14px",
                        border: "1px solid #D1D5DB",
                        borderRadius: "8px",
                      }}
                    />
                    <span style={{
                      position: "absolute",
                      right: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#9CA3AF",
                      fontSize: "14px",
                      pointerEvents: "none",
                    }}>
                      PHP
                    </span>
                  </div>
                </div>
                
                <div>
                  <label style={{ display: "block", fontSize: "14px", fontWeight: 500, color: "#6B7280", marginBottom: "8px" }}>
                    Maximum Salary
                  </label>
                  <div style={{ position: "relative" }}>
                    <span style={{
                      position: "absolute",
                      left: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#9CA3AF",
                      fontSize: "14px",
                      pointerEvents: "none",
                    }}>
                      ₱
                    </span>
                    <input
                      type="number"
                      value={maximumSalary}
                      onChange={(e) => setMaximumSalary(e.target.value || "")}
                      placeholder="0"
                      min={0}
                      className="form-control"
                      style={{
                        width: "100%",
                        paddingTop: "10px",
                        paddingBottom: "10px",
                        paddingLeft: "36px",
                        paddingRight: "60px",
                        fontSize: "14px",
                        border: "1px solid #D1D5DB",
                        borderRadius: "8px",
                      }}
                    />
                    <span style={{
                      position: "absolute",
                      right: "14px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#9CA3AF",
                      fontSize: "14px",
                      pointerEvents: "none",
                    }}>
                      PHP
                    </span>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>

          {/* Job Description Section */}
          <div style={{ backgroundColor: "#F9FAFB", borderRadius: "12px", padding: "24px" }}>
            {/* Section Title */}
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#111827", marginBottom: "20px" }}>
              2. Job Description
            </h2>

            {/* White Card Container */}
            <div style={{ backgroundColor: "#FFFFFF", borderRadius: "8px", padding: "24px", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)" }}>
              <RichTextEditor setText={setDescription} text={description} />
            </div>
          </div>

          {/* Team Access Section */}
          <div style={{ backgroundColor: "#F9FAFB", borderRadius: "12px", padding: "24px" }}>
            {/* Section Title */}
            <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#111827", marginBottom: "20px" }}>
              3. Team Access
            </h2>

            {/* White Card Container */}
            <div style={{ backgroundColor: "#FFFFFF", borderRadius: "8px", padding: "24px", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)" }}>
              {/* Add more members header */}
              <div style={{ marginBottom: "24px" }}>
                <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#111827", marginBottom: "8px" }}>
                  Add more members
                </h3>
                <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "16px" }}>
                  You can add other members to collaborate on this career.
                </p>
                
                {/* Add member button/dropdown */}
                <div style={{ position: "relative" }}>
                  <button
                    onClick={() => setShowMemberDropdown(!showMemberDropdown)}
                    type="button"
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      fontSize: "14px",
                      color: "#6B7280",
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #D1D5DB",
                      borderRadius: "8px",
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <i className="la la-user-plus" style={{ fontSize: 18 }}></i>
                    Add member
                    <i className={`la la-angle-${showMemberDropdown ? 'up' : 'down'}`} style={{ fontSize: 18, marginLeft: "auto" }}></i>
                  </button>

                  {/* Dropdown Menu */}
                  {showMemberDropdown && (
                    <div style={{
                      position: "absolute",
                      top: "calc(100% + 4px)",
                      left: 0,
                      right: 0,
                      backgroundColor: "#FFFFFF",
                      border: "1px solid #D1D5DB",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                      zIndex: 10,
                      maxHeight: "300px",
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                    }}>
                      {/* Search Input */}
                      <div style={{ padding: "12px", borderBottom: "1px solid #E5E7EB" }}>
                        <div style={{ position: "relative" }}>
                          <i className="la la-search" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#9CA3AF", fontSize: 16 }}></i>
                          <input
                            type="text"
                            placeholder="Search member"
                            value={memberSearch}
                            onChange={(e) => setMemberSearch(e.target.value)}
                            style={{
                              width: "100%",
                              padding: "8px 12px 8px 36px",
                              fontSize: "14px",
                              border: "1px solid #D1D5DB",
                              borderRadius: "6px",
                              outline: "none",
                            }}
                          />
                        </div>
                      </div>

                      {/* Members List */}
                      <div style={{ overflowY: "auto", maxHeight: "240px" }}>
                        {orgMembers
                          .filter((member: any) => 
                            member.email !== user?.email &&
                            !selectedMembers.find((m: any) => m.email === member.email) &&
                            (member.name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
                             member.email?.toLowerCase().includes(memberSearch.toLowerCase()))
                          )
                          .map((member: any) => (
                            <div
                              key={member.email}
                              onClick={() => {
                                setSelectedMembers([...selectedMembers, { ...member, role: "Viewer" }]);
                                setShowMemberDropdown(false);
                                setMemberSearch("");
                              }}
                              style={{
                                padding: "12px 16px",
                                display: "flex",
                                alignItems: "center",
                                gap: "12px",
                                cursor: "pointer",
                                borderBottom: "1px solid #F3F4F6",
                                transition: "background-color 0.2s",
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F9FAFB"}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                            >
                              {/* Avatar */}
                              <div style={{ 
                                width: "36px", 
                                height: "36px", 
                                borderRadius: "50%", 
                                backgroundColor: "#E5E7EB",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                overflow: "hidden",
                                flexShrink: 0,
                              }}>
                                {member.image ? (
                                  <img src={member.image} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                ) : (
                                  <i className="la la-user" style={{ fontSize: 18, color: "#6B7280" }}></i>
                                )}
                              </div>
                              
                              {/* Member Info */}
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: "14px", fontWeight: 500, color: "#111827", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {member.name}
                                </div>
                                <div style={{ fontSize: "13px", color: "#6B7280", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                  {member.email}
                                </div>
                              </div>
                            </div>
                          ))}
                        
                        {orgMembers.filter((member: any) => 
                          member.email !== user?.email &&
                          !selectedMembers.find((m: any) => m.email === member.email) &&
                          (member.name?.toLowerCase().includes(memberSearch.toLowerCase()) ||
                           member.email?.toLowerCase().includes(memberSearch.toLowerCase()))
                        ).length === 0 && (
                          <div style={{ padding: "24px", textAlign: "center", color: "#6B7280", fontSize: "14px" }}>
                            No members found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Current user as Job Owner */}
              <div style={{ display: "flex", alignItems: "center", gap: "16px", paddingBottom: "16px", borderBottom: "1px solid #E5E7EB" }}>
                {/* User Avatar */}
                <div style={{ 
                  width: "48px", 
                  height: "48px", 
                  borderRadius: "50%", 
                  backgroundColor: "#E5E7EB",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden"
                }}>
                  {user?.image ? (
                    <img src={user.image} alt={user.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <i className="la la-user" style={{ fontSize: 24, color: "#6B7280" }}></i>
                  )}
                </div>

                {/* User Info */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
                    {user?.name || "User"} <span style={{ color: "#6B7280", fontWeight: 400 }}>(You)</span>
                  </div>
                  <div style={{ fontSize: "14px", color: "#6B7280" }}>
                    {user?.email || "user@example.com"}
                  </div>
                </div>

                {/* Role Dropdown */}
                <RoleDropdown
                  value="Job Owner"
                  onChange={() => {}}
                  disabled={false}
                />

                {/* Delete button (disabled for owner) */}
                <button
                  disabled
                  style={{
                    padding: "8px",
                    backgroundColor: "transparent",
                    border: "none",
                    cursor: "not-allowed",
                    opacity: 0.3,
                  }}
                >
                  <i className="la la-trash" style={{ fontSize: 20, color: "#6B7280" }}></i>
                </button>
              </div>

              {/* Selected Members */}
              {selectedMembers.map((member: any, index: number) => (
                <div key={member.email} style={{ display: "flex", alignItems: "center", gap: "16px", paddingTop: "16px", paddingBottom: "16px", borderBottom: index < selectedMembers.length - 1 ? "1px solid #E5E7EB" : "none" }}>
                  {/* User Avatar */}
                  <div style={{ 
                    width: "48px", 
                    height: "48px", 
                    borderRadius: "50%", 
                    backgroundColor: "#E5E7EB",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden"
                  }}>
                    {member.image ? (
                      <img src={member.image} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <i className="la la-user" style={{ fontSize: 24, color: "#6B7280" }}></i>
                    )}
                  </div>

                  {/* User Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "#111827" }}>
                      {member.name}
                    </div>
                    <div style={{ fontSize: "14px", color: "#6B7280" }}>
                      {member.email}
                    </div>
                  </div>

                  {/* Role Dropdown */}
                  <RoleDropdown
                    value={member.role}
                    onChange={(newRole) => {
                      const updated = [...selectedMembers];
                      updated[index].role = newRole;
                      setSelectedMembers(updated);
                    }}
                  />

                  {/* Delete button */}
                  <button
                    onClick={() => {
                      setSelectedMembers(selectedMembers.filter((m: any) => m.email !== member.email));
                    }}
                    type="button"
                    style={{
                      padding: "8px",
                      backgroundColor: "transparent",
                      border: "none",
                      cursor: "pointer",
                    }}
                  >
                    <i className="la la-trash" style={{ fontSize: 20, color: "#EF4444" }}></i>
                  </button>
                </div>
              ))}

              {/* Admin note */}
              <p style={{ fontSize: "12px", color: "#6B7280", marginTop: "16px", fontStyle: "italic" }}>
                *Admins can view all careers regardless of specific access settings.
              </p>
            </div>
          </div>
          </>
          )}

          {/* Step 2: CV Review & Pre-Screening */}
          {currentStep === 2 && (
            <>
            <div style={{ backgroundColor: "#F9FAFB", borderRadius: "12px", padding: "24px" }}>
              {/* Section Title */}
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#111827", marginBottom: "20px" }}>
                1. CV Review Settings
              </h2>

              {/* White Card Container */}
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "8px", padding: "24px", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)" }}>
                {/* CV Screening */}
                <div style={{ marginBottom: "32px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>
                    CV Screening
                  </h3>
                  <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "16px" }}>
                    Jia automatically endorses candidates who meet the chosen criteria.
                  </p>
                  
                  <CustomDropdown
                    onSelectSetting={setScreeningSetting}
                    screeningSetting={screeningSetting}
                    settingList={screeningSettingList}
                    placeholder="Choose screening setting"
                  />
                </div>

                {/* CV Secret Prompt */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px", position: "relative" }}>
                    <i className="la la-sparkles" style={{ fontSize: 18, color: "#EC4899" }}></i>
                    <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#374151", margin: 0 }}>
                      CV Secret Prompt <span style={{ fontWeight: 400, color: "#9CA3AF" }}>(optional)</span>
                    </h3>
                    <div style={{ position: "relative" }}>
                      <i 
                        className="la la-info-circle" 
                        style={{ fontSize: 16, color: "#9CA3AF", cursor: "pointer" }}
                        onMouseEnter={() => setShowSecretPromptTooltip(true)}
                        onMouseLeave={() => setShowSecretPromptTooltip(false)}
                      ></i>
                      
                      {/* Tooltip */}
                      {showSecretPromptTooltip && (
                        <div style={{ 
                          position: "absolute",
                          top: "calc(100% + 8px)",
                          left: "50%",
                          transform: "translateX(-50%)",
                          width: "320px",
                          padding: "12px 16px", 
                          backgroundColor: "#1F2937", 
                          color: "#FFFFFF", 
                          borderRadius: "8px",
                          fontSize: "13px",
                          lineHeight: "1.5",
                          zIndex: 10,
                          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                          pointerEvents: "none"
                        }}>
                          These prompts remain hidden from candidates and the public job portal. Additionally, only Admins and the Job Owner can view the secret prompt.
                          {/* Arrow */}
                          <div style={{
                            position: "absolute",
                            top: "-6px",
                            left: "50%",
                            transform: "translateX(-50%)",
                            width: 0,
                            height: 0,
                            borderLeft: "6px solid transparent",
                            borderRight: "6px solid transparent",
                            borderBottom: "6px solid #1F2937"
                          }}></div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "16px" }}>
                    Secret Prompts give you extra control over Jia's evaluation style, complementing her accurate assessment of requirements from the job description.
                  </p>
                  
                  <div style={{ position: "relative" }}>
                    <i className="la la-sparkles" style={{ 
                      position: "absolute", 
                      left: "14px", 
                      top: "14px", 
                      fontSize: 16, 
                      color: "#EC4899",
                      pointerEvents: "none",
                      zIndex: 1
                    }}></i>
                    <textarea
                      value={secretPrompt}
                      onChange={(e) => setSecretPrompt(e.target.value)}
                      placeholder="Enter a secret prompt (e.g. Give higher fit scores to candidates who participate in hackathons or competitions.)"
                      style={{
                        width: "100%",
                        minHeight: "80px",
                        padding: "12px 14px 12px 40px",
                        fontSize: "14px",
                        border: "1px solid #D1D5DB",
                        borderRadius: "8px",
                        resize: "vertical",
                        fontFamily: "inherit",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Pre-Screening Questions Section */}
            <div style={{ backgroundColor: "#F9FAFB", borderRadius: "12px", padding: "24px" }}>
              {/* Section Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#111827", margin: 0 }}>
                    2. Pre-Screening Questions <span style={{ fontWeight: 400, color: "#9CA3AF" }}>(optional)</span>
                  </h2>
                  {preScreeningQuestions.length > 0 && (
                    <span style={{ 
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: "24px",
                      height: "24px",
                      padding: "0 8px",
                      backgroundColor: "#E5E7EB",
                      color: "#374151",
                      borderRadius: "12px",
                      fontSize: "13px",
                      fontWeight: 600
                    }}>
                      {preScreeningQuestions.length}
                    </span>
                  )}
                  <i className="la la-info-circle" style={{ fontSize: 16, color: "#9CA3AF", cursor: "pointer" }}></i>
                </div>
                <button
                  type="button"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 20px",
                    backgroundColor: "#111827",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: "pointer",
                  }}
                  onClick={() => {
                    setShowCustomQuestionForm(true);
                    setCustomQuestion("");
                    setCustomQuestionType("dropdown");
                    setCustomQuestionOptions(["Option 1"]);
                  }}
                >
                  <i className="la la-plus" style={{ fontSize: 16 }}></i>
                  Add custom
                </button>
              </div>

              {/* White Card Container */}
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "8px", padding: "24px", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)" }}>
                
                {/* Custom Question Form */}
                {showCustomQuestionForm && (
                  <div style={{ 
                    backgroundColor: "#F9FAFB", 
                    borderRadius: "8px", 
                    padding: "20px",
                    marginBottom: "24px"
                  }}>
                    {/* Question Input and Type Selector */}
                    <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                      <input
                        type="text"
                        value={customQuestion}
                        onChange={(e) => setCustomQuestion(e.target.value)}
                        placeholder="Write your question..."
                        style={{
                          flex: 1,
                          padding: "10px 14px",
                          fontSize: "14px",
                          border: "1px solid #D1D5DB",
                          borderRadius: "6px",
                          outline: "none",
                        }}
                      />
                      
                      {/* Type Dropdown */}
                      <div style={{ position: "relative" }}>
                        <button
                          type="button"
                          onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                          style={{
                            padding: "10px 16px",
                            backgroundColor: "#FFFFFF",
                            color: "#374151",
                            border: "1px solid #D1D5DB",
                            borderRadius: "6px",
                            fontSize: "14px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            minWidth: "160px",
                            justifyContent: "space-between"
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <i className={
                              customQuestionType === "dropdown" ? "la la-smile" :
                              customQuestionType === "short" ? "la la-user" :
                              customQuestionType === "long" ? "la la-align-left" :
                              customQuestionType === "checkboxes" ? "la la-check-square" :
                              "la la-sliders-h"
                            } style={{ fontSize: 16, color: "#6B7280" }}></i>
                            <span>
                              {customQuestionType === "dropdown" ? "Dropdown" :
                               customQuestionType === "short" ? "Short Answer" :
                               customQuestionType === "long" ? "Long Answer" :
                               customQuestionType === "checkboxes" ? "Checkboxes" :
                               "Range"}
                            </span>
                          </div>
                          <i className="la la-angle-down" style={{ fontSize: 14 }}></i>
                        </button>

                        {/* Type Dropdown Menu */}
                        {showTypeDropdown && (
                          <div style={{
                            position: "absolute",
                            top: "calc(100% + 4px)",
                            right: 0,
                            backgroundColor: "#FFFFFF",
                            border: "1px solid #D1D5DB",
                            borderRadius: "8px",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            zIndex: 10,
                            minWidth: "200px",
                            overflow: "hidden"
                          }}>
                            {[
                              { value: "short", label: "Short Answer", icon: "la-user" },
                              { value: "long", label: "Long Answer", icon: "la-align-left" },
                              { value: "dropdown", label: "Dropdown", icon: "la-smile" },
                              { value: "checkboxes", label: "Checkboxes", icon: "la-check-square" },
                              { value: "range", label: "Range", icon: "la-sliders-h" }
                            ].map((type) => (
                              <button
                                key={type.value}
                                type="button"
                                onClick={() => {
                                  setCustomQuestionType(type.value);
                                  setShowTypeDropdown(false);
                                }}
                                style={{
                                  width: "100%",
                                  padding: "12px 16px",
                                  backgroundColor: customQuestionType === type.value ? "#F3F4F6" : "transparent",
                                  border: "none",
                                  textAlign: "left",
                                  cursor: "pointer",
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "12px",
                                  fontSize: "14px",
                                  color: "#374151"
                                }}
                                onMouseEnter={(e) => {
                                  if (customQuestionType !== type.value) {
                                    e.currentTarget.style.backgroundColor = "#F9FAFB";
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (customQuestionType !== type.value) {
                                    e.currentTarget.style.backgroundColor = "transparent";
                                  }
                                }}
                              >
                                <i className={`la ${type.icon}`} style={{ fontSize: 16, color: "#6B7280" }}></i>
                                <span>{type.label}</span>
                                {customQuestionType === type.value && (
                                  <i className="la la-check" style={{ fontSize: 16, color: "#3B82F6", marginLeft: "auto" }}></i>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Options for Dropdown/Checkboxes */}
                    {(customQuestionType === "dropdown" || customQuestionType === "checkboxes") && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px", marginBottom: "16px" }}>
                        {customQuestionOptions.map((option, index) => (
                          <div key={index} style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "12px",
                            backgroundColor: "#FFFFFF",
                            padding: "12px 16px",
                            borderRadius: "6px"
                          }}>
                            <i className="la la-grip-vertical" style={{ fontSize: 16, color: "#9CA3AF", cursor: "grab" }}></i>
                            <span style={{ fontSize: "14px", color: "#6B7280", marginRight: "4px" }}>{index + 1}</span>
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const updated = [...customQuestionOptions];
                                updated[index] = e.target.value;
                                setCustomQuestionOptions(updated);
                              }}
                              style={{
                                flex: 1,
                                border: "none",
                                outline: "none",
                                fontSize: "14px",
                                color: "#374151",
                                backgroundColor: "transparent"
                              }}
                            />
                            {customQuestionOptions.length > 1 && (
                              <button
                                type="button"
                                onClick={() => {
                                  setCustomQuestionOptions(customQuestionOptions.filter((_, i) => i !== index));
                                }}
                                style={{
                                  padding: "4px",
                                  backgroundColor: "transparent",
                                  border: "none",
                                  cursor: "pointer",
                                  color: "#9CA3AF"
                                }}
                              >
                                <i className="la la-times" style={{ fontSize: 18 }}></i>
                              </button>
                            )}
                          </div>
                        ))}

                        {/* Add Option Button */}
                        <button
                          type="button"
                          onClick={() => {
                            setCustomQuestionOptions([...customQuestionOptions, `Option ${customQuestionOptions.length + 1}`]);
                          }}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px 16px",
                            backgroundColor: "transparent",
                            color: "#6B7280",
                            border: "none",
                            borderRadius: "6px",
                            fontSize: "14px",
                            cursor: "pointer",
                            alignSelf: "flex-start"
                          }}
                        >
                          <i className="la la-plus" style={{ fontSize: 16 }}></i>
                          Add Option
                        </button>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCustomQuestionForm(false);
                          setCustomQuestion("");
                          setCustomQuestionType("dropdown");
                          setCustomQuestionOptions(["Option 1"]);
                        }}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: "#FFFFFF",
                          color: "#374151",
                          border: "1px solid #D1D5DB",
                          borderRadius: "6px",
                          fontSize: "14px",
                          cursor: "pointer"
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (customQuestion.trim()) {
                            const newQuestion: any = {
                              id: Date.now(),
                              title: "Custom",
                              question: customQuestion,
                              type: customQuestionType
                            };

                            if (customQuestionType === "dropdown" || customQuestionType === "checkboxes") {
                              newQuestion.options = customQuestionOptions;
                            } else if (customQuestionType === "range") {
                              newQuestion.minValue = "";
                              newQuestion.maxValue = "";
                              newQuestion.currency = "PHP";
                            }

                            setPreScreeningQuestions([...preScreeningQuestions, newQuestion]);
                            setShowCustomQuestionForm(false);
                            setCustomQuestion("");
                            setCustomQuestionType("dropdown");
                            setCustomQuestionOptions(["Option 1"]);
                          }
                        }}
                        disabled={!customQuestion.trim()}
                        style={{
                          padding: "8px 16px",
                          backgroundColor: customQuestion.trim() ? "#111827" : "#D1D5DB",
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: "6px",
                          fontSize: "14px",
                          cursor: customQuestion.trim() ? "pointer" : "not-allowed"
                        }}
                      >
                        Add Question
                      </button>
                    </div>
                  </div>
                )}

                {/* Added Questions */}
                {preScreeningQuestions.length > 0 && (
                  <div style={{ marginBottom: "32px" }}>
                    {preScreeningQuestions.map((q: any, index: number) => (
                      <div key={q.id} style={{ 
                        backgroundColor: "#F9FAFB", 
                        borderRadius: "8px", 
                        padding: "20px",
                        marginBottom: index < preScreeningQuestions.length - 1 ? "16px" : "0"
                      }}>
                        {/* Question Header */}
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                          <p style={{ fontSize: "14px", color: "#374151", fontWeight: 500, margin: 0 }}>
                            {q.question}
                          </p>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <button
                              type="button"
                              style={{
                                padding: "6px 16px",
                                backgroundColor: "#FFFFFF",
                                color: "#374151",
                                border: "1px solid #D1D5DB",
                                borderRadius: "6px",
                                fontSize: "13px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px"
                              }}
                            >
                              <i className={q.type === "range" ? "la la-sliders-h" : "la la-smile"} style={{ fontSize: 14 }}></i>
                              {q.type === "range" ? "Range" : "Dropdown"}
                              <i className="la la-angle-down" style={{ fontSize: 14 }}></i>
                            </button>
                          </div>
                        </div>

                        {/* Range Type Input */}
                        {q.type === "range" && (
                          <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                            <div style={{ flex: 1 }}>
                              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#6B7280", marginBottom: "8px" }}>
                                Minimum
                              </label>
                              <div style={{ display: "flex", gap: "8px" }}>
                                <div style={{ position: "relative", flex: 1 }}>
                                  <span style={{
                                    position: "absolute",
                                    left: "14px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "#6B7280",
                                    fontSize: "14px",
                                    pointerEvents: "none",
                                  }}>
                                    ₱
                                  </span>
                                  <input
                                    type="number"
                                    value={q.minValue || ""}
                                    onChange={(e) => {
                                      const updated = [...preScreeningQuestions];
                                      updated[index].minValue = e.target.value;
                                      setPreScreeningQuestions(updated);
                                    }}
                                    placeholder="40,000"
                                    style={{
                                      width: "100%",
                                      padding: "10px 14px 10px 32px",
                                      fontSize: "14px",
                                      border: "1px solid #D1D5DB",
                                      borderRadius: "6px",
                                      outline: "none",
                                    }}
                                  />
                                </div>
                                <select
                                  value={q.currency || "PHP"}
                                  onChange={(e) => {
                                    const updated = [...preScreeningQuestions];
                                    updated[index].currency = e.target.value;
                                    setPreScreeningQuestions(updated);
                                  }}
                                  style={{
                                    padding: "10px 14px",
                                    fontSize: "14px",
                                    border: "1px solid #D1D5DB",
                                    borderRadius: "6px",
                                    backgroundColor: "#FFFFFF",
                                    cursor: "pointer",
                                  }}
                                >
                                  <option value="PHP">PHP</option>
                                  <option value="USD">USD</option>
                                </select>
                              </div>
                            </div>
                            
                            <div style={{ flex: 1 }}>
                              <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#6B7280", marginBottom: "8px" }}>
                                Maximum
                              </label>
                              <div style={{ display: "flex", gap: "8px" }}>
                                <div style={{ position: "relative", flex: 1 }}>
                                  <span style={{
                                    position: "absolute",
                                    left: "14px",
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    color: "#6B7280",
                                    fontSize: "14px",
                                    pointerEvents: "none",
                                  }}>
                                    ₱
                                  </span>
                                  <input
                                    type="number"
                                    value={q.maxValue || ""}
                                    onChange={(e) => {
                                      const updated = [...preScreeningQuestions];
                                      updated[index].maxValue = e.target.value;
                                      setPreScreeningQuestions(updated);
                                    }}
                                    placeholder="60,000"
                                    style={{
                                      width: "100%",
                                      padding: "10px 14px 10px 32px",
                                      fontSize: "14px",
                                      border: "1px solid #D1D5DB",
                                      borderRadius: "6px",
                                      outline: "none",
                                    }}
                                  />
                                </div>
                                <select
                                  value={q.currency || "PHP"}
                                  onChange={(e) => {
                                    const updated = [...preScreeningQuestions];
                                    updated[index].currency = e.target.value;
                                    setPreScreeningQuestions(updated);
                                  }}
                                  style={{
                                    padding: "10px 14px",
                                    fontSize: "14px",
                                    border: "1px solid #D1D5DB",
                                    borderRadius: "6px",
                                    backgroundColor: "#FFFFFF",
                                    cursor: "pointer",
                                  }}
                                >
                                  <option value="PHP">PHP</option>
                                  <option value="USD">USD</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Options List for Dropdown Type */}
                        {q.type !== "range" && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                          {q.options?.map((option: string, optIndex: number) => (
                            <div key={optIndex} style={{ 
                              display: "flex", 
                              alignItems: "center", 
                              gap: "12px",
                              backgroundColor: "#FFFFFF",
                              padding: "12px 16px",
                              borderRadius: "6px"
                            }}>
                              <i className="la la-grip-vertical" style={{ fontSize: 16, color: "#9CA3AF", cursor: "grab" }}></i>
                              <span style={{ fontSize: "14px", color: "#6B7280", marginRight: "4px" }}>{optIndex + 1}</span>
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const updated = [...preScreeningQuestions];
                                  updated[index].options[optIndex] = e.target.value;
                                  setPreScreeningQuestions(updated);
                                }}
                                style={{
                                  flex: 1,
                                  border: "none",
                                  outline: "none",
                                  fontSize: "14px",
                                  color: "#374151",
                                  backgroundColor: "transparent"
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...preScreeningQuestions];
                                  updated[index].options = updated[index].options.filter((_: any, i: number) => i !== optIndex);
                                  setPreScreeningQuestions(updated);
                                }}
                                style={{
                                  padding: "4px",
                                  backgroundColor: "transparent",
                                  border: "none",
                                  cursor: "pointer",
                                  color: "#9CA3AF"
                                }}
                              >
                                <i className="la la-times" style={{ fontSize: 18 }}></i>
                              </button>
                            </div>
                          ))}

                          {/* Add Option Button */}
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...preScreeningQuestions];
                              if (!updated[index].options) {
                                updated[index].options = [];
                              }
                              updated[index].options.push("");
                              setPreScreeningQuestions(updated);
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "10px 16px",
                              backgroundColor: "transparent",
                              color: "#6B7280",
                              border: "none",
                              borderRadius: "6px",
                              fontSize: "14px",
                              cursor: "pointer",
                              alignSelf: "flex-start"
                            }}
                          >
                            <i className="la la-plus" style={{ fontSize: 16 }}></i>
                            Add Option
                          </button>
                        </div>
                        )}

                        {/* Delete Question Button */}
                        <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            onClick={() => {
                              setPreScreeningQuestions(preScreeningQuestions.filter((item: any) => item.id !== q.id));
                            }}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "8px",
                              padding: "8px 16px",
                              backgroundColor: "#FFFFFF",
                              color: "#EF4444",
                              border: "1px solid #FEE2E2",
                              borderRadius: "6px",
                              fontSize: "14px",
                              cursor: "pointer"
                            }}
                          >
                            <i className="la la-trash" style={{ fontSize: 16 }}></i>
                            Delete Question
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Suggested Questions */}
                <div>
                  <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#374151", marginBottom: "20px" }}>
                    Suggested Pre-screening Questions:
                  </h3>

                  {/* Notice Period */}
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "flex-start", 
                    paddingBottom: "20px", 
                    marginBottom: "20px", 
                    borderBottom: "1px solid #E5E7EB" 
                  }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        fontSize: "14px", 
                        fontWeight: 600, 
                        color: preScreeningQuestions.find((q: any) => q.title === "Notice Period") ? "#D1D5DB" : "#111827", 
                        marginBottom: "4px" 
                      }}>
                        Notice Period
                      </h4>
                      <p style={{ 
                        fontSize: "14px", 
                        color: preScreeningQuestions.find((q: any) => q.title === "Notice Period") ? "#D1D5DB" : "#6B7280", 
                        margin: 0 
                      }}>
                        How long is your notice period?
                      </p>
                    </div>
                    {preScreeningQuestions.find((q: any) => q.title === "Notice Period") ? (
                      <span style={{
                        padding: "8px 20px",
                        color: "#D1D5DB",
                        fontSize: "14px",
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                      }}>
                        Added
                      </span>
                    ) : (
                    <button
                      type="button"
                      style={{
                        padding: "8px 20px",
                        backgroundColor: "#FFFFFF",
                        color: "#374151",
                        border: "1px solid #D1D5DB",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: 500,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                      onClick={() => {
                        setPreScreeningQuestions([...preScreeningQuestions, {
                          id: Date.now(),
                          title: "Notice Period",
                          question: "How long is your notice period?",
                          type: "dropdown",
                          options: ["Immediately", "< 30 days", "> 30 days"]
                        }]);
                      }}
                    >
                      Add
                    </button>
                    )}
                  </div>

                  {/* Work Setup */}
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "flex-start", 
                    paddingBottom: "20px", 
                    marginBottom: "20px", 
                    borderBottom: "1px solid #E5E7EB" 
                  }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        fontSize: "14px", 
                        fontWeight: 600, 
                        color: preScreeningQuestions.find((q: any) => q.title === "Work Setup") ? "#D1D5DB" : "#111827", 
                        marginBottom: "4px" 
                      }}>
                        Work Setup
                      </h4>
                      <p style={{ 
                        fontSize: "14px", 
                        color: preScreeningQuestions.find((q: any) => q.title === "Work Setup") ? "#D1D5DB" : "#6B7280", 
                        margin: 0 
                      }}>
                        How often are you willing to report to the office each week?
                      </p>
                    </div>
                    {preScreeningQuestions.find((q: any) => q.title === "Work Setup") ? (
                      <span style={{
                        padding: "8px 20px",
                        color: "#D1D5DB",
                        fontSize: "14px",
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                      }}>
                        Added
                      </span>
                    ) : (
                    <button
                      type="button"
                      style={{
                        padding: "8px 20px",
                        backgroundColor: "#FFFFFF",
                        color: "#374151",
                        border: "1px solid #D1D5DB",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: 500,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                      onClick={() => {
                        setPreScreeningQuestions([...preScreeningQuestions, {
                          id: Date.now(),
                          title: "Work Setup",
                          question: "How often are you willing to report to the office?",
                          type: "dropdown",
                          options: ["At most 1-2x a week", "At most 3-4x a week", "Open to fully onsite work", "Only open to fully remote work"]
                        }]);
                      }}
                    >
                      Add
                    </button>
                    )}
                  </div>

                  {/* Asking Salary */}
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "flex-start"
                  }}>
                    <div style={{ flex: 1 }}>
                      <h4 style={{ 
                        fontSize: "14px", 
                        fontWeight: 600, 
                        color: preScreeningQuestions.find((q: any) => q.title === "Asking Salary") ? "#D1D5DB" : "#111827", 
                        marginBottom: "4px" 
                      }}>
                        Asking Salary
                      </h4>
                      <p style={{ 
                        fontSize: "14px", 
                        color: preScreeningQuestions.find((q: any) => q.title === "Asking Salary") ? "#D1D5DB" : "#6B7280", 
                        margin: 0 
                      }}>
                        How much is your expected monthly salary?
                      </p>
                    </div>
                    {preScreeningQuestions.find((q: any) => q.title === "Asking Salary") ? (
                      <span style={{
                        padding: "8px 20px",
                        color: "#D1D5DB",
                        fontSize: "14px",
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                      }}>
                        Added
                      </span>
                    ) : (
                    <button
                      type="button"
                      style={{
                        padding: "8px 20px",
                        backgroundColor: "#FFFFFF",
                        color: "#374151",
                        border: "1px solid #D1D5DB",
                        borderRadius: "8px",
                        fontSize: "14px",
                        fontWeight: 500,
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                      onClick={() => {
                        setPreScreeningQuestions([...preScreeningQuestions, {
                          id: Date.now(),
                          title: "Asking Salary",
                          question: "How much is your expected monthly salary?",
                          type: "range",
                          minValue: 40000,
                          maxValue: 60000,
                          currency: "PHP"
                        }]);
                      }}
                    >
                      Add
                    </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
            </>
          )}

          {/* Step 3: AI Interview Setup */}
          {currentStep === 3 && (
            <>
            <div style={{ backgroundColor: "#F9FAFB", borderRadius: "12px", padding: "24px" }}>
              {/* Section Title */}
              <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#111827", marginBottom: "20px" }}>
                1. AI Interview Settings
              </h2>

              {/* White Card Container */}
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "8px", padding: "24px", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)" }}>
                {/* AI Interview Screening */}
                <div style={{ marginBottom: "32px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>
                    AI Interview Screening
                  </h3>
                  <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "16px" }}>
                    Jia automatically endorses candidates who meet the chosen criteria.
                  </p>
                  
                  <CustomDropdown
                    onSelectSetting={setAiInterviewScreening}
                    screeningSetting={aiInterviewScreening}
                    settingList={screeningSettingList}
                    placeholder="Choose screening setting"
                  />
                </div>

                {/* Require Video on Interview */}
                <div style={{ marginBottom: "32px" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#374151", marginBottom: "8px" }}>
                    Require Video on Interview
                  </h3>
                  <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "16px" }}>
                    Require candidates to keep their camera on. Recordings will appear on their analysis page.
                  </p>
                  
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", backgroundColor: "#F9FAFB", borderRadius: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <i className="la la-video" style={{ fontSize: 20, color: "#374151" }}></i>
                      <span style={{ fontSize: "14px", fontWeight: 500, color: "#374151" }}>
                        Require Video Interview
                      </span>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <span style={{ fontSize: "14px", color: "#6B7280" }}>
                        {requireVideo ? "Yes" : "No"}
                      </span>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={requireVideo}
                          onChange={() => setRequireVideo(!requireVideo)}
                        />
                        <span className="slider round"></span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* AI Interview Secret Prompt */}
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                    <i className="la la-sparkles" style={{ fontSize: 18, color: "#EC4899" }}></i>
                    <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#374151", margin: 0 }}>
                      AI Interview Secret Prompt <span style={{ fontWeight: 400, color: "#9CA3AF" }}>(optional)</span>
                    </h3>
                    <i className="la la-info-circle" style={{ fontSize: 16, color: "#9CA3AF", cursor: "pointer" }}></i>
                  </div>
                  
                  <p style={{ fontSize: "14px", color: "#6B7280", marginBottom: "16px" }}>
                    Secret Prompts give you extra control over Jia's evaluation style, complementing her accurate assessment of requirements from the job description.
                  </p>
                  
                  <div style={{ position: "relative" }}>
                    <i className="la la-sparkles" style={{ 
                      position: "absolute", 
                      left: "14px", 
                      top: "14px", 
                      fontSize: 16, 
                      color: "#EC4899",
                      pointerEvents: "none",
                      zIndex: 1
                    }}></i>
                    <textarea
                      value={aiInterviewSecretPrompt}
                      onChange={(e) => setAiInterviewSecretPrompt(e.target.value)}
                      placeholder="Enter a secret prompt (e.g. Treat candidates who speak in Taglish, English, or Tagalog equally. Focus on clarity, coherence, and confidence rather than language preference or accent.)"
                      style={{
                        width: "100%",
                        minHeight: "80px",
                        padding: "12px 14px 12px 40px",
                        fontSize: "14px",
                        border: "1px solid #D1D5DB",
                        borderRadius: "8px",
                        resize: "vertical",
                        fontFamily: "inherit",
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* AI Interview Questions Section */}
            <div style={{ backgroundColor: "#F9FAFB", borderRadius: "12px", padding: "24px" }}>
              {/* Section Header */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#111827", margin: 0 }}>
                    2. AI Interview Questions
                  </h2>
                  <i className="la la-info-circle" style={{ fontSize: 16, color: "#9CA3AF", cursor: "pointer" }}></i>
                </div>
                <button
                  type="button"
                  onClick={generateAllQuestions}
                  disabled={isGeneratingAllQuestions || !jobTitle || !description}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "10px 20px",
                    backgroundColor: isGeneratingAllQuestions || !jobTitle || !description ? "#D1D5DB" : "#111827",
                    color: "#FFFFFF",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "14px",
                    fontWeight: 500,
                    cursor: isGeneratingAllQuestions || !jobTitle || !description ? "not-allowed" : "pointer",
                  }}
                >
                  {isGeneratingAllQuestions ? (
                    <>
                      <i className="la la-spinner la-spin" style={{ fontSize: 16 }}></i>
                      Generating...
                    </>
                  ) : (
                    <>
                      <i className="la la-sparkles" style={{ fontSize: 16 }}></i>
                      Generate all questions
                    </>
                  )}
                </button>
              </div>

              {/* White Card Container */}
              <div style={{ backgroundColor: "#FFFFFF", borderRadius: "8px", padding: "24px", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)" }}>
                {/* Error Message */}
                {showValidationError && !isFormValid() && currentStep === 3 && (
                  <div style={{ 
                    display: "flex", 
                    alignItems: "center", 
                    gap: "8px", 
                    padding: "12px 16px", 
                    backgroundColor: "#FEF2F2", 
                    border: "1px solid #FEE2E2",
                    borderRadius: "8px",
                    marginBottom: "20px"
                  }}>
                    <i className="la la-exclamation-triangle" style={{ fontSize: 18, color: "#EF4444" }}></i>
                    <span style={{ fontSize: "14px", color: "#EF4444", fontWeight: 500 }}>
                      Please add at least 5 interview questions.
                    </span>
                  </div>
                )}

                {/* Question Categories */}
                {questions.map((category: any, categoryIndex: number) => (
                  <div key={category.id} style={{ marginBottom: categoryIndex < questions.length - 1 ? "32px" : "0" }}>
                    <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#374151", marginBottom: "16px" }}>
                      {category.category}
                    </h3>

                    {/* Display existing questions */}
                    {category.questions && category.questions.length > 0 && (
                      <div style={{ marginBottom: "16px" }}>
                        {category.questions.map((q: string, qIndex: number) => (
                          <div key={qIndex} style={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: "12px",
                            padding: "12px 16px",
                            backgroundColor: "#F9FAFB",
                            borderRadius: "8px",
                            marginBottom: "8px"
                          }}>
                            <i className="la la-grip-vertical" style={{ fontSize: 16, color: "#9CA3AF", cursor: "grab" }}></i>
                            <span style={{ flex: 1, fontSize: "14px", color: "#374151" }}>{q}</span>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...questions];
                                updated[categoryIndex].questions = updated[categoryIndex].questions.filter((_: any, i: number) => i !== qIndex);
                                setQuestions(updated);
                              }}
                              style={{
                                padding: "6px 12px",
                                backgroundColor: "transparent",
                                color: "#6B7280",
                                border: "1px solid #D1D5DB",
                                borderRadius: "6px",
                                fontSize: "13px",
                                cursor: "pointer",
                                display: "flex",
                                alignItems: "center",
                                gap: "6px"
                              }}
                            >
                              <i className="la la-pen" style={{ fontSize: 14 }}></i>
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...questions];
                                updated[categoryIndex].questions = updated[categoryIndex].questions.filter((_: any, i: number) => i !== qIndex);
                                setQuestions(updated);
                              }}
                              style={{
                                padding: "6px",
                                backgroundColor: "transparent",
                                border: "none",
                                cursor: "pointer",
                                color: "#EF4444"
                              }}
                            >
                              <i className="la la-trash" style={{ fontSize: 18 }}></i>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add question input */}
                    {addingQuestionToCategoryId === category.id && (
                      <div style={{ marginBottom: "16px" }}>
                        <textarea
                          value={newQuestionText}
                          onChange={(e) => setNewQuestionText(e.target.value)}
                          placeholder="Enter your question..."
                          autoFocus
                          style={{
                            width: "100%",
                            minHeight: "80px",
                            padding: "12px 14px",
                            fontSize: "14px",
                            border: "1px solid #D1D5DB",
                            borderRadius: "8px",
                            resize: "vertical",
                            fontFamily: "inherit",
                            marginBottom: "8px"
                          }}
                        />
                        <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                          <button
                            type="button"
                            onClick={() => {
                              setAddingQuestionToCategoryId(null);
                              setNewQuestionText("");
                            }}
                            style={{
                              padding: "8px 16px",
                              backgroundColor: "#FFFFFF",
                              color: "#374151",
                              border: "1px solid #D1D5DB",
                              borderRadius: "6px",
                              fontSize: "14px",
                              cursor: "pointer"
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (newQuestionText.trim()) {
                                const updated = [...questions];
                                if (!updated[categoryIndex].questions) {
                                  updated[categoryIndex].questions = [];
                                }
                                updated[categoryIndex].questions.push(newQuestionText.trim());
                                setQuestions(updated);
                                setAddingQuestionToCategoryId(null);
                                setNewQuestionText("");
                              }
                            }}
                            disabled={!newQuestionText.trim()}
                            style={{
                              padding: "8px 16px",
                              backgroundColor: newQuestionText.trim() ? "#111827" : "#D1D5DB",
                              color: "#FFFFFF",
                              border: "none",
                              borderRadius: "6px",
                              fontSize: "14px",
                              cursor: newQuestionText.trim() ? "pointer" : "not-allowed"
                            }}
                          >
                            Add Question
                          </button>
                        </div>
                      </div>
                    )}

                    <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                      <button
                        type="button"
                        onClick={() => generateQuestionsForCategory(category.id, category.category)}
                        disabled={generatingQuestionsForCategory === category.id || !jobTitle || !description}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "10px 20px",
                          backgroundColor: generatingQuestionsForCategory === category.id || !jobTitle || !description ? "#D1D5DB" : "#111827",
                          color: "#FFFFFF",
                          border: "none",
                          borderRadius: "8px",
                          fontSize: "14px",
                          fontWeight: 500,
                          cursor: generatingQuestionsForCategory === category.id || !jobTitle || !description ? "not-allowed" : "pointer",
                        }}
                      >
                        {generatingQuestionsForCategory === category.id ? (
                          <>
                            <i className="la la-spinner la-spin" style={{ fontSize: 16 }}></i>
                            Generating...
                          </>
                        ) : (
                          <>
                            <i className="la la-sparkles" style={{ fontSize: 16 }}></i>
                            Generate questions
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAddingQuestionToCategoryId(category.id);
                          setNewQuestionText("");
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "8px",
                          padding: "10px 20px",
                          backgroundColor: "#FFFFFF",
                          color: "#374151",
                          border: "1px solid #D1D5DB",
                          borderRadius: "8px",
                          fontSize: "14px",
                          fontWeight: 500,
                          cursor: "pointer",
                        }}
                      >
                        <i className="la la-plus-circle" style={{ fontSize: 16 }}></i>
                        Manually add
                      </button>

                      {category.questions && category.questions.length > 0 && (
                        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "14px", color: "#6B7280" }}>
                            # of questions to ask
                          </span>
                          <input
                            type="number"
                            value={category.questionCountToAsk || category.questions.length}
                            onChange={(e) => {
                              const updated = [...questions];
                              updated[categoryIndex].questionCountToAsk = parseInt(e.target.value) || null;
                              setQuestions(updated);
                            }}
                            min="1"
                            max={category.questions.length}
                            style={{
                              width: "60px",
                              padding: "6px 10px",
                              fontSize: "14px",
                              border: "1px solid #D1D5DB",
                              borderRadius: "6px",
                              textAlign: "center"
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            </>
          )}

          {/* Step 4: Review Career */}
          {currentStep === 4 && (
            <div style={{ backgroundColor: "#F9FAFB", borderRadius: "12px", padding: "24px" }}>
              {/* Career Details & Team Access Section */}
              <div style={{ marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#111827", margin: 0 }}>
                    <i className="la la-angle-down" style={{ fontSize: 20, marginRight: "8px" }}></i>
                    Career Details & Team Access
                  </h2>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(1)}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "transparent",
                      color: "#6B7280",
                      border: "1px solid #D1D5DB",
                      borderRadius: "6px",
                      fontSize: "14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <i className="la la-pen" style={{ fontSize: 14 }}></i>
                    Edit
                  </button>
                </div>

                <div style={{ backgroundColor: "#FFFFFF", borderRadius: "8px", padding: "20px", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)" }}>
                  <div style={{ marginBottom: "20px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#6B7280", marginBottom: "8px" }}>Job Title</h3>
                    <p style={{ fontSize: "14px", color: "#111827", margin: 0 }}>{jobTitle}</p>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                    <div>
                      <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#6B7280", marginBottom: "8px" }}>Employment Type</h3>
                      <p style={{ fontSize: "14px", color: "#111827", margin: 0 }}>{employmentType}</p>
                    </div>
                    <div>
                      <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#6B7280", marginBottom: "8px" }}>Work Arrangement</h3>
                      <p style={{ fontSize: "14px", color: "#111827", margin: 0 }}>{workSetup}</p>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                    <div>
                      <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#6B7280", marginBottom: "8px" }}>Country</h3>
                      <p style={{ fontSize: "14px", color: "#111827", margin: 0 }}>{country}</p>
                    </div>
                    <div>
                      <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#6B7280", marginBottom: "8px" }}>State / Province</h3>
                      <p style={{ fontSize: "14px", color: "#111827", margin: 0 }}>{province}</p>
                    </div>
                    <div>
                      <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#6B7280", marginBottom: "8px" }}>City</h3>
                      <p style={{ fontSize: "14px", color: "#111827", margin: 0 }}>{city}</p>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "20px" }}>
                    <div>
                      <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#6B7280", marginBottom: "8px" }}>Minimum Salary</h3>
                      <p style={{ fontSize: "14px", color: "#111827", margin: 0 }}>
                        {salaryNegotiable ? "Negotiable" : minimumSalary ? `₱${minimumSalary}` : "Not specified"}
                      </p>
                    </div>
                    <div>
                      <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#6B7280", marginBottom: "8px" }}>Maximum Salary</h3>
                      <p style={{ fontSize: "14px", color: "#111827", margin: 0 }}>
                        {salaryNegotiable ? "Negotiable" : maximumSalary ? `₱${maximumSalary}` : "Not specified"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#6B7280", marginBottom: "8px" }}>Job Description</h3>
                    <div 
                      style={{ 
                        fontSize: "14px", 
                        color: "#111827", 
                        padding: "12px", 
                        backgroundColor: "#F9FAFB", 
                        borderRadius: "6px",
                        border: "1px solid #E5E7EB",
                        maxHeight: "200px",
                        overflow: "auto"
                      }}
                      dangerouslySetInnerHTML={{ __html: description }}
                    />
                  </div>

                  {selectedMembers.length > 0 && (
                    <div style={{ marginTop: "20px" }}>
                      <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#6B7280", marginBottom: "12px" }}>Team Access</h3>
                      {selectedMembers.map((member: any) => (
                        <div key={member.email} style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "8px" }}>
                          <div style={{ 
                            width: "32px", 
                            height: "32px", 
                            borderRadius: "50%", 
                            backgroundColor: "#E5E7EB",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            overflow: "hidden"
                          }}>
                            {member.image ? (
                              <img src={member.image} alt={member.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                            ) : (
                              <i className="la la-user" style={{ fontSize: 16, color: "#6B7280" }}></i>
                            )}
                          </div>
                          <span style={{ fontSize: "14px", color: "#111827" }}>{member.name}</span>
                          <span style={{ fontSize: "13px", color: "#6B7280" }}>({member.role})</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* CV Review & Pre-screening Section */}
              <div style={{ marginBottom: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#111827", margin: 0 }}>
                    <i className="la la-angle-down" style={{ fontSize: 20, marginRight: "8px" }}></i>
                    CV Review & Pre-screening
                  </h2>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(2)}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "transparent",
                      color: "#6B7280",
                      border: "1px solid #D1D5DB",
                      borderRadius: "6px",
                      fontSize: "14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <i className="la la-pen" style={{ fontSize: 14 }}></i>
                    Edit
                  </button>
                </div>

                <div style={{ backgroundColor: "#FFFFFF", borderRadius: "8px", padding: "20px", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)" }}>
                  <div style={{ marginBottom: "20px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#6B7280", marginBottom: "8px" }}>CV Screening</h3>
                    <p style={{ fontSize: "14px", color: "#111827", margin: 0 }}>{screeningSetting}</p>
                  </div>

                  {secretPrompt && (
                    <div>
                      <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#6B7280", marginBottom: "8px" }}>CV Secret Prompt</h3>
                      <p style={{ fontSize: "14px", color: "#111827", margin: 0 }}>{secretPrompt}</p>
                    </div>
                  )}

                  {preScreeningQuestions.length > 0 && (
                    <div style={{ marginTop: "20px" }}>
                      <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#6B7280", marginBottom: "12px" }}>
                        Pre-Screening Questions ({preScreeningQuestions.length})
                      </h3>
                      {preScreeningQuestions.map((q: any, index: number) => (
                        <div key={q.id} style={{ marginBottom: "12px", paddingBottom: "12px", borderBottom: index < preScreeningQuestions.length - 1 ? "1px solid #E5E7EB" : "none" }}>
                          <p style={{ fontSize: "14px", color: "#111827", fontWeight: 500, marginBottom: "4px" }}>{q.question}</p>
                          <p style={{ fontSize: "13px", color: "#6B7280", margin: 0 }}>Type: {q.type === "range" ? "Range" : "Dropdown"}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* AI Interview Setup Section */}
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#111827", margin: 0 }}>
                    <i className="la la-angle-down" style={{ fontSize: 20, marginRight: "8px" }}></i>
                    AI Interview Setup
                  </h2>
                  <button
                    type="button"
                    onClick={() => setCurrentStep(3)}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "transparent",
                      color: "#6B7280",
                      border: "1px solid #D1D5DB",
                      borderRadius: "6px",
                      fontSize: "14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "6px"
                    }}
                  >
                    <i className="la la-pen" style={{ fontSize: 14 }}></i>
                    Edit
                  </button>
                </div>

                <div style={{ backgroundColor: "#FFFFFF", borderRadius: "8px", padding: "20px", boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)" }}>
                  <div style={{ marginBottom: "20px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#6B7280", marginBottom: "8px" }}>AI Interview Screening</h3>
                    <p style={{ fontSize: "14px", color: "#111827", margin: 0 }}>{aiInterviewScreening}</p>
                  </div>

                  <div style={{ marginBottom: "20px" }}>
                    <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#6B7280", marginBottom: "8px" }}>Require Video Interview</h3>
                    <p style={{ fontSize: "14px", color: "#111827", margin: 0 }}>{requireVideo ? "Yes" : "No"}</p>
                  </div>

                  {aiInterviewSecretPrompt && (
                    <div style={{ marginBottom: "20px" }}>
                      <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#6B7280", marginBottom: "8px" }}>AI Interview Secret Prompt</h3>
                      <p style={{ fontSize: "14px", color: "#111827", margin: 0 }}>{aiInterviewSecretPrompt}</p>
                    </div>
                  )}

                  <div>
                    <h3 style={{ fontSize: "14px", fontWeight: 600, color: "#6B7280", marginBottom: "12px" }}>
                      Interview Questions ({questions.reduce((sum, cat) => sum + (cat.questions?.length || 0), 0)} total)
                    </h3>
                    {questions.map((category: any) => (
                      category.questions && category.questions.length > 0 && (
                        <div key={category.id} style={{ marginBottom: "16px" }}>
                          <h4 style={{ fontSize: "14px", fontWeight: 600, color: "#111827", marginBottom: "8px" }}>
                            {category.category} ({category.questions.length} questions)
                          </h4>
                          <ul style={{ margin: 0, paddingLeft: "20px" }}>
                            {category.questions.map((q: string, index: number) => (
                              <li key={index} style={{ fontSize: "13px", color: "#6B7280", marginBottom: "4px" }}>{q}</li>
                            ))}
                          </ul>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        <div style={{ width: "25%", display: "flex", flexDirection: "column", gap: 8 }}>
          {/* Tips Section */}
          <TipsSection step={currentStep} />
        </div>
      </div>
      {showSaveModal && (
         <CareerActionModal action={showSaveModal} onAction={(action) => saveCareer(action)} />
        )}
    {isSavingCareer && (
        <FullScreenLoadingAnimation title={formType === "add" ? "Saving career..." : "Updating career..."} subtext={`Please wait while we are ${formType === "add" ? "saving" : "updating"} the career`} />
    )}
    {showDraftModal && (
        <div style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
        }}>
            <div style={{
                backgroundColor: "#FFFFFF",
                borderRadius: "12px",
                padding: "32px",
                maxWidth: "500px",
                width: "90%",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
            }}>
                <div style={{ marginBottom: "24px", textAlign: "center" }}>
                    <div style={{
                        width: "64px",
                        height: "64px",
                        borderRadius: "50%",
                        backgroundColor: "#EEF2FF",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 16px",
                    }}>
                        <i className="la la-file-alt" style={{ fontSize: 32, color: "#6366F1" }}></i>
                    </div>
                    <h2 style={{ fontSize: "20px", fontWeight: 600, color: "#111827", marginBottom: "8px" }}>
                        Resume from Draft?
                    </h2>
                    <p style={{ fontSize: "14px", color: "#6B7280", margin: 0 }}>
                        We found a saved draft of your career posting. Would you like to continue where you left off?
                    </p>
                </div>
                <div style={{ display: "flex", gap: "12px" }}>
                    <button
                        onClick={() => {
                            setShowDraftModal(false);
                            deleteDraft();
                        }}
                        style={{
                            flex: 1,
                            padding: "10px 16px",
                            backgroundColor: "#FFFFFF",
                            color: "#374151",
                            border: "1px solid #D1D5DB",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        Start Fresh
                    </button>
                    <button
                        onClick={resumeFromDraft}
                        style={{
                            flex: 1,
                            padding: "10px 16px",
                            backgroundColor: "#6366F1",
                            color: "#FFFFFF",
                            border: "none",
                            borderRadius: "8px",
                            fontSize: "14px",
                            fontWeight: 600,
                            cursor: "pointer",
                        }}
                    >
                        Resume Draft
                    </button>
                </div>
            </div>
        </div>
    )}
    {isLoadingDraft && (
        <FullScreenLoadingAnimation title="Loading..." subtext="Checking for saved drafts..." />
    )}
    </div>
    )
}