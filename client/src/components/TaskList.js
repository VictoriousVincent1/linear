const statusOrder = ['backlog', 'todo', 'in_progress', 'in_review', 'done', 'cancelled']

const statusLabels = {
  backlog: 'Backlog',
  todo: 'Todo',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
  cancelled: 'Cancelled',
}

const priorityIcons = {
  low: '•',
  medium: '◔',
  high: '▲',
  urgent: '⚡',
}

function getInitials(name) {
  return String(name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || '')
    .join('')
    .toUpperCase() || '?'
}

function formatDate(value) {
  if (!value) return 'No date'
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function LoadingGroup({ label }) {
  return `
    <section class="task-group task-group--loading">
      <div class="task-group-header">
        <h3>${label}</h3>
        <span>...</span>
      </div>
      <div class="task-group-body">
        ${Array.from({ length: 3 })
          .map(
            () => `
              <div class="task-row task-row--skeleton">
                <div class="task-row-priority skeleton-bar"></div>
                <div class="task-row-main">
                  <div class="skeleton-line skeleton-line--title"></div>
                  <div class="task-row-meta">
                    <div class="skeleton-chip"></div>
                    <div class="skeleton-chip"></div>
                    <div class="skeleton-chip"></div>
                  </div>
                </div>
                <div class="skeleton-pill"></div>
              </div>
            `
          )
          .join('')}
      </div>
    </section>
  `
}

export function TaskList({ tasks, users, projects, activeTaskId, loading }) {
  const visibleStatuses = statusOrder

  if (loading) {
    return `
      <div class="task-list-shell">
        <div class="task-list-topbar">
          <button class="primary-button" data-action="new-task">+ New Task</button>
        </div>
        <div class="task-groups">
          ${visibleStatuses.map((status) => LoadingGroup({ label: statusLabels[status] })).join('')}
        </div>
      </div>
    `
  }

  const userById = new Map(users.map((user) => [String(user.id), user]))
  const projectById = new Map(projects.map((project) => [String(project.id), project]))
  const tasksByStatus = new Map(visibleStatuses.map((status) => [status, []]))

  tasks.forEach((task) => {
    const status = tasksByStatus.has(task.status) ? task.status : 'backlog'
    tasksByStatus.get(status).push(task)
  })

  const statusSections = visibleStatuses
    .map((status) => {
      const groupedTasks = tasksByStatus.get(status) || []
      const rows = groupedTasks
        .map((task) => {
          const assignee = userById.get(String(task.assignee_id))
          const project = projectById.get(String(task.project_id))

          return `
            <article class="task-row task-row--${task.status} ${String(task.id) === String(activeTaskId) ? 'is-active' : ''}" data-action="open-task" data-task-id="${task.id}" tabindex="0" role="button">
              <div class="task-row-priority" aria-hidden="true">${priorityIcons[task.priority] || '•'}</div>
              <div class="task-row-main">
                <div class="task-row-title">${task.title}</div>
                <div class="task-row-meta">
                  <span>${project?.name || 'No project'}</span>
                  <span class="task-assignee">
                    <span class="task-avatar" style="background:${assignee?.avatar_color || '#3b82f6'}">${getInitials(assignee?.name)}</span>
                    ${assignee?.name || 'Unassigned'}
                  </span>
                  <span>${formatDate(task.due_date)}</span>
                </div>
              </div>
              <div class="task-row-side">
                <button type="button" class="status-badge status-${task.status}" data-action="cycle-status" data-task-id="${task.id}">${statusLabels[task.status] || task.status}</button>
              </div>
            </article>
          `
        })
        .join('')

      return `
        <section class="task-group">
          <div class="task-group-header">
            <h3>${statusLabels[status]}</h3>
            <span>${groupedTasks.length}</span>
          </div>
          <div class="task-group-body">
            ${rows || '<div class="task-group-empty">No tasks in this status.</div>'}
          </div>
        </section>
      `
    })
    .join('')

  if (!tasks.length) {
    return `
      <div class="task-list-shell">
        <div class="task-list-topbar">
          <button class="primary-button" data-action="new-task">+ New Task</button>
        </div>
        <div class="empty-state empty-state--panel">
          <div class="empty-illustration">[ ]</div>
          <h3>No tasks found</h3>
          <p>Try clearing filters or create a new task to get the board moving.</p>
        </div>
      </div>
    `
  }

  return `
    <div class="task-list-shell">
      <div class="task-list-topbar">
        <button class="primary-button" data-action="new-task">+ New Task</button>
      </div>
      <div class="task-groups">
        ${statusSections}
      </div>
    </div>
  `
}
