const db = require('../db/database')

const now = () => new Date().toISOString()

const getAllUsersStmt = db.prepare('SELECT * FROM users ORDER BY id DESC')
const getUserByIdStmt = db.prepare('SELECT * FROM users WHERE id = ?')
const createUserStmt = db.prepare(
  'INSERT INTO users (name, email, avatar_color, created_at) VALUES (@name, @email, @avatar_color, @created_at)'
)

const getUsers = (req, res) => {
  res.json(getAllUsersStmt.all())
}

const createUser = (req, res) => {
  const { name, email, avatar_color = null, avatarColor = null } = req.body || {}
  const resolvedAvatarColor = avatar_color ?? avatarColor

  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' })
  }

  try {
    const result = createUserStmt.run({
      name,
      email,
      avatar_color: resolvedAvatarColor,
      created_at: now(),
    })

    res.status(201).json(getUserByIdStmt.get(result.lastInsertRowid))
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(409).json({ error: 'email already exists' })
    }

    throw error
  }
}

module.exports = {
  getUsers,
  createUser,
}