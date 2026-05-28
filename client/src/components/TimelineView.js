const DAY_WIDTH = 32
const DAY_COUNT = 60
const MS_PER_DAY = 24 * 60 * 60 * 1000

const PRIORITY_CLASS_MAP = {
  low: 'priority-low',
  medium: 'priority-medium',
  high: 'priority-high',
  urgent: 'priority-urgent',
}

const PRIORITY_COLOR_MAP = {
  low: '#64748b',
  medium: '#3b82f6',
  high: '#eab308',
  urgent: '#ef4444',
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate())
}

function parseDate(value) {
  if (!value) return null

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00`)
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatDate(value) {
  const date = parseDate(value)
  if (!date) return 'No date'
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

function formatHeaderDate(date, today, isFirstOfMonth) {
  const day = date.getDate()
  const month = date.toLocaleDateString([], { month: 'short' })

  if (date.getTime() === today.getTime()) {
    return 'Today'
  }

  if (isFirstOfMonth || day === 1) {
    return `${month} ${day}`
  }

  return String(day)
}

function getDisplayWindow(now) {
  const start = startOfDay(now)
  const days = Array.from({ length: DAY_COUNT }, (_, index) => new Date(start.getTime() + index * MS_PER_DAY))
  return { start, days, end: days[days.length - 1] }
}

function getBarMetrics(task, windowStart, windowEnd) {
  const startDate = parseDate(task.start_date) || parseDate(task.due_date) || windowStart
  const dueDate = parseDate(task.due_date) || parseDate(task.start_date) || startDate

  const normalizedStart = startOfDay(startDate)
  const normalizedEnd = startOfDay(dueDate)

  const visibleStart = normalizedStart < windowStart ? windowStart : normalizedStart
  const visibleEnd = normalizedEnd > windowEnd ? windowEnd : normalizedEnd

  if (visibleStart > visibleEnd) {
    if (normalizedEnd < windowStart) {
      return { offsetDays: 0, spanDays: 1 }
    }

    return { offsetDays: DAY_COUNT - 1, spanDays: 1 }
  }

  const offsetDays = Math.floor((visibleStart.getTime() - windowStart.getTime()) / MS_PER_DAY)
  const spanDays = Math.max(1, Math.floor((visibleEnd.getTime() - visibleStart.getTime()) / MS_PER_DAY) + 1)

  return { offsetDays, spanDays }
}

function buildTooltip(task, assigneeName) {
  const title = task.title
  const assignee = assigneeName || 'Unassigned'
  const start = formatDate(task.start_date)
  const due = formatDate(task.due_date)

  return `${title}\n${assignee}\n${start} → ${due}`
}

function LoadingTimelineRows() {
  return Array.from({ length: 6 })
    .map(
      (_, index) => `
        <div class="timeline-row timeline-row--skeleton">
          <div class="timeline-row-label">
            <div class="skeleton-line skeleton-line--title"></div>
            <div class="timeline-row-meta">
              <div class="skeleton-chip"></div>
              <div class="skeleton-chip"></div>
            </div>
          </div>
          <div class="timeline-row-track">
            <div class="timeline-grid-lines"></div>
            <div class="skeleton-timeline-bar" style="--start: ${index * 2}; --span: 10;"></div>
          </div>
        </div>
      `
    )
    .join('')
}

export function TimelineView({ tasks, users, projects, activeTaskId, loading }) {
  const now = startOfDay(new Date())
  const { start: windowStart, days, end: windowEnd } = getDisplayWindow(now)
  const todayIndex = Math.floor((now.getTime() - windowStart.getTime()) / MS_PER_DAY)

  const userById = new Map(users.map((user) => [String(user.id), user]))
  const projectById = new Map(projects.map((project) => [String(project.id), project]))

  const daysMarkup = days
    .map((date, index) => {
      const isFirstOfMonth = index === 0 || date.getDate() === 1

      return `
        <div class="timeline-day ${date.getTime() === now.getTime() ? 'is-today' : ''}">
          <span class="timeline-day-label">${formatHeaderDate(date, now, isFirstOfMonth)}</span>
        </div>
      `
    })
    .join('')

  const rowsMarkup = loading
    ? LoadingTimelineRows()
    : tasks.length
    ? tasks
        .map((task) => {
          const assignee = userById.get(String(task.assignee_id))
          const project = projectById.get(String(task.project_id))
          const metrics = getBarMetrics(task, windowStart, windowEnd)
          const priorityClass = PRIORITY_CLASS_MAP[task.priority] || PRIORITY_CLASS_MAP.medium
          const color = PRIORITY_COLOR_MAP[task.priority] || PRIORITY_COLOR_MAP.medium
          const tooltip = buildTooltip(task, assignee?.name)
          const isActive = String(task.id) === String(activeTaskId)

          return `
            <div class="timeline-row ${isActive ? 'is-active' : ''}">
              <div class="timeline-row-label">
                <div class="timeline-row-title">${task.title}</div>
                <div class="timeline-row-meta">
                  <span>${project?.name || 'No project'}</span>
                  <span>${assignee?.name || 'Unassigned'}</span>
                </div>
              </div>

              <div class="timeline-row-track">
                <div class="timeline-grid-lines"></div>
                <div class="timeline-today-line" style="--today-index: ${todayIndex}; --day-width: ${DAY_WIDTH}px;"></div>
                <button
                  type="button"
                  class="timeline-bar ${priorityClass} ${isActive ? 'is-active' : ''}"
                  data-action="open-task"
                  data-task-id="${task.id}"
                  style="--start: ${metrics.offsetDays}; --span: ${metrics.spanDays}; --bar-color: ${color}; --day-width: ${DAY_WIDTH}px;"
                  title="${tooltip.replaceAll('"', '&quot;')}"
                >
                  <span class="timeline-bar-title">${task.title}</span>
                  <span class="timeline-bar-tooltip">
                    <strong>${task.title}</strong>
                    <span>${assignee?.name || 'Unassigned'}</span>
                    <span>${formatDate(task.start_date)} → ${formatDate(task.due_date)}</span>
                  </span>
                </button>
              </div>
            </div>
          `
        })
        .join('')
    : `
      <div class="empty-state empty-state--panel timeline-empty">
        <div class="empty-illustration">---</div>
        <h3>No tasks on the timeline</h3>
        <p>When tasks have start and due dates, they will appear here as bars across the next 60 days.</p>
      </div>
    `

  return `
    <section class="timeline-shell">
      <div class="timeline-shell-scroll">
        <div class="timeline-grid timeline-grid-header" style="--day-width: ${DAY_WIDTH}px; --day-count: ${DAY_COUNT};">
          <div class="timeline-sticky-cell timeline-sticky-head">Task</div>
          <div class="timeline-days-track">
            ${daysMarkup}
          </div>
        </div>

        <div class="timeline-grid timeline-grid-body" style="--day-width: ${DAY_WIDTH}px; --day-count: ${DAY_COUNT};">
          ${rowsMarkup}
        </div>
      </div>
    </section>
  `
}
