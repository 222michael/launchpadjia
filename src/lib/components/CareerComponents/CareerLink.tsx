"use client"

import { useEffect, useState } from "react";
import { candidateActionToast } from "../../Utils";

export default function CareerLink(props: {career: any}) {
    const { career } = props;
    const [shareLink, setShareLink] = useState("");

    useEffect(() => {
        let careerRedirection = "applicant";
        if (career.orgID === "682d3fc222462d03263b0881") {
            careerRedirection = "whitecloak";
        }
        setShareLink(`${window.location.origin}/${careerRedirection}/job-openings/${career._id}`);
    }, [career]);

    return (
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
                Career Link
            </h3>
                
            {/* Content */}
            {shareLink && (
                <div style={{ 
                    display: "flex", 
                    flexDirection: "column", 
                    gap: "12px",
                    backgroundColor: "#FFFFFF",
                    borderRadius: "8px",
                    padding: "16px"
                }}>
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
                                    "Career Link Copied to Clipboard",
                                    1300,
                                    <i className="la la-link mr-1 text-info"></i>
                                );
                            }}
                        >
                            <i className="la la-copy" style={{ fontSize: 20, color: "#535862" }}></i>
                        </button>
                    </div>

                    <a href={shareLink} target="_blank" style={{ textDecoration: "none" }}>
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
                </div>
            )}
        </div>
    )
}