const express = require('express')
const cors = require('cors')
const dotenv = require('dotenv')
require('./db/database')
const apiRoutes = require('./routes')
const { notFound, errorHandler } = require('./middleware/errorHandler')

dotenv.config()

const app = express()
const port = Number(process.env.PORT) || 5001

app.use(cors())
app.use(express.json())
app.use('/api', apiRoutes)

app.get('/health', (req, res) => {
  res.json({ ok: true })
})

app.use(notFound)
app.use(errorHandler)

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})
