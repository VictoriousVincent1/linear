function notFound(req, res) {
  res.status(404).json({ error: 'route not found' })
}

function errorHandler(err, req, res, next) {
  const status = err.status || err.statusCode || 500
  const message = err.message || 'Internal Server Error'

  res.status(status).json({ error: message })
}

module.exports = {
  notFound,
  errorHandler,
}