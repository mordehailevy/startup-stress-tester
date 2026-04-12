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
