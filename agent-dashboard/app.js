const state = {
  agents: [],
  tasks: [],
  activities: []
};

async function fetchState() {
  try {
    const res = await fetch('/api/state');
    if (!res.ok) return;
    const data = await res.json();
    state.agents = data.agents || [];
    state.tasks = data.tasks || [];
    state.activities = data.activities || [];
    render();
  } catch (e) {
    console.error('fetch error', e);
  }
}

function renderAgents() {
  const container = document.getElementById('agents');
  container.innerHTML = '';
  const inProgress = state.tasks.filter(t => t.status === 'in-progress');
  const todo = state.tasks.filter(t => t.status === 'todo');
  state.agents.forEach(agent => {
    const card = document.createElement('div');
    card.className = 'agent-card';

    const avatar = document.createElement('div');
    avatar.className = 'agent-avatar';
    avatar.style.background = agent.color || '#fee2e2';
    avatar.textContent = agent.emoji || '⚙️';

    const info = document.createElement('div');
    info.className = 'agent-info';

    const nameEl = document.createElement('h3');
    nameEl.textContent = agent.name;

    const roleEl = document.createElement('div');
    roleEl.className = 'agent-role';
    roleEl.textContent = agent.role;

    const statusEl = document.createElement('p');
    statusEl.className = 'agent-status';
    const dot = document.createElement('span');
    dot.className = 'agent-dot';

    const textSpan = document.createElement('span');

    const agentInProgress = inProgress.filter(t => t.agentId === agent.id);
    const agentTodo = todo.filter(t => t.agentId === agent.id);

    if (agentInProgress.length > 0) {
      statusEl.classList.add('busy');
      const current = agentInProgress[0];
      textSpan.textContent = `Lagi ngerjain: ${current.title}`;
      card.classList.add('active');
    } else if (agentTodo.length > 0) {
      statusEl.classList.add('idle');
      textSpan.textContent = `Nunggu ${agentTodo.length} task di To Do`;
    } else {
      statusEl.classList.add('idle');
      textSpan.textContent = agent.statusText || 'Siap ngerjain task berikutnya';
    }

    statusEl.appendChild(dot);
    statusEl.appendChild(textSpan);

    info.appendChild(nameEl);
    info.appendChild(roleEl);
    info.appendChild(statusEl);

    card.appendChild(avatar);
    card.appendChild(info);
    container.appendChild(card);
  });
}

function renderAssignForm() {
  const select = document.getElementById('agent-select');
  select.innerHTML = '';
  state.agents.forEach(agent => {
    const opt = document.createElement('option');
    opt.value = agent.id;
    opt.textContent = `${agent.name} (${agent.role})`;
    select.appendChild(opt);
  });
}

function renderTasks() {
  const statuses = ['todo', 'in-progress', 'done'];
  statuses.forEach(status => {
    const container = document.getElementById(`tasks-${status}`);
    container.innerHTML = '';
    const tasks = state.tasks.filter(t => t.status === status);
    document.getElementById(`count-${status}`).textContent = tasks.length;

    tasks.forEach(task => {
      const card = document.createElement('div');
      card.className = 'task-card';

      const title = document.createElement('p');
      title.className = 'task-title';
      title.textContent = task.title;

      const meta = document.createElement('div');
      meta.className = 'task-meta';

      const left = document.createElement('span');
      const agent = state.agents.find(a => a.id === task.agentId);
      left.textContent = agent ? agent.name : task.agentId;

      const right = document.createElement('span');
      right.className = 'task-actions';

      if (status !== 'todo') {
        const btnTodo = document.createElement('button');
        btnTodo.textContent = 'To Do';
        btnTodo.onclick = () => updateTaskStatus(task.id, 'todo');
        right.appendChild(btnTodo);
      }

      if (status !== 'in-progress') {
        const btnInProgress = document.createElement('button');
        btnInProgress.textContent = 'In Progress';
        btnInProgress.onclick = () => updateTaskStatus(task.id, 'in-progress');
        right.appendChild(btnInProgress);
      }

      if (status !== 'done') {
        const btnDone = document.createElement('button');
        btnDone.textContent = 'Done';
        btnDone.onclick = () => updateTaskStatus(task.id, 'done');
        right.appendChild(btnDone);
      }

      meta.appendChild(left);
      meta.appendChild(right);

      card.appendChild(title);
      card.appendChild(meta);
      container.appendChild(card);
    });
  });
}

function renderActivities() {
  const list = document.getElementById('activity-list');
  list.innerHTML = '';
  state.activities.slice(0, 50).forEach(item => {
    const li = document.createElement('li');
    li.className = 'activity-item';

    const time = document.createElement('span');
    time.className = 'activity-time';
    const date = new Date(item.time);
    if (!isNaN(date)) {
      const hh = String(date.getHours()).padStart(2, '0');
      const mm = String(date.getMinutes()).padStart(2, '0');
      time.textContent = `[${hh}:${mm}]`;
    } else {
      time.textContent = '[--:--]';
    }

    const text = document.createElement('span');
    text.className = 'activity-text';
    text.textContent = item.text;

    li.appendChild(time);
    li.appendChild(text);
    list.appendChild(li);
  });
}

function render() {
  renderAgents();
  renderAssignForm();
  renderTasks();
  renderActivities();
}

function updateWorkflowStatus() {
  const now = new Date();
  const hh = now.getHours();
  const mm = now.getMinutes();
  const currentMinutes = hh * 60 + mm;

  const cards = document.querySelectorAll('.workflow-card');
  cards.forEach(card => {
    const startStr = card.getAttribute('data-start');
    const endStr = card.getAttribute('data-end');
    const slot = card.getAttribute('data-slot');
    const statusEl = document.getElementById(`workflow-status-${slot}`);
    if (!startStr || !endStr || !statusEl) return;

    const [sh, sm] = startStr.split(':').map(Number);
    const [eh, em] = endStr.split(':').map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;

    let statusClass = 'upcoming';
    let label = 'Upcoming';

    if (currentMinutes >= endMin) {
      statusClass = 'done';
      label = 'Done';
    } else if (currentMinutes >= startMin && currentMinutes < endMin) {
      statusClass = 'active';
      label = 'Now';
    }

    statusEl.classList.remove('upcoming', 'active', 'done');
    statusEl.classList.add(statusClass);
    statusEl.textContent = label;

    card.classList.toggle('active', statusClass === 'active');
  });
}

function updatePipeline() {
  const now = new Date();
  const hh = now.getHours();
  const mm = now.getMinutes();
  const currentMinutes = hh * 60 + mm;

  const trackStart = 7 * 60;  // 07:00
  const trackEnd = 23 * 60;   // 23:00
  let pct = 0;

  if (currentMinutes <= trackStart) {
    pct = 0;
  } else if (currentMinutes >= trackEnd) {
    pct = 100;
  } else {
    pct = ((currentMinutes - trackStart) / (trackEnd - trackStart)) * 100;
  }

  const fill = document.getElementById('pipeline-fill');
  if (fill) {
    fill.style.width = `${pct}%`;
  }
}

async function createTask(title, agentId) {
  await fetch('/api/task', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title, agentId })
  });
  await fetchState();
}

async function updateTaskStatus(id, status) {
  await fetch('/api/task/status', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status })
  });
  await fetchState();
}

function setupForm() {
  const form = document.getElementById('task-form');
  const input = document.getElementById('task-input');
  const select = document.getElementById('agent-select');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = input.value.trim();
    const agentId = select.value;
    if (!title || !agentId) return;
    await createTask(title, agentId);
    input.value = '';
  });
}

window.addEventListener('DOMContentLoaded', () => {
  setupForm();
  fetchState();
  setInterval(fetchState, 5000);
  updateWorkflowStatus();
  updatePipeline();
  setInterval(() => {
    updateWorkflowStatus();
    updatePipeline();
  }, 60000);
});
