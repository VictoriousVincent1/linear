const STATUS_LABELS = {
  backlog: 'Backlog',
  todo: 'Todo',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
  cancelled: 'Cancelled',
}

const STATUS_ORDER = ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled']

function formatDate(value) {
  if (!value) return 'No date'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? 'No date' : date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000)
}

function getWeekWindow() {
  const today = startOfDay(new Date())
  return { start: today, end: addDays(today, 6) }
}

function getStatusCounts(tasks) {
  return STATUS_ORDER.map((status) => ({
    status,
    label: STATUS_LABELS[status],
    count: tasks.filter((task) => task.status === status).length,
  }))
}

function getAssigneeCounts(tasks, users) {
  const counts = new Map(users.map((user) => [String(user.id), { user, count: 0 }]))
  let unassigned = 0

  tasks.forEach((task) => {
    if (!task.assignee_id) {
      unassigned += 1
      return
    }

    const entry = counts.get(String(task.assignee_id))
    if (entry) {
      entry.count += 1
    }
  })

  return [...counts.values()]
    .filter((entry) => entry.count > 0)
    .sort((left, right) => right.count - left.count)
    .concat(unassigned ? [{ user: null, count: unassigned }] : [])
}

function getDueThisWeek(tasks) {
  const { start, end } = getWeekWindow()
  return tasks.filter((task) => {
    if (!task.due_date) return false
    const dueDate = startOfDay(new Date(task.due_date))
    return dueDate >= start && dueDate <= end
  })
}

function renderSkeletonBars() {
  return STATUS_ORDER.map(
    (status) => `
      <div class="dashboard-bar-row">
        <span class="dashboard-bar-label">${STATUS_LABELS[status]}</span>
        <div class="dashboard-bar-track">
          <div class="dashboard-bar-fill skeleton-bar"></div>
        </div>
      </div>
    `
  ).join('')
}

export function Dashboard({ tasks, users, loading }) {
  if (loading) {
    return `
      <section class="dashboard-shell">
        <div class="dashboard-grid">
          <article class="dashboard-card">
            <div class="skeleton-line skeleton-line--title"></div>
            ${renderSkeletonBars()}
          </article>
          <article class="dashboard-card">
            <div class="skeleton-line skeleton-line--title"></div>
            <div class="dashboard-list dashboard-list--skeleton">
              ${Array.from({ length: 4 })
                .map(() => '<div class="skeleton-chip skeleton-chip--wide"></div>')
                .join('')}
            </div>
          </article>
          <article class="dashboard-card">
            <div class="skeleton-line skeleton-line--title"></div>
            <div class="dashboard-list dashboard-list--skeleton">
              ${Array.from({ length: 4 })
                .map(() => '<div class="skeleton-chip skeleton-chip--wide"></div>')
                .join('')}
            </div>
          </article>
        </div>
      </section>
    `
  }

  const statusCounts = getStatusCounts(tasks)
  const maxStatusCount = Math.max(1, ...statusCounts.map((entry) => entry.count))
  const dueThisWeek = getDueThisWeek(tasks)
  const assigneeCounts = getAssigneeCounts(tasks, users)

  return `
    <section class="dashboard-shell">
      <div class="dashboard-grid">
        <article class="dashboard-card dashboard-card--wide">
          <div class="dashboard-card-header">
            <div>
              <p class="dashboard-kicker">Overview</p>
              <h3>Total tasks by status</h3>
            </div>
            <span class="dashboard-badge">${tasks.length} total</span>
          </div>
          <div class="dashboard-bars">
            ${statusCounts
              .map((entry) => {
                const percent = Math.round((entry.count / maxStatusCount) * 100)
                return `
                  <div class="dashboard-bar-row">
                    <span class="dashboard-bar-label">${entry.label}</span>
                    <div class="dashboard-bar-track">
                      <div class="dashboard-bar-fill status-${entry.status}" style="width: ${percent}%"></div>
                    </div>
                    <span class="dashboard-bar-count">${entry.count}</span>
                  </div>
                `
              })
              .join('')}
          </div>
        </article>

        <article class="dashboard-card">
          <div class="dashboard-card-header">
            <div>
              <p class="dashboard-kicker">This week</p>
              <h3>Tasks due this week</h3>
            </div>
            <span class="dashboard-badge">${dueThisWeek.length} due</span>
          </div>
          <div class="dashboard-list">
            ${dueThisWeek.length
              ? dueThisWeek
                  .slice(0, 6)
                  .map(
                    (task) => `
                      <div class="dashboard-list-item">
                        <div>
                          <strong>${task.title}</strong>
                          <span>${formatDate(task.due_date)}</span>
                        </div>
                        <span class="status-${task.status}">${STATUS_LABELS[task.status]}</span>
                      </div>
                    `
                  )
                  .join('')
              : '<div class="empty-state empty-state--compact">Nothing is due this week.</div>'}
          </div>
        </article>

        <article class="dashboard-card">
          <div class="dashboard-card-header">
            <div>
              <p class="dashboard-kicker">People</p>
              <h3>Tasks per assignee</h3>
            </div>
          </div>
          <div class="dashboard-list">
            ${assigneeCounts.length
              ? assigneeCounts
                  .map(
                    (entry) => `
                      <div class="dashboard-list-item dashboard-list-item--assignee">
                        <div class="dashboard-assignee-name">
                          ${entry.user ? `<span class="filter-avatar" style="background:${entry.user.avatar_color || '#3b82f6'}">${entry.user.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()}</span>` : '<span class="filter-avatar" style="background:#2c2c2c">?</span>'}
                          <strong>${entry.user?.name || 'Unassigned'}</strong>
                        </div>
                        <span class="dashboard-badge">${entry.count}</span>
                      </div>
                    `
                  )
                  .join('')
              : '<div class="empty-state empty-state--compact">No assignee data yet.</div>'}
          </div>
        </article>
      </div>
    </section>
  `
}