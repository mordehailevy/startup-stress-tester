import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "Startup Stress Tester API",
      version: "1.0.0",
      description:
        "REST API for the Startup Stress Tester — an AI-powered investor panel that evaluates startup ideas across 5 dimensions (Tech, Market, Go-to-Market, Scalability, Financial).",
      contact: { name: "Mordehay Levy" },
      license: { name: "MIT" },
    },
    servers: [{ url: "/api", description: "API base path" }],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            _id: { type: "string" },
            email: { type: "string", format: "email" },
            fullName: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Idea: {
          type: "object",
          properties: {
            _id: { type: "string" },
            userId: { type: "string" },
            title: { type: "string" },
            description: { type: "string" },
            marketSizeEstimate: { type: "string" },
            teamSummary: { type: "string" },
            techStack: { type: "string" },
            revenueModel: { type: "string" },
            stage: { type: "string", enum: ["idea", "prototype", "mvp", "growth", "scale"] },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Analysis: {
          type: "object",
          properties: {
            _id: { type: "string" },
            ideaId: { type: "string" },
            overallScore: { type: "number", minimum: 0, maximum: 100 },
            verdict: { type: "string", enum: ["strong", "promising", "needs-work", "weak"] },
            scores: {
              type: "object",
              properties: {
                tech: { type: "number" },
                market: { type: "number" },
                goToMarket: { type: "number" },
                scalability: { type: "number" },
                financial: { type: "number" },
              },
            },
            risks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  reason: { type: "string" },
                  severity: { type: "string" },
                  role: { type: "string" },
                },
              },
            },
            recommendations: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  text: { type: "string" },
                  priority: { type: "string" },
                  role: { type: "string" },
                },
              },
            },
            panelistFeedbacks: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  role: { type: "string" },
                  summary: { type: "string" },
                  score: { type: "number" },
                  strengths: { type: "array", items: { type: "string" } },
                  weaknesses: { type: "array", items: { type: "string" } },
                },
              },
            },
            mvpSteps: { type: "array", items: { type: "string" } },
            shortPitch: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
          },
        },
        Pagination: {
          type: "object",
          properties: {
            page: { type: "integer" },
            limit: { type: "integer" },
            total: { type: "integer" },
            totalPages: { type: "integer" },
            hasNextPage: { type: "boolean" },
            hasPrevPage: { type: "boolean" },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            error: {
              type: "object",
              properties: { message: { type: "string" } },
            },
          },
        },
      },
    },
    tags: [
      { name: "Auth", description: "Authentication endpoints" },
      { name: "Ideas", description: "Startup ideas CRUD" },
      { name: "Analyses", description: "AI stress test analysis" },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

export const swaggerSpec = swaggerJsdoc(options);
