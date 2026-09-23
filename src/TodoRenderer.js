export class TodoRenderer {
  constructor(containerId, service) {
    this.container = document.getElementById(containerId);
    this.service = service;
  }

  buildTaskRow(id, desc, completed, priority, createdAt, showActions) {
    const label = desc.length > 40 ? `${desc.slice(0, 40)}...` : desc;
    const priorityClass = priority === 'high' ? 'priority-high' : '';
    const completedClass = completed ? 'completed' : '';
    const actions = showActions
      ? `<span class="task-actions">
          <button data-toggle="${id}">${completed ? 'Undo' : 'Done'}</button>
          <button data-delete="${id}">Delete</button>
        </span>`
      : '';

    return `<li class="${completedClass}" data-row="${id}">
        <span class="task-desc ${priorityClass}">${label}</span>
        <span class="task-time">${createdAt}</span>
        ${actions}
      </li>`;
  }

  renderPendingRows() {
    let html = '';
    for (const task of this.service.tasks) {
      if (task.completed) continue;
      html += this.buildTaskRow(task.id, task.desc, task.completed, task.priority, task.createdAt, true);
    }
    return html;
  }

  renderCompletedRows() {
    let html = '';
    for (const task of this.service.tasks) {
      if (!task.completed) continue;
      html += this.buildTaskRow(task.id, task.desc, task.completed, task.priority, task.createdAt, true);
    }
    return html;
  }

  render(justAddedId) {
    if (!this.container) return;

    const pendingHtml = this.renderPendingRows();
    const completedHtml = this.renderCompletedRows();

    let oldestPendingLabel = 'none';
    for (const task of this.service.tasks) {
      if (!task.completed) {
        oldestPendingLabel = task.desc;
        break;
      }
    }

    this.container.innerHTML =
      `<p class="status">${this.service.summarizeWorkload()} - oldest: ${oldestPendingLabel}</p>` +
      '<h2 class="section-title">To do</h2>' +
      `<ul>${pendingHtml || '<li>Nothing pending. Add a task above.</li>'}</ul>` +
      '<h2 class="section-title">Completed</h2>' +
      `<ul>${completedHtml || '<li>Nothing completed yet.</li>'}</ul>`;

    this.container.querySelectorAll('[data-toggle]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.service.toggleComplete(Number(btn.dataset.toggle));
        this.render();
      });
    });

    this.container.querySelectorAll('[data-delete]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.service.deleteTask(Number(btn.dataset.delete));
        this.render();
      });
    });

    if (justAddedId) {
      const row = this.container.querySelector(`[data-row="${justAddedId}"]`);
      if (row) {
        row.classList.add('flash');
        setTimeout(() => row.classList.remove('flash'), 1500);
      }
    }

    document.title = `Todo (${this.service.tasks.filter(t => !t.completed).length})`;
  }
}
