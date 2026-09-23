

let __bookingState = { tour:null, travelers:1, date:null };

function buildBookingModal(){
  if(document.getElementById('booking-modal')) return;
  const wrap = document.createElement('div');
  wrap.id = 'booking-modal';
  wrap.className = 'modal-backdrop';
  wrap.innerHTML = `
    <div class="booking-shell glass">
      <button class="modal-close" id="booking-close" aria-label="Close booking">✕</button>
      <div class="booking-shell-inner" id="booking-inner"></div>
    </div>`;
  document.body.appendChild(wrap);
  wrap.addEventListener('click', (e)=>{ if(e.target===wrap) closeBookingModal(); });
  document.getElementById('booking-close').addEventListener('click', closeBookingModal);
  document.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeBookingModal(); });
}

async function openBookingModal(tourId){
  const user = await currentUser();
  if(!user){
    showToast('Login required', 'Please log in or create an account to book this adventure.', 'error');
    setTimeout(()=>{ window.location.href = 'login.html?tour='+encodeURIComponent(tourId); }, 900);
    return;
  }

  const tour = await getTourById(tourId);
  if(!tour){
    showToast('Tour unavailable', 'This tour could not be loaded. Please try again.', 'error');
    return;
  }

  buildBookingModal();
  __bookingState = { tour, travelers:2, date: tour.dates[0] };
  renderBookingForm();
  document.getElementById('booking-modal').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeBookingModal(){
  const modal = document.getElementById('booking-modal');
  if(!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

function renderBookingForm(){
  const { tour, travelers, date } = __bookingState;
  const pricing = calcPrice(tour, travelers);
  const shell = document.querySelector('.booking-shell');
  shell.style.backgroundImage = `linear-gradient(120deg, rgba(5,12,28,.85), rgba(10,28,58,.82)), url('${tour.img}')`;

  const inner = document.getElementById('booking-inner');
  inner.innerHTML = `
    <div>
      <div class="eyebrow" style="color:#67e8f9">Book Your Adventure</div>
      <h2 style="color:#fff; margin-bottom:22px;">${tour.name}</h2>

      <div class="form-group">
        <label style="color:#fff;">Selected Tour</label>
        <div class="form-control" style="background:rgba(255,255,255,.08); border-color:rgba(255,255,255,.25); color:#fff; display:flex; justify-content:space-between;">
          <span>${tour.location}</span><span>${tour.duration}</span>
        </div>
      </div>

      <div class="form-group">
        <label style="color:#fff;">Travel Date</label>
        <select id="bk-date" class="form-control" style="background:rgba(255,255,255,.08); border-color:rgba(255,255,255,.25); color:#fff;">
          ${tour.dates.map(d=>`<option value="${d}" ${d===date?'selected':''}>${d}</option>`).join('')}
        </select>
      </div>

      <div class="form-group">
        <label style="color:#fff;">Number of Travelers</label>
        <div class="counter">
          <button type="button" id="bk-minus" ${travelers<=1?'disabled':''}>−</button>
          <div class="counter-num" id="bk-count">${travelers}</div>
          <button type="button" id="bk-plus" ${travelers>=10?'disabled':''}>+</button>
          <span style="color:rgba(255,255,255,.65); font-size:.85rem;">${travelers===1?'traveler':'travelers'}</span>
        </div>
      </div>
    </div>

    <div class="summary-card">
      <h3 style="color:#fff; margin-bottom:18px;">Your Trip</h3>
      <div class="price-line"><span>Tour</span><span>${tour.name}</span></div>
      <div class="price-line"><span>Date</span><span id="bk-sum-date">${date}</span></div>
      <div class="price-line"><span>Travelers</span><span id="bk-sum-travelers">${travelers}</span></div>
      <div class="price-line"><span>Price per traveler</span><span>${fmtMoney(tour.price)}</span></div>
      <div class="price-line"><span>Subtotal</span><span id="bk-subtotal">${fmtMoney(pricing.subtotal)}</span></div>
      <div class="price-line"><span>Service fee</span><span id="bk-fee">${fmtMoney(pricing.serviceFee)}</span></div>
      <div class="price-total">
        <span style="color:rgba(255,255,255,.75); font-weight:600;">Total</span>
        <span class="amount" id="bk-total">${fmtMoney(pricing.total)}</span>
      </div>
      <button class="btn btn-primary btn-block" id="bk-confirm" style="margin-top:22px; padding:18px;">Confirm Booking</button>
      <p style="font-size:.75rem; color:rgba(255,255,255,.5); margin-top:12px; text-align:center;">You won't be charged yet. Your booking is sent to our team for approval.</p>
    </div>
  `;

  document.getElementById('bk-minus').addEventListener('click', ()=>changeTravelers(-1));
  document.getElementById('bk-plus').addEventListener('click', ()=>changeTravelers(1));
  document.getElementById('bk-date').addEventListener('change', (e)=>{ __bookingState.date = e.target.value; document.getElementById('bk-sum-date').textContent = e.target.value; });
  document.getElementById('bk-confirm').addEventListener('click', confirmBooking);
}

function changeTravelers(delta){
  const next = __bookingState.travelers + delta;
  if(next < 1 || next > 10) return;
  __bookingState.travelers = next;
  const { tour, travelers } = __bookingState;
  const pricing = calcPrice(tour, travelers);

  document.getElementById('bk-count').textContent = travelers;
  document.getElementById('bk-minus').disabled = travelers<=1;
  document.getElementById('bk-plus').disabled = travelers>=10;
  document.getElementById('bk-sum-travelers').textContent = travelers;
  document.getElementById('bk-subtotal').textContent = fmtMoney(pricing.subtotal);
  document.getElementById('bk-fee').textContent = fmtMoney(pricing.serviceFee);

  const totalEl = document.getElementById('bk-total');
  totalEl.textContent = fmtMoney(pricing.total);
  totalEl.style.transform = 'scale(1.12)';
  setTimeout(()=>{ totalEl.style.transform = 'scale(1)'; }, 220);
}

async function confirmBooking(){
  const { tour, travelers, date } = __bookingState;
  const btn = document.getElementById('bk-confirm');
  btn.disabled = true; btn.textContent = 'Submitting…';

  const result = await createBooking({ tourId: tour.id, travelDate: date, travelers });
  if(!result.ok){
    showToast('Booking failed', result.error, 'error');
    btn.disabled = false; btn.textContent = 'Confirm Booking';
    return;
  }
  renderConfirmation(result.booking);
}

function renderConfirmation(booking){
  const inner = document.getElementById('booking-inner');
  inner.style.gridTemplateColumns = '1fr';
  inner.innerHTML = `
    <div class="confirm-wrap">
      <div class="confirm-check">✓</div>
      <h2 style="color:#fff;">Booking Submitted!</h2>
      <p style="color:rgba(255,255,255,.78); max-width:440px; margin:10px auto 0; font-size:1.02rem;">
        Your adventure has been sent to our travel curators for verification.
      </p>

      <div class="ref-badge">Booking Reference: <b>${booking.reference}</b></div>

      <!-- Outstanding Pending Status Component -->
      <div class="pending-btn-wrap">
        <button type="button" class="btn-pending-status" id="btn-pending-toggle" aria-label="Booking status pending approval">
          <span class="pulse-beacon">
            <span class="beacon-ring"></span>
            <span class="beacon-dot"></span>
          </span>
          <span>Status: Pending Approval</span>
          <span class="status-badge-tag">Reviewing</span>
        </button>

        <div class="pending-helper-card" id="pending-details-panel">
          <span class="helper-icon">⏱️</span>
          <div>
            <strong style="color:#fde047; display:block; margin-bottom:2px;">Our operations team is reviewing your trip</strong>
            <span>We are locking in your dates and local guide availability. Track live updates in your dashboard.</span>
          </div>
        </div>
      </div>

      <!-- Visual Booking Progress Steps -->
      <div class="booking-tracker">
        <div class="tracker-step completed">
          <div class="step-circle">✓</div>
          <div class="step-label">Submitted</div>
        </div>
        <div class="tracker-line active"></div>
        <div class="tracker-step active">
          <div class="step-circle">
            <span class="pulse-beacon">
              <span class="beacon-ring"></span>
              <span class="beacon-dot"></span>
            </span>
          </div>
          <div class="step-label">Under Review</div>
        </div>
        <div class="tracker-line"></div>
        <div class="tracker-step upcoming">
          <div class="step-circle">✈</div>
          <div class="step-label">Confirmed</div>
        </div>
      </div>

      <div class="hero-btns" style="margin-top:28px;">
        <a href="dashboard.html" class="btn btn-primary">View My Bookings →</a>
        <button class="btn btn-ghost" id="bk-close-conf">Continue Exploring</button>
      </div>
    </div>`;

  const toggleBtn = document.getElementById('btn-pending-toggle');
  const helperCard = document.getElementById('pending-details-panel');
  if(toggleBtn && helperCard){
    toggleBtn.addEventListener('click', ()=>{
      const isVisible = helperCard.style.display !== 'none';
      helperCard.style.display = isVisible ? 'none' : 'flex';
    });
  }

  document.getElementById('bk-close-conf').addEventListener('click', closeBookingModal);
}
