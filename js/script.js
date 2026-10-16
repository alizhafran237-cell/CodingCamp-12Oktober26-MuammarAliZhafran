/* ================================================================
   Life Dashboard – script.js
   Vanilla JavaScript, no frameworks, LocalStorage persistence.
   ================================================================ */

/* ── HELPERS ────────────────────────────────────────────────────── */

/** Read a value from LocalStorage (returns null if missing). */
function lsGet(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}

/** Write a value to LocalStorage. */
function lsSet(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

/** Generate a simple unique ID. */
function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

/** Show an element (remove .hidden). */
function show(el) { el.classList.remove('hidden'); }

/** Hide an element (add .hidden). */
function hide(el) { el.classList.add('hidden'); }

/* ================================================================
   1. DATE, TIME & GREETING
   ================================================================ */

const dateEl      = document.getElementById('currentDate');
const timeEl      = document.getElementById('currentTime');
const greetingEl  = document.getElementById('greetingText');
const nameInput   = document.getElementById('nameInput');
const saveNameBtn = document.getElementById('saveNameBtn');

// Load saved name
let userName = lsGet('userName') || '';
if (userName) nameInput.value = userName;

/** Returns greeting prefix based on current hour. */
function getGreeting(hour) {
  if (hour >= 5  && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 21) return 'Good evening';
  return 'Good night';
}

/** Full day names for display. */
const DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
const MONTHS = ['January','February','March','April','May','June',
                'July','August','September','October','November','December'];

/** Update the clock display every second. */
function updateClock() {
  const now   = new Date();
  const hour  = now.getHours();
  const min   = String(now.getMinutes()).padStart(2, '0');
  const sec   = String(now.getSeconds()).padStart(2, '0');
  const ampm  = hour >= 12 ? 'PM' : 'AM';
  const hour12 = String(hour % 12 || 12).padStart(2, '0');

  timeEl.textContent = `${hour12}:${min}:${sec} ${ampm}`;

  const dayName  = DAYS[now.getDay()];
  const monthName = MONTHS[now.getMonth()];
  dateEl.textContent = `${dayName}, ${monthName} ${now.getDate()}, ${now.getFullYear()}`;

  const prefix = getGreeting(hour);
  greetingEl.textContent = userName
    ? `${prefix}, ${userName}! 👋`
    : `${prefix}! 👋`;
}

// Kick off the clock immediately, then every second.
updateClock();
setInterval(updateClock, 1000);

/* Challenge 2: Save custom name */
saveNameBtn.addEventListener('click', () => {
  const trimmed = nameInput.value.trim();
  userName = trimmed;
  lsSet('userName', userName);
  updateClock(); // refresh greeting immediately
});

// Also save when pressing Enter inside the name field
nameInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') saveNameBtn.click();
});

/* ================================================================
   2. FOCUS TIMER (25 minutes)
   ================================================================ */

const TIMER_DURATION = 25 * 60; // 25 minutes in seconds

const timerDisplay  = document.getElementById('timerDisplay');
const timerStartBtn = document.getElementById('timerStartBtn');
const timerStopBtn  = document.getElementById('timerStopBtn');
const timerResetBtn = document.getElementById('timerResetBtn');
const timerStatus   = document.getElementById('timerStatus');

let timerSeconds   = TIMER_DURATION;
let timerInterval  = null;
let timerIsRunning = false;

/** Format seconds into MM:SS string. */
function formatTime(secs) {
  const m = String(Math.floor(secs / 60)).padStart(2, '0');
  const s = String(secs % 60).padStart(2, '0');
  return `${m}:${s}`;
}

/** Render the current timer state to the DOM. */
function renderTimer() {
  timerDisplay.textContent = formatTime(timerSeconds);

  // Update colour class
  timerDisplay.classList.remove('running', 'paused', 'done');
  if (timerSeconds === 0) {
    timerDisplay.classList.add('done');
  } else if (timerIsRunning) {
    timerDisplay.classList.add('running');
  } else if (timerSeconds < TIMER_DURATION) {
    timerDisplay.classList.add('paused');
  }
}

/** Called every second while the timer runs. */
function timerTick() {
  if (timerSeconds > 0) {
    timerSeconds--;
    renderTimer();
  } else {
    // Timer finished
    clearInterval(timerInterval);
    timerIsRunning = false;
    timerStartBtn.disabled = true;
    timerStopBtn.disabled  = true;
    timerStatus.textContent = '🎉 Focus session complete! Great work!';
    renderTimer();
  }
}

timerStartBtn.addEventListener('click', () => {
  if (timerIsRunning || timerSeconds === 0) return;
  timerIsRunning = true;
  timerInterval  = setInterval(timerTick, 1000);
  timerStartBtn.disabled = true;
  timerStopBtn.disabled  = false;
  timerStatus.textContent = '🔥 Focusing… stay on task!';
  renderTimer();
});

timerStopBtn.addEventListener('click', () => {
  if (!timerIsRunning) return;
  clearInterval(timerInterval);
  timerIsRunning = false;
  timerStartBtn.disabled = false;
  timerStopBtn.disabled  = true;
  timerStatus.textContent = '⏸ Paused. Click Start to continue.';
  renderTimer();
});

timerResetBtn.addEventListener('click', () => {
  clearInterval(timerInterval);
  timerIsRunning  = false;
  timerSeconds    = TIMER_DURATION;
  timerStartBtn.disabled = false;
  timerStopBtn.disabled  = true;
  timerStatus.textContent = 'Ready to focus!';
  renderTimer();
});

// Initial render
renderTimer();

/* ================================================================
   3. TO-DO LIST
   ================================================================ */

const taskInput        = document.getElementById('taskInput');
const addTaskBtn       = document.getElementById('addTaskBtn');
const taskList         = document.getElementById('taskList');
const duplicateWarning = document.getElementById('duplicateWarning');
const emptyMessage     = document.getElementById('emptyMessage');
const taskCount        = document.getElementById('taskCount');
const filterBtns       = document.querySelectorAll('.filter-btn');

// Modal elements
const editModal            = document.getElementById('editModal');
const editTaskInput        = document.getElementById('editTaskInput');
const editSaveBtn          = document.getElementById('editSaveBtn');
const editCancelBtn        = document.getElementById('editCancelBtn');
const editDuplicateWarning = document.getElementById('editDuplicateWarning');
const modalBackdrop        = editModal.querySelector('.modal__backdrop');

let tasks = lsGet('tasks') || [];     // Array of { id, text, done }
let activeFilter = 'all';             // 'all' | 'active' | 'done'
let editingTaskId = null;             // ID of the task being edited

/** Save tasks array to LocalStorage. */
function saveTasks() {
  lsSet('tasks', tasks);
}

/** Normalize task text: trim and lowercase for comparison. */
function normalizeText(str) {
  return str.trim().toLowerCase();
}

/**
 * Challenge 3: Check if a task text already exists.
 * @param {string} text  – The text to check.
 * @param {string} excludeId – Optional: skip comparing against this task ID (used during editing).
 */
function isDuplicate(text, excludeId = null) {
  const norm = normalizeText(text);
  return tasks.some(t => normalizeText(t.text) === norm && t.id !== excludeId);
}

/** Build and render the visible task list based on the active filter. */
function renderTasks() {
  taskList.innerHTML = '';

  const filtered = tasks.filter(t => {
    if (activeFilter === 'active') return !t.done;
    if (activeFilter === 'done')   return  t.done;
    return true;
  });

  if (filtered.length === 0) {
    show(emptyMessage);
  } else {
    hide(emptyMessage);
    filtered.forEach(task => {
      const li = document.createElement('li');
      li.className = `task-item${task.done ? ' done' : ''}`;
      li.dataset.id = task.id;

      li.innerHTML = `
        <input
          type="checkbox"
          class="task-checkbox"
          ${task.done ? 'checked' : ''}
          aria-label="Mark task as done"
        />
        <span class="task-text">${escapeHtml(task.text)}</span>
        <div class="task-actions">
          <button class="task-btn task-btn--edit"   aria-label="Edit task">✏️ Edit</button>
          <button class="task-btn task-btn--delete" aria-label="Delete task">🗑️ Delete</button>
        </div>
      `;

      // Checkbox: toggle done
      li.querySelector('.task-checkbox').addEventListener('change', () => {
        toggleTaskDone(task.id);
      });

      // Edit button
      li.querySelector('.task-btn--edit').addEventListener('click', () => {
        openEditModal(task.id);
      });

      // Delete button
      li.querySelector('.task-btn--delete').addEventListener('click', () => {
        deleteTask(task.id);
      });

      taskList.appendChild(li);
    });
  }

  // Update task count
  const total  = tasks.length;
  const done   = tasks.filter(t => t.done).length;
  const active = total - done;
  taskCount.textContent = total > 0
    ? `${active} active · ${done} done · ${total} total`
    : '';
}

/** Safely escape HTML to prevent XSS. */
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/** Add a new task. */
function addTask() {
  const text = taskInput.value.trim();
  if (!text) return;

  // Challenge 3: Duplicate detection
  if (isDuplicate(text)) {
    show(duplicateWarning);
    taskInput.focus();
    setTimeout(() => hide(duplicateWarning), 3000);
    return;
  }

  hide(duplicateWarning);
  tasks.unshift({ id: uid(), text, done: false }); // add at top
  saveTasks();
  renderTasks();
  taskInput.value = '';
  taskInput.focus();
}

addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addTask();
});

// Hide duplicate warning when user starts typing again
taskInput.addEventListener('input', () => hide(duplicateWarning));

/** Toggle a task's done state. */
function toggleTaskDone(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  task.done = !task.done;
  saveTasks();
  renderTasks();
}

/** Delete a task. */
function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  renderTasks();
}

/* ── Edit Modal ─────────────────────────────────────────────────── */

function openEditModal(id) {
  const task = tasks.find(t => t.id === id);
  if (!task) return;
  editingTaskId = id;
  editTaskInput.value = task.text;
  hide(editDuplicateWarning);
  show(editModal);
  editTaskInput.focus();
  editTaskInput.select();
}

function closeEditModal() {
  editingTaskId = null;
  hide(editModal);
  hide(editDuplicateWarning);
}

editSaveBtn.addEventListener('click', () => {
  const newText = editTaskInput.value.trim();
  if (!newText) return;

  // Challenge 3: Duplicate detection (excluding the task being edited)
  if (isDuplicate(newText, editingTaskId)) {
    show(editDuplicateWarning);
    editTaskInput.focus();
    return;
  }

  const task = tasks.find(t => t.id === editingTaskId);
  if (task) {
    task.text = newText;
    saveTasks();
    renderTasks();
  }
  closeEditModal();
});

editCancelBtn.addEventListener('click', closeEditModal);
modalBackdrop.addEventListener('click', closeEditModal);

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !editModal.classList.contains('hidden')) {
    closeEditModal();
  }
});

// Hide edit duplicate warning on input
editTaskInput.addEventListener('input', () => hide(editDuplicateWarning));

/* ── Filter Buttons ─────────────────────────────────────────────── */

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    activeFilter = btn.dataset.filter;
    renderTasks();
  });
});

// Initial render
renderTasks();

/* ================================================================
   4. QUICK LINKS
   ================================================================ */

const linkNameInput = document.getElementById('linkNameInput');
const linkUrlInput  = document.getElementById('linkUrlInput');
const addLinkBtn    = document.getElementById('addLinkBtn');
const linksList     = document.getElementById('linksList');
const linkError     = document.getElementById('linkError');
const emptyLinks    = document.getElementById('emptyLinks');

let links = lsGet('quickLinks') || []; // Array of { id, name, url }

/** Save links to LocalStorage. */
function saveLinks() {
  lsSet('quickLinks', links);
}

/** Basic URL validation. */
function isValidUrl(str) {
  try {
    const url = new URL(str);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Render all quick-link chips. */
function renderLinks() {
  linksList.innerHTML = '';

  if (links.length === 0) {
    show(emptyLinks);
    return;
  }

  hide(emptyLinks);
  links.forEach(link => {
    const chip = document.createElement('a');
    chip.className    = 'link-chip';
    chip.href         = link.url;
    chip.target       = '_blank';
    chip.rel          = 'noopener noreferrer';
    chip.title        = link.url;
    chip.setAttribute('aria-label', `Open ${link.name}`);

    chip.innerHTML = `
      🔗 ${escapeHtml(link.name)}
      <button
        class="link-chip__delete"
        aria-label="Remove ${escapeHtml(link.name)}"
        title="Remove"
      >✕</button>
    `;

    // Delete button — stop propagation so the anchor doesn't fire
    chip.querySelector('.link-chip__delete').addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      deleteLink(link.id);
    });

    linksList.appendChild(chip);
  });
}

/** Add a new quick link. */
function addLink() {
  const name = linkNameInput.value.trim();
  let   url  = linkUrlInput.value.trim();

  // Auto-prepend https:// if missing
  if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  if (!name || !isValidUrl(url)) {
    show(linkError);
    setTimeout(() => hide(linkError), 3000);
    return;
  }

  hide(linkError);
  links.push({ id: uid(), name, url });
  saveLinks();
  renderLinks();
  linkNameInput.value = '';
  linkUrlInput.value  = '';
  linkNameInput.focus();
}

/** Delete a quick link by ID. */
function deleteLink(id) {
  links = links.filter(l => l.id !== id);
  saveLinks();
  renderLinks();
}

addLinkBtn.addEventListener('click', addLink);
linkUrlInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') addLink();
});
linkNameInput.addEventListener('input', () => hide(linkError));
linkUrlInput.addEventListener('input',  () => hide(linkError));

// Initial render
renderLinks();

/* ================================================================
   5. LIGHT / DARK MODE  (Challenge 1)
   ================================================================ */

const themeToggleBtn = document.getElementById('themeToggleBtn');
const htmlEl         = document.documentElement;

// Load saved theme preference
let currentTheme = lsGet('theme') || 'light';
applyTheme(currentTheme);

/** Apply theme to <html> and update button icon. */
function applyTheme(theme) {
  currentTheme = theme;
  htmlEl.setAttribute('data-theme', theme);
  themeToggleBtn.textContent = theme === 'dark' ? '☀️' : '🌙';
  themeToggleBtn.title = theme === 'dark'
    ? 'Switch to light mode'
    : 'Switch to dark mode';
  lsSet('theme', theme);
}

themeToggleBtn.addEventListener('click', () => {
  applyTheme(currentTheme === 'light' ? 'dark' : 'light');
});
