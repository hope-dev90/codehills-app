/**
 * Gemini AI service — generates a business plan description from the user's
 * selected raw materials and business category.
 *
 * Uses the Gemini 1.5 Flash model via the REST API (no SDK dependency needed).
 * API key is read from EXPO_PUBLIC_GEMINI_API_KEY in .env
 * Get a key at: https://aistudio.google.com/app/apikey
 */

const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
const API_URL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

interface GeminiResponse {
  candidates?: {
    content?: {
      parts?: { text?: string }[];
    };
  }[];
  error?: { message: string };
}

/**
 * Generates a short business description (2–3 sentences) based on the
 * selected Rwandan raw materials and the chosen category.
 *
 * @param materials  - Names of the raw materials the user selected
 * @param category   - Business category chosen (e.g. "Food & Drinks")
 * @param businessName - Optional business name for more personalised output
 */
/**
 * Returns a hardcoded demo description when no API key is configured.
 * The text is personalised with the actual materials, category and name
 * so the UI feels real during development.
 */
function demoBusinessPlan(
  materials: string[],
  category: string,
  businessName?: string,
): string {
  const name = businessName?.trim() || 'this business';
  const mats = materials.length > 0 ? materials.join(', ') : 'local Rwandan materials';
  return (
    `${name} is a ${category} venture rooted in Rwanda's rich natural heritage, ` +
    `crafting premium products from locally sourced ${mats}. ` +
    `By working directly with Rwandan farmers and cooperatives, the business ensures fair trade practices ` +
    `while delivering authentic, high-quality goods that celebrate the flavours and traditions of Rwanda. ` +
    `With a focus on sustainable production and community impact, ${name} connects local artisans ` +
    `with customers who value culture, quality, and purpose.`
  );
}

export async function generateBusinessPlan(
  materials: string[],
  category: string,
  businessName?: string,
): Promise<string> {
  if (!API_KEY) {
    // No API key yet — return a realistic demo response so the UI works end-to-end.
    return demoBusinessPlan(materials, category, businessName);
  }

  const materialsText = materials.join(', ');
  const nameHint = businessName?.trim() ? ` called "${businessName.trim()}"` : '';

  const prompt = `You are a helpful business advisor specialising in Rwandan small businesses.

Write a short, compelling business description (2 to 3 sentences) for a ${category} business${nameHint} in Rwanda that uses the following raw materials: ${materialsText}.

The description should:
- Explain what the business does and what it produces or offers
- Mention the specific raw materials it uses
- Highlight its connection to Rwandan culture or heritage
- Be written in a warm, professional tone suitable for a business profile

Return only the description text, with no headings, bullet points or extra formatting.`;

  const res = await fetch(`${API_URL}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 200,
      },
    }),
  });

  const json = (await res.json()) as GeminiResponse;

  if (!res.ok || json.error) {
    throw new Error(json.error?.message ?? `Gemini API error ${res.status}`);
  }

  const text = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  if (!text) throw new Error('Gemini returned an empty response. Please try again.');

  return text;
}
