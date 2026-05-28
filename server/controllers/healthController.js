const getHealth = (req, res) => {
  res.json({ ok: true, service: 'api' })
}

module.exports = {
  getHealth,
}
