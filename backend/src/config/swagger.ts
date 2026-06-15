import swaggerJsdoc from "swagger-jsdoc";
import dotenv from "dotenv";

dotenv.config();

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Job Tracker API",
      version: "1.0.0",
      description: "API documentation for the Job Tracker application",
    },
    servers: [
      {
        url: process.env.API_URL || "http://localhost:3000",
        description: "Development server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Job: {
          type: "object",
          properties: {
            _id: { type: "string" },
            company: { type: "string" },
            role: { type: "string" },
            status: {
              type: "string",
              enum: ["applied", "interviewing", "offered", "rejected"],
            },
            appliedDate: { type: "string", format: "date-time" },
            jobUrl: { type: "string" },
            salary: { type: "number" },
            notes: { type: "string" },
            cv: { type: "string" },
            user: { type: "string" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        AuthResponse: {
          type: "object",
          properties: {
            message: { type: "string" },
            token: { type: "string" },
          },
        },
        ErrorResponse: {
          type: "object",
          properties: {
            error: { type: "string" },
          },
        },
      },
    },
    paths: {
      "/api/auth/register": {
        post: {
          tags: ["Auth"],
          summary: "Register a new user",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["username", "email", "password"],
                  properties: {
                    username: { type: "string", example: "john_doe" },
                    email: { type: "string", example: "john@example.com" },
                    password: { type: "string", example: "password123" },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "User registered successfully",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthResponse" },
                },
              },
            },
            400: {
              description: "User already exists or missing fields",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/auth/login": {
        post: {
          tags: ["Auth"],
          summary: "Login with email and password",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["email", "password"],
                  properties: {
                    email: { type: "string", example: "john@example.com" },
                    password: { type: "string", example: "password123" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Login successful",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/AuthResponse" },
                },
              },
            },
            400: {
              description: "Invalid credentials",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/ErrorResponse" },
                },
              },
            },
          },
        },
      },
      "/api/auth/profile": {
        get: {
          tags: ["Auth"],
          summary: "Get current user profile",
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: "User profile returned" },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/api/jobs": {
        get: {
          tags: ["Jobs"],
          summary: "Get all jobs",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "status",
              in: "query",
              schema: {
                type: "string",
                enum: ["applied", "interviewing", "offered", "rejected"],
              },
              description: "Filter by status",
            },
            {
              name: "sort",
              in: "query",
              schema: { type: "string", enum: ["newest", "oldest"] },
              description: "Sort by applied date",
            },
            {
              name: "search",
              in: "query",
              schema: { type: "string" },
              description: "Search by company or role",
            },
          ],
          responses: {
            200: {
              description: "List of jobs",
              content: {
                "application/json": {
                  schema: {
                    type: "array",
                    items: { $ref: "#/components/schemas/Job" },
                  },
                },
              },
            },
            401: { description: "Unauthorized" },
          },
        },
        post: {
          tags: ["Jobs"],
          summary: "Create a new job",
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  required: ["company", "role"],
                  properties: {
                    company: { type: "string", example: "Google" },
                    role: { type: "string", example: "Frontend Engineer" },
                    status: {
                      type: "string",
                      enum: ["applied", "interviewing", "offered", "rejected"],
                      example: "applied",
                    },
                    appliedDate: {
                      type: "string",
                      format: "date",
                      example: "2026-06-01",
                    },
                    jobUrl: {
                      type: "string",
                      example: "https://careers.google.com/jobs/123",
                    },
                    salary: { type: "number", example: 120000 },
                    notes: { type: "string", example: "Referred by a friend" },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: "Job created",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Job" },
                },
              },
            },
            400: { description: "Missing required fields" },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/api/jobs/stats": {
        get: {
          tags: ["Jobs"],
          summary: "Get dashboard stats",
          security: [{ bearerAuth: [] }],
          responses: {
            200: {
              description: "Aggregated stats for dashboard",
              content: {
                "application/json": {
                  schema: {
                    type: "object",
                    properties: {
                      total: { type: "number" },
                      statusCounts: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            _id: { type: "string" },
                            count: { type: "number" },
                          },
                        },
                      },
                      monthlyApplications: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            _id: {
                              type: "object",
                              properties: {
                                year: { type: "number" },
                                month: { type: "number" },
                              },
                            },
                            count: { type: "number" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/api/jobs/{id}": {
        get: {
          tags: ["Jobs"],
          summary: "Get a single job",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: {
              description: "Job found",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Job" },
                },
              },
            },
            404: { description: "Job not found" },
            401: { description: "Unauthorized" },
          },
        },
        patch: {
          tags: ["Jobs"],
          summary: "Update a job",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    company: { type: "string" },
                    role: { type: "string" },
                    status: {
                      type: "string",
                      enum: ["applied", "interviewing", "offered", "rejected"],
                    },
                    appliedDate: { type: "string", format: "date" },
                    jobUrl: { type: "string" },
                    salary: { type: "number" },
                    notes: { type: "string" },
                  },
                },
              },
            },
          },
          responses: {
            200: {
              description: "Job updated",
              content: {
                "application/json": {
                  schema: { $ref: "#/components/schemas/Job" },
                },
              },
            },
            404: { description: "Job not found" },
            401: { description: "Unauthorized" },
          },
        },
        delete: {
          tags: ["Jobs"],
          summary: "Delete a job",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "Job deleted" },
            404: { description: "Job not found" },
            401: { description: "Unauthorized" },
          },
        },
      },
      "/api/jobs/{id}/cv": {
        post: {
          tags: ["CV"],
          summary: "Upload a CV for a job",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          requestBody: {
            required: true,
            content: {
              "multipart/form-data": {
                schema: {
                  type: "object",
                  properties: {
                    cv: {
                      type: "string",
                      format: "binary",
                      description: "PDF file, max 5MB",
                    },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: "CV uploaded successfully" },
            400: { description: "No file uploaded or invalid file type" },
            404: { description: "Job not found" },
            401: { description: "Unauthorized" },
          },
        },
        delete: {
          tags: ["CV"],
          summary: "Delete a CV from a job",
          security: [{ bearerAuth: [] }],
          parameters: [
            {
              name: "id",
              in: "path",
              required: true,
              schema: { type: "string" },
            },
          ],
          responses: {
            200: { description: "CV deleted successfully" },
            400: { description: "No CV attached to this job" },
            404: { description: "Job not found" },
            401: { description: "Unauthorized" },
          },
        },
      },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
