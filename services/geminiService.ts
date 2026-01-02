
import { GoogleGenAI } from "@google/genai";
import { ActivityData } from '../types';

export const analyzeDashboardData = async (data: ActivityData[], domainFilter: string | null) => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const dataSummary = data.map(d => ({
      domain: d.domainName,
      activity: d.activityName,
      status: d.status,
      budget: d.allocationBudget,
      spent: d.expenditure,
      balance: d.balance
    }));

    const context = domainFilter 
      ? `Focusing on the '${domainFilter}' domain.` 
      : "Analyzing all domains.";

    const prompt = `
      You are a senior project manager and budget analyst.
      ${context}
      Analyze the following project activity and budget data:
      ${JSON.stringify(dataSummary)}

      Please provide a concise executive summary formatted in Markdown including:
      1. **Overall Health**: 1-2 sentences on general status.
      2. **Budget Risks**: Specifically name activities over budget.
      3. **Status Blockers**: Note if certain domains are lagging.
      4. **Strategic Recommendations**: 2 actionable steps for the team.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text;
  } catch (error) {
    console.error("Error generating insights:", error);
    return "Unable to generate AI insights at this time. Please check your API key configuration.";
  }
};
