/* ============================================================
   Beyond Data — Main JavaScript
   ============================================================ */

// Disable copy, cut, right-click sitewide
document.addEventListener('contextmenu', e => e.preventDefault());
document.addEventListener('copy', e => e.preventDefault());
document.addEventListener('cut', e => e.preventDefault());
document.addEventListener('selectstart', e => e.preventDefault());


/* ── Toast notification ──────────────────────────────────── */
let notifTimer = null;

function showNotif(header, text) {
  const el = document.getElementById('notification');
  document.getElementById('notif-header').textContent = header;
  document.getElementById('notif-text').textContent   = text;

  el.classList.remove('show');
  void el.offsetWidth;
  el.classList.add('show');

  clearTimeout(notifTimer);
  notifTimer = setTimeout(() => el.classList.remove('show'), 4000);
}

function dismissNotif() {
  document.getElementById('notification').classList.remove('show');
  clearTimeout(notifTimer);
}

/* ── Solutions accordion ─────────────────────────────────── */
function toggleSrv(btn) {
  const item = btn.closest('.srv-item');
  if (!item) return;
  const list = item.closest('.srv-list');
  if (!list) return;

  const isOpen = item.classList.contains('open');
  list.querySelectorAll('.srv-item.open').forEach(el => el.classList.remove('open'));
  if (!isOpen) item.classList.add('open');
}


/* ── Firebase (Firestore for hub) ────────────────────────── */
import('https://www.gstatic.com/firebasejs/10.12.1/firebase-app.js').then(({ initializeApp }) => {
  import('https://www.gstatic.com/firebasejs/10.12.1/firebase-firestore.js').then(({
    getFirestore, collection, getDocs, query, orderBy, doc, updateDoc, increment, addDoc
  }) => {
    const firebaseConfig = {
      apiKey:            "AIzaSyALFwIt7_koP1zaN7XP-kjvZHi1yaKOfB4",
      authDomain:        "beyond-data-1013d.firebaseapp.com",
      projectId:         "beyond-data-1013d",
      storageBucket:     "beyond-data-1013d.firebasestorage.app",
      messagingSenderId: "921236694715",
      appId:             "1:921236694715:web:c1d16affcaca65befa2b9e",
    };

    const fbApp = initializeApp(firebaseConfig);
    const db    = getFirestore(fbApp);

    // Expose db and Firestore helpers globally so hub functions can use them
    window._db         = db;
    window._fsHelpers  = { collection, getDocs, query, orderBy, doc, updateDoc, increment, addDoc };
    window._fbReady    = true;

    // If hub was already loaded before Firebase was ready, load hub content now
    if (window._hubWaiting) loadHubContent();
  });
});

/* ── Hub content loader ──────────────────────────────────── */
function typeIcon(type) {
  const icons = {
    pdf:  `<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:#ff4d6a;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round"><path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>`,
    docx: `<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:#00c2ff;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round"><path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/></svg>`,
    link: `<svg viewBox="0 0 24 24" style="width:18px;height:18px;stroke:#00d97e;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round"><path d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244"/></svg>`,
  };
  return icons[type] || icons.pdf;
}

async function loadHubContent() {
  const db          = window._db;
  const { collection, getDocs, query, orderBy } = window._fsHelpers;

  const loadingEl = document.getElementById('hub-loading');
  const gridEl    = document.getElementById('hubGrid');
  const emptyEl   = document.getElementById('hub-empty');
  if (!loadingEl) return; // hub page not in DOM yet

  try {
    const snap = await getDocs(query(collection(db, 'files'), orderBy('createdAt', 'desc')));
    loadingEl.style.display = 'none';

    if (snap.empty) {
      if (emptyEl) emptyEl.style.display = 'block';
      return;
    }

    if (gridEl) {
      gridEl.style.display = 'grid';
      gridEl.innerHTML = snap.docs.map(d => {
        const f = d.data();
        return `
          <div class="res-card" style="background:var(--navy-mid);border:1px solid var(--border);border-radius:12px;padding:22px;display:flex;flex-direction:column;gap:12px">
            <div style="display:flex;align-items:center;gap:10px">
              ${typeIcon(f.type)}
              <span style="font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:0.08em;color:var(--text-muted)">${f.type.toUpperCase()}</span>
            </div>
            <h3 style="font-size:15px;font-weight:600;color:#fff;line-height:1.4">${f.title}</h3>
            ${f.description ? `<p style="font-size:13px;color:var(--text-muted);line-height:1.6">${f.description}</p>` : ''}
            <div style="margin-top:auto;padding-top:8px">
              <button
                class="btn btn-p"
                style="font-size:13px;padding:9px 18px;display:inline-flex;align-items:center;gap:8px"
                onclick="openHubGate('${d.id}', '${f.title.replace(/'/g, "\\'")}', '${f.type}')">
                <svg viewBox="0 0 24 24" style="width:14px;height:14px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round"><path d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>
                Download
              </button>
            </div>
          </div>`;
      }).join('');
    }
  } catch (e) {
    if (loadingEl) loadingEl.textContent = 'Failed to load resources.';
    console.error('Hub load error:', e);
  }
}

window._hubPendingDownload = null;

function openHubGate(fileId, fileTitle, fileType) {
  window._hubPendingDownload = { fileId, fileTitle, fileType };
  openGate(fileTitle);
}

async function completeHubDownload(userName, userEmail, userCompany) {
  const pending = window._hubPendingDownload;
  if (!pending || !window._fbReady) return;

  const db = window._db;
  const { collection, getDocs, doc, updateDoc, increment, addDoc } = window._fsHelpers;

  try {
    // 1. Log download to Firestore
    await addDoc(collection(db, 'downloads'), {
      name:         userName,
      email:        userEmail,
      company:      userCompany || '',
      fileId:       pending.fileId,
      fileTitle:    pending.fileTitle,
      downloadedAt: new Date(),
    });

    // 2. Increment download counter on the file
    await updateDoc(doc(db, 'files', pending.fileId), {
      downloadCount: increment(1)
    });

    // 3. Fetch file and trigger download
    const snap    = await getDocs(collection(db, 'files'));
    const fileDoc = snap.docs.find(d => d.id === pending.fileId);
    if (fileDoc) {
      const f = fileDoc.data();
      if (f.externalUrl) {
        window.open(f.externalUrl, '_blank');
      } else if (f.base64) {
        const a    = document.createElement('a');
        a.href     = f.base64;
        a.download = f.fileName || f.title;
        a.click();
      }
    }

    // 4. Send email notification via FormSubmit
    const formData = new FormData();
    formData.append("Name",      userName);
    formData.append("Email",     userEmail);
    formData.append("Company",   userCompany || "Not provided");
    formData.append("File",      pending.fileTitle);
    formData.append("_subject", "New Download — " + pending.fileTitle);
    formData.append("_template", "table");
    fetch("https://formsubmit.co/ajax/letstalk@beyond-data.net", {
      method: "POST", body: formData
    }).catch(() => {});

  } catch (err) {
    console.error('Download error:', err);
  }

  window._hubPendingDownload = null;
}


/* ── View router ─────────────────────────────────────────── */
const loadedPages = new Set(['home']);

async function show(page) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const view = document.getElementById(`view-${page}`);

  if (!loadedPages.has(page)) {
    try {
      const res  = await fetch(`pages/${page}.html`);
      const html = await res.text();
      view.innerHTML = html;
      loadedPages.add(page);
      if (page === 'hub') {
        // If Firebase is ready load immediately, else flag for when it's ready
        if (window._fbReady) {
          loadHubContent();
        } else {
          window._hubWaiting = true;
        }
      }
    } catch (e) {
      view.innerHTML = '<p style="color:red;padding:2rem">Failed to load page.</p>';
    }
  } else if (page === 'hub') {
    // Page was already loaded but user navigated away and back — reload hub content
    if (window._fbReady) loadHubContent();
  }

  view.classList.add('active');
  window.scrollTo(0, 0);

  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  const navMap = { home: 0, solutions: 1, services: 2, hub: 3 };
  const links  = document.querySelectorAll('.nav-links > a');
  if (navMap[page] !== undefined) links[navMap[page]].classList.add('active');
}


/* ── Partners scroll ─────────────────────────────────────── */
function goToPartners() {
  show('home');
  setTimeout(() => {
    const partnerSection = document.getElementById('partners');
    if (partnerSection) partnerSection.scrollIntoView({ behavior: 'smooth' });
  }, 100);
}


/* ── Mobile nav toggle ───────────────────────────────────── */
function toggleNav() {
  const nav = document.getElementById("mainNav");
  nav.style.display = nav.style.display === "flex" ? "none" : "flex";
}


/* ── Gate modal ──────────────────────────────────────────── */
function openGate(title) {
  document.getElementById("gateDocTitle").textContent = title;
  document.getElementById("gateOverlay").classList.add("open");
  document.body.style.overflow = "hidden";
  prefillGate();
}

function closeGate() {
  document.getElementById("gateOverlay").classList.remove("open");
  document.body.style.overflow = "";
}

document.getElementById("gateOverlay").addEventListener("click", function (e) {
  if (e.target === this) closeGate();
});
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") closeGate();
});

const PERSONAL_DOMAINS = new Set([
  'gmail.com','yahoo.com','hotmail.com','outlook.com','live.com','icloud.com',
  'me.com','mac.com','aol.com','protonmail.com','proton.me','mail.com',
  'zoho.com','yandex.com','gmx.com','inbox.com','rediffmail.com','msn.com',
]);

function submitGate() {
  const n  = document.getElementById("gName").value.trim();
  const em = document.getElementById("gEmail").value.trim();
  const co = document.getElementById("gCompany").value.trim();
  const c  = document.getElementById("gConsent").checked;

  if (!n || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em) || !c) {
    showNotif("Missing details", "Please fill in your name, a valid email, and agree to the Privacy Policy.");
    return;
  }

  const domain = em.split('@')[1].toLowerCase();
  if (PERSONAL_DOMAINS.has(domain)) {
    showNotif("Work email required", "Please use your work email address to download this resource.");
    return;
  }

  localStorage.setItem('gd_name',    n);
  localStorage.setItem('gd_email',   em);
  localStorage.setItem('gd_company', co);

  closeGate();

  // Complete the hub download (logs to Firestore + triggers file + sends email)
  completeHubDownload(n, em, co);

  showNotif("Download Ready!", "Thank you " + n + "! We'll email a copy to " + em + ".");
}

function prefillGate() {
  const name    = localStorage.getItem('gd_name');
  const email   = localStorage.getItem('gd_email');
  const company = localStorage.getItem('gd_company');
  if (name)    document.getElementById('gName').value    = name;
  if (email)   document.getElementById('gEmail').value   = email;
  if (company) document.getElementById('gCompany').value = company;
}


/* ── Contact form helpers ────────────────────────────────── */
function cfLive(fId, iId, type) {
  const field = document.getElementById(fId);
  const input = document.getElementById(iId);
  const val   = input.value.trim();
  if (!val) { field.classList.remove("ok", "err"); return; }
  let ok = type === "name"
    ? val.length >= 2
    : type === "email"
      ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)
      : val !== "";
  field.classList.toggle("ok",  ok);
  field.classList.toggle("err", !ok);
}

function cfMsgInput() {
  const ta  = document.getElementById("cf-msg");
  const cc  = document.getElementById("cf-char");
  const len = ta.value.length;
  cc.textContent = len + " / 1000";
  cc.classList.toggle("warn", len > 900);
  if (ta.value.trim().length >= 20) {
    document.getElementById("ff-msg").classList.add("ok");
    document.getElementById("ff-msg").classList.remove("err");
    document.getElementById("cf-msg-err").style.display = "none";
  }
  if (len > 1000) ta.value = ta.value.slice(0, 1000);
}

function cfConsentChange() {
  document.getElementById("cf-consent-err").style.display = "none";
}

function cfValidate() {
  let ok = true;

  const name = document.getElementById("cf-name").value.trim();
  const ff   = document.getElementById("ff-name");
  if (name.length < 2) { ff.classList.add("err"); ff.classList.remove("ok"); ok = false; }
  else                  { ff.classList.remove("err"); ff.classList.add("ok"); }

  const email = document.getElementById("cf-email").value.trim();
  const fe    = document.getElementById("ff-email");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { fe.classList.add("err"); fe.classList.remove("ok"); ok = false; }
  else                                              { fe.classList.remove("err"); fe.classList.add("ok"); }

  const subj = document.getElementById("cf-subject").value;
  const fs   = document.getElementById("ff-subject");
  if (!subj) { fs.classList.add("err"); fs.classList.remove("ok"); ok = false; }
  else        { fs.classList.remove("err"); fs.classList.add("ok"); }

  const msg = document.getElementById("cf-msg").value.trim();
  const fm  = document.getElementById("ff-msg");
  const me  = document.getElementById("cf-msg-err");
  if (msg.length < 20) {
    fm.classList.add("err"); fm.classList.remove("ok");
    me.style.display = "block"; ok = false;
  } else {
    fm.classList.remove("err"); fm.classList.add("ok");
    me.style.display = "none";
  }

  const consent = document.getElementById("cf-consent").checked;
  if (!consent) { document.getElementById("cf-consent-err").style.display = "block"; ok = false; }
  else           { document.getElementById("cf-consent-err").style.display = "none"; }

  return ok;
}

function cfSubmit() {
  if (!cfValidate()) return;
  const btn = document.getElementById("cf-submitBtn");
  btn.disabled = true;
  btn.innerHTML = '<div class="spinner"></div> Sending...';

  const name    = document.getElementById("cf-name").value.trim();
  const email   = document.getElementById("cf-email").value.trim();
  const company = document.getElementById("cf-company").value.trim();
  const phone   = document.getElementById("cf-phone").value.trim();
  const subject = document.getElementById("cf-subject").value;
  const msg     = document.getElementById("cf-msg").value.trim();

  const formData = new FormData();
  formData.append("name",    name);
  formData.append("email",   email);
  formData.append("company", company || "Not provided");
  formData.append("phone",   phone   || "Not provided");
  formData.append("subject", subject);
  formData.append("message", msg);

  fetch("https://formsubmit.co/ajax/letstalk@beyond-data.net", {
    method: "POST",
    body: formData,
  })
    .then(function (res) {
      if (res.ok) {
        document.getElementById("cf-successDetail").innerHTML =
          "<strong>Submission summary</strong>Name: " + name +
          "<br>Email: " + email +
          (company ? "<br>Company: " + company : "") +
          (phone   ? "<br>Phone: "   + phone   : "") +
          "<br>Topic: " + subject;
        document.getElementById("cf-formArea").style.display     = "none";
        document.getElementById("cf-successState").style.display = "block";
        showNotif("Message sent!", "We'll be in touch with you soon.");
      } else {
        btn.disabled  = false;
        btn.innerHTML = '<svg viewBox="0 0 24 24" style="width:17px;height:17px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round"><path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>Send message';
        showNotif("Something went wrong", "Please try again or contact us directly.");
      }
    })
    .catch(function () {
      btn.disabled  = false;
      btn.innerHTML = '<svg viewBox="0 0 24 24" style="width:17px;height:17px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round"><path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>Send message';
      showNotif("Network error", "Please check your connection and try again.");
    });
}

function cfReset() {
  document.getElementById("cf-formArea").style.display     = "block";
  document.getElementById("cf-successState").style.display = "none";
  const btn = document.getElementById("cf-submitBtn");
  btn.disabled  = false;
  btn.innerHTML = '<svg viewBox="0 0 24 24" style="width:17px;height:17px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round"><path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>Send message';
  ["ff-name","ff-email","ff-subject","ff-msg"].forEach(id => {
    document.getElementById(id).classList.remove("err","ok");
  });
  document.getElementById("cf-consent-err").style.display = "none";
  document.getElementById("cf-msg-err").style.display     = "none";
  document.getElementById("cf-char").textContent          = "0 / 1000";
  document.querySelectorAll(".cf-input,.cf-select,.cf-textarea").forEach(el => (el.value = ""));
  document.getElementById("cf-consent").checked = false;
}


/* ============================================================
   HERO SLIDER
   ============================================================ */
function initHeroSlider() {
  const INTERVAL = 9000;

  const section = document.getElementById("heroSliderSection");
  if (!section) return;

  const slides   = Array.from(section.querySelectorAll(".hero-slide"));
  const dotsWrap = section.querySelector(".hero-slider-dots");
  if (!slides.length) return;

  let current = 0;
  let timer   = null;

  slides.forEach(slide => {
    const bg = slide.dataset.bg;
    if (bg) {
      const bgEl = slide.querySelector(".hero-slide-bg");
      if (bgEl) bgEl.style.backgroundImage = "url('" + bg + "')";
    }
  });

  slides.forEach((_, i) => {
    const dot = document.createElement("button");
    dot.setAttribute("aria-label", "Go to slide " + (i + 1));
    if (i === 0) dot.classList.add("active");
    dot.addEventListener("click", () => goTo(i));
    dotsWrap.appendChild(dot);
  });

  function getDots() { return Array.from(dotsWrap.querySelectorAll("button")); }

  function goTo(index) {
    slides[current].classList.remove("active");
    getDots()[current].classList.remove("active");
    current = (index + slides.length) % slides.length;
    slides[current].classList.add("active");
    getDots()[current].classList.add("active");
  }

  function next() { goTo(current + 1); }
  function prev() { goTo(current - 1); }

  slides[0].classList.add("active");

  function startTimer() { timer = setInterval(next, INTERVAL); }
  function stopTimer()  { clearInterval(timer); }

  startTimer();

  section.addEventListener("mouseenter", stopTimer);
  section.addEventListener("mouseleave", startTimer);

  const btnNext = section.querySelector(".hero-arrow-next");
  const btnPrev = section.querySelector(".hero-arrow-prev");
  if (btnNext) btnNext.addEventListener("click", () => { stopTimer(); next(); startTimer(); });
  if (btnPrev) btnPrev.addEventListener("click", () => { stopTimer(); prev(); startTimer(); });

  let touchStartX = 0;
  section.addEventListener("touchstart", e => { touchStartX = e.touches[0].clientX; }, { passive: true });
  section.addEventListener("touchend", e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) {
      stopTimer();
      dx < 0 ? next() : prev();
      startTimer();
    }
  });
}


/* ── Site Footer web component ───────────────────────────── */
class SiteFooter extends HTMLElement {
  connectedCallback() {
    this.innerHTML = `
      <footer class="site-footer">
        <div class="container">
          <div class="footer-grid">
            <div class="footer-brand" style="display:flex;flex-direction:column;align-items:center;justify-content:center">
              <img src="assets/icons/full-logo.png" alt="Beyond Data" style="height:8rem;width:auto" />
            </div>
            <div class="footer-col">
              <h4 style="color: #00c2ff;">Solutions</h4>
              <ul>
                <li><a onclick="show('solutions'); setTimeout(() => document.getElementById('solution-1').scrollIntoView({behavior:'smooth'}), 100)">Cyber Threat Intelligence</a></li>
                <li><a onclick="show('solutions'); setTimeout(() => document.getElementById('solution-2').scrollIntoView({behavior:'smooth'}), 100)">Digital Risk Protection</a></li>
                <li><a onclick="show('solutions'); setTimeout(() => document.getElementById('solution-3').scrollIntoView({behavior:'smooth'}), 100)">Blockchain &amp; Web 3.0</a></li>
                <li><a onclick="show('solutions'); setTimeout(() => document.getElementById('solution-4').scrollIntoView({behavior:'smooth'}), 100)">Intelligence Fusion</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4 style="color: #00c2ff;">Company</h4>
              <ul>
                <li><a onclick="show('about')">About Us</a></li>
                <li><a onclick="show('services')">Services</a></li>
                <li><a onclick="show('hub')">Knowledge Hub</a></li>
                <li><a onclick="show('contact')">Contact</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4 style="color: #00c2ff;">Global offices</h4>
              <div class="office"><strong>Middle East</strong>Dubai, UAE</div>
              <div class="office"><strong>Africa</strong>Cairo, Egypt</div>
              <div class="office"><strong>Australasia</strong>Sydney, Australia</div>
            </div>
          </div>
          <div class="footer-bottom">
            <p>&copy; 2026 Beyond Data. All rights reserved.</p>
            <div class="footer-bottom-links"><a href="#" onclick="event.preventDefault(); openPP()">Privacy Policy</a></div>
          </div>
        </div>
      </footer>`;
  }
}

/* ── Privacy Policy Modal ────────────────────────────────── */
function openPP() {
  const iframe = document.getElementById('ppIframe');
  // Load the PDF only on first open to avoid unnecessary requests
  if (!iframe.src || iframe.src === window.location.href) {
    iframe.src = 'assets/Beyond_Data_Privacy_Policy.pdf#toolbar=0&navpanes=0&scrollbar=0';
  }
  document.getElementById('ppOverlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closePP() {
  document.getElementById('ppOverlay').classList.remove('open');
  document.body.style.overflow = '';
}

// Close on backdrop click
document.getElementById('ppOverlay').addEventListener('click', function(e) {
  if (e.target === this) closePP();
});

// Close on Escape (extend existing keydown listener or add new one)
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closePP();
});

customElements.define('site-footer', SiteFooter);

/* ── Load hero slider component ──────────────────────────── */
async function loadComponents() {
  try {
    const res  = await fetch('components/hero-slider.html');
    const html = await res.text();
    document.getElementById('heroSliderSlot').innerHTML = html;
    initHeroSlider();
  } catch (e) {
    console.error('Failed to load hero slider:', e);
  }
}

loadComponents();