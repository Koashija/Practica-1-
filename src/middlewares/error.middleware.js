const errorMiddleware = (err, req, res, next) => {
  console.error('Detalle del Error Capturado:', err.stack);
  
  res.status(err.status || 500).json({
    message: err.message || 'Ocurrió un error interno en el servidor.',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
};

export default errorMiddleware;