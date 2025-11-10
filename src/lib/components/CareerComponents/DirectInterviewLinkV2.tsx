import { useEffect, useState } from "react";
import axios from "axios";
import { useAppContext } from "@/lib/context/AppContext";
import { candidateActionToast, copyTextToClipboard, loadingToast, successToast } from "@/lib/Utils";
import { toast } from "react-toastify";

export default function DirectInterviewLinkV2(props: { formData: any, setFormData: (formData: any) => void }) {
  const { user } = useAppContext();

  const { formData, setFormData } = props;

  async function updateCareer(
    dataUpdates: any,
    loadingMessage: string,
    sucessMessage: string
  ) {
    let userInfoSlice = {
      image: user.image,
      name: user.name,
      email: user.email,
    };

    loadingToast(loadingMessage);
    // Handle slug if it's an array or string

    const response = await axios.post("/api/update-career", {
      _id: formData._id,
      lastEditedBy: userInfoSlice,
      ...dataUpdates,
    });

    if (response.status === 200) {
      successToast(sucessMessage, 1200);
      toast.dismiss("loading-toast");
    }
  }

  const [shareLink, setLink] = useState(null);

  async function generateLink() {
    const directLink = `/direct-interview/${formData._id}`;

    await updateCareer(
      {
        directInterviewLink: directLink,
        updatedAt: Date.now(),
      },
      "Generating Link...",
      "Sucessfully Created Direct Link"
    );

    let dynamicLink = `${window.location.origin}${directLink}`;
    setLink(dynamicLink);
    copyTextToClipboard(dynamicLink);
    setFormData({ ...formData, directInterviewLink: `/direct-interview/${formData._id}` });
  }

  async function disableLink() {
    await updateCareer(
      {
        directInterviewLink: null,
        updatedAt: Date.now(),
      },
      "Removing Direct Link",
      "Sucessfully Removed Direct Link"
    );

    setLink(null);
    setFormData({ ...formData, directInterviewLink: null });
  }

  useEffect(() => {
      if (formData?.directInterviewLink) {
        let dynamicLink = `${window.location.origin}${formData.directInterviewLink}`;

        setLink(dynamicLink);
      }
  }, [formData?.directInterviewLink]);

  return (
    <>
      {formData && (
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
                Direct Interview Link
            </h3>
                
            {/* Content */}
            <div style={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: "12px",
                backgroundColor: "#FFFFFF",
                borderRadius: "8px",
                padding: "16px"
            }}>
              {shareLink ? (
                <>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 10 }}>
                        <input
                            type="text"
                            className="form-control"
                            value={shareLink}
                            readOnly={true}
                            style={{ flex: 1 }}
                        />
                        <button
                            style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center", 
                                cursor: "pointer",
                                background: "#F8F9FC",
                                border: "1px solid #E9EAEB",
                                borderRadius: "8px",
                                padding: "10px 12px",
                                minWidth: "40px"
                            }}
                            onClick={() => {
                                navigator.clipboard.writeText(shareLink);
                                candidateActionToast(
                                    "Direct Interview Link Copied to Clipboard",
                                    1300,
                                    <i className="la la-link mr-1 text-info"></i>
                                );
                            }}
                        >
                            <i className="la la-copy" style={{ fontSize: 20, color: "#535862" }}></i>
                        </button>
                    </div>
                    
                    <p style={{ 
                        textAlign: "center", 
                        fontSize: 14, 
                        color: "#6B7280", 
                        fontWeight: 500,
                        margin: "4px 0"
                    }}>
                        Share this link to an applicant for a direct interview.
                    </p>

                    <div style={{ display: "flex", flexDirection: "row", gap: 10, width: "100%" }}>
                        <a href={shareLink} target="_blank" style={{ flex: 1, textDecoration: "none" }}>
                            <button style={{ 
                                color: "#414651", 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center",
                                gap: 8, 
                                background: "#fff", 
                                border: "1px solid #D5D7DA", 
                                padding: "10px 16px", 
                                borderRadius: "8px", 
                                cursor: "pointer", 
                                whiteSpace: "nowrap", 
                                width: "100%",
                                fontWeight: 600, 
                                fontSize: 14 
                            }}>
                                <i className="la la-external-link-alt"></i> Open link
                            </button>
                        </a>
                        <button
                            style={{ 
                                color: "#B32318", 
                                display: "flex", 
                                alignItems: "center", 
                                justifyContent: "center",
                                gap: 8, 
                                background: "#FEF3F2", 
                                border: "1px solid #FECDCA", 
                                padding: "10px 16px", 
                                borderRadius: "8px", 
                                cursor: "pointer", 
                                whiteSpace: "nowrap", 
                                fontWeight: 600, 
                                fontSize: 14,
                                flex: 1
                            }}
                            onClick={disableLink}
                        >
                            <i className="la la-ban"></i> Disable Link
                        </button>
                    </div>
                </>
              ) : (
                <button 
                    style={{ 
                        display: "flex", 
                        justifyContent: "center", 
                        alignItems: "center", 
                        gap: 8, 
                        background: "#fff", 
                        border: "1px solid #D5D7DA", 
                        padding: "10px 16px", 
                        borderRadius: "8px", 
                        cursor: "pointer", 
                        whiteSpace: "nowrap",
                        width: "100%",
                        fontWeight: 600,
                        fontSize: 14,
                        color: "#414651"
                    }}
                    onClick={generateLink}
                >
                    <i className="la la-plus-circle" style={{ color: "#10B981" }} /> Generate Direct Interview Link
                </button>
              )}
            </div>
        </div>
      )}
    </>
  );
}
