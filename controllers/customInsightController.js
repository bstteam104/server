import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPEN_AI_KEY, // Add your API key in .env
});

export const getCustomInsight = async (req, res) => {
  try {
    const { data, question } = req.body;

    // Basic validations
    if (!data || !Array.isArray(data) || data.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or empty data provided" });
    }

    if (!question || question.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Custom question is required" });
    }

    const lowerQuestion = question.toLowerCase();

    // Determine output type from user prompt
    const wantsTable = /list all|show all|give me all|display all|table of|every|all .* in/i.test(lowerQuestion);
    const wantsChart = /(chart|graph|visualize|bar chart|pie chart|line chart)/i.test(lowerQuestion);

    const batchSize = 20;
    const responses = [];

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: wantsChart
              ? `You're a JSON chart generator. Based on the user's dataset and question, return only JSON like:
{
  "type": "bar" | "pie" | "line",
  "x": ["label1", "label2", ...],
  "y": [value1, value2, ...],
  "labels": ["optional1", "optional2"] // optional
}
Do not explain anything. Only return JSON.`
              : wantsTable
              ? `You're a professional HTML table formatter. Convert the dataset and question into a valid <table>. No summaries or commentary. Return only HTML with no styles, no markdown, no extra text.`
              : `You are a senior business analyst. Based on the dataset and question, generate insightful HTML using:
- <h3> for section headings (e.g., "Summary", "Trends", "Suggestions")
- <ul><li> for bullet points
- <p> for descriptions

Strict rules:
- Do NOT use markdown or bullet characters (•, -, etc.)
- Return only clean HTML. No commentary or wrappers.`,
          },
          {
            role: "user",
            content: `Analyze this part of the dataset:\n${JSON.stringify(batch, null, 2)}\n\nQuestion:\n"${question}"\n\nReturn only ${wantsChart ? "JSON for chart rendering" : "HTML"}.`,
          },
        ],
      });

      responses.push(completion.choices[0].message.content);
    }

    // === Chart Response ===
    if (wantsChart) {
      const parsedCharts = responses
        .map((res) => {
          try {
            return JSON.parse(res);
          } catch {
            return null;
          }
        })
        .filter(Boolean);

      const combinedChart = parsedCharts.reduce(
        (acc, cur) => {
          acc.type = cur.type || acc.type;
          acc.x.push(...cur.x);
          acc.y.push(...cur.y);
          if (cur.labels) acc.labels.push(...cur.labels);
          return acc;
        },
        { type: "bar", x: [], y: [], labels: [] }
      );

      return res.json({ success: true, chart: combinedChart });
    }

    // === HTML Response ===
    const finalSummary = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expert HTML aggregator.

You will receive multiple HTML fragments from previous answers. Your job is to merge them into a single clean and valid HTML block using:
- <h3> for section titles
- <ul><li> for listing points
- <p> for additional notes or descriptions

Strictly follow:
- Do NOT include markdown, bullet characters (•, -), or <br>
- Do NOT wrap inside <html> or <body> tags
- Output only pure, browser-renderable HTML`,
        },
        {
          role: "user",
          content: `HTML Fragments:\n${responses.join("\n\n")}`,
        },
      ],
    });

    const finalHTML = finalSummary.choices[0].message.content.trim();

    return res.json({ success: true, response: finalHTML });
  } catch (error) {
    console.error("Custom Insight Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to get custom insight",
      error: error?.message || error,
    });
  }
};
