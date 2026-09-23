

let __activeBookingId = null;
let __currentFilter = 'all';

function statusBadgeAdmin(status){
  const map = {
    Pending: ['pending', '<span class="pulse-beacon" style="width:11px;height:11px;display:inline-flex;margin-right:2px;"><span class="beacon-ring"></span><span class="beacon-dot" style="width:7px;height:7px;"></span></span>'],
    Approved: ['approved', '<span class="status-dot"></span>'],
    Rejected: ['rejected', '<span class="status-dot"></span>']
  };
  const [cls, icon] = map[status] || ['pending', '<span class="status-dot"></span>'];
  return `<span class="status ${cls}">${icon} ${status}</span>`;
}

async function renderStats(){
  const s = await getAdminStats();
  const set = (id, val, decimals, suffix) => {
    const el = document.getElementById(id);
    el.dataset.count = val;
    if(decimals) el.dataset.decimals = decimals;
    if(suffix) el.dataset.suffix = suffix;
  };
  set('stat-total', s.total);
  set('stat-pending', s.pending);
  set('stat-approved', s.approved);
  set('stat-rejected', s.rejected);
  set('stat-travelers', s.travelers);
  set('stat-revenue', s.revenue, 0, '');
  initCounters();
  // Prefix revenue with $ after animation kicks in
  const revEl = document.getElementById('stat-revenue');
  const dur = 1500;
  setTimeout(()=>{ revEl.textContent = '$' + revEl.textContent; }, dur + 50);
}

let __allBookingsCache = [];

async function renderBookingsTable(){
  __allBookingsCache = await getAllBookings();
  const filtered = __currentFilter==='all' ? __allBookingsCache : __allBookingsCache.filter(b=>b.status===__currentFilter);
  const tbody = document.getElementById('bookings-tbody');

  if(!filtered.length){
    tbody.innerHTML = `<tr><td colspan="11" style="text-align:center; padding:40px; color:rgba(255,255,255,.5);">No bookings found.</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.map(b=>`
    <tr>
      <td>${b.reference}</td>
      <td>${b.travelerName}</td>
      <td>${b.travelerEmail}</td>
      <td>${b.tourName}</td>
      <td>${b.travelDate}</td>
      <td>${b.travelers}</td>
      <td>${fmtMoney(b.pricePerPerson)}</td>
      <td><strong>${fmtMoney(b.totalPrice)}</strong></td>
      <td>${new Date(b.createdAt).toLocaleDateString()}</td>
      <td>${statusBadgeAdmin(b.status)}</td>
      <td>
        <div class="row-actions">
          <button class="icon-btn" title="View" onclick="openDetailModal('${b.id}')">👁</button>
          ${b.status==='Pending' ? `
            <button class="icon-btn" title="Approve" onclick="approveBookingAction('${b.id}')">✔</button>
            <button class="icon-btn" title="Reject" onclick="openRejectModal('${b.id}')">✕</button>` : ''}
        </div>
      </td>
    </tr>`).join('');
}

function openDetailModal(id){
  __activeBookingId = id;
  const b = __allBookingsCache.find(x=>x.id===id);
  if(!b) return;
  const body = document.getElementById('detail-body');
  body.innerHTML = `
    <button class="modal-close" onclick="closeModal('detail-modal')">✕</button>
    <div class="eyebrow" style="color:#67e8f9;">Booking Details</div>
    <h3 style="color:#fff;">${b.reference}</h3>
    <div class="detail-grid">
      <div><div class="lbl">Full Name</div><div class="val">${b.travelerName}</div></div>
      <div><div class="lbl">Email</div><div class="val">${b.travelerEmail}</div></div>
      <div><div class="lbl">Tour Name</div><div class="val">${b.tourName}</div></div>
      <div><div class="lbl">Destination</div><div class="val">${b.location}</div></div>
      <div><div class="lbl">Travel Date</div><div class="val">${b.travelDate}</div></div>
      <div><div class="lbl">Number of Travelers</div><div class="val">${b.travelers}</div></div>
      <div><div class="lbl">Price Per Person</div><div class="val">${fmtMoney(b.pricePerPerson)}</div></div>
      <div><div class="lbl">Total Price</div><div class="val">${fmtMoney(b.totalPrice)}</div></div>
      <div><div class="lbl">Booking Date</div><div class="val">${new Date(b.createdAt).toLocaleString()}</div></div>
      <div><div class="lbl">Current Status</div><div class="val">${statusBadgeAdmin(b.status)}</div></div>
    </div>
    ${b.status==='Rejected' && b.rejectionReason ? `<p style="color:#ff8b7b; font-size:.85rem; margin-bottom:16px;">Rejection reason: ${b.rejectionReason}</p>` : ''}
    ${b.status==='Pending' ? `
      <div style="display:flex; gap:12px;">
        <button class="btn btn-success" style="flex:1;" onclick="approveBookingAction('${b.id}'); closeModal('detail-modal');">Approve Booking</button>
        <button class="btn btn-danger" style="flex:1;" onclick="closeModal('detail-modal'); openRejectModal('${b.id}');">Reject Booking</button>
      </div>` : ''}
  `;
  openModal('detail-modal');
}

async function approveBookingAction(id){
  const result = await updateBookingStatus(id, 'Approved');
  if(!result.ok){
    showToast('Could not approve', result.error || 'Please try again.', 'error');
    return;
  }
  showToast('Booking approved successfully.', 'The traveler will see this update in their dashboard.', 'success');
  refreshAdmin();
}

function openRejectModal(id){
  __activeBookingId = id;
  document.getElementById('reject-reason').value = '';
  openModal('reject-modal');
}

function openModal(id){ document.getElementById(id).classList.add('open'); document.body.style.overflow='hidden'; }
function closeModal(id){ document.getElementById(id).classList.remove('open'); document.body.style.overflow=''; }

let __allToursCache = [];

async function renderToursMgmt(){
  __allToursCache = await getAllToursAdmin();
  const list = document.getElementById('tours-mgmt-list');
  list.innerHTML = __allToursCache.map(t=>`
    <div class="tour-mgmt-card">
      <img src="${t.img}" alt="${t.name}">
      <div class="info">
        <h4>${t.name} ${t.active===false ? '<span class="badge-off">Inactive</span>' : ''}</h4>
        <div style="font-size:.82rem; color:rgba(255,255,255,.6);">${t.location} · ${t.duration} · ${fmtMoney(t.price)} / person</div>
      </div>
      <div class="row-actions">
        <button class="icon-btn" title="Edit" onclick="openTourEditor('${t.id}')">✎</button>
        <button class="icon-btn" title="${t.active===false?'Activate':'Deactivate'}" onclick="toggleTourActive('${t.id}')">${t.active===false?'↺':'🗑'}</button>
      </div>
    </div>`).join('');
}

async function toggleTourActive(id){
  const t = __allToursCache.find(t=>t.id===id);
  if(!t) return;
  const nextActive = !(t.active !== false);
  const result = await setTourActive(id, nextActive);
  if(!result.ok){
    showToast('Update failed', result.error || 'Please try again.', 'error');
    return;
  }
  showToast(nextActive ? 'Tour activated' : 'Tour deactivated', t.name, 'success');
  renderToursMgmt();
}

function openTourEditor(id){
  const form = document.getElementById('tour-form');
  form.reset();
  if(id){
    const t = __allToursCache.find(t=>t.id===id);
    if(!t) return;
    document.getElementById('tour-modal-title').textContent = 'Edit Tour';
    document.getElementById('tf-id').value = t.id;
    document.getElementById('tf-name').value = t.name;
    document.getElementById('tf-destination').value = t.destination;
    document.getElementById('tf-location').value = t.location;
    document.getElementById('tf-duration').value = t.duration;
    document.getElementById('tf-price').value = t.price;
    document.getElementById('tf-desc').value = t.description;
    document.getElementById('tf-img').value = t.img || '';
    document.getElementById('tf-dates').value = (t.dates||[]).join(', ');
  } else {
    document.getElementById('tour-modal-title').textContent = 'Add Tour';
    document.getElementById('tf-id').value = '';
  }
  openModal('tour-modal');
}

async function refreshAdmin(){
  await Promise.all([renderStats(), renderBookingsTable(), renderToursMgmt()]);
}

document.addEventListener('DOMContentLoaded', async ()=>{
  const admin = await requireAdmin();
  if(!admin) return;
  document.getElementById('admin-name').textContent = admin.fullName;

  refreshAdmin();

  document.getElementById('admin-logout').addEventListener('click', async ()=>{
    await logoutUser();
    window.location.href = 'admin-login.html';
  });

  document.getElementById('status-filter').addEventListener('change', (e)=>{
    __currentFilter = e.target.value;
    renderBookingsTable();
  });

  document.getElementById('reject-cancel').addEventListener('click', ()=>closeModal('reject-modal'));
  document.getElementById('reject-confirm').addEventListener('click', async ()=>{
    const reason = document.getElementById('reject-reason').value.trim();
    const result = await updateBookingStatus(__activeBookingId, 'Rejected', reason);
    closeModal('reject-modal');
    if(!result.ok){
      showToast('Could not reject', result.error || 'Please try again.', 'error');
      return;
    }
    showToast('Booking rejected', 'The traveler has been notified of the rejection.', 'error');
    refreshAdmin();
  });

  document.getElementById('add-tour-btn').addEventListener('click', ()=>openTourEditor(null));
  document.getElementById('tour-cancel').addEventListener('click', ()=>closeModal('tour-modal'));

  document.getElementById('tour-form').addEventListener('submit', async (e)=>{
    e.preventDefault();
    const id = document.getElementById('tf-id').value;
    const isNew = !id;
    const existing = !isNew ? __allToursCache.find(t=>t.id===id) : null;

    const tour = {
      id: id || undefined,
      name: document.getElementById('tf-name').value.trim(),
      destination: document.getElementById('tf-destination').value.trim(),
      location: document.getElementById('tf-location').value.trim(),
      duration: document.getElementById('tf-duration').value.trim(),
      price: parseFloat(document.getElementById('tf-price').value),
      description: document.getElementById('tf-desc').value.trim(),
      img: document.getElementById('tf-img').value.trim(),
      dates: document.getElementById('tf-dates').value.split(',').map(s=>s.trim()).filter(Boolean),
      gallery: existing ? existing.gallery : [document.getElementById('tf-img').value.trim()].filter(Boolean),
      itinerary: existing ? existing.itinerary : [{day:'Day 1', text:'Details to be announced.'}],
      included: existing ? existing.included : ['Accommodation','Breakfast','Transfers'],
      excluded: existing ? existing.excluded : ['Flights','Insurance'],
      rating: existing ? existing.rating : 4.8
    };

    const submitBtn = document.querySelector('#tour-form button[type="submit"]');
    submitBtn.disabled = true; submitBtn.textContent = 'Saving…';
    const result = await saveTour(tour, isNew);
    submitBtn.disabled = false; submitBtn.textContent = 'Save Tour';

    if(!result.ok){
      showToast('Could not save tour', result.error || 'Please check the form and try again.', 'error');
      return;
    }
    closeModal('tour-modal');
    showToast('Tour saved', tour.name + ' has been updated.', 'success');
    renderToursMgmt();
  });

  // close modals on backdrop click
  document.querySelectorAll('.modal-backdrop').forEach(m=>{
    m.addEventListener('click', (e)=>{ if(e.target===m) closeModal(m.id); });
  });
});
