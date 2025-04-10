import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: "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"
});

export const getInsights = async (req, res) => {
  try {
    const { data } = req.body;

    if (!data || !Array.isArray(data) || data.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid or empty data provided" });
    }

    const batchSize = 40;
    const allInsights = [];

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);

      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are a professional B2B sales data analyst.`,
          },
          {
            role: "user",
            content: `Analyze the following lead data:\n${JSON.stringify(
              batch,
              null,
              2
            )}\n
Return a detailed business intelligence report in clean HTML format. Make it structured and easy to visualize, as if it were a dashboard.

Strict formatting rules:
- Use <h3> for section titles (e.g., "Lead Quality Summary", "Segment Analysis", "Conversion Funnel", "Industry Insights").
- Use <table> with <thead> and <tbody> for numeric summaries (like leads by status, industry, or source).
- Use <ul><li> for insight points and observations under each section.
- Always include high-level metrics like:
  - Total Leads
  - Qualified vs Unqualified Leads
  - Leads by Status / Industry / Source (use tables)
  - Conversion trends or notable drops
- Highlight any patterns, clusters, or anomalies (e.g., most leads from one source performing poorly).
- If 'score' column is available, provide average score and outlier insights.
- Do NOT use bullet characters like •, -, or <br>.
- Return only clean HTML without any external CSS, styles, scripts, or comments. It should render properly in a browser.`,
          },
        ],
      });

      allInsights.push(completion.choices[0].message.content);
    }

    const finalSummary = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are a senior sales strategist.`,
        },
        {
          role: "user",
          content: `Merge the following multiple insight segments into one single, clean HTML summary:
${allInsights.join("\n\n")}

Strict formatting rules:
- Use <h3> for section headings.
- Use <table> with <thead> and <tbody> to merge numeric summaries across batches.
- Use <ul><li> for listing insights under each section.
- Do NOT use •, -, or <br> for bullet formatting.
- Include totals and aggregated metrics where possible from the entire dataset.
- Return only a valid, browser-renderable HTML snippet without comments or styles.`,
        },
      ],
    });

    const insights = finalSummary.choices[0].message.content;

    res.json({ success: true, insights });
  } catch (error) {
    console.error("OpenAI Error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to get insights", error });
  }
};
