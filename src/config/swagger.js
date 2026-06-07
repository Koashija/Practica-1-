import swaggerJSDoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Tic-Tac-Toe API de Producción',
      version: '1.0.0',
      description: 'Documentación oficial de microservicios para autenticación y estadísticas de juego.'
    },
    servers: [
      {
        url: 'http://localhost:5000',
        description: 'Servidor Local de Desarrollo'
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      }
    },
    // Definimos los endpoints aquí directamente para evitar errores de escaneo
    paths: {
      '/api/auth/register': {
        post: {
          summary: 'Registrar un nuevo usuario',
          tags: ['Autenticación'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['username', 'email', 'password'],
                  properties: {
                    username: { type: 'string' },
                    email: { type: 'string' },
                    password: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            201: { description: 'Usuario creado con éxito' },
            400: { description: 'Error de validación o usuario ya existente' }
          }
        }
      },
      '/api/auth/login': {
        post: {
          summary: 'Iniciar sesión de usuario',
          tags: ['Autenticación'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string' },
                    password: { type: 'string' }
                  }
                }
              }
            }
          },
          responses: {
            200: { description: 'Login exitoso, devuelve el token JWT' },
            401: { description: 'Credenciales incorrectas' }
          }
        }
      },
      '/api/auth/profile': {
        get: {
          summary: 'Obtener el perfil del usuario autenticado',
          tags: ['Autenticación'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Datos del perfil obtenidos correctamente' },
            401: { description: 'Token inválido o no proporcionado' }
          }
        }
      },
      '/api/game/history': {
        get: {
          summary: 'Obtener el historial de partidas del usuario',
          tags: ['Juego'],
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Lista de partidas jugadas obtenida con éxito' },
            401: { description: 'No autorizado, token faltante o inválido' }
          }
        }
      }
    }
  },
  // Al dejar esto vacío forcemos a swagger-jsdoc a leer exclusivamente el objeto que definimos arriba
  apis: []
};

export const swaggerSpec = swaggerJSDoc(options);