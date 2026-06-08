const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tic Tac Toe API',
      version: '1.0.0',
      description: 'API for Tic Tac Toe game with authentication and statistics',
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        User: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            username: { type: 'string' },
            email: { type: 'string' },
            avatar: { type: 'string' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
        Game: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            result: { type: 'string', enum: ['victoria', 'derrota', 'empate'] },
            playedAt: { type: 'string', format: 'date-time' },
          },
        },
        Stats: {
          type: 'object',
          properties: {
            victorias: { type: 'number' },
            derrotas: { type: 'number' },
            empates: { type: 'number' },
            totalPartidas: { type: 'number' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/routes/*.js'], // Scan route files for annotations
};

const swaggerSpec = swaggerJsdoc(options);

const swaggerDocs = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log('Swagger docs available at /api-docs');
};

module.exports = swaggerDocs;