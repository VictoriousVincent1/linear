function getInitials(name) {
  return String(name || '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0] || '')
    .join('')
    .toUpperCase() || '?'
}

export function Sidebar({ projects, users, activeProjectId, view, myTasksCount, selectedUserId, collapsed }) {
  const projectItems = projects
    .map(
      (project) => `
        <button class="sidebar-item ${String(project.id) === String(activeProjectId) ? 'is-active' : ''}" data-action="select-project" data-project-id="${project.id}">
          <span>${project.name}</span>
          <span class="sidebar-count">${String(project.id) === String(activeProjectId) ? 'Active' : ''}</span>
        </button>
      `
    )
    .join('')

  const userItems = users
    .map(
      (user) => `
        <button class="sidebar-user ${String(user.id) === String(selectedUserId) ? 'is-active' : ''}" type="button" data-action="switch-user" data-user-id="${user.id}">
          <span class="sidebar-avatar" style="background:${user.avatar_color || '#3b82f6'}">${getInitials(user.name)}</span>
          <span class="sidebar-user-name">${user.name}</span>
        </button>
      `
    )
    .join('')

  return `
    <aside class="sidebar ${collapsed ? 'sidebar--collapsed' : ''}">
      <div class="brand">
        <div class="brand-mark">L</div>
        <div>
          <p class="brand-kicker">Workspace</p>
          <h1>Linear</h1>
        </div>
        <button class="sidebar-collapse-toggle" type="button" data-action="toggle-sidebar-collapse" aria-label="Toggle sidebar">≡</button>
      </div>

      <nav class="sidebar-nav">
        <button class="sidebar-item ${view === 'dashboard' ? 'is-active' : ''}" data-action="navigate" data-view="dashboard">
          <span>Dashboard</span>
        </button>
        <button class="sidebar-item ${view === 'list' && !activeProjectId ? 'is-active' : ''}" data-action="navigate" data-view="all">
          <span>All Tasks</span>
        </button>
        <button class="sidebar-item ${view === 'my' ? 'is-active' : ''}" data-action="navigate" data-view="my">
          <span>My Tasks</span>
          <span class="sidebar-count">${myTasksCount}</span>
        </button>
        <button class="sidebar-item ${view === 'timeline' ? 'is-active' : ''}" data-action="navigate" data-view="timeline">
          <span>Timeline</span>
        </button>
      </nav>

      <div class="sidebar-section">
        <div class="sidebar-section-title">Projects</div>
        <div class="sidebar-projects">
          ${projectItems || '<p class="empty-copy">No projects yet.</p>'}
        </div>
        <form class="sidebar-mini-form" data-action="create-project-form">
          <input class="sidebar-mini-input" type="text" name="name" placeholder="New project name" maxlength="80" required />
          <textarea class="sidebar-mini-textarea" name="description" placeholder="Description" rows="2" maxlength="240"></textarea>
          <button class="secondary-button sidebar-mini-button" type="submit">Add project</button>
        </form>
      </div>

      <div class="sidebar-user-switcher">
        <div class="sidebar-section-title">Active User</div>
        <div class="sidebar-user-list">
          ${userItems || '<p class="empty-copy">No users yet.</p>'}
        </div>
        <form class="sidebar-mini-form" data-action="create-user-form">
          <input class="sidebar-mini-input" type="text" name="name" placeholder="New user name" maxlength="80" required />
          <input class="sidebar-mini-input" type="email" name="email" placeholder="Email address" maxlength="120" required />
          <input class="sidebar-mini-input" type="text" name="avatar_color" placeholder="Avatar color #4f7cff" maxlength="32" />
          <button class="secondary-button sidebar-mini-button" type="submit">Add user</button>
        </form>
      </div>
    </aside>
  `
}
