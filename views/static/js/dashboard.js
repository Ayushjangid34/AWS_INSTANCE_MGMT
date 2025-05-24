let actionMenuVisible = false;

document.addEventListener('DOMContentLoaded', () => {
  const instancesBody = document.getElementById('instancesBody');
  const selectAll = document.getElementById('selectAll');
  const actionBtn = document.getElementById('actionBtn');
  const connectBtn = document.getElementById('connectBtn');
  const actionMenu = document.getElementById('actionMenu');

  // Load and render instances
  loadInstances();

  // Toggle action dropdown
  if (actionBtn) {
    actionBtn.addEventListener('click', () => {
      if (!actionBtn.classList.contains('disabled')) {
        actionMenu.classList.toggle('show');
      }
    });
  }

  // Close dropdown when clicking outside
  window.addEventListener('click', e => {
    if (!e.target.closest('.action-dropdown')) {
      actionMenu.classList.remove('show');
    }
  });

  // Connect button
  if (connectBtn) {
    connectBtn.addEventListener('click', () => {
      if (!connectBtn.classList.contains('disabled')) {
        connectToInstance();
      }
    });
  }

  // Helper to wire up checkboxes and update button states
  function wireCheckboxes() {
    const checkboxes = Array.from(document.querySelectorAll('.instance-checkbox'));
    function updateButtons() {
      const checked = checkboxes.filter(cb => cb.checked);
      if (checked.length) actionBtn.classList.remove('disabled');
      else actionBtn.classList.add('disabled');
      if (checked.length === 1) connectBtn.classList.remove('disabled');
      else connectBtn.classList.add('disabled');
      if (!checked.length) actionMenu.classList.remove('show');
    }
    checkboxes.forEach(cb => cb.addEventListener('change', updateButtons));
    if (selectAll) {
      selectAll.addEventListener('change', () => {
        checkboxes.forEach(cb => cb.checked = selectAll.checked);
        updateButtons();
      });
    }
    updateButtons();
  }

  // Load instances from backend and render table
  async function loadInstances() {
    try {
      const res = await fetch('/user/getInstDetails');
      const { instances } = await res.json();
      instancesBody.innerHTML = '';
      if (!instances || !instances.length) {
        showEmptyRow();
        return;
      }
      instances.forEach(inst => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><input type="checkbox" class="instance-checkbox" data-id="${inst.instanceId}"></td>
          <td>${inst.instanceName}</td>
          <td>${inst.instanceId}</td>
          <td><span class="status ${inst.status.toLowerCase()}">${capitalize(inst.status)}</span></td>
          <td>${inst.type}</td>
          <td>${inst.securityGroup}</td>
          <td>${inst.launchTime ? new Date(inst.launchTime).toLocaleString() : ''}</td>
          <td>${inst.os}</td>
        `;
        instancesBody.appendChild(tr);
      });
      wireCheckboxes();
    } catch (e) {
      showEmptyRow();
      showErrorToast('Failed to load instances');
    }
  }

  function showEmptyRow() {
    instancesBody.innerHTML = `<tr class="empty-row"><td colspan="8" class="no-instances-msg">No EC2 instances!</td></tr>`;
    if (selectAll) selectAll.checked = false;
    if (actionBtn) actionBtn.classList.add('disabled');
    if (connectBtn) connectBtn.classList.add('disabled');
    actionMenu.classList.remove('show');
  }

  // Capitalize helper
  function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  // Connect to a single instance
  function connectToInstance() {
    const checked = document.querySelectorAll('.instance-checkbox:checked');
    if (checked.length !== 1) return;
    const id = checked[0].dataset.id;
    window.open(`/user/terminal/${id}`, '_blank');
  }

  // Expose performAction globally for HTML inline onclick
  window.performAction = async function(action) {
    const selected = Array.from(document.querySelectorAll('.instance-checkbox:checked')).map(cb => cb.dataset.id);
    if (!selected.length) return;
    try {
      const res = await fetch(`/user/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, instanceIds: selected })
      });
      const result = await res.json();
      if (res.ok) showSuccessToast(result.message || `${capitalize(action)} successful`);
      else showErrorToast(result.message || `${capitalize(action)} failed`);
    } catch (err) {
      showErrorToast(`${capitalize(action)} error`);
    } finally {
      loadInstances();
    }
  };
});