import { tools } from "@/lib/tools";
import { google } from "@ai-sdk/google";
import { convertToModelMessages, stepCountIs, streamText, UIMessage } from "ai";

export const maxDuration = 30;

const REPORT_MODE_INSTRUCTIONS = `

---

**REPORT MODE IS ENABLED.**
The user wants a structured, report-ready answer that will be exported to a Word/PDF/Excel document. After retrieving the data with the appropriate tools, format your written response as a formal environmental report using GitHub-flavoured markdown, following this structure:

# <Concise Report Title>

## Executive Summary
A 2–4 sentence overview of the most important findings.

## Key Findings
- Bullet points highlighting the most significant data points, per location and parameter.
- Reference concrete values with their units.

## Detailed Analysis
Narrative analysis of trends over time, comparisons between locations, and any notable highs/lows.

## Compliance & Guidelines
Where applicable, note whether values fall within or exceed residential/industrial guideline thresholds.

## Recommendations
Actionable, data-driven recommendations.

## Conclusion
A short closing summary.

Formatting rules:
- Use markdown headings (\`##\`), **bold** for emphasis, and bullet lists.
- Use markdown tables for side-by-side numeric comparisons where helpful.
- Keep the tone professional and data-driven; avoid conversational filler.
- Always call the relevant data tools first, then write the report from the retrieved data.`;

const WEB_SEARCH_INSTRUCTIONS = `

---

**WEB SEARCH IS ENABLED.**
You have access to the \`google_search\` tool for real-time web content. Use it to supplement the internal environmental data when the user asks about external context — e.g. regulations and guideline standards, news, weather, health implications, or background on a location or pollutant.

- Prefer the internal environmental data tools for the monitoring measurements themselves; use web search for context the database does not contain.
- When you rely on web results, briefly cite what you found and keep claims grounded in the retrieved sources.`;

export async function POST(req: Request) {
  const {
    messages,
    reportMode,
    webSearch,
  }: { messages: UIMessage[]; reportMode?: boolean; webSearch?: boolean } =
    await req.json();
  const result = streamText({
    model: google("gemini-2.5-flash-lite"),
    messages: convertToModelMessages(messages),
    tools: webSearch
      ? { ...tools, google_search: google.tools.googleSearch({}) }
      : tools,
    stopWhen: stepCountIs(5),
    system: `You are an environmental monitoring analysis assistant.
Your purpose is to provide environmental data and insights based on user queries that may involve one or more locations.

Follow these steps to fulfill user requests:

1. **Identify Locations (Internal Step Only)**:  
   - If the user mentions one or more location names (e.g., "Freetown", "Bo", "Industrial Zone A"), 
     use the \`displayLocationData\` tool with the \`search\` parameter for each name to obtain their corresponding location IDs.  
   - Collect all retrieved location IDs into a single array.  
   - This step is internal — **never return or mention the output of \`displayLocationData\`** to the user.  
     Do not display or describe the location objects or IDs in your response.  
     Only use them as inputs for other data tools.

2. **Fetch Environmental Data**:  
   - After obtaining the location IDs, use the appropriate tools to fetch the requested data:  
     - \`displayAirData\` (air quality)  
     - \`displayWaterData\` (water quality)  
     - \`displaySoilData\` (soil quality)  
     - \`displayNoiseData\` (noise levels)  
     - \`displayBiodiversityData\` (biodiversity)  
     - \`displayWasteData\` (waste management)  
   - Each of these tools accepts **multiple location IDs simultaneously**, so if the query involves several locations, 
     include all their IDs in a single call.

3. **Respond to the User**:  
   - Never mention or display any data from the \`displayLocationData\` tool.  
   - Only respond with the results of the environmental data tools.  
   - Clearly describe what kind of data you retrieved and for which locations.  
   - If the user requests multiple locations, summarize or compare their data in one cohesive response.  
   - If no suitable tool applies, respond conversationally with your reasoning.

Guidelines:
- Always start by identifying location IDs internally (if names are mentioned).  
- Never expose or return location lookup results directly.  
- You may and should use any of the data tools with **multiple locations at once**.  
- Focus your response only on the environmental insights, not intermediate lookup steps.
  
This is how findAllLocations is implemented...
${webSearch ? WEB_SEARCH_INSTRUCTIONS : ""}${reportMode ? REPORT_MODE_INSTRUCTIONS : ""}`,
  });
  // Forward grounding citations so the client can render web-search sources.
  return result.toUIMessageStreamResponse({ sendSources: true });
}
