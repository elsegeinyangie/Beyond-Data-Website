/* ============================================================
   Beyond Data — Main JavaScript
   ============================================================ */

/* ── View router ─────────────────────────────────────────── */
const loadedPages = new Set(['home']); // home is already inline

/* Updated show function in main.js */
async function show(page) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  const view = document.getElementById(`view-${page}`);

  if (!loadedPages.has(page)) {
    try {
      const res = await fetch(`pages/${page}.html`);
      const html = await res.text();
      view.innerHTML = html;
      loadedPages.add(page);
      if (page === 'hub') initHubFilters();
    } catch (e) {
      view.innerHTML = '<p style="color:red;padding:2rem">Failed to load page.</p>';
    }
  }

  view.classList.add('active');
  window.scrollTo(0, 0);

  // FIXED NAV HIGHLIGHT LOGIC
  document.querySelectorAll('.nav-links a').forEach(a => a.classList.remove('active'));
  
  // Mapping updated to match your HTML order: 
  // [Home (0), Solutions (1), Services (2), Knowledge Hub (3)]
  const navMap = { home: 0, solutions: 1, services: 2, hub: 3 };
  const links = document.querySelectorAll('.nav-links > a'); // Notice the '>' to only target direct links
  
  if (navMap[page] !== undefined) links[navMap[page]].classList.add('active');
}


/* Add this to main.js */
function goToPartners() {
  // 1. Ensure we are on the home view first
  show('home');
  
  // 2. Wait a tiny bit for the view to become visible, then scroll
  setTimeout(() => {
    const partnerSection = document.getElementById('partners');
    if (partnerSection) {
      partnerSection.scrollIntoView({ behavior: 'smooth' });
    }
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

function submitGate() {
  const n  = document.getElementById("gName").value.trim();
  const em = document.getElementById("gEmail").value.trim();
  const c  = document.getElementById("gConsent").checked;
  if (!n || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em) || !c) {
    alert("Please fill in your name, a valid email, and agree to the Privacy Policy.");
    return;
  }
  closeGate();
  alert("Thank you " + n + "! Your download is ready. We will email a copy to " + em + ".");
}

/* ── Knowledge Hub filters ───────────────────────────────── */
// Wrapped in a function because the hub HTML doesn't exist until
// the user clicks the Knowledge Hub nav link and the page is fetched.
function initHubFilters() {
  document.querySelectorAll(".kh-filter").forEach(btn => {
    btn.addEventListener("click", function () {
      document.querySelectorAll(".kh-filter").forEach(b => b.classList.remove("active"));
      this.classList.add("active");
      const type = this.dataset.type;
      document.querySelectorAll(".res-card").forEach(card => {
        card.style.display = type === "all" || card.dataset.type === type ? "" : "none";
      });
    });
  });
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
        document.getElementById("cf-formArea").style.display    = "none";
        document.getElementById("cf-successState").style.display = "block";
      } else {
        btn.disabled  = false;
        btn.innerHTML = '<svg viewBox="0 0 24 24" style="width:17px;height:17px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round"><path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>Send message';
        alert("There was a problem sending your message. Please try again.");
      }
    })
    .catch(function () {
      btn.disabled  = false;
      btn.innerHTML = '<svg viewBox="0 0 24 24" style="width:17px;height:17px;stroke:currentColor;fill:none;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round"><path d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"/></svg>Send message';
      alert("Network error. Please check your connection and try again.");
    });
}

function cfReset() {
  document.getElementById("cf-formArea").style.display    = "block";
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
  const INTERVAL = 5000;

  const section = document.getElementById("heroSliderSection");
  if (!section) return;

  const slides   = Array.from(section.querySelectorAll(".hero-slide"));
  const dotsWrap = section.querySelector(".hero-slider-dots");
  if (!slides.length) return;

  let current = 0;
  let timer   = null;

  // Apply background images from data-bg attribute
  slides.forEach(slide => {
    const bg = slide.dataset.bg;
    if (bg) {
      const bgEl = slide.querySelector(".hero-slide-bg");
      if (bgEl) bgEl.style.backgroundImage = "url('" + bg + "')";
    }
  });

  // Build dot buttons
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
              <img src="assets/full-logo.png" alt="Beyond Data" style="height:8rem;width:auto" />
            </div>
            <div class="footer-col">
              <h4>Solutions</h4>
              <ul>
                <li><a onclick="show('solutions')">Cyber Threat Intelligence</a></li>
                <li><a onclick="show('solutions')">Digital Risk Protection</a></li>
                <li><a onclick="show('solutions')">Blockchain &amp; Web 3.0</a></li>
                <li><a onclick="show('solutions')">Intelligence Fusion</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Company</h4>
              <ul>
                <li><a onclick="show('about')">About Us</a></li>
                <li><a onclick="show('services')">Services</a></li>
                <li><a onclick="show('hub')">Knowledge Hub</a></li>
                <li><a onclick="show('contact')">Contact</a></li>
              </ul>
            </div>
            <div class="footer-col">
              <h4>Global offices</h4>
              <div class="office"><strong>Middle East</strong>Dubai South, Dubai, UAE</div>
              <div class="office"><strong>Africa</strong>New Cairo, Cairo, Egypt</div>
              <div class="office"><strong>APAC</strong>Sydney, NSW, Australia</div>
            </div>
          </div>
          <div class="footer-bottom">
            <p>&copy; 2026 Beyond Data. All rights reserved.</p>
            <div class="footer-bottom-links"><a>Privacy Policy</a><a>Terms of Use</a></div>
          </div>
        </div>
      </footer>`;
  }
}

customElements.define('site-footer', SiteFooter);

/* ── Load hero slider component ──────────────────────────── */
// Fetches components/hero-slider.html and injects it into
// the #heroSliderSlot div, then initialises the slider JS.
async function loadComponents() {
  try {
    const res = await fetch('components/hero-slider.html');
    const html = await res.text();
    document.getElementById('heroSliderSlot').innerHTML = html;
    initHeroSlider();
  } catch (e) {
    console.error('Failed to load hero slider:', e);
  }
}

loadComponents();
