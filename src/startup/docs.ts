import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Tech Scope API",
      version: "1.0.0",
      description: "All exposed endpoints of the Tech Scope store",
    },
    servers: [
      {
        url: "http://localhost:3000",
      },
    ],
  },
  apis: ["./src/routes/*.ts"],
};

export const specs = swaggerJSDoc(options);
