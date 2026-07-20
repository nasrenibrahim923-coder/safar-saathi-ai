import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { DayPlan, Itinerary, TripInput } from "./trip-types";

const InterestEnum = z.enum(["Nature", "History", "Food", "Adventure", "Religious Sites", "Beaches"]);
const GroupEnum = z.enum(["Solo", "Couple", "Friends group", "Family"]);

const TripInputSchema = z.object({
  startCity: z.string().min(1).max(80),
  destination: z.string().min(1).max(120),
  days: z.number().int().min(1).max(21),
  budgetPKR: z.number().int().min(1000).max(10_000_000),
  interests: z.array(InterestEnum).min(1).max(6),
  groupSize: GroupEnum,
});

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const MODEL = "google/gemini-3.5-flash";

const SYSTEM_PROMPT = `You are Safar Saathi, an experienced, friendly local Pakistani travel guide who deeply understands budget travel for university students. You know local transport (Daewoo, Faisal Movers, Skyways, local buses, wagons, ride-shares), affordable hostels/guesthouses/backpacker spots, cheap authentic food (dhabas, student joints, chai/paratha spots), and safe, practical, authentic experiences. Keep total estimated costs realistic and STRICTLY within the user's stated budget in PKR. Recommend real places when possible. Always respond with valid JSON matching the requested schema — no prose outside JSON.`;

function itineraryUserPrompt(input: TripInput) {
  const dest = input.destination === "Surprise Me"
    ? "Pick the most suitable Pakistani destination for the user (surprise them) that fits their budget, days, group, and interests."
    : `Destination: ${input.destination}`;
  return `Plan a ${input.days}-day budget trip for a Pakistani university student group.

Starting city: ${input.startCity}
${dest}
Total budget: PKR ${input.budgetPKR}
Interests: ${input.interests.join(", ")}
Group: ${input.groupSize}

Return JSON with this exact shape:
{
  "destinationResolved": string,           // actual destination chosen
  "summary": string,                       // 2-3 sentence overview
  "bestTimeToVisit": string,               // best months/season with brief reason
  "totalEstimatedCostPKR": number,         // <= budget
  "budgetTips": string[],                  // 4-6 practical Pakistan-specific tips (name real bus companies, hostels, food spots)
  "packingChecklist": string[],            // 8-14 items relevant to destination + season
  "days": [
    {
      "day": number,
      "title": string,                     // catchy day title
      "places": [{ "name": string, "description": string }],  // 2-4 places with 1-2 sentence descriptions
      "activities": string[],              // 2-4 short activity bullets
      "transport": { "description": string, "costPKR": number },
      "food": { "description": string, "costPKR": number },
      "stay": { "description": string, "costPKR": number },
      "totalCostPKR": number               // sum for the day
    }
  ]
}

Rules:
- Sum of all days.totalCostPKR must be <= ${input.budgetPKR}.
- Use realistic PKR prices for students (hostels PKR 800-2500/night, dhaba meals PKR 200-500, Daewoo/local buses).
- ${input.days} day objects, in order.
- Suggest safe, authentic, practical spots.
- No markdown, no code fences, only JSON.`;
}

function dayUserPrompt(input: TripInput, currentDayNumber: number, existing: Itinerary) {
  return `Regenerate ONLY day ${currentDayNumber} of this trip with a DIFFERENT plan than before. Same destination (${existing.destinationResolved}), same starting city (${input.startCity}), same group (${input.groupSize}), interests (${input.interests.join(", ")}), and keep the day's cost within a similar range (aim for PKR ${Math.round(existing.totalEstimatedCostPKR / input.days)}).

Previous day plan was: ${JSON.stringify(existing.days.find((d) => d.day === currentDayNumber))}

Return JSON matching this shape (single day, no wrapping object):
{
  "day": ${currentDayNumber},
  "title": string,
  "places": [{ "name": string, "description": string }],
  "activities": string[],
  "transport": { "description": string, "costPKR": number },
  "food": { "description": string, "costPKR": number },
  "stay": { "description": string, "costPKR": number },
  "totalCostPKR": number
}
No markdown, only JSON.`;
}

async function callGateway(userPrompt: string): Promise<string> {
  const key = process.env.LOVABLE_API_KEY;
  if (!key) throw new Error("LOVABLE_API_KEY is not configured");
  const res = await fetch(GATEWAY_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "Lovable-API-Key": key,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    if (res.status === 429) throw new Error("Rate limit reached. Please wait a moment and try again.");
    if (res.status === 402) throw new Error("AI credits exhausted. Please add credits to continue.");
    throw new Error(`AI request failed (${res.status}): ${text.slice(0, 200)}`);
  }
  const json = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = json.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty AI response");
  return content;
}

function parseJson<T>(text: string): T {
  const trimmed = text.trim().replace(/^```json\s*/i, "").replace(/^```\s*/, "").replace(/```\s*$/, "");
  return JSON.parse(trimmed) as T;
}

export const generateItinerary = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => TripInputSchema.parse(input))
  .handler(async ({ data }) => {
    const content = await callGateway(itineraryUserPrompt(data));
    const itinerary = parseJson<Itinerary>(content);
    return itinerary;
  });

const RegenDaySchema = z.object({
  input: TripInputSchema,
  currentItinerary: z.custom<Itinerary>(),
  dayNumber: z.number().int().min(1).max(21),
});

export const regenerateDay = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => RegenDaySchema.parse(input))
  .handler(async ({ data }) => {
    const content = await callGateway(dayUserPrompt(data.input, data.dayNumber, data.currentItinerary));
    const day = parseJson<DayPlan>(content);
    return day;
  });