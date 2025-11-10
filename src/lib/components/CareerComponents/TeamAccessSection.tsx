"use client";

export default function TeamAccessSection({ teamMembers }: { teamMembers?: any[] }) {
    // Default to empty array if no team members provided
    const members = teamMembers || [];

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
            <div style={{ 
                display: "flex", 
                flexDirection: "row", 
                alignItems: "center", 
                justifyContent: "space-between", 
                width: "100%"
            }}>
                <h3 style={{ 
                    fontSize: "18px", 
                    fontWeight: 700, 
                    color: "#181D27",
                    margin: 0
                }}>
                    Team Access
                </h3>
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
                    onMouseOver={(e) => e.currentTarget.style.background = "#F8F9FC"}
                    onMouseOut={(e) => e.currentTarget.style.background = "#FFFFFF"}
                >
                    <i className="la la-pen" style={{ fontSize: 16, color: "#535862" }} />
                </button>
            </div>
                
            {/* Members List */}
            <div style={{ 
                display: "flex", 
                flexDirection: "column", 
                gap: "16px",
                backgroundColor: "#FFFFFF",
                borderRadius: "8px",
                padding: members.length > 0 ? "16px" : "32px 16px"
            }}>
                {members.length === 0 ? (
                    <div style={{ 
                        textAlign: "center", 
                        color: "#9CA3AF", 
                        fontSize: "14px",
                        fontWeight: 500
                    }}>
                        No team members assigned
                    </div>
                ) : (
                    members.map((member, index) => (
                        <div 
                            key={index}
                            style={{ 
                                display: "flex", 
                                flexDirection: "row", 
                                alignItems: "center", 
                                justifyContent: "space-between",
                                width: "100%",
                                paddingBottom: index < members.length - 1 ? "16px" : "0",
                                borderBottom: index < members.length - 1 ? "1px solid #F3F4F6" : "none"
                            }}
                        >
                            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: 12 }}>
                                <img 
                                    src={member.image || "/default-avatar.png"} 
                                    alt={member.name} 
                                    style={{ 
                                        width: 48, 
                                        height: 48, 
                                        borderRadius: "50%",
                                        objectFit: "cover",
                                        border: "2px solid #F3F4F6"
                                    }} 
                                />
                                <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                    <span style={{ 
                                        fontSize: 16, 
                                        fontWeight: 600, 
                                        color: "#181D27",
                                        lineHeight: "20px"
                                    }}>
                                        {member.name}
                                        {member.isYou && <span style={{ color: "#9CA3AF", fontWeight: 400 }}> (You)</span>}
                                    </span>
                                    <span style={{ 
                                        fontSize: 14, 
                                        color: "#6B7280",
                                        lineHeight: "18px"
                                    }}>
                                        {member.email}
                                    </span>
                                </div>
                            </div>
                            <span style={{ 
                                fontSize: 16, 
                                color: "#9CA3AF",
                                fontWeight: 500,
                                whiteSpace: "nowrap",
                                marginLeft: "16px"
                            }}>
                                {member.role}
                            </span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
