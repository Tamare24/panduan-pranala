// Kejutan ulang tahun Pranala
// gelap -> lilin & lagu 8-bit -> tiup -> pesta -> kunci (AES-GCM + PBKDF2) -> amplop -> surat diketik
// -> foto muncul satu per satu & berpindah sendiri -> semua kenangan. Lagu: Glue Song (YouTube resmi) di "TV Pranala".
(() => {
  const $ = (id) => document.getElementById(id);
  const tenang = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tidur = (ms) => new Promise((r) => setTimeout(r, tenang ? Math.min(ms, 150) : ms));
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const acak = (a, b) => a + Math.random() * (b - a);
  const pilih = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const WARNA = ['#ffcf7a', '#f48aa8', '#8ad6aa', '#b9a3ee', '#8cc3f2'];

  // =================== wajah ASCII Pranala (lebar 25, simetris di kolom 12) ===================
  function wajah({ mata = 'O', pipi = '~~', mulut = 'w', lirik = 0, baris = 8, tangan = false } = {}) {
    const L = [
      String.raw`    /\             /\    `,
      String.raw`   /  \___________/  \   `,
      String.raw`  /      \  *  /      \  `,
      String.raw` |        \   /        | `,
      ' |' + ' '.repeat(5 + lirik) + 'E' + ' '.repeat(9) + 'E' + ' '.repeat(5 - lirik) + '| ',
      String.raw` |  CC      M      CC  | `,
      String.raw`  \                   /  `,
      String.raw`   '-._____________.-'   `,
    ];
    if (tangan) { L[2] = 'o' + L[2].slice(1, 24) + 'o'; L[3] = '\\' + L[3].slice(1, 24) + '/'; }   // tangan terangkat
    return L.slice(0, baris).map((l) => esc(l)
      .replace('*', '<span class="bintang-k">*</span>')
      .replace(/E/g, mata)
      .replace(/CC/g, `<span class="pipi">${pipi}</span>`)
      .replace('M', mulut)).join('\n');
  }
  const KUE = [
    String.raw`           | |           `,
    String.raw`     .-----| |-----.     `,
    String.raw`    ( *  *  *  *  * )    `,
    String.raw`  ()|~~~~~~~~~~~~~~~|()  `,
    String.raw`    |  happy b'day  |    `,
    String.raw`    '---------------'    `,
  ].map(esc).join('\n');
  function lilin(t, menyala, angin) {
    let ujung, badan;
    if (menyala) {
      ujung = ' '.repeat(12) + `<span class="api">${[',', "'", '`'][t % 3]}</span>`;
      badan = ' '.repeat(11) + `<span class="api">${['(*)', '( )', '{*}'][t % 3]}</span>`;
    } else {
      ujung = ' '.repeat(10 + (t % 4)) + '~';
      badan = ' '.repeat(12) + "'";
    }
    if (angin) badan = badan.replace(/^ {7}/, '<span class="angin">~ ~ ~</span>  '.padEnd(7));
    return ujung + '\n' + badan + '\n' + KUE;
  }
  function barisNot(t) {                                          // not lagu melayang di atas kepala
    const s = Array(25).fill(' ');
    s[(3 + t) % 6 + 1] = '♪'; s[(t * 2) % 7 + 16] = '♫';
    return '<span class="not">' + s.join('') + '</span>';
  }

  // =================== ketik pelan ===================
  async function ketik(el, teks, cepat = 38) {
    el.textContent = '';
    if (tenang) { el.textContent = teks; return; }
    const kursor = document.createElement('span'); kursor.className = 'kursor';
    const node = document.createTextNode('');
    el.append(node, kursor);
    for (const ch of teks) { node.data += ch; await tidur(/[.!?]/.test(ch) ? cepat * 7 : ch === ',' ? cepat * 3 : cepat); }
    kursor.remove();
  }

  // =================== latar: bintang, lampu tumbler, bendera, bokeh ===================
  let lebarHuruf = 9;
  function ukurHuruf() {
    const c = document.createElement('canvas').getContext('2d');
    c.font = '18px VT323';
    const w = c.measureText('MMMMMMMMMM').width / 10;
    if (w > 4) lebarHuruf = w;
  }
  let gridBintang = [], titikBintang = [];
  function bangunBintang() {
    const cols = Math.ceil(innerWidth / lebarHuruf) + 1, rows = Math.ceil(innerHeight * 0.85 / 18);
    gridBintang = Array.from({ length: rows }, () => Array(cols).fill(' '));
    titikBintang = [];
    const n = Math.floor(cols * rows * 0.02);
    for (let k = 0; k < n; k++) {
      const r = Math.floor(Math.random() * rows), c = Math.floor(Math.random() * cols);
      gridBintang[r][c] = pilih(['.', '.', '.', '*', '+', "'"]);
      titikBintang.push([r, c]);
    }
    $('bintang').textContent = gridBintang.map((r) => r.join('')).join('\n');
  }
  function kerlipBintang() {
    for (let k = 0; k < 8 && titikBintang.length; k++) {
      const [r, c] = pilih(titikBintang);
      gridBintang[r][c] = pilih(['.', '+', '*', "'", '.']);
    }
    $('bintang').textContent = gridBintang.map((r) => r.join('')).join('\n');
  }
  function bangunUntaian() {
    const cols = Math.ceil(innerWidth / lebarHuruf) + 1;
    const KAWAT = ['-', '~', '-', '.', '_', '.', '-', '~'];
    let kawat = '', bola = '';
    for (let c = 0; c < cols; c++) {
      kawat += KAWAT[c % 8];
      bola += c % 8 === 4 ? `<span class="bola" style="--c:${WARNA[(c / 8 | 0) % WARNA.length]}">o</span>` : ' ';
    }
    $('untaian').innerHTML = esc(kawat) + '\n' + bola;
    let bendera = '', tali = '';
    for (let c = 0; c < cols; c++) {
      tali += c % 2 ? '-' : '~';
      const k = c % 5, w = WARNA[(c / 5 | 0) % WARNA.length];
      bendera += k === 1 ? `<span style="--c:${w}">\\</span>` : k === 2 ? `<span style="--c:${w}">/</span>` : ' ';
    }
    $('bendera').innerHTML = tali + '\n' + bendera;
  }
  function kerlipLampu() {
    document.querySelectorAll('.untaian .bola').forEach((b) => b.classList.toggle('redup', Math.random() < 0.3));
  }
  function bangunBokeh() {
    const wadah = $('bokeh');
    const C = ['rgba(255,190,110,.9)', 'rgba(255,150,180,.9)', 'rgba(190,160,240,.9)', 'rgba(255,220,150,.9)'];
    for (let i = 0; i < 10; i++) {
      const s = document.createElement('i'), d = acak(60, 170);
      s.style.cssText = `width:${d}px;height:${d}px;left:${acak(-5, 95)}%;top:${acak(5, 90)}%;--c:${C[i % C.length]};` +
        `--x:${acak(-50, 50)}px;--y:${acak(-40, 40)}px;--d:${acak(14, 26)}s`;
      wadah.appendChild(s);
    }
  }
  function hati() {                                              // hati ASCII melayang naik
    const s = document.createElement('span');
    s.textContent = pilih(['♥', '<3', '♡', '*', '♥']);
    s.style.cssText = `left:${acak(4, 94)}%;--c:${pilih(['#e8658a', '#ffb3c6', '#ffcf7a', '#c2456b'])};--x:${acak(-60, 60)}px;--r:${acak(-30, 30)}deg;--d:${acak(7, 12)}s`;
    $('hati-terbang').appendChild(s);
    setTimeout(() => s.remove(), 12500);
  }
  ukurHuruf();
  bangunBintang(); bangunUntaian(); bangunBokeh();
  if (document.fonts) document.fonts.ready.then(() => { ukurHuruf(); bangunBintang(); bangunUntaian(); });
  let ukurUlang = 0;
  addEventListener('resize', () => { clearTimeout(ukurUlang); ukurUlang = setTimeout(() => { bangunBintang(); bangunUntaian(); }, 250); });
  if (!tenang) { setInterval(kerlipBintang, 700); setInterval(kerlipLampu, 900); }

  // cahaya lilin berdenyut
  let glow = 0, glowOn = false;
  setInterval(() => {
    const target = glowOn ? 0.75 + Math.random() * 0.25 : 0;
    glow += (target - glow) * 0.3;
    document.body.style.setProperty('--glow', glow.toFixed(3));
  }, 120);

  // =================== pindah adegan ===================
  let hatiTimer = 0;
  function ganti(id) {
    document.querySelectorAll('.adegan').forEach((s) => { s.hidden = s.id !== id; });
    window.scrollTo(0, 0);
    clearInterval(hatiTimer);
    if (!tenang && ['a-amplop', 'a-surat', 'a-foto', 'a-akhir'].includes(id)) hatiTimer = setInterval(hati, 1600);
  }

  // =================== lagu ulang tahun 8-bit (melodi lama milik umum), pelan ===================
  let ac = null, nyala = true;
  const btnSuara = $('suara');
  btnSuara.addEventListener('click', () => {
    nyala = !nyala;
    btnSuara.textContent = 'musik: ' + (nyala ? 'nyala' : 'mati');
    btnSuara.setAttribute('aria-pressed', String(nyala));
    if (ac) (nyala ? ac.resume() : ac.suspend());
  });
  function mainkanLagu() {
    if (!ac) return Promise.resolve();
    const N = { G4: 392, A4: 440, B4: 494, C5: 523, D5: 587, E5: 659, F5: 698, G5: 784 };
    const L = [['G4', .75], ['G4', .25], ['A4', 1], ['G4', 1], ['C5', 1], ['B4', 2],
               ['G4', .75], ['G4', .25], ['A4', 1], ['G4', 1], ['D5', 1], ['C5', 2],
               ['G4', .75], ['G4', .25], ['G5', 1], ['E5', 1], ['C5', 1], ['B4', 1], ['A4', 2],
               ['F5', .75], ['F5', .25], ['E5', 1], ['C5', 1], ['D5', 1], ['C5', 3]];
    const ketuk = 0.42;
    let t = ac.currentTime + 0.15;
    for (const [n, d] of L) {
      const o = ac.createOscillator(), g = ac.createGain();
      o.type = 'square'; o.frequency.value = N[n];
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.045, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d * ketuk * 0.92);
      o.connect(g).connect(ac.destination);
      o.start(t); o.stop(t + d * ketuk);
      t += d * ketuk;
    }
    return new Promise((r) => setTimeout(r, (t - ac.currentTime) * 1000));
  }

  // =================== konfeti ===================
  const cv = $('confetti'), cx = cv.getContext('2d');
  let bits = [];
  function konfeti() {
    if (tenang) return;
    cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio;
    for (let i = 0; i < 150; i++) bits.push({ x: Math.random() * cv.width, y: -Math.random() * cv.height * 0.6, v: 1.5 + Math.random() * 3,
      w: 5 + Math.random() * 6, a: Math.random() * 6, s: (Math.random() - 0.5) * 0.2, c: WARNA[i % WARNA.length] });
    const step = () => {
      cx.clearRect(0, 0, cv.width, cv.height);
      bits = bits.filter((b) => b.y < cv.height + 20);
      for (const b of bits) {
        b.y += b.v * devicePixelRatio; b.x += Math.sin(b.a) * devicePixelRatio; b.a += b.s;
        cx.save(); cx.translate(b.x, b.y); cx.rotate(b.a); cx.fillStyle = b.c; cx.fillRect(-b.w / 2, -b.w / 4, b.w, b.w / 2); cx.restore();
      }
      if (bits.length) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // =================== 1. gelap: Pranala mengintip ===================
  const intip = $('ascii-intip');
  let kedip = 0;
  const gambarIntip = () => {
    const lirik = [0, 0, -1, -1, 0, 0, 1, 1][Math.floor(kedip / 5) % 8];
    intip.innerHTML = wajah({ mata: kedip % 11 === 0 ? '-' : 'O', pipi: '  ', lirik, baris: 5 });
  };
  const intipLoop = setInterval(() => { kedip++; gambarIntip(); }, 260);
  gambarIntip();
  (async () => {
    await tidur(800);
    await ketik($('t-gelap'), 'Sstt... lampunya kumatikan dulu ya.');
    await tidur(400);
    $('b-mulai').hidden = false;
    $('b-mulai').focus();
  })();

  // =================== 2. lilin & harapan ===================
  let tik = 0, menyala = true, angin = false, wajahLilin = { mata: 'O', pipi: '~~', mulut: 'w' };
  const lilinEl = $('ascii-lilin');
  const gambarLilin = () => {
    lilinEl.innerHTML = (menyala ? barisNot(Math.floor(tik / 3)) : ' ') + '\n' + wajah(wajahLilin) + '\n' + lilin(tik, menyala, angin);
  };
  let lilinLoop = 0;
  $('b-mulai').addEventListener('click', async () => {
    clearInterval(intipLoop);
    try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) { ac = null; }
    if (ac) btnSuara.hidden = false;
    ganti('a-lilin');
    glowOn = true;
    gambarLilin();
    lilinLoop = setInterval(() => {
      tik++;
      if (menyala && !angin) wajahLilin.mata = tik % 14 === 0 ? '-' : 'O';
      gambarLilin();
    }, 180);
    const lagu = mainkanLagu();
    await tidur(900);
    await ketik($('t-lilin'), 'Pejamkan mata, buat satu harapan dulu...');
    await Promise.race([lagu, tidur(15000)]);
    $('b-tiup').hidden = false;
    $('b-tiup').focus();
  });

  // =================== 3. tiup lilin, lampu menyala, pesta ===================
  $('b-tiup').addEventListener('click', async () => {
    $('b-tiup').hidden = true;
    wajahLilin = { mata: '-', pipi: '()', mulut: 'o' };           // pipi menggembung: fuuuh~
    angin = true;
    $('t-lilin').textContent = 'Fuuuh~';
    await tidur(700);
    menyala = false; glowOn = false;
    await tidur(400);
    angin = false; wajahLilin = { mata: '^', pipi: '~~', mulut: 'w' };
    await tidur(1100);
    clearInterval(lilinLoop);
    document.body.classList.add('terang');
    ganti('a-pesta');
    konfeti();
    const pesta = $('ascii-pesta');
    let n = 0;
    const kilau = ['  *    .    *    .    *  ', '  .    *    .    *    .  '];
    const gambarPesta = () => {
      const naik = n % 2 === 0;
      pesta.innerHTML = '<span class="bintang-k">' + kilau[n % 2] + '</span>\n' + (naik ? '' : '\n') +
        wajah({ mata: '^', pipi: '//', mulut: 'w', tangan: naik }) + (naik ? '\n' : '');
    };
    gambarPesta();
    const pestaLoop = setInterval(() => { n++; gambarPesta(); }, 420);
    await tidur(600);
    await ketik($('t-pesta'), 'Selamat ulang tahun! Pranala punya satu hadiah lagi untukmu: kenangan kalian.');
    $('b-hadiah').hidden = false;
    $('b-hadiah').focus();
    $('b-hadiah').addEventListener('click', () => { clearInterval(pestaLoop); bukaKunci(); }, { once: true });
  });

  // =================== 4. kunci kenangan ===================
  // kenangan.dat = "PRNL1\n" + kepala JSON (garam, iv, petunjuk) + "\n" + data terenkripsi (biner)
  let berkas = null;
  function bacaBerkas(buf) {
    const u8 = new Uint8Array(buf);
    const n1 = u8.indexOf(10), n2 = u8.indexOf(10, n1 + 1);
    const td = new TextDecoder();
    if (n1 < 0 || n2 < 0 || td.decode(u8.subarray(0, n1)) !== 'PRNL1') throw new Error('format');
    const kepala = JSON.parse(td.decode(u8.subarray(n1 + 1, n2)));
    kepala.isi = u8.subarray(n2 + 1);
    return kepala;
  }
  async function bukaKunci() {
    ganti('a-kunci');
    btnSuara.hidden = true;
    $('ascii-ngintip').innerHTML = wajah({ mata: 'o', pipi: '  ', baris: 5 });
    try {
      const r = await fetch('kenangan.dat', { cache: 'no-store' });
      if (!r.ok) throw new Error('tidak ada');
      berkas = bacaBerkas(await r.arrayBuffer());
      if (berkas.petunjuk) { $('petunjuk').textContent = 'Petunjuk: ' + berkas.petunjuk; $('petunjuk').hidden = false; }
      $('sandi').focus();
    } catch (_) {
      $('salah').textContent = 'Hadiahnya masih dibungkus. Coba buka lagi nanti ya.';
      $('sandi').disabled = true; $('b-buka').disabled = true;
    }
  }
  const b64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));
  async function bukaIsi(sandi) {
    const dasar = await crypto.subtle.importKey('raw', new TextEncoder().encode(sandi), 'PBKDF2', false, ['deriveKey']);
    const kunci = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt: b64(berkas.salt), iterations: berkas.iter, hash: 'SHA-256' },
      dasar, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    const polos = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: b64(berkas.iv) }, kunci, berkas.isi);
    return JSON.parse(new TextDecoder().decode(polos));
  }
  let isi = null;
  $('f-kunci').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!berkas) return;
    const btn = $('b-buka');
    btn.disabled = true; btn.textContent = 'membuka...';
    $('salah').textContent = '';
    try {
      isi = await bukaIsi($('sandi').value.trim());
      keAmplop();
    } catch (_) {
      $('ascii-ngintip').innerHTML = wajah({ mata: 'o', pipi: '  ', mulut: '-', lirik: -1, baris: 5 });
      $('salah').textContent = 'Sandinya belum cocok. Coba lagi ya.';
      btn.disabled = false; btn.textContent = 'buka';
      $('sandi').select();
    }
  });

  // =================== TV Pranala: Glue Song (YouTube resmi) ===================
  let yt = null, ytSiap = false, ytMau = false;
  function siapkanTV() {
    $('tv').hidden = false;
    document.body.classList.add('berlagu');
    window.onYouTubeIframeAPIReady = () => {
      yt = new YT.Player('yt', {
        width: 200, height: 200, videoId: 'y1cBhJLNNXU',
        playerVars: { playsinline: 1, rel: 0, modestbranding: 1 },
        events: {
          onReady: () => { ytSiap = true; yt.setVolume(85); if (ytMau) yt.playVideo(); },
          onStateChange: (ev) => {
            $('lampu-tv').classList.toggle('nyala', ev.data === 1);
            if (ev.data === 1) $('tv-petunjuk').hidden = true;
          },
        },
      });
    };
    const s = document.createElement('script');
    s.src = 'https://www.youtube.com/iframe_api';
    s.onerror = () => { $('tv').hidden = true; };               // tanpa internet / diblokir: lanjut tanpa lagu
    document.head.appendChild(s);
  }
  function putarLagu() {
    ytMau = true;
    if (ac) ac.suspend();
    if (ytSiap) yt.playVideo();
    setTimeout(() => { if (!$('tv').hidden && (!ytSiap || yt.getPlayerState() !== 1)) $('tv-petunjuk').hidden = false; }, 3000);
  }

  // =================== 5. amplop ===================
  function keAmplop() {
    $('alamat').textContent = isi.untuk ? 'untuk ' + isi.untuk : 'untukmu';
    ganti('a-amplop');
    siapkanTV();
  }
  $('amplop').addEventListener('click', async () => {
    const a = $('amplop');
    if (a.classList.contains('buka')) return;
    putarLagu();                                                  // ketukan ini sekaligus menyalakan lagu
    a.classList.add('buka');
    $('ketuk').hidden = true;
    await tidur(2300);
    bacaSurat();
  });

  // =================== 6. surat diketik ===================
  async function bacaSurat() {
    ganti('a-surat');
    $('untuk').textContent = isi.untuk ? 'Untuk ' + isi.untuk + ',' : '';
    $('dari').textContent = '';
    const wadah = $('isi-surat');
    wadah.innerHTML = '';
    await tidur(500);
    for (const para of (isi.pesan || '').split(/\n\s*\n/)) {
      const p = document.createElement('p');
      wadah.appendChild(p);
      await ketik(p, para.trim(), 34);
      await tidur(500);
    }
    if (isi.dari) await ketik($('dari'), '— ' + isi.dari, 60);
    await tidur(900);
    $('lanjut').hidden = false;
    await ketik($('lanjut'), '...dan ini kenangan kita ~', 45);
    await tidur(2200);
    $('lanjut').hidden = true;
    mulaiFoto();
  }

  // =================== 7. foto satu per satu, berpindah sendiri ===================
  const DURASI = 5200;
  let fIdx = -1, fJeda = false, fTimer = 0, fAktif = null, fToken = 0;
  const daftar = () => (isi && isi.foto) || [];
  function progres() {
    const n = daftar().length, lebar = 16, isiBar = Math.round(((fIdx + 1) / n) * lebar);
    $('progres').textContent = '[' + '='.repeat(Math.max(0, isiBar - 1)) + (isiBar ? '>' : '') + '-'.repeat(lebar - isiBar) + ']  ' +
      String(fIdx + 1).padStart(2, '0') + ' / ' + String(n).padStart(2, '0');
  }
  async function tampilFoto(i) {
    const f = daftar()[i];
    if (!f) return;
    fIdx = i; progres();
    const token = ++fToken;
    clearTimeout(fTimer);
    const fig = document.createElement('figure');
    fig.className = 'polaroid masuk';
    fig.style.setProperty('--r', ((i % 2 ? 1 : -1) * (1.2 + ((i * 7) % 4))) + 'deg');
    fig.innerHTML = '<span class="selotip"></span><img alt=""><figcaption><span class="ket"></span><span class="tgl"></span></figcaption>';
    const img = fig.querySelector('img');
    img.src = f.src; img.alt = f.ket || 'Foto kenangan';
    fig.addEventListener('click', jedaLanjut);
    if (fAktif) { const lama = fAktif; lama.classList.remove('masuk'); lama.classList.add('keluar'); setTimeout(() => lama.remove(), 850); }
    $('tumpukan').appendChild(fig);
    fAktif = fig;
    await tidur(500);
    await ketik(fig.querySelector('.ket'), f.ket || '', 45);
    if (token !== fToken) return;
    fig.querySelector('.tgl').textContent = f.tgl || '';
    jadwal();
  }
  function jadwal() { clearTimeout(fTimer); if (!fJeda) fTimer = setTimeout(maju, DURASI); }
  function maju() {
    if (fIdx + 1 >= daftar().length) { clearTimeout(fTimer); keAkhir(); return; }
    tampilFoto(fIdx + 1);
  }
  function jedaLanjut() {
    fJeda = !fJeda;
    $('b-jeda').textContent = fJeda ? '[ > ]' : '[ || ]';
    $('b-jeda').setAttribute('aria-label', fJeda ? 'Lanjutkan' : 'Jeda');
    jadwal();
  }
  function mulaiFoto() {
    ganti('a-foto');
    fJeda = false; $('b-jeda').textContent = '[ || ]';
    if (fAktif) { fAktif.remove(); fAktif = null; }
    fIdx = -1;
    tampilFoto(0);
  }
  $('b-maju').addEventListener('click', () => { if (fIdx + 1 < daftar().length) tampilFoto(fIdx + 1); else keAkhir(); });
  $('b-mundur').addEventListener('click', () => { if (fIdx > 0) tampilFoto(fIdx - 1); });
  $('b-jeda').addEventListener('click', jedaLanjut);

  // =================== 8. semua kenangan ===================
  let galeriJadi = false;
  function keAkhir() {
    clearTimeout(fTimer); fToken++;
    ganti('a-akhir');
    if (!galeriJadi) {
      galeriJadi = true;
      daftar().forEach((f, i) => {
        const b = document.createElement('button');
        b.type = 'button'; b.className = 'mini';
        b.style.setProperty('--r', ((i % 2 ? 1 : -1) * (1 + (i * 5) % 3)) + 'deg');
        b.innerHTML = '<img alt="" loading="lazy">';
        b.querySelector('img').src = f.src;
        b.querySelector('img').alt = f.ket || 'Foto kenangan';
        b.addEventListener('click', () => {
          $('lihat-img').src = f.src; $('lihat-img').alt = f.ket || 'Foto kenangan';
          $('lihat-ket').textContent = [f.ket, f.tgl].filter(Boolean).join(', ');
          $('lihat').showModal();
        });
        $('galeri').appendChild(b);
      });
    }
    $('ascii-akhir').innerHTML = '<span class="hati">  ♥        &lt;3        ♥  </span>\n' +
      wajah({ mata: '<span class="hati">♥</span>', pipi: '//', mulut: 'w' });
  }
  $('b-ulang').addEventListener('click', mulaiFoto);
  $('b-surat').addEventListener('click', () => { ganti('a-surat'); $('b-ke-akhir').hidden = false; });
  $('b-ke-akhir').addEventListener('click', () => { $('b-ke-akhir').hidden = true; keAkhir(); });
})();
