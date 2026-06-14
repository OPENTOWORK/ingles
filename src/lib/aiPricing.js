/** OpenAI pricing estimates — override via env for production accuracy. */

export const EUR_PER_USD = Number(process.env.USD_EUR_RATE || 0.92);

const envInputPer1M = Number(process.env.OPENAI_INPUT_PRICE_PER_1M);
const envOutputPer1M = Number(process.env.OPENAI_OUTPUT_PRICE_PER_1M);

export const MODEL_PRICING = {
  'gpt-4o': {
    inputPer1M: Number.isFinite(envInputPer1M) && envInputPer1M > 0 ? envInputPer1M : 2.5,
    outputPer1M: Number.isFinite(envOutputPer1M) && envOutputPer1M > 0 ? envOutputPer1M : 10,
  },
  'gpt-4o-mini': {
    inputPer1M: Number.isFinite(envInputPer1M) && envInputPer1M > 0 ? envInputPer1M : 0.15,
    outputPer1M: Number.isFinite(envOutputPer1M) && envOutputPer1M > 0 ? envOutputPer1M : 0.6,
  },
};

function resolveModelPricing(model = '') {
  const key = String(model || '').trim().toLowerCase();
  if (MODEL_PRICING[key]) return MODEL_PRICING[key];
  if (key.includes('mini')) return MODEL_PRICING['gpt-4o-mini'];
  return MODEL_PRICING['gpt-4o'];
}

/**
 * @param {string} model
 * @param {number} inputTokens
 * @param {number} outputTokens
 * @returns {{ costUsd: number, costEur: number }}
 */
export function estimateAiCost(model, inputTokens = 0, outputTokens = 0) {
  const pricing = resolveModelPricing(model);
  const input = Math.max(0, Number(inputTokens) || 0);
  const output = Math.max(0, Number(outputTokens) || 0);
  const costUsd = (input / 1_000_000) * pricing.inputPer1M + (output / 1_000_000) * pricing.outputPer1M;
  const costEur = costUsd * EUR_PER_USD;
  return {
    costUsd: Math.round(costUsd * 1_000_000) / 1_000_000,
    costEur: Math.round(costEur * 1_000_000) / 1_000_000,
  };
}

/** Rough token estimate when API usage is unavailable. */
export function estimateTokensFromText(text = '') {
  return Math.max(1, Math.ceil(String(text || '').length / 4));
}
