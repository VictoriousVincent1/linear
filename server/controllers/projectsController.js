const db = require('../db/database')

const now = () => new Date().toISOString()

const getAllProjectsStmt = db.prepare('SELECT * FROM projects ORDER BY id DESC')
const getProjectByIdStmt = db.prepare('SELECT * FROM projects WHERE id = ?')
const createProjectStmt = db.prepare(
  'INSERT INTO projects (name, description, created_at) VALUES (@name, @description, @created_at)'
)

const getProjects = (req, res) => {
  res.json(getAllProjectsStmt.all())
}

const createProject = (req, res) => {
  const { name, description = null } = req.body || {}

  if (!name) {
    return res.status(400).json({ error: 'name is required' })
  }

  const result = createProjectStmt.run({
    name,
    description,
    created_at: now(),
  })

  res.status(201).json(getProjectByIdStmt.get(result.lastInsertRowid))
}

module.exports = {
  getProjects,
  createProject,
}