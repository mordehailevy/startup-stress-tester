import { analyzeIdea } from "../services/analysisEngine";
import { enrichWithLlm, resetDailyQuotaForTests } from "../services/llmAnalysis";

describe("Gemini enrichment", () => {
  const idea = {
    title: "Quote automation for SMB sales teams",
    description: "Generates sales quotes from a form, validates them and pushes leads to the CRM through its API.",
    marketSizeEstimate: "Small and mid-size companies in Europe",
    teamSummary: "One full-stack developer with sales experience",
    techStack: "Node.js, React, TypeScript, n8n, Docker",
    revenueModel: "Monthly SaaS subscription per seat",
    stage: "mvp",
  };
  const base = analyzeIdea(idea);

  const validOutput = {
    panelists: base.panelistFeedbacks.map((p) => ({
      role: p.role,
      summary: `${p.role} summary`,
      strengths: ["Clear pain point", "Working MVP"],
      weaknesses: ["Single founder", "Unproven pricing"],
    })),
    risks: [{ title: "Key-person risk", reason: "One developer", severity: "high", role: "Venture Capital Investor" }],
    recommendations: [{ text: "Interview 20 sales managers", priority: "high", role: "Marketing Strategist" }],
    mvpSteps: ["Interview users", "Ship to 5 teams", "Measure time saved"],
    shortPitch: "Quotes in seconds instead of minutes for small sales teams.",
  };

  function geminiResponse(payload: unknown, status = 200): typeof fetch {
    return jest.fn().mockResolvedValue({
      ok: status >= 200 && status < 300,
      status,
      json: async () => ({ steps: [{ type: "model_output", content: [{ type: "text", text: JSON.stringify(payload) }] }] }),
    }) as unknown as typeof fetch;
  }

  beforeEach(() => resetDailyQuotaForTests());

  it("falls back to the rule engine when no API key is set", async () => {
    const fetchImpl = jest.fn() as unknown as typeof fetch;
    const out = await enrichWithLlm(idea, base, { apiKey: "", fetchImpl });
    expect(out.engine).toBe("rules");
    expect(out.fallbackReason).toBe("no_api_key");
    expect(out.result).toEqual(base);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("uses Gemini text but keeps the rule-based scores", async () => {
    const out = await enrichWithLlm(idea, base, { apiKey: "test-key", fetchImpl: geminiResponse(validOutput) });
    expect(out.engine).toBe("gemini");
    expect(out.result.scores).toEqual(base.scores);
    expect(out.result.overallScore).toBe(base.overallScore);
    expect(out.result.panelistFeedbacks.map((p) => p.score)).toEqual(base.panelistFeedbacks.map((p) => p.score));
    expect(out.result.panelistFeedbacks[0].summary).toBe("Venture Capital Investor summary");
    expect(out.result.shortPitch).toBe(validOutput.shortPitch);
  });

  it("sends the key in a header, never in the URL", async () => {
    const fetchImpl = geminiResponse(validOutput);
    await enrichWithLlm(idea, base, { apiKey: "secret-key", fetchImpl });
    const [url, init] = (fetchImpl as jest.Mock).mock.calls[0];
    expect(String(url)).not.toContain("secret-key");
    expect(init.headers["x-goog-api-key"]).toBe("secret-key");
  });

  it("falls back when Gemini returns an HTTP error", async () => {
    const out = await enrichWithLlm(idea, base, { apiKey: "k", fetchImpl: geminiResponse({}, 400) });
    expect(out.engine).toBe("rules");
    expect(out.fallbackReason).toBe("gemini_http_400");
  });

  it("retries once on the lighter model when the main one is overloaded", async () => {
    const fetchImpl = jest
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503, json: async () => ({}) })
      .mockImplementationOnce(geminiResponse(validOutput) as unknown as jest.Mock) as unknown as typeof fetch;
    const out = await enrichWithLlm(idea, base, { apiKey: "k", model: "main", fallbackModel: "lite", fetchImpl });
    expect(out.engine).toBe("gemini");
    const models = (fetchImpl as unknown as jest.Mock).mock.calls.map((c) => JSON.parse(c[1].body).model);
    expect(models).toEqual(["main", "lite"]);
  });

  it("falls back when the output does not match the expected shape", async () => {
    const out = await enrichWithLlm(idea, base, { apiKey: "k", fetchImpl: geminiResponse({ panelists: [] }) });
    expect(out.engine).toBe("rules");
    expect(out.fallbackReason).toBe("gemini_schema_mismatch");
  });

  it("falls back when Gemini is too slow", async () => {
    const slowFetch = jest.fn(
      (_url: string, init: RequestInit) =>
        new Promise((_resolve, reject) => {
          init.signal?.addEventListener("abort", () => {
            const err = new Error("aborted");
            err.name = "AbortError";
            reject(err);
          });
        })
    ) as unknown as typeof fetch;
    const out = await enrichWithLlm(idea, base, { apiKey: "k", fetchImpl: slowFetch, timeoutMs: 50 });
    expect(out.engine).toBe("rules");
    expect(out.fallbackReason).toBe("gemini_timeout");
  });
});
