// OpenAPI 3.0.3 specification for the bike-booking API.
// Served as raw JSON at GET /api/openapi.json and rendered with Swagger UI at
// GET /api/docs. Kept as a plain object (not generated from code) so the spec
// stays explicit and easy to read in a PR.

export const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Bike Booking API",
    version: "1.0.0",
    description:
      "REST API for browsing bikes, checking availability and creating, " +
      "listing and cancelling bookings. All responses are wrapped in an " +
      "`ApiResponse` envelope with a `success` boolean and either `data` or " +
      "`error`.",
  },
  servers: [
    { url: "/api", description: "Same-origin (dev proxy / production mount)" },
  ],
  tags: [
    { name: "Health" },
    { name: "Bikes" },
    { name: "Bookings" },
    { name: "Users" },
  ],
  components: {
    securitySchemes: {
      // Until proper auth is added, the API identifies the caller via an
      // x-user-id header (or a userId field in body / query). This is
      // documented here so the Swagger UI "Authorize" button works for
      // endpoints that require ownership checks.
      UserIdHeader: {
        type: "apiKey",
        in: "header",
        name: "x-user-id",
        description:
          "User id of the caller. Required for cancelling a booking " +
          "(must match the booking owner).",
      },
    },
    schemas: {
      ApiError: {
        type: "object",
        required: ["success", "error"],
        properties: {
          success: { type: "boolean", example: false },
          error: { type: "string", example: "Something went wrong" },
        },
      },
      Bike: {
        type: "object",
        required: [
          "id",
          "name",
          "type",
          "description",
          "pricePerHour",
          "imageUrl",
        ],
        properties: {
          id: { type: "string", example: "65f0a1c2d3e4f5a6b7c8d9e0" },
          name: { type: "string", example: "Mountain Explorer" },
          type: {
            type: "string",
            enum: ["mountain", "road", "city", "electric"],
          },
          description: { type: "string" },
          pricePerHour: { type: "number", format: "float", example: 15 },
          imageUrl: { type: "string", format: "uri" },
          isAvailable: {
            type: "boolean",
            description:
              "Whether the bike is available for the next hour from `now`.",
          },
        },
      },
      Booking: {
        type: "object",
        required: [
          "id",
          "bikeId",
          "userId",
          "startTime",
          "endTime",
          "status",
        ],
        properties: {
          id: { type: "string" },
          bikeId: { type: "string" },
          userId: { type: "string" },
          startTime: { type: "string", format: "date-time" },
          endTime: { type: "string", format: "date-time" },
          status: { type: "string", enum: ["confirmed", "cancelled"] },
          totalPrice: { type: "number", format: "float" },
          bike: { $ref: "#/components/schemas/Bike" },
        },
      },
      CreateBookingRequest: {
        type: "object",
        required: ["bikeId", "userId", "startTime", "endTime"],
        properties: {
          bikeId: { type: "string" },
          userId: { type: "string" },
          startTime: { type: "string", format: "date-time" },
          endTime: { type: "string", format: "date-time" },
        },
      },
      User: {
        type: "object",
        required: ["id", "email", "name"],
        properties: {
          id: { type: "string" },
          email: { type: "string", format: "email" },
          name: { type: "string" },
          createdAt: { type: "string", format: "date-time" },
        },
      },
      RegisterRequest: {
        type: "object",
        required: ["email", "password", "name"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string", minLength: 6 },
          name: { type: "string" },
        },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email" },
          password: { type: "string" },
        },
      },
    },
    responses: {
      NotFound: {
        description: "Resource not found",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ApiError" },
          },
        },
      },
      BadRequest: {
        description: "Validation error",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ApiError" },
          },
        },
      },
      Conflict: {
        description: "Conflict (e.g. bike already booked)",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ApiError" },
          },
        },
      },
      Unauthorized: {
        description: "Missing or invalid caller identity",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ApiError" },
          },
        },
      },
      Forbidden: {
        description: "Caller is not allowed to perform this action",
        content: {
          "application/json": {
            schema: { $ref: "#/components/schemas/ApiError" },
          },
        },
      },
    },
  },
  paths: {
    "/health": {
      get: {
        tags: ["Health"],
        summary: "Service and database health check",
        responses: {
          "200": {
            description: "Service is up",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    status: { type: "string", example: "ok" },
                    timestamp: { type: "string", format: "date-time" },
                    uptime: { type: "number" },
                    database: {
                      type: "object",
                      properties: {
                        status: { type: "string", example: "connected" },
                        connected: { type: "boolean" },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/bikes": {
      get: {
        tags: ["Bikes"],
        summary: "List bikes with current availability",
        parameters: [
          {
            name: "type",
            in: "query",
            schema: {
              type: "string",
              enum: ["mountain", "road", "city", "electric"],
            },
            required: false,
          },
          {
            name: "available",
            in: "query",
            description:
              "If `true`, only return bikes currently available (no " +
              "overlapping confirmed booking in the next hour).",
            schema: { type: "string", enum: ["true"] },
            required: false,
          },
        ],
        responses: {
          "200": {
            description: "Array of bikes",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Bike" },
                    },
                  },
                },
              },
            },
          },
        },
      },
    },
    "/bikes/{id}": {
      get: {
        tags: ["Bikes"],
        summary: "Get a single bike with its confirmed bookings",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Bike found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      allOf: [
                        { $ref: "#/components/schemas/Bike" },
                        {
                          type: "object",
                          properties: {
                            bookings: {
                              type: "array",
                              items: { $ref: "#/components/schemas/Booking" },
                            },
                          },
                        },
                      ],
                    },
                  },
                },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/bikes/{id}/availability": {
      get: {
        tags: ["Bikes"],
        summary: "Check whether a bike is available in a specific time range",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
          {
            name: "startTime",
            in: "query",
            required: true,
            schema: { type: "string", format: "date-time" },
          },
          {
            name: "endTime",
            in: "query",
            required: true,
            schema: { type: "string", format: "date-time" },
          },
        ],
        responses: {
          "200": {
            description: "Availability result",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: { available: { type: "boolean" } },
                    },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/bookings": {
      get: {
        tags: ["Bookings"],
        summary: "List bookings (optionally filter by userId)",
        parameters: [
          {
            name: "userId",
            in: "query",
            required: false,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Array of bookings",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Booking" },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        tags: ["Bookings"],
        summary: "Create a new booking",
        description:
          "Creates a confirmed booking. The server validates that " +
          "`startTime` is in the future, `endTime` is after `startTime`, " +
          "and that the bike has no overlapping confirmed booking. A " +
          "post-insert re-check rolls the booking back if a concurrent " +
          "request beat it to the slot (returns 409).",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/CreateBookingRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "Booking created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Booking" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "404": { $ref: "#/components/responses/NotFound" },
          "409": { $ref: "#/components/responses/Conflict" },
        },
      },
    },
    "/bookings/{id}": {
      get: {
        tags: ["Bookings"],
        summary: "Get a single booking",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "Booking found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/Booking" },
                  },
                },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
      delete: {
        tags: ["Bookings"],
        summary: "Cancel a booking",
        description:
          "Marks the booking as `cancelled`. The caller must identify " +
          "themselves (via `x-user-id` header, `userId` query param, or " +
          "`userId` field in the JSON body) and must be the booking " +
          "owner. Bookings that have already ended cannot be cancelled.",
        security: [{ UserIdHeader: [] }],
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: {
          required: false,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { userId: { type: "string" } },
              },
            },
          },
        },
        responses: {
          "200": {
            description: "Booking cancelled",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "object",
                      properties: { message: { type: "string" } },
                    },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
          "403": { $ref: "#/components/responses/Forbidden" },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
    "/users/register": {
      post: {
        tags: ["Users"],
        summary: "Register a new user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/RegisterRequest" },
            },
          },
        },
        responses: {
          "201": {
            description: "User created",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "409": { $ref: "#/components/responses/Conflict" },
        },
      },
    },
    "/users/login": {
      post: {
        tags: ["Users"],
        summary: "Log in an existing user",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { $ref: "#/components/schemas/LoginRequest" },
            },
          },
        },
        responses: {
          "200": {
            description: "Authenticated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          "400": { $ref: "#/components/responses/BadRequest" },
          "401": { $ref: "#/components/responses/Unauthorized" },
        },
      },
    },
    "/users/{id}": {
      get: {
        tags: ["Users"],
        summary: "Get a user by id",
        parameters: [
          {
            name: "id",
            in: "path",
            required: true,
            schema: { type: "string" },
          },
        ],
        responses: {
          "200": {
            description: "User found",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: { $ref: "#/components/schemas/User" },
                  },
                },
              },
            },
          },
          "404": { $ref: "#/components/responses/NotFound" },
        },
      },
    },
  },
} as const;

export default openapiSpec;
