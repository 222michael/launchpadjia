"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import HeaderBar from "@/lib/PageComponent/HeaderBar";
import CareerForm from "@/lib/components/CareerComponents/CareerForm";
import axios from "axios";
import FullScreenLoadingAnimation from "@/lib/components/CareerComponents/FullScreenLoadingAnimation";

export default function EditCareerPage() {
    const { slug } = useParams();
    const [career, setCareer] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCareer = async () => {
            try {
                const response = await axios.post("/api/career-data", {
                    id: slug,
                });
                setCareer(response.data);
            } catch (error) {
                console.error("Error fetching career:", error);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchCareer();
        }
    }, [slug]);

    if (loading) {
        return <FullScreenLoadingAnimation title="Loading career..." subtext="Please wait while we load the career details" />;
    }

    return (
        <>
            <HeaderBar activeLink="Careers" currentPage="Edit career" icon="la la-suitcase" />
            <div className="container-fluid mt--7" style={{ paddingTop: "6rem" }}>
                <div className="row">
                    <CareerForm career={career} formType="edit" />
                </div>
            </div>
        </>
    );
}
