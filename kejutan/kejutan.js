// Kejutan ulang tahun Pranala: wajah ASCII, lilin, lagu 8-bit, lalu kenangan terkunci sandi (AES-GCM + PBKDF2).
(() => {
  const $ = (id) => document.getElementById(id);
  const tenang = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tidur = (ms) => new Promise((r) => setTimeout(r, tenang ? Math.min(ms, 150) : ms));
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // ---------- wajah ASCII Pranala (lebar 25 kolom, simetris di kolom 12) ----------
  // E = mata, C = pipi (2 huruf), M = mulut
  const WAJAH = [
    String.raw`    /\             /\    `,
    String.raw`   /  \___________/  \   `,
    String.raw`  /      \  *  /      \  `,
    String.raw` |        \   /        | `,
    String.raw` |     E         E     | `,
    String.raw` |  CC      M      CC  | `,
    String.raw`  \                   /  `,
    String.raw`   '-._____________.-'   `,
  ];
  const KUE = [
    String.raw`           | |           `,
    String.raw`     .-----| |-----.     `,
    String.raw`    ( *  *  *  *  * )    `,
    String.raw`  ()|~~~~~~~~~~~~~~~|()  `,
    String.raw`    |  happy b'day  |    `,
    String.raw`    '---------------'    `,
  ];
  function wajah(mata, pipi, mulut, baris = WAJAH.length) {
    return WAJAH.slice(0, baris).map((l) => esc(l)
      .replace('*', '<span class="bintang">*</span>')
      .replace(/E/g, mata)
      .replace(/CC/g, `<span class="pipi">${pipi}</span>`)
      .replace('M', mulut)).join('\n');
  }
  // api lilin 2 baris di kolom 12 (berkedip), atau asap tipis setelah ditiup
  function lilin(t, menyala, asap) {
    let ujung, badan;
    if (menyala) {
      ujung = ' '.repeat(12) + `<span class="api">${[',', "'", '`'][t % 3]}</span>`;
      badan = ' '.repeat(11) + `<span class="api">${['(*)', '( )', '{*}'][t % 3]}</span>`;
    } else {
      ujung = asap ? ' '.repeat(11 + (t % 3)) + '~' : '';
      badan = ' '.repeat(12) + "'";
    }
    return [ujung, badan, ...KUE.map(esc)].join('\n');
  }

  // ---------- teks yang diketik pelan ----------
  async function ketik(el, teks, cepat = 38) {
    el.textContent = '';
    if (tenang) { el.textContent = teks; return; }
    for (const ch of teks) { el.textContent += ch; await tidur(ch === '.' ? cepat * 6 : cepat); }
  }
  function ganti(id) {
    document.querySelectorAll('.adegan').forEach((s) => { s.hidden = s.id !== id; });
    window.scrollTo(0, 0);
  }

  // ---------- bintang & cahaya lilin ----------
  const stars = document.querySelector('.stars');
  for (let i = 0; i < 46; i++) {
    const s = document.createElement('i');
    s.style.left = (Math.random() * 100) + '%';
    s.style.top = (Math.random() * 70) + '%';
    s.style.opacity = (0.3 + Math.random() * 0.6).toFixed(2);
    stars.appendChild(s);
  }
  let glow = 0, glowOn = false;
  setInterval(() => {
    const target = glowOn ? 0.34 + Math.random() * 0.08 : 0;
    glow += (target - glow) * 0.35;
    document.body.style.setProperty('--glow', glow.toFixed(3));
  }, 120);

  // ---------- lagu ulang tahun 8-bit (melodi lama milik umum), pelan ----------
  let ac = null, nyala = true, laguSelesai = Promise.resolve();
  const btnSuara = $('suara');
  btnSuara.addEventListener('click', () => {
    nyala = !nyala;
    btnSuara.textContent = 'Musik: ' + (nyala ? 'nyala' : 'mati');
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

  // ---------- konfeti ----------
  const cv = $('confetti'), cx = cv.getContext('2d');
  let bits = [];
  function konfeti() {
    if (tenang) return;
    cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio;
    const W = ['#f07595', '#ffcf7a', '#8ad6aa', '#b4a0ec', '#8cacee'];
    for (let i = 0; i < 140; i++) bits.push({ x: Math.random() * cv.width, y: -Math.random() * cv.height * 0.6, v: 1.5 + Math.random() * 3,
      w: 5 + Math.random() * 6, a: Math.random() * 6, s: (Math.random() - 0.5) * 0.2, c: W[i % W.length] });
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

  // ---------- adegan 1: lampu dimatikan, Pranala mengintip ----------
  const intip = $('ascii-intip');
  let kedip = 0;
  const intipLoop = setInterval(() => {
    kedip++;
    intip.innerHTML = wajah(kedip % 9 === 0 ? '-' : 'O', '  ', 'w', 5);
  }, 260);
  (async () => {
    intip.innerHTML = wajah('O', '  ', 'w', 5);
    await tidur(700);
    await ketik($('t-gelap'), 'Sstt... lampunya kumatikan dulu ya.');
    await tidur(400);
    $('b-mulai').hidden = false;
    $('b-mulai').focus();
  })();

  // ---------- adegan 2: lilin & harapan ----------
  let tik = 0, menyala = true, asap = false, wajahLilin = ['O', '~~', 'w'];
  const lilinEl = $('ascii-lilin');
  const gambarLilin = () => { lilinEl.innerHTML = wajah(...wajahLilin) + '\n' + lilin(tik, menyala, asap); };
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
      if (menyala) wajahLilin[0] = tik % 14 === 0 ? '-' : 'O';
      gambarLilin();
    }, 180);
    laguSelesai = mainkanLagu();
    await tidur(900);
    await ketik($('t-lilin'), 'Pejamkan mata, buat satu harapan dulu...');
    await Promise.race([laguSelesai, tidur(15000)]);
    $('b-tiup').hidden = false;
    $('b-tiup').focus();
  });

  // ---------- adegan 3: tiup lilin, lampu menyala, pesta ----------
  $('b-tiup').addEventListener('click', async () => {
    $('b-tiup').hidden = true;
    wajahLilin = ['-', '~~', 'o'];                          // fuuuh~
    $('t-lilin').textContent = 'Fuuuh~';
    await tidur(500);
    menyala = false; asap = true; glowOn = false;
    await tidur(1300);
    clearInterval(lilinLoop);
    document.body.classList.remove('gelap');
    document.body.classList.add('terang');
    ganti('a-pesta');
    konfeti();
    const pesta = $('ascii-pesta');
    let n = 0;
    const kilau = ['  *    .    *    .    *  ', '  .    *    .    *    .  '];
    const pestaLoop = setInterval(() => {
      n++;
      pesta.innerHTML = '<span class="bintang">' + kilau[n % 2] + '</span>\n' + wajah('^', '//', 'w');
    }, 450);
    pesta.innerHTML = '<span class="bintang">' + kilau[0] + '</span>\n' + wajah('^', '//', 'w');
    await tidur(600);
    await ketik($('t-pesta'), 'Selamat ulang tahun! Pranala punya satu hadiah lagi untukmu: kenangan kalian.');
    $('b-hadiah').hidden = false;
    $('b-hadiah').focus();
    $('b-hadiah').addEventListener('click', () => { clearInterval(pestaLoop); bukaKunci(); }, { once: true });
  });

  // ---------- adegan 4: kunci kenangan ----------
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
    btnSuara.hidden = true;                                       // lagu sudah selesai: tombol musik tidak menutupi foto
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
  $('f-kunci').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!berkas) return;
    const btn = $('b-buka');
    btn.disabled = true; btn.textContent = 'Membuka...';
    $('salah').textContent = '';
    try {
      const isi = await bukaIsi($('sandi').value.trim());
      tampilkanKenangan(isi);
    } catch (_) {
      $('salah').textContent = 'Sandinya belum cocok. Coba lagi ya.';
      btn.disabled = false; btn.textContent = 'Buka';
      $('sandi').select();
    }
  });

  // ---------- adegan 5: surat & foto kenangan ----------
  async function tampilkanKenangan(isi) {
    ganti('a-kenangan');
    $('untuk').textContent = isi.untuk ? 'Untuk ' + isi.untuk + ',' : '';
    $('dari').textContent = isi.dari ? '— ' + isi.dari : '';
    const galeri = $('galeri');
    (isi.foto || []).forEach((f, i) => {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'foto';
      b.style.setProperty('--r', ((i % 2 ? 1 : -1) * (1 + (i * 7) % 3)) + 'deg');
      b.innerHTML = `<img alt="" loading="lazy"><span class="ket"></span><span class="tgl"></span>`;
      b.querySelector('img').src = f.src;
      b.querySelector('img').alt = f.ket || 'Foto kenangan';
      b.querySelector('.ket').textContent = f.ket || '';
      b.querySelector('.tgl').textContent = f.tgl || '';
      b.addEventListener('click', () => {
        $('lihat-img').src = f.src; $('lihat-img').alt = f.ket || 'Foto kenangan';
        $('lihat-ket').textContent = [f.ket, f.tgl].filter(Boolean).join(', ');
        $('lihat').showModal();
      });
      galeri.appendChild(b);
    });
    $('ascii-akhir').innerHTML = wajah('<span class="hati">♥</span>', '//', 'w');
    const wadah = $('isi-surat');
    for (const para of (isi.pesan || '').split(/\n\s*\n/)) {
      const p = document.createElement('p');
      wadah.appendChild(p);
      await ketik(p, para.trim(), 22);
    }
  }
})();
