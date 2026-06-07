export const errorHandler = (err, req, res, next) => {
  // Si el controlador no definió un estatus específico, usamos 500 (Error interno)
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  
  res.status(statusCode).json({
    message: err.message || 'Ocurrió un error inesperado en el servidor.',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
};