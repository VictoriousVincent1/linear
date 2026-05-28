const path = require('path')
const Database = require('better-sqlite3')

const dbPath = path.join(__dirname, 'project.db')
const db = new Database(dbPath)

db.pragma('foreign_keys = ON')

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    avatar_color TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS tasks (
    id INTEGER PRIMARY KEY,
    project_id INTEGER,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT CHECK(status IN ('backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled')) DEFAULT 'todo',
    priority TEXT CHECK(priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
    assignee_id INTEGER,
    start_date TEXT,
    due_date TEXT,
    completed_at TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id),
    FOREIGN KEY (assignee_id) REFERENCES users(id)
  );
`)

const seedSampleData = db.transaction(() => {
  const userCount = db.prepare('SELECT COUNT(*) AS count FROM users').get().count

  if (userCount > 0) {
    return
  }

  const now = new Date().toISOString()

  const insertUser = db.prepare(
    'INSERT INTO users (name, email, avatar_color, created_at) VALUES (?, ?, ?, ?)'
  )
  const insertProject = db.prepare(
    'INSERT INTO projects (name, description, created_at) VALUES (?, ?, ?)'
  )

  insertUser.run('Avery Chen', 'avery@example.com', '#4f46e5', now)
  insertUser.run('Maya Patel', 'maya@example.com', '#0f766e', now)
  insertUser.run('Jordan Lee', 'jordan@example.com', '#b45309', now)

  insertProject.run('Launch Planning', 'Initial project setup and execution plan.', now)
})

seedSampleData()

module.exports = db