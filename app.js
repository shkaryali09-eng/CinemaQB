/*
 CinemaQB - simple static implementation
 Admin password: 13822
 Data stored in movies.json and in localStorage for edits
*/

const ADMIN_PASS = "13822";

let movies = [];
let uiLang = localStorage.getItem('uiLang') || 'fa';
let theme = localStorage.getItem('theme') || 'dark';
document.documentElement.lang = uiLang === 'fa' ? 'fa' : 'en';

const el = id => document.getElementById(id);
const moviesGrid = el('moviesGrid');
const search = el('search');
const genresList = el('genresList');
const movieModal = el('movieModal');
const closeMovie = el('closeMovie');
const movieTitle = el('movieTitle');
const moviePoster = el('moviePoster');
const movieInfo = el('movieInfo');
const playerWrap = el('playerWrap');
const movieDesc = el('movieDesc');
const qualitySelect = el('qualitySelect');
const commentsDiv = el('comments');
const commentInput = el('commentInput');
const addComment = el('addComment');
const langToggle = el('langToggle');
const themeToggle = el('themeToggle');

const menuFavs = el('menuFavs');
const menuCats = el('menuCats');
const menuProfile = el('menuProfile');

const adminModal = el('adminModal');
const adminPass = el('adminPass');
const adminLoginBtn = el('adminLoginBtn');
const adminArea = el('adminArea');
const closeAdmin = el('closeAdmin');

const posterFile = el('posterFile');
const adminTitleEn = el('adminTitleEn');
const adminTitleFa = el('adminTitleFa');
const adminYear = el('adminYear');
const adminDirector = el('adminDirector');
const adminCountry = el('adminCountry');
const adminGenres = el('adminGenres');
const admin1080 = el('admin1080');
const admin720 = el('admin720');
const admin480 = el('admin480');
const adminDescEn = el('adminDescEn');
const adminDescFa = el('adminDescFa');
const saveMovie = el('saveMovie');
const logoutAdmin = el('logoutAdmin');

const brandText = document.getElementById('brandText');
const heroTitle = document.getElementById('heroTitle');
const heroSubtitle = document.getElementById('heroSubtitle');
const catTitle = document.getElementById('catTitle');
const popularTitle = document.getElementById('popularTitle');
const commentsTitle = document.getElementById('commentsTitle');

function applyLang(){
  if(uiLang === 'fa'){
    brandText.textContent = 'CinemaQB';
    heroTitle.textContent = 'CinemaQB';
    heroSubtitle.textContent = 'تماشای آنلاین فیلم‌ها';
    catTitle.textContent = 'ژانرها';
    popularTitle.textContent = 'محبوب';
    commentsTitle.textContent = 'نظرات';
    document.dir = 'rtl';
  } else {
    brandText.textContent = 'CinemaQB';
    heroTitle.textContent = 'CinemaQB';
    heroSubtitle.textContent = 'Watch movies online';
    catTitle.textContent = 'Genres';
    popularTitle.textContent = 'Popular';
    commentsTitle.textContent = 'Comments';
    document.dir = 'ltr';
  }
  langToggle.value = uiLang;
  localStorage.setItem('uiLang', uiLang);
}
applyLang();

function applyTheme(){
  if(theme === 'light'){
    document.body.classList.add('light');
  } else {
    document.body.classList.remove('light');
  }
  localStorage.setItem('theme', theme);
}
applyTheme();

langToggle.addEventListener('change', e=>{
  uiLang = e.target.value;
  applyLang();
});

themeToggle.addEventListener('click', ()=>{
  theme = theme === 'dark' ? 'light' : 'dark';
  applyTheme();
});

// Load movies.json (then merge with local edits)
async function loadMovies(){
  try{
    const res = await fetch('movies.json');
    const baseMovies = await res.json();
    const local = JSON.parse(localStorage.getItem('cinemaqb_movies') || '[]');
    // merge: local overrides by id
    const map = {};
    baseMovies.forEach(m=>map[m.id]=m);
    local.forEach(m=>map[m.id]=m);
    movies = Object.values(map);
    renderMovies(movies);
    renderGenres(movies);
  }catch(e){
    console.error('load error', e);
    moviesGrid.innerHTML = '<p style="color:#f88">خطا در بارگذاری فیلم‌ها</p>';
  }
}

function renderMovies(list){
  moviesGrid.innerHTML = '';
  list.forEach(m=>{
    const div = document.createElement('div');
    div.className = 'card';
    div.innerHTML = `
      <img src="${m.poster}" alt="${m.title_en}">
      <h5>${uiLang==='fa'?m.title_fa:m.title_en}</h5>
      <p style="color:var(--muted);font-size:13px">${m.genres.join(', ')}</p>
    `;
    div.addEventListener('click', ()=>openMovie(m.id));
    moviesGrid.appendChild(div);
  });
}

function renderGenres(list){
  const set = new Set();
  list.forEach(m=>m.genres.forEach(g=>set.add(g)));
  genresList.innerHTML = '';
  ['All', ...Array.from(set)].forEach(g=>{
    const btn = document.createElement('button');
    btn.className = 'genre-btn';
    btn.textContent = g === 'All' ? (uiLang==='fa'?'همه':'All') : g;
    btn.addEventListener('click', ()=> {
      if(g==='All') renderMovies(movies);
      else renderMovies(movies.filter(m=>m.genres.includes(g)));
      window.scrollTo({top:200,behavior:'smooth'});
    });
    genresList.appendChild(btn);
  });
}

function openMovie(id){
  const m = movies.find(x=>x.id===id);
  if(!m) return;
  movieTitle.textContent = uiLang==='fa'?m.title_fa:m.title_en;
  moviePoster.src = m.poster;
  movieInfo.textContent = `${m.year} • ${m.director} • ${m.country}`;
  setQualityAndPlayer(m, qualitySelect.value || '1080');
  movieDesc.textContent = uiLang==='fa'?m.description_fa:m.description_en;
  loadComments(id);
  movieModal.classList.remove('hidden');
}

function setQualityAndPlayer(m, q){
  playerWrap.innerHTML = '';
  const src = (m.sources && m.sources[q]) ? m.sources[q] : (m.sources && m.sources['720']) || '';
  if(src.includes('youtube.com') || src.includes('youtu.be')){
    const iframe = document.createElement('iframe');
    iframe.src = src.includes('embed') ? src+'?autoplay=1' : src.replace('watch?v=','embed/') + '?autoplay=1';
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture';
    iframe.setAttribute('allowfullscreen','');
    playerWrap.appendChild(iframe);
  } else {
    const video = document.createElement('video');
    video.src = src;
    video.controls = true;
    video.autoplay = true;
    playerWrap.appendChild(video);
  }
}

qualitySelect.addEventListener('change', ()=>{
  const id = document.querySelector('.card[data-current]');
  // we can parse current opened movie from title
  const title = movieTitle.textContent;
  const m = movies.find(x => x.title_en === title || x.title_fa === title);
  if(m) setQualityAndPlayer(m, qualitySelect.value);
});

closeMovie.addEventListener('click', ()=> movieModal.classList.add('hidden'));
movieModal.addEventListener('click', (e)=> { if(e.target===movieModal) movieModal.classList.add('hidden'); });

search.addEventListener('input', e=>{
  const q = e.target.value.trim().toLowerCase();
  renderMovies(movies.filter(m=> (m.title_en+m.title_fa+m.genres.join(' ')).toLowerCase().includes(q)));
});

// Comments stored per movie in localStorage
function loadComments(movieId){
  commentsDiv.innerHTML = '';
  const all = JSON.parse(localStorage.getItem('cinemaqb_comments') || '{}');
  const list = all[movieId] || [];
  list.forEach(c=>{
    const d = document.createElement('div');
    d.style.padding='8px'; d.style.borderBottom='1px solid #1a1a1a';
    d.innerHTML = `<strong>${c.name || 'User'}</strong> <small style="color:var(--muted)">${c.time}</small><p>${c.text}</p>`;
    commentsDiv.appendChild(d);
  });
  addComment.onclick = ()=>{
    const text = commentInput.value.trim();
    if(!text) return alert(uiLang==='fa'?'نظر خالی است':'Comment empty');
    const obj = {name: uiLang==='fa'?'کاربر':'User', text, time: new Date().toLocaleString()};
    const all2 = JSON.parse(localStorage.getItem('cinemaqb_comments') || '{}');
    all2[movieId] = all2[movieId] || [];
    all2[movieId].push(obj);
    localStorage.setItem('cinemaqb_comments', JSON.stringify(all2));
    commentInput.value = '';
    loadComments(movieId);
  };
}

// Bottom menu handlers
menuCats.addEventListener('click', ()=> window.scrollTo({top:180,behavior:'smooth'}));
menuFavs.addEventListener('click', ()=> alert(uiLang==='fa'?'بخش علاقه‌مندی هنوز فعال نشده':'Favorites not implemented yet'));
menuProfile.addEventListener('click', ()=> {
  adminModal.classList.remove('hidden');
});

// Admin logic (simple)
adminLoginBtn.addEventListener('click', ()=>{
  if(adminPass.value === ADMIN_PASS){
    adminArea.classList.remove('hidden');
    adminPass.value = '';
    // populate list? show message
  } else {
    alert(uiLang==='fa'?'رمز اشتباه است':'Wrong password');
  }
});
closeAdmin.addEventListener('click', ()=> adminModal.classList.add('hidden'));
logoutAdmin.addEventListener('click', ()=> {
  adminArea.classList.add('hidden');
  adminModal.classList.add('hidden');
});

// poster preview handling
let posterDataUrl = '';
posterFile.addEventListener('change', (e)=>{
  const f = e.target.files[0];
  if(!f) return;
  const reader = new FileReader();
  reader.onload = ()=> { posterDataUrl = reader.result; alert('Poster loaded (local only).'); };
  reader.readAsDataURL(f);
});

// save movie (add new or update)
saveMovie.addEventListener('click', ()=>{
  const id = 'm' + Date.now();
  const obj = {
    id,
    title_en: adminTitleEn.value || 'Untitled',
    title_fa: adminTitleFa.value || adminTitleEn.value || 'بدون نام',
    year: Number(adminYear.value) || 2023,
    director: adminDirector.value || '',
    country: adminCountry.value || '',
    cast: [],
    genres: adminGenres.value ? adminGenres.value.split(',').map(s=>s.trim()) : [],
    poster: posterDataUrl || 'https://via.placeholder.com/300x450?text=No+Poster',
    sources: {
      "1080": admin1080.value || '',
      "720": admin720.value || '',
      "480": admin480.value || ''
    },
    description_en: adminDescEn.value || '',
    description_fa: adminDescFa.value || ''
  };
  // save into localStorage
  const local = JSON.parse(localStorage.getItem('cinemaqb_movies') || '[]');
  local.push(obj);
  localStorage.setItem('cinemaqb_movies', JSON.stringify(local));
  alert(uiLang==='fa'?'فیلم ذخیره شد (محلی)':'Movie saved locally');
  adminArea.classList.add('hidden');
  adminModal.classList.add('hidden');
  loadMovies();
});

// initial load
loadMovies();

