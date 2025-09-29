(() => {
  const $ = (sel) => document.querySelector(sel);
  const listEl = $('#todo-list');
  const inputEl = $('#todo-input');
  const formEl = $('#todo-form');
  const countEl = $('#count');
  const clearBtn = $('#clear-completed');
  const filterBtns = document.querySelectorAll('.filters button');

  const STORAGE_KEY = 'todo-list.v1';
  let todos = load();
  let filter = 'all'; // 'all' | 'active' | 'completed'

  function load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
    catch { return []; }
  }
  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
  }

  function addTodo(title) {
    todos.push({ id: crypto.randomUUID(), title: title.trim(), completed: false });
    save(); render();
  }
  function toggle(id) {
    const t = todos.find(x => x.id === id);
    if (t) { t.completed = !t.completed; save(); render(); }
  }
  function destroy(id) {
    todos = todos.filter(t => t.id !== id);
    save(); render();
  }
  function clearCompleted() {
    todos = todos.filter(t => !t.completed);
    save(); render();
  }
  function setFilter(next) {
    filter = next;
    filterBtns.forEach(btn => {
      const active = btn.dataset.filter === filter;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-selected', String(active));
    });
    render();
  }

  function filtered() {
    if (filter === 'active') return todos.filter(t => !t.completed);
    if (filter === 'completed') return todos.filter(t => t.completed);
    return todos;
  }

  function render() {
    listEl.innerHTML = '';
    for (const t of filtered()) {
      const li = document.createElement('li');
      li.className = `todo${t.completed ? ' completed' : ''}`;
      li.innerHTML = `
        <input type="checkbox" ${t.completed ? 'checked' : ''} aria-label="Toggle ${t.title}">
        <label>${escapeHtml(t.title)}</label>
        <button class="destroy" aria-label="Delete ${t.title}">✕</button>
      `;
      const [checkbox,, delBtn] = li.children;
      checkbox.addEventListener('change', () => toggle(t.id));
      delBtn.addEventListener('click', () => destroy(t.id));
      listEl.appendChild(li);
    }
    const left = todos.filter(t => !t.completed).length;
    countEl.textContent = `${left} item${left === 1 ? '' : 's'} left`;
  }

  function escapeHtml(s) {
    return s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // events
  formEl.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = inputEl.value.trim();
    if (val) addTodo(val);
    inputEl.value = '';
    inputEl.focus();
  });

  clearBtn.addEventListener('click', clearCompleted);
  filterBtns.forEach(btn => btn.addEventListener('click', () => setFilter(btn.dataset.filter)));

  // init
  render();
})();
