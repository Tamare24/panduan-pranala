// Panduan Pranala: perangkat tiruan (A geser, B buka, tahan A ke atas), daftar isi aktif, banner 15 Desember.
(() => {
  const $ = (id) => document.getElementById(id);
  const now = new Date();
  const hour = now.getHours();
  const night = hour >= 20 || hour < 6;                       // sama seperti Pranala: ikon Tidur hanya malam

  // ---- ikon menu (gaya layar Pranala) ----
  const ICON = {
    makan: '<svg viewBox="0 0 24 24"><path d="M3 12h18a9 6 0 0 1-18 0z" fill="#ee7c72"/><circle cx="8" cy="9" r="2.5" fill="#a87250"/><circle cx="12" cy="7.5" r="2.5" fill="#b8784f"/><circle cx="16" cy="9" r="2.5" fill="#a87250"/></svg>',
    elus: '<svg viewBox="0 0 24 24"><path d="M12 21 3.5 12.5a5 5 0 0 1 8.5-6 5 5 0 0 1 8.5 6z" fill="#f0708e"/></svg>',
    mandi: '<svg viewBox="0 0 24 24"><path d="M5 3h3v6H5zM5 3h9v3H5z" fill="#aab0c4"/><rect x="11" y="5" width="10" height="4" rx="2" fill="#c4cee2"/><g fill="#6eb4e6"><circle cx="13" cy="13" r="1.4"/><circle cx="17" cy="15" r="1.4"/><circle cx="20" cy="12" r="1.4"/><circle cx="15" cy="19" r="1.4"/></g></svg>',
    tidur: '<svg viewBox="0 0 24 24"><path d="M15 3a9 9 0 1 0 6 13A8 8 0 0 1 15 3z" fill="#f2c25a"/></svg>',
    surat: '<svg viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2" fill="#fffefa" stroke="#7e6470" stroke-width="1.5"/><path d="M2.5 6 12 13l9.5-7" fill="none" stroke="#7e6470" stroke-width="1.5"/></svg>',
    ekstra: '<svg viewBox="0 0 24 24"><path d="M12 2l2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z" fill="#f2c25a"/></svg>',
  };
  const ITEMS = [
    { key: 'makan', label: 'Makan', target: 'makan', line: 'Lapar nih~\nKe Dapur yuk' },
    { key: 'elus', label: 'Elus', target: 'elus', line: 'Elus aku dong~\nhehe' },
    { key: 'mandi', label: 'Mandi', target: 'mandi', line: 'Badanku agak\ndebuan nih' },
    { key: 'tidur', label: 'Tidur', target: 'tidur', line: 'Ngantuk...\nayo tidur?', nightOnly: true },
    { key: 'surat', label: 'Surat', target: 'surat', line: 'Ada surat\nbuatku?' },
    { key: 'ekstra', label: 'Ekstra', target: 'main', line: 'Main game\nyuk!' },
  ].filter((it) => !it.nightOnly || night);

  const bar = $('bar'), bubble = $('bubble'), pet = $('pet'), oledL = $('oledL'), oledR = $('oledR');
  let idx = 0;
  bar.innerHTML = ITEMS.map((it, i) => `<div class="tab${i === 0 ? ' on' : ''}">${ICON[it.key]}<span>${it.label}</span></div>`).join('');
  const tabs = [...bar.children];

  const say = (text) => { bubble.textContent = text; };          // \n = baris kedua, seperti gelembung di Pranala
  const hop = () => { pet.classList.remove('hop'); void pet.getBoundingClientRect(); pet.classList.add('hop'); };
  function select(i) {
    idx = (i + ITEMS.length) % ITEMS.length;
    tabs.forEach((t, k) => t.classList.toggle('on', k === idx));
    oledL.textContent = ITEMS[idx].label;
    oledR.textContent = 'B:buka';
  }
  function openItem() {
    const it = ITEMS[idx];
    say(it.line);
    hop();
    const el = $(it.target);
    if (el) setTimeout(() => el.scrollIntoView({ block: 'start' }), 350);
  }

  // malam hari: kamar ikut redup seperti di perangkat
  if (night) {
    const room = $('room');
    room.style.setProperty('--wall', '#4a3a5e');
    room.style.setProperty('--wall-dot', '#5d4a74');
    room.style.setProperty('--wainscot', '#3f3150');
    room.style.setProperty('--rail', '#2f2440');
    room.style.setProperty('--floor', '#6d5060');
    room.style.setProperty('--floor-line', '#5a4050');
    room.style.setProperty('--sky', '#263063');
    room.style.setProperty('--sun', '#fff2c4');
    say('Malam, sudah\nmau tidur?');
  }

  // ---- tombol A: klik = geser, tahan = kembali ke atas ----
  const keyA = $('keyA'), keyB = $('keyB');
  let holdTimer = 0, held = false;
  const pressA = () => { held = false; keyA.classList.add('down'); holdTimer = setTimeout(() => { held = true; say('Kembali ke\natas ya~'); window.scrollTo({ top: 0 }); }, 550); };
  const releaseA = () => { keyA.classList.remove('down'); clearTimeout(holdTimer); if (!held) { select(idx + 1); say(ITEMS[idx].label + '?\nTekan B'); } held = false; };
  keyA.addEventListener('pointerdown', (e) => { e.preventDefault(); pressA(); });
  keyA.addEventListener('pointerup', releaseA);
  keyA.addEventListener('pointerleave', () => { if (keyA.classList.contains('down')) { keyA.classList.remove('down'); clearTimeout(holdTimer); } });
  keyA.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) { e.preventDefault(); pressA(); } });
  keyA.addEventListener('keyup', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); releaseA(); } });
  keyB.addEventListener('click', () => { keyB.classList.add('down'); setTimeout(() => keyB.classList.remove('down'), 120); openItem(); });
  keyA.addEventListener('contextmenu', (e) => e.preventDefault());

  // ---- rahasia kecil: elus Pranala 5 kali ----
  let taps = [];
  pet.addEventListener('click', () => {
    const t = Date.now();
    taps = taps.filter((x) => t - x < 4000);
    taps.push(t);
    hop();
    if (taps.length >= 5) { say('Ssst... ikut\naku ya~'); setTimeout(() => { location.href = 'kejutan/'; }, 900); }
    else say(['Hehe, geli~', 'Prrr...', 'Lagi dong~', 'Eh? Ada apa?'][taps.length - 1] || 'Hehe');
  });

  // ---- 15 Desember: banner kejutan ----
  if (now.getMonth() === 11 && now.getDate() === 15) $('bday').hidden = false;

  // ---- daftar isi: tandai bagian yang sedang dibaca ----
  const links = [...document.querySelectorAll('#toc a')];
  const byId = new Map(links.map((a) => [a.getAttribute('href').slice(1), a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => a.classList.remove('here'));
      const a = byId.get(en.target.id);
      if (a) a.classList.add('here');
    });
  }, { rootMargin: '-30% 0px -60% 0px' });
  document.querySelectorAll('.guide section').forEach((s) => io.observe(s));
})();
