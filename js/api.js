
const API_BASE = window.GLOBETREK_API_BASE || (
  (!window.location.hostname || window.location.protocol === 'file:')
    ? 'http://localhost:4000'
    : `${window.location.protocol}//${window.location.hostname}:4000`
);

function normalizeImgUrl(url){
  if(!url) return '';
  return url.startsWith('/') ? url.slice(1) : url;
}

async function apiFetch(path, options = {}) {
  let res;
  try {
    res = await fetch(API_BASE + path, {
      credentials: 'include', 
      headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
      ...options
    });
  } catch (err) {
    
    return { ok: false, error: 'Could not reach the GlobeTrek server. Is the backend running?' , networkError: true };
  }
  let data = null;
  try { data = await res.json(); } catch (e) { /* empty body is fine */ }
  return data || { ok: false, error: 'Unexpected server response.' };
}


const DESTINATIONS = [
  { id:'ella', name:'Ella', desc:'Misty mountains, tea trails and the iconic Nine Arch Bridge.', img:'images/destinations/ella.jpg' },
  { id:'sigiriya', name:'Sigiriya', desc:'Climb the ancient rock fortress rising above the jungle.', img:'images/destinations/sigiriya.jpg' },
  { id:'mirissa', name:'Mirissa', desc:'Golden beaches, whale watching and swaying palms.', img:'images/destinations/mirissa.jpg' },
  { id:'kandy', name:'Kandy', desc:'Sacred temples and the shimmering hills of the highlands.', img:'images/destinations/kandy.jpg' },
  { id:'nuwaraeliya', name:'Nuwara Eliya', desc:'Cool colonial charm amid endless emerald tea estates.', img:'images/destinations/nuwaraeliya.jpg' },
  { id:'galle', name:'Galle', desc:'Cobbled ramparts and ocean views inside a historic fort.', img:'images/destinations/galle.jpg' }
];
function getDestinations(){ return DESTINATIONS; }

const DEFAULT_TOURS = [
  {
    id: 't-ella-adv',
    name: 'Ella Adventure',
    destination: 'Ella',
    location: 'Ella, Sri Lanka',
    description: "Wind through misty tea plantations, walk the Nine Arch Bridge and watch sunrise from Little Adam's Peak on this unforgettable highland escape.",
    duration: '3 Days / 2 Nights',
    price: 250,
    img: 'images/tours/t-ella-adv/cover.jpg',
    gallery: [
      'images/tours/t-ella-adv/gallery-1.jpg',
      'images/tours/t-ella-adv/gallery-2.jpg',
      'images/tours/t-ella-adv/gallery-3.jpg'
    ],
    itinerary: [
      { day: 'Day 1', text: 'Arrival, scenic train ride through tea country, evening at leisure.' },
      { day: 'Day 2', text: "Sunrise hike to Little Adam's Peak, Nine Arch Bridge, waterfall visit." },
      { day: 'Day 3', text: 'Tea factory tour, local breakfast, departure.' }
    ],
    included: ['Accommodation', 'Daily breakfast', 'Guided hikes', 'Train tickets', 'Airport transfers'],
    excluded: ['International flights', 'Travel insurance', 'Personal expenses', 'Lunch & dinner'],
    dates: ['12 Sep 2026', '26 Sep 2026', '10 Oct 2026'],
    reviews: [
      { name: 'Amara P.', text: 'One of the most scenic trips of my life. Everything was seamless.', rating: 5 },
      { name: 'Liam K.', text: 'Guides were fantastic, the bridge at sunrise was magical.', rating: 5 }
    ],
    rating: 4.9,
    active: true
  },
  {
    id: 't-sigiriya-her',
    name: 'Sigiriya Heritage',
    destination: 'Sigiriya',
    location: 'Sigiriya, Sri Lanka',
    description: 'Climb the legendary Lion Rock, explore ancient frescoes and discover the ruins of a 5th-century royal palace above the jungle canopy.',
    duration: '2 Days / 1 Night',
    price: 180,
    img: 'images/tours/t-sigiriya-her/cover.jpg',
    gallery: [
      'images/tours/t-sigiriya-her/gallery-1.jpg',
      'images/tours/t-sigiriya-her/gallery-2.jpg',
      'images/tours/t-sigiriya-her/gallery-3.jpg'
    ],
    itinerary: [
      { day: 'Day 1', text: 'Sigiriya Rock Fortress climb, Water Gardens, evening village dinner.' },
      { day: 'Day 2', text: 'Dambulla Cave Temple, safari option, departure.' }
    ],
    included: ['Accommodation', 'Breakfast', 'Entrance fees', 'Licensed guide', 'Transfers'],
    excluded: ['Flights', 'Insurance', 'Optional safari cost', 'Dinner day 1'],
    dates: ['5 Sep 2026', '19 Sep 2026', '3 Oct 2026'],
    reviews: [
      { name: 'Sofia R.', text: 'Breathtaking views from the top. Well organized trip.', rating: 5 },
      { name: 'Noah T.', text: 'Guide knew so much history, made the ruins come alive.', rating: 4 }
    ],
    rating: 4.8,
    active: true
  },
  {
    id: 't-mirissa-beach',
    name: 'Mirissa Beach Escape',
    destination: 'Mirissa',
    location: 'Mirissa, Sri Lanka',
    description: 'Chase sunrises on golden sand, spot blue whales offshore and unwind at beachfront cafés on this relaxed coastal getaway.',
    duration: '3 Days / 2 Nights',
    price: 220,
    img: 'images/tours/t-mirissa-beach/cover.jpg',
    gallery: [
      'images/tours/t-mirissa-beach/gallery-1.jpg',
      'images/tours/t-mirissa-beach/gallery-2.jpg',
      'images/tours/t-mirissa-beach/gallery-3.jpg'
    ],
    itinerary: [
      { day: 'Day 1', text: 'Beach arrival, sunset at Coconut Tree Hill, dinner on the sand.' },
      { day: 'Day 2', text: 'Early whale watching cruise, afternoon at leisure, surfing lesson.' },
      { day: 'Day 3', text: 'Beach yoga, local market visit, departure.' }
    ],
    included: ['Accommodation', 'Breakfast', 'Whale watching cruise', 'Surf lesson', 'Transfers'],
    excluded: ['Flights', 'Insurance', 'Lunch & dinner (except day 1)'],
    dates: ['8 Sep 2026', '22 Sep 2026', '6 Oct 2026'],
    reviews: [
      { name: 'Elena M.', text: 'Saw two blue whales! Beach was postcard perfect.', rating: 5 },
      { name: 'Kavi S.', text: 'Relaxing and beautifully organized.', rating: 4 }
    ],
    rating: 4.7,
    active: true
  },
  {
    id: 't-kandy-culture',
    name: 'Kandy Cultural Trail',
    destination: 'Kandy',
    location: 'Kandy, Sri Lanka',
    description: 'Visit the sacred Temple of the Tooth, wander botanical gardens and experience a traditional Kandyan dance performance.',
    duration: '2 Days / 1 Night',
    price: 160,
    img: 'images/tours/t-kandy-culture/cover.jpg',
    gallery: [
      'images/tours/t-kandy-culture/gallery-1.jpg',
      'images/tours/t-kandy-culture/gallery-2.jpg',
      'images/tours/t-kandy-culture/gallery-3.jpg'
    ],
    itinerary: [
      { day: 'Day 1', text: 'Temple of the Tooth, Royal Botanical Gardens, evening cultural show.' },
      { day: 'Day 2', text: 'Kandy Lake walk, spice garden visit, departure.' }
    ],
    included: ['Accommodation', 'Breakfast', 'Cultural show tickets', 'Guide', 'Transfers'],
    excluded: ['Flights', 'Insurance', 'Lunch & dinner'],
    dates: ['14 Sep 2026', '28 Sep 2026', '12 Oct 2026'],
    reviews: [
      { name: 'Priya D.', text: 'Loved the dance show, so vibrant and well explained.', rating: 5 }
    ],
    rating: 4.6,
    active: true
  },
  {
    id: 't-nuwara-tea',
    name: 'Nuwara Eliya Tea Trails',
    destination: 'Nuwara Eliya',
    location: 'Nuwara Eliya, Sri Lanka',
    description: 'Stroll through rolling tea estates, sip freshly brewed Ceylon tea and enjoy the cool colonial charm of "Little England".',
    duration: '2 Days / 1 Night',
    price: 190,
    img: 'images/tours/t-nuwara-tea/cover.jpg',
    gallery: [
      'images/tours/t-nuwara-tea/gallery-1.jpg',
      'images/tours/t-nuwara-tea/gallery-2.jpg',
      'images/tours/t-nuwara-tea/gallery-3.jpg'
    ],
    itinerary: [
      { day: 'Day 1', text: 'Tea estate tour and tasting, Lake Gregory walk, colonial town visit.' },
      { day: 'Day 2', text: "Horton Plains sunrise trek to World's End, departure." }
    ],
    included: ['Accommodation', 'Breakfast', 'Tea tasting', 'Trekking guide', 'Transfers'],
    excluded: ['Flights', 'Insurance', 'Lunch & dinner'],
    dates: ['9 Sep 2026', '23 Sep 2026', '7 Oct 2026'],
    reviews: [
      { name: 'Marcus B.', text: "World's End at sunrise was unreal. Highly recommend.", rating: 5 }
    ],
    rating: 4.8,
    active: true
  },
  {
    id: 't-galle-fort',
    name: 'Galle Fort Getaway',
    destination: 'Galle',
    location: 'Galle, Sri Lanka',
    description: 'Wander cobbled streets inside a 17th-century Dutch fort, watch the sunset on the ramparts and browse boutique galleries.',
    duration: '2 Days / 1 Night',
    price: 170,
    img: 'images/tours/t-galle-fort/cover.jpg',
    gallery: [
      'images/tours/t-galle-fort/gallery-1.jpg',
      'images/tours/t-galle-fort/gallery-2.jpg',
      'images/tours/t-galle-fort/gallery-3.jpg'
    ],
    itinerary: [
      { day: 'Day 1', text: 'Fort walking tour, lighthouse, sunset on the ramparts.' },
      { day: 'Day 2', text: 'Boutique shopping, beach morning, departure.' }
    ],
    included: ['Accommodation', 'Breakfast', 'Walking tour guide', 'Transfers'],
    excluded: ['Flights', 'Insurance', 'Lunch & dinner'],
    dates: ['11 Sep 2026', '25 Sep 2026', '9 Oct 2026'],
    reviews: [
      { name: 'Hana Y.', text: 'Charming town, loved the sunset walk on the ramparts.', rating: 5 }
    ],
    rating: 4.7,
    active: true
  }
];


async function currentUser(){
  const r = await apiFetch('/auth/me');
  return r.ok ? r.user : null;
}

async function registerUser({ fullName, email, phone, password, country, dob }){
  const r = await apiFetch('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ fullName, email, phone, password, country, dob })
  });
  return r.ok ? { ok:true, user:r.user } : { ok:false, error:r.error || 'Registration failed.' };
}

async function loginUser(email, password, requiredRole){
  const r = await apiFetch('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, requiredRole })
  });
  return r.ok ? { ok:true, user:r.user } : { ok:false, error:r.error || 'Login failed.' };
}

async function logoutUser(){
  await apiFetch('/auth/logout', { method:'POST' });
}

async function updateProfile({ fullName, phone, country }){
  const r = await apiFetch('/auth/me', { method:'PATCH', body: JSON.stringify({ fullName, phone, country }) });
  return r.ok ? { ok:true, user:r.user } : { ok:false, error:r.error };
}


async function getTours(){
  const r = await apiFetch('/tours');
  if (r.ok && Array.isArray(r.tours) && r.tours.length > 0) {
    return r.tours.map(t => ({
      ...t,
      img: normalizeImgUrl(t.img),
      gallery: (t.gallery || []).map(normalizeImgUrl)
    }));
  }
  return DEFAULT_TOURS.map(t => ({
    ...t,
    img: normalizeImgUrl(t.img),
    gallery: (t.gallery || []).map(normalizeImgUrl)
  }));
}

async function getAllToursAdmin(){
  const r = await apiFetch('/tours/admin/all');
  if (r.ok && Array.isArray(r.tours) && r.tours.length > 0) {
    return r.tours.map(t => ({
      ...t,
      img: normalizeImgUrl(t.img),
      gallery: (t.gallery || []).map(normalizeImgUrl)
    }));
  }
  return DEFAULT_TOURS.map(t => ({
    ...t,
    img: normalizeImgUrl(t.img),
    gallery: (t.gallery || []).map(normalizeImgUrl)
  }));
}

async function getTourById(id){
  const r = await apiFetch('/tours/' + encodeURIComponent(id));
  if (r.ok && r.tour) {
    return {
      ...r.tour,
      img: normalizeImgUrl(r.tour.img),
      gallery: (r.tour.gallery || []).map(normalizeImgUrl)
    };
  }

  // Fallback search in DEFAULT_TOURS by ID, slug, name, or destination
  const q = String(id || '').toLowerCase();
  const match = DEFAULT_TOURS.find(t =>
    t.id.toLowerCase() === q ||
    t.name.toLowerCase() === q ||
    t.destination.toLowerCase() === q ||
    q.includes(t.destination.toLowerCase()) ||
    t.id.replace('t-', '') === q
  );

  if(match){
    return {
      ...match,
      img: normalizeImgUrl(match.img),
      gallery: (match.gallery || []).map(normalizeImgUrl)
    };
  }
  return DEFAULT_TOURS[0]; // fallback gracefully to first tour
}
async function saveTour(tour, isNew){
  const path = isNew ? '/tours' : '/tours/' + encodeURIComponent(tour.id);
  const r = await apiFetch(path, { method: isNew ? 'POST' : 'PUT', body: JSON.stringify(tour) });
  return r;
}
async function setTourActive(id, active){
  return apiFetch('/tours/' + encodeURIComponent(id) + '/active', {
    method:'PATCH', body: JSON.stringify({ active })
  });
}


function calcPrice(tour, travelers){
  const subtotal = Math.round(tour.price * travelers * 100) / 100;
  const serviceFee = Math.round(subtotal * 0.03 * 100) / 100;
  const total = Math.round((subtotal + serviceFee) * 100) / 100;
  return { subtotal, serviceFee, total };
}


async function createBooking({ tourId, travelDate, travelers }){
  const r = await apiFetch('/bookings', {
    method: 'POST',
    body: JSON.stringify({ tourId, travelDate, travelers })
  });
  return r.ok ? { ok:true, booking:r.booking } : { ok:false, error:r.error || 'Booking failed.' };
}
async function getBookingsForUser(){
  const r = await apiFetch('/bookings/mine');
  return r.ok ? r.bookings : [];
}
async function getAllBookings(){
  const r = await apiFetch('/bookings/admin/all');
  return r.ok ? r.bookings : [];
}
async function getAdminStats(){
  const r = await apiFetch('/bookings/admin/stats');
  return r.ok ? r.stats : { total:0, pending:0, approved:0, rejected:0, travelers:0, revenue:0 };
}
async function updateBookingStatus(id, status, reason){
  return apiFetch('/bookings/' + encodeURIComponent(id) + '/status', {
    method:'PATCH', body: JSON.stringify({ status, reason })
  });
}
