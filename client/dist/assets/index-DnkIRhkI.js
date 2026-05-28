(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))a(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const o of n.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&a(o)}).observe(document,{childList:!0,subtree:!0});function r(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function a(i){if(i.ep)return;i.ep=!0;const n=r(i);fetch(i.href,n)}})();const Z="/api";async function T(t,s={}){const r=await fetch(`${Z}${t}`,{headers:{"Content-Type":"application/json",...s.headers||{}},...s}),a=await r.text(),i=a?JSON.parse(a):null;if(!r.ok)throw new Error((i==null?void 0:i.error)||`Request failed with status ${r.status}`);return i}function tt(t={}){const s=new URLSearchParams;t.projectId&&s.set("projectId",t.projectId),t.status&&s.set("status",t.status),t.assigneeId&&s.set("assigneeId",t.assigneeId);const r=s.toString();return T(`/tasks${r?`?${r}`:""}`)}function et(){return T("/projects")}function st(t){return T("/tasks",{method:"POST",body:JSON.stringify(t)})}function x(t,s){return T(`/tasks/${t}`,{method:"PATCH",body:JSON.stringify(s)})}function at(t){return T(`/tasks/${t}`,{method:"DELETE"})}function it(){return T("/users")}function nt(t){return String(t||"").trim().split(/\s+/).slice(0,2).map(s=>s[0]||"").join("").toUpperCase()||"?"}function rt({projects:t,users:s,activeProjectId:r,view:a,myTasksCount:i,selectedUserId:n,collapsed:o}){const d=t.map(l=>`
        <button class="sidebar-item ${String(l.id)===String(r)?"is-active":""}" data-action="select-project" data-project-id="${l.id}">
          <span>${l.name}</span>
          <span class="sidebar-count">${String(l.id)===String(r)?"Active":""}</span>
        </button>
      `).join(""),p=s.map(l=>`
        <button class="sidebar-user ${String(l.id)===String(n)?"is-active":""}" type="button" data-action="switch-user" data-user-id="${l.id}">
          <span class="sidebar-avatar" style="background:${l.avatar_color||"#3b82f6"}">${nt(l.name)}</span>
          <span class="sidebar-user-name">${l.name}</span>
        </button>
      `).join("");return`
    <aside class="sidebar ${o?"sidebar--collapsed":""}">
      <div class="brand">
        <div class="brand-mark">L</div>
        <div>
          <p class="brand-kicker">Workspace</p>
          <h1>Linear</h1>
        </div>
        <button class="sidebar-collapse-toggle" type="button" data-action="toggle-sidebar-collapse" aria-label="Toggle sidebar">≡</button>
      </div>

      <nav class="sidebar-nav">
        <button class="sidebar-item ${a==="dashboard"?"is-active":""}" data-action="navigate" data-view="dashboard">
          <span>Dashboard</span>
        </button>
        <button class="sidebar-item ${a==="list"&&!r?"is-active":""}" data-action="navigate" data-view="all">
          <span>All Tasks</span>
        </button>
        <button class="sidebar-item ${a==="my"?"is-active":""}" data-action="navigate" data-view="my">
          <span>My Tasks</span>
          <span class="sidebar-count">${i}</span>
        </button>
        <button class="sidebar-item ${a==="timeline"?"is-active":""}" data-action="navigate" data-view="timeline">
          <span>Timeline</span>
        </button>
      </nav>

      <div class="sidebar-section">
        <div class="sidebar-section-title">Projects</div>
        <div class="sidebar-projects">
          ${d||'<p class="empty-copy">No projects yet.</p>'}
        </div>
      </div>

      <div class="sidebar-user-switcher">
        <div class="sidebar-section-title">Active User</div>
        <div class="sidebar-user-list">
          ${p||'<p class="empty-copy">No users yet.</p>'}
        </div>
      </div>
    </aside>
  `}const ot=["backlog","todo","in_progress","in_review","done"],lt=["","low","medium","high","urgent"];function C(t){return String(t||"").trim().split(/\s+/).slice(0,2).map(s=>s[0]||"").join("").toUpperCase()||"?"}function dt({users:t,filters:s,view:r,selectedUserId:a}){const i=t.find(l=>String(l.id)===String(s.assigneeId)),n=t.find(l=>String(l.id)===String(a)),o=t.map(l=>`
        <button class="filter-user-option ${String(s.assigneeId)===String(l.id)?"is-selected":""}" type="button" data-action="filter-assignee" data-user-id="${l.id}">
          <span class="filter-avatar" style="background:${l.avatar_color||"#3b82f6"}">${C(l.name)}</span>
          <span class="filter-user-name">${l.name}</span>
          ${String(s.assigneeId)===String(l.id)?'<span class="filter-check">✓</span>':""}
        </button>
      `).join(""),d=ot.map(l=>`
        <button type="button" class="chip ${s.statuses.includes(l)?"is-active":""}" data-action="toggle-status" data-status="${l}">
          ${l.replaceAll("_"," ")}
        </button>
      `).join(""),p=lt.map(l=>`
        <option value="${l}" ${s.priority===l?"selected":""}>${l||"All priorities"}</option>
      `).join("");return`
    <div class="filter-bar">
      <div class="filter-bar-row filter-bar-row--top">
        <div class="filter-group filter-group--search">
          <label class="search-field">
            <span class="field-label">Search</span>
            <input data-action="filter-search" type="search" value="${s.search||""}" placeholder="Search by title" />
          </label>
        </div>

        <div class="view-switcher">
          <button class="chip ${r==="list"?"is-active":""}" data-action="set-view" data-view="list">List</button>
          <button class="chip ${r==="timeline"?"is-active":""}" data-action="set-view" data-view="timeline">Timeline</button>
        </div>
      </div>

      <div class="filter-bar-row">
        <div class="filter-group filter-group--assignee">
          <div class="filter-dropdown">
            <button class="filter-dropdown-trigger" type="button" data-action="toggle-filter-menu">
              <span class="field-label">Assignee</span>
              <span class="filter-dropdown-value">
                <span class="filter-avatar" style="background:${(i==null?void 0:i.avatar_color)||"#2c2c2c"}">${i?C(i.name):n?C(n.name):"?"}</span>
                ${(i==null?void 0:i.name)||"Everyone"}
              </span>
            </button>
            <div class="filter-dropdown-menu" data-filter-menu>
              <button class="filter-user-option ${s.assigneeId?"":"is-selected"}" type="button" data-action="filter-assignee" data-user-id="">
                <span class="filter-user-name">Everyone</span>
                ${s.assigneeId?"":'<span class="filter-check">✓</span>'}
              </button>
              ${o}
            </div>
          </div>

          <label class="filter-select">
            <span class="field-label">Priority</span>
            <select data-action="filter-priority">
              ${p}
            </select>
          </label>
        </div>

        <div class="filter-group filter-group--status">
          <div class="field-label">Status</div>
          <div class="status-chip-row">
            ${d}
          </div>
        </div>

        <div class="filter-actions">
          <button class="secondary-button" type="button" data-action="clear-filters">Clear filters</button>
        </div>
      </div>
    </div>
  `}const ct=["backlog","todo","in_progress","in_review","done","cancelled"],A={backlog:"Backlog",todo:"Todo",in_progress:"In Progress",in_review:"In Review",done:"Done",cancelled:"Cancelled"},ut={low:"•",medium:"◔",high:"▲",urgent:"⚡"};function pt(t){return String(t||"").trim().split(/\s+/).slice(0,2).map(s=>s[0]||"").join("").toUpperCase()||"?"}function vt(t){if(!t)return"No date";const s=new Date(t);return Number.isNaN(s.getTime())?t:s.toLocaleDateString([],{month:"short",day:"numeric"})}function gt({label:t}){return`
    <section class="task-group task-group--loading">
      <div class="task-group-header">
        <h3>${t}</h3>
        <span>...</span>
      </div>
      <div class="task-group-body">
        ${Array.from({length:3}).map(()=>`
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
            `).join("")}
      </div>
    </section>
  `}function mt({tasks:t,users:s,projects:r,activeTaskId:a,loading:i}){const n=ct;if(i)return`
      <div class="task-list-shell">
        <div class="task-list-topbar">
          <button class="primary-button" data-action="new-task">+ New Task</button>
        </div>
        <div class="task-groups">
          ${n.map(u=>gt({label:A[u]})).join("")}
        </div>
      </div>
    `;const o=new Map(s.map(u=>[String(u.id),u])),d=new Map(r.map(u=>[String(u.id),u])),p=new Map(n.map(u=>[u,[]]));t.forEach(u=>{const k=p.has(u.status)?u.status:"backlog";p.get(k).push(u)});const l=n.map(u=>{const k=p.get(u)||[],g=k.map(f=>{const c=o.get(String(f.assignee_id)),m=d.get(String(f.project_id));return`
            <article class="task-row task-row--${f.status} ${String(f.id)===String(a)?"is-active":""}" data-action="open-task" data-task-id="${f.id}" tabindex="0" role="button">
              <div class="task-row-priority" aria-hidden="true">${ut[f.priority]||"•"}</div>
              <div class="task-row-main">
                <div class="task-row-title">${f.title}</div>
                <div class="task-row-meta">
                  <span>${(m==null?void 0:m.name)||"No project"}</span>
                  <span class="task-assignee">
                    <span class="task-avatar" style="background:${(c==null?void 0:c.avatar_color)||"#3b82f6"}">${pt(c==null?void 0:c.name)}</span>
                    ${(c==null?void 0:c.name)||"Unassigned"}
                  </span>
                  <span>${vt(f.due_date)}</span>
                </div>
              </div>
              <div class="task-row-side">
                <button type="button" class="status-badge status-${f.status}" data-action="cycle-status" data-task-id="${f.id}">${A[f.status]||f.status}</button>
              </div>
            </article>
          `}).join("");return`
        <section class="task-group">
          <div class="task-group-header">
            <h3>${A[u]}</h3>
            <span>${k.length}</span>
          </div>
          <div class="task-group-body">
            ${g||'<div class="task-group-empty">No tasks in this status.</div>'}
          </div>
        </section>
      `}).join("");return t.length?`
    <div class="task-list-shell">
      <div class="task-list-topbar">
        <button class="primary-button" data-action="new-task">+ New Task</button>
      </div>
      <div class="task-groups">
        ${l}
      </div>
    </div>
  `:`
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
    `}const ft=["backlog","todo","in_progress","in_review","done","cancelled"],bt=["low","medium","high","urgent"],ht={low:"Low",medium:"Medium",high:"High",urgent:"Urgent"};function kt({task:t,users:s,projects:r,open:a,closing:i}){if(!a)return"";const n=!!t,o=(t==null?void 0:t.status)||"todo",d=(t==null?void 0:t.priority)||"medium",p=s.map(g=>`<option value="${g.id}" ${String((t==null?void 0:t.assignee_id)||"")===String(g.id)?"selected":""}>${g.name}</option>`).join(""),l=r.map(g=>`<option value="${g.id}" ${String((t==null?void 0:t.project_id)||"")===String(g.id)?"selected":""}>${g.name}</option>`).join(""),u=ft.map(g=>`<option value="${g}" ${o===g?"selected":""}>${g.replaceAll("_"," ")}</option>`).join(""),k=bt.map(g=>`<option value="${g}" ${d===g?"selected":""}>● ${ht[g]}</option>`).join("");return`
    <section class="task-modal ${i?"is-closing":"is-open"}" aria-hidden="false">
      <button class="task-modal-backdrop" type="button" data-action="close-modal" aria-label="Close task modal"></button>

      <aside class="task-panel task-modal-panel" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
        <div class="task-panel-header">
          <div>
            <p class="panel-kicker">Task detail</p>
            <h2 id="task-modal-title">${n?t.title:"Create task"}</h2>
          </div>
          <button class="icon-button" type="button" data-action="close-modal">Cancel</button>
        </div>

        <form class="task-form" data-task-form>
          <input type="hidden" name="id" value="${(t==null?void 0:t.id)||""}" />
          <label>
            Title
            <input name="title" value="${(t==null?void 0:t.title)||""}" placeholder="Task title" required />
          </label>

          <label>
            Description
            <textarea name="description" rows="5" placeholder="Add details">${(t==null?void 0:t.description)||""}</textarea>
          </label>

          <div class="form-grid">
            <label>
              Status
              <select name="status">
                ${u}
              </select>
            </label>
            <label>
              Priority
              <select name="priority">
                ${k}
              </select>
            </label>
            <label>
              Assignee
              <select name="assignee_id">
                <option value="">Unassigned</option>
                ${p}
              </select>
            </label>
            <label>
              Project
              <select name="project_id">
                <option value="">None</option>
                ${l}
              </select>
            </label>
            <label>
              Start date
              <input type="date" name="start_date" value="${(t==null?void 0:t.start_date)||""}" />
            </label>
            <label>
              Due date
              <input type="date" name="due_date" value="${(t==null?void 0:t.due_date)||""}" />
            </label>
          </div>

          <div class="task-form-actions">
            ${n?'<button type="button" class="danger-button" data-action="delete-task">Delete</button>':""}
            <button type="button" class="secondary-button" data-action="close-modal">Cancel</button>
            <button type="submit" class="primary-button">Save</button>
          </div>
        </form>
      </aside>
    </section>
  `}const I=32,j=60,L=1440*60*1e3,B={low:"priority-low",medium:"priority-medium",high:"priority-high",urgent:"priority-urgent"},R={low:"#64748b",medium:"#3b82f6",high:"#eab308",urgent:"#ef4444"};function D(t){return new Date(t.getFullYear(),t.getMonth(),t.getDate())}function S(t){if(!t)return null;if(/^\d{4}-\d{2}-\d{2}$/.test(t))return new Date(`${t}T00:00:00`);const s=new Date(t);return Number.isNaN(s.getTime())?null:s}function E(t){const s=S(t);return s?s.toLocaleDateString([],{month:"short",day:"numeric"}):"No date"}function yt(t,s,r){const a=t.getDate(),i=t.toLocaleDateString([],{month:"short"});return t.getTime()===s.getTime()?"Today":r||a===1?`${i} ${a}`:String(a)}function wt(t){const s=D(t),r=Array.from({length:j},(a,i)=>new Date(s.getTime()+i*L));return{start:s,days:r,end:r[r.length-1]}}function Tt(t,s,r){const a=S(t.start_date)||S(t.due_date)||s,i=S(t.due_date)||S(t.start_date)||a,n=D(a),o=D(i),d=n<s?s:n,p=o>r?r:o;if(d>p)return o<s?{offsetDays:0,spanDays:1}:{offsetDays:j-1,spanDays:1};const l=Math.floor((d.getTime()-s.getTime())/L),u=Math.max(1,Math.floor((p.getTime()-d.getTime())/L)+1);return{offsetDays:l,spanDays:u}}function $t(t,s){const r=t.title,a=s||"Unassigned",i=E(t.start_date),n=E(t.due_date);return`${r}
${a}
${i} → ${n}`}function St(){return Array.from({length:6}).map((t,s)=>`
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
            <div class="skeleton-timeline-bar" style="--start: ${s*2}; --span: 10;"></div>
          </div>
        </div>
      `).join("")}function It({tasks:t,users:s,projects:r,activeTaskId:a,loading:i}){const n=D(new Date),{start:o,days:d,end:p}=wt(n),l=Math.floor((n.getTime()-o.getTime())/L),u=new Map(s.map(c=>[String(c.id),c])),k=new Map(r.map(c=>[String(c.id),c])),g=d.map((c,m)=>{const $=m===0||c.getDate()===1;return`
        <div class="timeline-day ${c.getTime()===n.getTime()?"is-today":""}">
          <span class="timeline-day-label">${yt(c,n,$)}</span>
        </div>
      `}).join(""),f=i?St():t.length?t.map(c=>{const m=u.get(String(c.assignee_id)),$=k.get(String(c.project_id)),P=Tt(c,o,p),K=B[c.priority]||B.medium,X=R[c.priority]||R.medium,Q=$t(c,m==null?void 0:m.name),q=String(c.id)===String(a);return`
            <div class="timeline-row ${q?"is-active":""}">
              <div class="timeline-row-label">
                <div class="timeline-row-title">${c.title}</div>
                <div class="timeline-row-meta">
                  <span>${($==null?void 0:$.name)||"No project"}</span>
                  <span>${(m==null?void 0:m.name)||"Unassigned"}</span>
                </div>
              </div>

              <div class="timeline-row-track">
                <div class="timeline-grid-lines"></div>
                <div class="timeline-today-line" style="--today-index: ${l}; --day-width: ${I}px;"></div>
                <button
                  type="button"
                  class="timeline-bar ${K} ${q?"is-active":""}"
                  data-action="open-task"
                  data-task-id="${c.id}"
                  style="--start: ${P.offsetDays}; --span: ${P.spanDays}; --bar-color: ${X}; --day-width: ${I}px;"
                  title="${Q.replaceAll('"',"&quot;")}"
                >
                  <span class="timeline-bar-title">${c.title}</span>
                  <span class="timeline-bar-tooltip">
                    <strong>${c.title}</strong>
                    <span>${(m==null?void 0:m.name)||"Unassigned"}</span>
                    <span>${E(c.start_date)} → ${E(c.due_date)}</span>
                  </span>
                </button>
              </div>
            </div>
          `}).join(""):`
      <div class="empty-state empty-state--panel timeline-empty">
        <div class="empty-illustration">---</div>
        <h3>No tasks on the timeline</h3>
        <p>When tasks have start and due dates, they will appear here as bars across the next 60 days.</p>
      </div>
    `;return`
    <section class="timeline-shell">
      <div class="timeline-shell-scroll">
        <div class="timeline-grid timeline-grid-header" style="--day-width: ${I}px; --day-count: ${j};">
          <div class="timeline-sticky-cell timeline-sticky-head">Task</div>
          <div class="timeline-days-track">
            ${g}
          </div>
        </div>

        <div class="timeline-grid timeline-grid-body" style="--day-width: ${I}px; --day-count: ${j};">
          ${f}
        </div>
      </div>
    </section>
  `}const U={backlog:"Backlog",todo:"Todo",in_progress:"In Progress",in_review:"In Review",done:"Done",cancelled:"Cancelled"},W=["backlog","todo","in_progress","in_review","done","cancelled"];function _t(t){if(!t)return"No date";const s=new Date(t);return Number.isNaN(s.getTime())?"No date":s.toLocaleDateString([],{month:"short",day:"numeric"})}function Y(t){return new Date(t.getFullYear(),t.getMonth(),t.getDate())}function jt(t,s){return new Date(t.getTime()+s*24*60*60*1e3)}function Lt(){const t=Y(new Date);return{start:t,end:jt(t,6)}}function Dt(t){return W.map(s=>({status:s,label:U[s],count:t.filter(r=>r.status===s).length}))}function Et(t,s){const r=new Map(s.map(i=>[String(i.id),{user:i,count:0}]));let a=0;return t.forEach(i=>{if(!i.assignee_id){a+=1;return}const n=r.get(String(i.assignee_id));n&&(n.count+=1)}),[...r.values()].filter(i=>i.count>0).sort((i,n)=>n.count-i.count).concat(a?[{user:null,count:a}]:[])}function Mt(t){const{start:s,end:r}=Lt();return t.filter(a=>{if(!a.due_date)return!1;const i=Y(new Date(a.due_date));return i>=s&&i<=r})}function Ct(){return W.map(t=>`
      <div class="dashboard-bar-row">
        <span class="dashboard-bar-label">${U[t]}</span>
        <div class="dashboard-bar-track">
          <div class="dashboard-bar-fill skeleton-bar"></div>
        </div>
      </div>
    `).join("")}function At({tasks:t,users:s,loading:r}){if(r)return`
      <section class="dashboard-shell">
        <div class="dashboard-grid">
          <article class="dashboard-card">
            <div class="skeleton-line skeleton-line--title"></div>
            ${Ct()}
          </article>
          <article class="dashboard-card">
            <div class="skeleton-line skeleton-line--title"></div>
            <div class="dashboard-list dashboard-list--skeleton">
              ${Array.from({length:4}).map(()=>'<div class="skeleton-chip skeleton-chip--wide"></div>').join("")}
            </div>
          </article>
          <article class="dashboard-card">
            <div class="skeleton-line skeleton-line--title"></div>
            <div class="dashboard-list dashboard-list--skeleton">
              ${Array.from({length:4}).map(()=>'<div class="skeleton-chip skeleton-chip--wide"></div>').join("")}
            </div>
          </article>
        </div>
      </section>
    `;const a=Dt(t),i=Math.max(1,...a.map(d=>d.count)),n=Mt(t),o=Et(t,s);return`
    <section class="dashboard-shell">
      <div class="dashboard-grid">
        <article class="dashboard-card dashboard-card--wide">
          <div class="dashboard-card-header">
            <div>
              <p class="dashboard-kicker">Overview</p>
              <h3>Total tasks by status</h3>
            </div>
            <span class="dashboard-badge">${t.length} total</span>
          </div>
          <div class="dashboard-bars">
            ${a.map(d=>{const p=Math.round(d.count/i*100);return`
                  <div class="dashboard-bar-row">
                    <span class="dashboard-bar-label">${d.label}</span>
                    <div class="dashboard-bar-track">
                      <div class="dashboard-bar-fill status-${d.status}" style="width: ${p}%"></div>
                    </div>
                    <span class="dashboard-bar-count">${d.count}</span>
                  </div>
                `}).join("")}
          </div>
        </article>

        <article class="dashboard-card">
          <div class="dashboard-card-header">
            <div>
              <p class="dashboard-kicker">This week</p>
              <h3>Tasks due this week</h3>
            </div>
            <span class="dashboard-badge">${n.length} due</span>
          </div>
          <div class="dashboard-list">
            ${n.length?n.slice(0,6).map(d=>`
                      <div class="dashboard-list-item">
                        <div>
                          <strong>${d.title}</strong>
                          <span>${_t(d.due_date)}</span>
                        </div>
                        <span class="status-${d.status}">${U[d.status]}</span>
                      </div>
                    `).join(""):'<div class="empty-state empty-state--compact">Nothing is due this week.</div>'}
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
            ${o.length?o.map(d=>{var p;return`
                      <div class="dashboard-list-item dashboard-list-item--assignee">
                        <div class="dashboard-assignee-name">
                          ${d.user?`<span class="filter-avatar" style="background:${d.user.avatar_color||"#3b82f6"}">${d.user.name.split(" ").map(l=>l[0]).slice(0,2).join("").toUpperCase()}</span>`:'<span class="filter-avatar" style="background:#2c2c2c">?</span>'}
                          <strong>${((p=d.user)==null?void 0:p.name)||"Unassigned"}</strong>
                        </div>
                        <span class="dashboard-badge">${d.count}</span>
                      </div>
                    `}).join(""):'<div class="empty-state empty-state--compact">No assignee data yet.</div>'}
          </div>
        </article>
      </div>
    </section>
  `}const v=document.querySelector("#app"),e={users:[],projects:[],allTasks:[],tasks:[],activeTaskId:null,isTaskModalOpen:!1,isTaskModalClosing:!1,activeProjectId:null,sidebarCollapsed:!1,view:"list",filters:{statuses:[],assigneeId:"",priority:"",search:""},selectedUserId:null,isLoadingTasks:!0,isBooting:!0,toasts:[]},O=["backlog","todo","in_progress","in_review","done","cancelled"],N=new Map;let _=null,Ot=0;function Nt(t){const s=O.indexOf(t);return O[(s+1)%O.length]}function Ut(t){return localStorage.getItem(t)==="true"}function Pt(t){if(!(t instanceof HTMLElement))return!1;const s=t.tagName;return s==="INPUT"||s==="TEXTAREA"||s==="SELECT"||t.isContentEditable}function y(t,s="success"){const r=++Ot;e.toasts=[...e.toasts,{id:r,message:t,tone:s}],b();const a=setTimeout(()=>J(r),3e3);N.set(r,a)}function J(t){const s=N.get(t);s&&(clearTimeout(s),N.delete(t)),e.toasts=e.toasts.filter(r=>r.id!==t),b()}function z(t,s=null){if(_&&(clearTimeout(_),_=null),t){e.activeTaskId=s,e.isTaskModalOpen=!0,e.isTaskModalClosing=!1,b();return}!e.isTaskModalOpen&&!e.isTaskModalClosing||(e.isTaskModalClosing=!0,b(),_=setTimeout(()=>{e.isTaskModalOpen=!1,e.isTaskModalClosing=!1,b()},180))}function V(){return e.isTaskModalOpen||e.isTaskModalClosing}function M(t){const s=!e.filters.statuses.length||e.filters.statuses.includes(t.status),r=!e.filters.priority||t.priority===e.filters.priority,a=!e.filters.search||String(t.title||"").toLowerCase().includes(e.filters.search.toLowerCase()),i=!e.filters.assigneeId||String(t.assignee_id)===String(e.filters.assigneeId),n=!e.activeProjectId||String(t.project_id)===String(e.activeProjectId),o=e.view!=="my"||!e.selectedUserId||String(t.assignee_id)===String(e.selectedUserId);return s&&r&&a&&i&&n&&o}function F(t){const s=e.allTasks.filter(r=>String(r.id)!==String(t.id));s.unshift(t),e.allTasks=s,e.tasks=s.filter(M)}function qt(t){e.allTasks=e.allTasks.filter(s=>String(s.id)!==String(t)),e.tasks=e.tasks.filter(s=>String(s.id)!==String(t))}function xt(){const t=v.querySelector('[data-action="filter-search"]');t instanceof HTMLInputElement&&(t.focus(),t.select())}function H(){z(!0,null)}function w(){z(!1)}async function Bt(){return et()}async function Rt(){return tt()}function G(){return e.tasks.find(t=>String(t.id)===String(e.activeTaskId))||null}function Ft(){return e.selectedUserId?e.allTasks.filter(t=>String(t.assignee_id)===String(e.selectedUserId)).length:0}function b(){const t=G(),s=document.createElement("div");s.className=`app-shell ${e.sidebarCollapsed?"sidebar-collapsed":""}`;const r=rt({projects:e.projects,users:e.users,activeProjectId:e.activeProjectId,view:e.view,myTasksCount:Ft(),selectedUserId:e.selectedUserId,collapsed:e.sidebarCollapsed}),a=e.view==="dashboard"?"Dashboard":e.view==="my"?"My Tasks":e.view==="timeline"?"Timeline":"All Tasks",i=e.view==="dashboard"?"Track workload, due dates, and assignments at a glance.":e.activeProjectId?"Showing tasks for the selected project.":"Track work across projects with a Linear-inspired workflow.";s.innerHTML=`
    ${r}
    <main class="main-panel">
      <section class="header-bar">
        <div class="header-title">
          <h2>${a}</h2>
          <p>${i}</p>
        </div>
      </section>

      ${e.view==="dashboard"?"":dt({users:e.users,filters:e.filters,view:e.view,selectedUserId:e.selectedUserId})}

      <section class="content-area" data-content-area>
        ${e.view==="dashboard"?At({tasks:e.allTasks,users:e.users,loading:e.isLoadingTasks}):e.view==="timeline"?It({tasks:e.tasks,users:e.users,projects:e.projects,activeTaskId:e.activeTaskId,loading:e.isLoadingTasks}):mt({tasks:e.tasks,users:e.users,projects:e.projects,activeTaskId:e.activeTaskId,loading:e.isLoadingTasks})}
      </section>
    </main>
    ${kt({task:t,users:e.users,projects:e.projects,open:V(),closing:e.isTaskModalClosing})}
    <div class="toast-stack" aria-live="polite" aria-atomic="true">
      ${e.toasts.map(n=>`
            <div class="toast toast-${n.tone}">
              <span>${n.message}</span>
              <button type="button" class="toast-dismiss" data-action="dismiss-toast" data-toast-id="${n.id}">×</button>
            </div>
          `).join("")}
    </div>
  `,v.innerHTML="",v.appendChild(s),Ht()}function Ht(){v.querySelectorAll('[data-action="dismiss-toast"]').forEach(a=>{a.addEventListener("click",()=>{J(a.dataset.toastId)})}),v.querySelectorAll('[data-action="navigate"]').forEach(a=>{a.addEventListener("click",async()=>{const i=a.dataset.view;e.activeProjectId=null,e.activeTaskId=null,i==="dashboard"?e.view="dashboard":i==="my"?e.view="my":i==="timeline"?e.view="timeline":e.view="list",localStorage.setItem("view",e.view),await h()})}),v.querySelectorAll('[data-action="select-project"]').forEach(a=>{a.addEventListener("click",async()=>{e.activeProjectId=a.dataset.projectId,e.view="list",e.activeTaskId=null,await h()})}),v.querySelectorAll('[data-action="set-view"]').forEach(a=>{a.addEventListener("click",async()=>{e.view=a.dataset.view,e.view!=="my"&&(e.activeProjectId=null),localStorage.setItem("view",e.view),await h()})}),v.querySelectorAll('[data-action="toggle-status"]').forEach(a=>{a.addEventListener("click",async i=>{const n=a.dataset.status;i.preventDefault(),n&&(e.filters.statuses=e.filters.statuses.includes(n)?e.filters.statuses.filter(o=>o!==n):[...e.filters.statuses,n],await h())})}),v.querySelectorAll('[data-action="filter-assignee"]').forEach(a=>{a.addEventListener("click",async()=>{e.filters.assigneeId=a.dataset.userId||"",Wt(),await h()})}),v.querySelectorAll('[data-action="filter-priority"]').forEach(a=>{a.addEventListener("change",async i=>{e.filters.priority=i.target.value,await h()})}),v.querySelectorAll('[data-action="filter-search"]').forEach(a=>{a.addEventListener("input",async i=>{e.filters.search=i.target.value,await h()})}),v.querySelectorAll('[data-action="clear-filters"]').forEach(a=>{a.addEventListener("click",async()=>{e.filters={statuses:[],assigneeId:"",priority:"",search:""},await h()})}),v.querySelectorAll('[data-action="toggle-filter-menu"]').forEach(a=>{a.addEventListener("click",()=>{const i=v.querySelector("[data-filter-menu]");i&&i.classList.toggle("is-open")})}),v.querySelectorAll('[data-action="open-task"]').forEach(a=>{const i=()=>{e.activeTaskId=a.dataset.taskId,e.isTaskModalOpen=!0,b()};a.addEventListener("click",i),a.addEventListener("keydown",n=>{(n.key==="Enter"||n.key===" ")&&(n.preventDefault(),i())})}),v.querySelectorAll('[data-action="new-task"]').forEach(a=>{a.addEventListener("click",()=>{H()})}),v.querySelectorAll('[data-action="switch-user"]').forEach(a=>{a.addEventListener("click",async()=>{e.selectedUserId=a.dataset.userId,localStorage.setItem("selectedUserId",e.selectedUserId),e.view==="my"||e.view==="dashboard"?await h():b()})}),v.querySelectorAll('[data-action="toggle-sidebar-collapse"]').forEach(a=>{a.addEventListener("click",()=>{e.sidebarCollapsed=!e.sidebarCollapsed,localStorage.setItem("sidebarCollapsed",String(e.sidebarCollapsed)),b()})}),v.querySelectorAll('[data-action="cycle-status"]').forEach(a=>{a.addEventListener("click",async i=>{i.stopPropagation();const n=a.dataset.taskId,o=e.tasks.find(u=>String(u.id)===String(n));if(!o)return;const d=Nt(o.status),p={allTasks:[...e.allTasks],tasks:[...e.tasks]},l={...o,status:d};F(l),b();try{await x(o.id,{title:o.title,description:o.description,project_id:o.project_id,assignee_id:o.assignee_id,status:d,priority:o.priority,start_date:o.start_date,due_date:o.due_date}),y("Task status updated")}catch{e.allTasks=p.allTasks,e.tasks=p.tasks,y("Could not update task status","error")}await h({showLoading:!1})})});const t=v.querySelector("[data-task-form]");t&&t.addEventListener("submit",async a=>{a.preventDefault();const i={allTasks:[...e.allTasks],tasks:[...e.tasks]},n=new FormData(t),o={title:n.get("title"),description:n.get("description"),project_id:n.get("project_id")||null,assignee_id:n.get("assignee_id")||null,status:n.get("status"),priority:n.get("priority"),start_date:n.get("start_date")||null,due_date:n.get("due_date")||null},d=n.get("id");if(d){const p={...i.allTasks.find(l=>String(l.id)===String(d)),...o};F(p),w(),b();try{await x(d,o),y("Task updated")}catch{e.allTasks=i.allTasks,e.tasks=i.tasks,y("Could not update task","error")}}else{const p=`temp-${Date.now()}`,l={id:p,project_id:o.project_id,title:o.title,description:o.description,status:o.status||"todo",priority:o.priority||"medium",assignee_id:o.assignee_id,start_date:o.start_date,due_date:o.due_date,created_at:new Date().toISOString(),updated_at:new Date().toISOString()};e.allTasks=[l,...e.allTasks],e.tasks=e.allTasks.filter(M),e.activeTaskId=p,w(),b();try{const u=await st(o);e.allTasks=e.allTasks.map(k=>String(k.id)===p?u:k),e.tasks=e.allTasks.filter(M),e.activeTaskId=u.id,y("Task created")}catch{e.allTasks=i.allTasks,e.tasks=i.tasks,y("Could not create task","error")}}await h({showLoading:!1})});const s=v.querySelector('[data-action="delete-task"]');s&&s.addEventListener("click",async()=>{if(!e.activeTaskId)return;const a={allTasks:[...e.allTasks],tasks:[...e.tasks]},i=e.activeTaskId;qt(i),e.activeTaskId=null,w(),b();try{await at(i),y("Task deleted")}catch{e.allTasks=a.allTasks,e.tasks=a.tasks,y("Could not delete task","error")}await h({showLoading:!1})}),v.querySelectorAll('[data-action="close-modal"]').forEach(a=>{a.addEventListener("click",()=>{w()})});const r=v.querySelector(".task-modal-backdrop");r&&r.addEventListener("click",()=>{w()}),window.onkeydown=a=>{if(a.key==="Escape"){V()&&w();const i=v.querySelector("[data-filter-menu]");i!=null&&i.classList.contains("is-open")&&i.classList.remove("is-open");return}if(!Pt(a.target)){if(a.key==="/"){a.preventDefault(),xt();return}a.key.toLowerCase()==="c"&&(a.preventDefault(),H())}}}function Wt(){const t=v.querySelector("[data-filter-menu]");t&&t.classList.remove("is-open")}async function h({showLoading:t=!0}={}){var s;t&&(e.isLoadingTasks=!0,b()),e.allTasks=await Rt(),e.tasks=e.allTasks.filter(M),e.activeTaskId&&!G()&&(e.activeTaskId=((s=e.tasks[0])==null?void 0:s.id)||null),e.isLoadingTasks=!1,b()}async function Yt(){var r,a;const[t,s]=await Promise.all([it(),Bt()]);e.users=t,e.projects=s,e.selectedUserId=localStorage.getItem("selectedUserId")||((r=t[0])==null?void 0:r.id)||null,e.sidebarCollapsed=Ut("sidebarCollapsed"),e.view=localStorage.getItem("view")||"list",t.some(i=>String(i.id)===String(e.selectedUserId))||(e.selectedUserId=((a=t[0])==null?void 0:a.id)||null),e.selectedUserId&&localStorage.setItem("selectedUserId",e.selectedUserId),localStorage.setItem("view",e.view),e.isBooting=!1,await h({showLoading:!0})}Yt().catch(t=>{v.innerHTML=`<pre class="empty-state">${t.message}</pre>`});
