import { analyzeIdea, AnalysisResult } from "../services/analysisEngine";

describe("Analysis Engine", () => {
  const strongIdea = {
    title: "CloudHR Pro",
    description:
      "A comprehensive SaaS platform for SMB enterprises to manage HR, payroll, and recruitment. " +
      "Uses machine learning for candidate matching. Targets a global market of 50 million SMBs. " +
      "Unique AI-powered approach with proprietary matching algorithm. Organic growth via content and SEO.",
    marketSizeEstimate: "Global SMB HR market worth $15 billion annually, growing 12% YoY",
    teamSummary: "CEO (ex-Google), CTO with 15 years backend experience, senior marketing lead, 2 engineers",
    techStack: "React, Node.js, TypeScript, PostgreSQL, Docker, AWS, Redis, microservices",
    revenueModel: "SaaS subscription model — monthly and annual plans, B2B enterprise tier",
    stage: "mvp",
  };

  const weakIdea = {
    title: "X",
    description: "An app that does something cool with blockchain and AR/VR for a niche local audience",
    marketSizeEstimate: "Small niche local market",
    teamSummary: "Just me",
    techStack: "blockchain web3",
    revenueModel: "Maybe ads",
    stage: "idea",
  };

  const averageIdea = {
    title: "Vintage Camera Market",
    description:
      "A marketplace enabling verified sellers of vintage cameras to reach collectors worldwide. " +
      "Features include seller verification, escrow payments, and community forums for enthusiasts.",
    marketSizeEstimate: "Niche market — estimated 50k active buyers per year",
    teamSummary: "2 co-founders: backend developer and business development lead, 1 contractor",
    techStack: "Node, React, MongoDB",
    revenueModel: "Commission per sale + optional seller subscription for premium features",
    stage: "prototype",
  };

  describe("Strong idea evaluation", () => {
    let result: AnalysisResult;

    beforeAll(() => {
      result = analyzeIdea(strongIdea);
    });

    it("should return overall score >= 65", () => {
      expect(result.overallScore).toBeGreaterThanOrEqual(65);
    });

    it("should return a 'strong' or 'promising' verdict", () => {
      expect(["strong", "promising"]).toContain(result.verdict);
    });

    it("should have all five score categories", () => {
      expect(result.scores).toHaveProperty("tech");
      expect(result.scores).toHaveProperty("market");
      expect(result.scores).toHaveProperty("goToMarket");
      expect(result.scores).toHaveProperty("scalability");
      expect(result.scores).toHaveProperty("financial");
    });

    it("should have 4 panelist feedbacks", () => {
      expect(result.panelistFeedbacks).toHaveLength(4);
    });

    it("should include MVP steps", () => {
      expect(result.mvpSteps.length).toBeGreaterThanOrEqual(1);
      expect(result.mvpSteps.length).toBeLessThanOrEqual(5);
    });

    it("should produce a short pitch", () => {
      expect(result.shortPitch.length).toBeGreaterThan(20);
    });

    it("should have tech score > 60 (solid stack)", () => {
      expect(result.scores.tech).toBeGreaterThanOrEqual(60);
    });
  });

  describe("Weak idea evaluation", () => {
    let result: AnalysisResult;

    beforeAll(() => {
      result = analyzeIdea(weakIdea);
    });

    it("should return overall score < 50", () => {
      expect(result.overallScore).toBeLessThan(50);
    });

    it("should return a 'weak' or 'needs-work' verdict", () => {
      expect(["weak", "needs-work"]).toContain(result.verdict);
    });

    it("should identify multiple risks", () => {
      expect(result.risks.length).toBeGreaterThanOrEqual(2);
    });

    it("should have at least one high/critical severity risk", () => {
      const severe = result.risks.filter((r) => r.severity === "high" || r.severity === "critical");
      expect(severe.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Average idea evaluation", () => {
    let result: AnalysisResult;

    beforeAll(() => {
      result = analyzeIdea(averageIdea);
    });

    it("should return a score between 35 and 75", () => {
      expect(result.overallScore).toBeGreaterThanOrEqual(35);
      expect(result.overallScore).toBeLessThanOrEqual(75);
    });

    it("should have recommendations", () => {
      expect(result.recommendations.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Output shape validation", () => {
    it("should always return scores clamped 0-100", () => {
      const result = analyzeIdea(strongIdea);
      const allScores = [
        result.overallScore,
        result.scores.tech,
        result.scores.market,
        result.scores.goToMarket,
        result.scores.scalability,
        result.scores.financial,
      ];
      for (const s of allScores) {
        expect(s).toBeGreaterThanOrEqual(0);
        expect(s).toBeLessThanOrEqual(100);
      }
    });

    it("should include role in every risk", () => {
      const result = analyzeIdea(averageIdea);
      for (const risk of result.risks) {
        expect(risk.role).toBeTruthy();
      }
    });
  });
});

describe("rule-based pitch and recommendations", () => {
  const idea = {
    title: "EcoTrack — Carbon Footprint Tracker for SMBs",
    description:
      "A SaaS platform that helps small and medium businesses track, report, and reduce their carbon footprint. " +
      "Integrates with accounting software to calculate emissions automatically.",
    marketSizeEstimate: "Global carbon management market worth $12 billion by 2027",
    teamSummary: "CEO with sustainability background, CTO ex-Stripe",
    techStack: "React, Node.js, PostgreSQL",
    revenueModel: "SaaS subscription: $49/mo starter, $199/mo pro, $499/mo enterprise with a very long tail of add-ons",
    stage: "prototype",
  };

  it("reads a French description as a clause after the name", () => {
    const { shortPitch } = analyzeIdea({
      ...idea,
      description: "Une plateforme qui aide les artisans à trouver des chantiers près de chez eux. Paiement sécurisé intégré.",
    } as never);
    expect(shortPitch).toContain("qui aide les artisans à trouver des chantiers");
  });

  it("scores French keywords like English ones", () => {
    const fr = analyzeIdea({
      ...idea,
      teamSummary: "Cofondateur CEO avec 10 ans d'expérience, CTO ingénieur senior",
      revenueModel: "Abonnement mensuel récurrent pour les PME",
    } as never);
    const investor = fr.panelistFeedbacks.find((f) => f.role === "Venture Capital Investor")!;
    expect(investor.strengths).toContain("Équipe expérimentée");
    expect(investor.strengths).toContain("Modèle économique clair et scalable");
  });

  it("writes a grammatical pitch that never cuts a word in half", () => {
    const { shortPitch } = analyzeIdea(idea as never);
    expect(shortPitch).toMatch(/^EcoTrack est un projet \S+/);
    expect(shortPitch).toContain("— helps small and medium businesses");
    expect(shortPitch).not.toMatch(/\.\.\./);
    expect(shortPitch).not.toMatch(/\w…\./);
  });

  it("turns weaknesses into concrete, de-duplicated actions", () => {
    const { recommendations } = analyzeIdea(idea as never);
    const texts = recommendations.map((r) => r.text);
    expect(new Set(texts).size).toBe(texts.length);
    expect(texts.length).toBeLessThanOrEqual(6);
    texts.forEach((t) => expect(t).not.toMatch(/^(Leverage|Address):/));
  });
});
