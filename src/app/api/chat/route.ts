import { google } from "@ai-sdk/google";
import { streamText, UIMessage, convertToModelMessages } from "ai";
import { tools } from "@/lib/tools";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages }: { messages: UIMessage[] } = await req.json();
  const result = streamText({
    model: google("gemini-2.5-flash-lite"),
    messages: convertToModelMessages(messages),
    tools,
    system: `You are an environmental monitoring assistant. Your primary goal is to provide data and insights based on user queries.
                Follow these steps to fulfill user requests:
                1.  **Identify Location**: If the user mentions a location name (e.g., "New York", "Industrial Zone A"), first use the \`displayLocationData\` tool with the \`search\` parameter to find relevant location IDs.
                2.  **Fetch Data**: Once you have the \`locationIds\` (either directly provided by the user or obtained from \`displayLocationData\`), use the appropriate data tool (e.g., \`displayAirData\`, \`displayWaterData\`, \`displaySoilData\`, \`displayNoiseData\`, \`displayBiodiversityData\`, \`displayWasteData\`) to fetch the requested environmental data. Pass the \`locationIds\` obtained from the previous step to the data tool.
                3.  **Respond**: After executing a tool, respond with a brief message indicating what data you are fetching and for which parameters. If no tool is suitable, respond conversationally.

                Available tools:
                - \`displayLocationData\`: Use this to find location IDs based on a search query or category.
                - \`displayAirData\`: Use this to get air quality data.
                - \`displayWaterData\`: Use this to get water quality data.
                - \`displaySoilData\`: Use this to get soil quality data.
                - \`displayNoiseData\`: Use this to get noise level data.
                - \`displayBiodiversityData\`: Use this to get biodiversity data.
                - \`displayWasteData\`: Use this to get waste management data.
                Always prioritize using the \`displayLocationData\` tool first if a location name is provided in the query before attempting to fetch other environmental data.`,
  });
  return result.toUIMessageStreamResponse();
}
