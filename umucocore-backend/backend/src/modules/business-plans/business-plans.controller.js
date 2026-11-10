import { prisma } from '../../config/database.js';
import { asyncHandler, ok, created } from '../../utils/http.js';
import { notFound } from '../../utils/errors.js';
import { env } from '../../config/env.js';

// ─── Gemini helper ────────────────────────────────────────────
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/${env.GEMINI_MODEL}:generateContent`;

async function callGemini(prompt) {
  if (!env.GEMINI_API_KEY) return null;
  const res = await fetch(`${GEMINI_URL}?key=${env.GEMINI_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.7, maxOutputTokens: 250 },
    }),
  });
  if (!res.ok) return null;
  const json = await res.json();
  return json.candidates?.[0]?.content?.parts?.[0]?.text?.trim() ?? null;
}

function demoDescription(name, category) {
  return `${name} is a ${category} venture rooted in Rwanda's rich natural heritage, crafting premium products from locally sourced materials. By working directly with Rwandan farmers and cooperatives, the business ensures fair trade practices while delivering authentic, high-quality goods that celebrate the flavours and traditions of Rwanda.`;
}

export const getPlan = asyncHandler(async (req, res) => {
  const biz = await prisma.business.findUnique({ where: { userId: req.user.id } });
  if (!biz) throw notFound('You must create a business first');

  // Return the most recent cached plan if it's less than 24 h old
  const recent = await prisma.businessPlan.findFirst({
    where: {
      businessId: biz.id,
      generatedAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    },
    orderBy: { generatedAt: 'desc' },
  });
  if (recent) return ok(res, { plan: recent.content, cached: true });

  // Generate via Gemini or use demo fallback
  const prompt = `You are a Rwandan small-business advisor. Write 2–3 sentences describing the mission and value of a ${biz.category} business called "${biz.name}": ${biz.description}. Be warm and professional.`;
  const text = (await callGemini(prompt)) ?? demoDescription(biz.name, biz.category);

  const plan = { summary: text };

  const saved = await prisma.businessPlan.create({
    data: { businessId: biz.id, content: plan },
  });

  ok(res, { plan: saved.content, cached: false });
});

export const regeneratePlan = asyncHandler(async (req, res) => {
  const biz = await prisma.business.findUnique({ where: { userId: req.user.id } });
  if (!biz) throw notFound('You must create a business first');

  const prompt = `You are a Rwandan small-business advisor. Write 2–3 sentences describing the mission and value of a ${biz.category} business called "${biz.name}": ${biz.description}. Be warm and professional.`;
  const text = (await callGemini(prompt)) ?? demoDescription(biz.name, biz.category);
  const plan = { summary: text };

  const saved = await prisma.businessPlan.create({
    data: { businessId: biz.id, content: plan },
  });
  ok(res, { plan: saved.content, cached: false }, 'Business plan regenerated');
});
