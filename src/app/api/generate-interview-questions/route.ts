import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { jobTitle, description, category, existingQuestions } = await request.json();

    if (!jobTitle || !description || !category) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const OPENROUTER_API_KEY = process.env.OPENAI_API_KEY;

    if (!OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "OpenRouter API key not configured" },
        { status: 500 }
      );
    }

    // Build the prompt based on category
    const categoryPrompts = {
      "CV Validation / Experience": `Generate 2 interview questions that validate the candidate's CV and work experience for the ${jobTitle} position. Focus on verifying their past roles, responsibilities, achievements, and relevant experience mentioned in their resume.`,
      "Technical": `Generate 2 technical interview questions for a ${jobTitle} position. Focus on technical skills, tools, technologies, and problem-solving abilities relevant to this role.`,
      "Behavioral": `Generate 2 behavioral interview questions for a ${jobTitle} position. Focus on soft skills, teamwork, conflict resolution, leadership, and how they handle workplace situations.`,
      "Analytical": `Generate 2 analytical interview questions for a ${jobTitle} position. Focus on critical thinking, problem-solving approach, data analysis, and decision-making abilities.`,
      "Others": `Generate 2 general interview questions for a ${jobTitle} position that don't fit into technical, behavioral, or analytical categories. Focus on motivation, culture fit, career goals, and other relevant aspects.`
    };

    const prompt = `${categoryPrompts[category as keyof typeof categoryPrompts]}

Job Description:
${description}

${existingQuestions && existingQuestions.length > 0 ? `Existing questions (avoid duplicates):
${existingQuestions.join('\n')}` : ''}

Requirements:
- Generate exactly 2 questions
- Make questions specific to the role and job description
- Ensure questions are clear, professional, and relevant
- Avoid duplicating existing questions
- Return ONLY a JSON array of question strings, no additional text

Format: ["Question 1?", "Question 2?"]`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
        "X-Title": "LaunchpadJia Interview Questions Generator",
      },
      body: JSON.stringify({
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "You are an expert HR interviewer and recruitment specialist. Generate relevant, insightful interview questions based on job descriptions and categories. Always return valid JSON arrays only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("OpenRouter API error:", errorData);
      return NextResponse.json(
        { error: "Failed to generate questions" },
        { status: 500 }
      );
    }

    const data = await response.json();
    const generatedText = data.choices[0]?.message?.content?.trim();

    if (!generatedText) {
      return NextResponse.json(
        { error: "No questions generated" },
        { status: 500 }
      );
    }

    // Parse the JSON response
    try {
      // Remove markdown code blocks if present
      const cleanedText = generatedText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      const questions = JSON.parse(cleanedText);

      if (!Array.isArray(questions) || questions.length === 0) {
        throw new Error("Invalid questions format");
      }

      return NextResponse.json({ questions });
    } catch (parseError) {
      console.error("Failed to parse generated questions:", parseError);
      console.error("Generated text:", generatedText);
      return NextResponse.json(
        { error: "Failed to parse generated questions" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error generating interview questions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
