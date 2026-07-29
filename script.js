/* =========================
   PORTFOLIO DATA STORE & ADMIN
   ========================= */

/* Global Terminal Command Execution Handler */
window.runTerminalCmd = function(cmd) {
  const output = document.getElementById('terminal-output');
  if (!output) return;

  if (cmd === 'clear') {
    output.innerHTML = `
      <p><span class="term-prompt">sanket@ai-engine:~$</span> system.clear()</p>
      <p class="term-res"><span class="term-info">[INFO]</span> Terminal reset. Ready for user query.</p>
    `;
    return;
  }

  if (cmd === 'skills') {
    output.innerHTML += `
      <p><span class="term-prompt">sanket@ai-engine:~$</span> fetch.tech_stack()</p>
      <p class="term-res"><span class="term-success">[AI & ML]</span> PyTorch, TensorFlow, OpenCV, Scikit-learn, CNNs, Transformers</p>
      <p class="term-res"><span class="term-success">[SOFTWARE]</span> Python, React.js, JavaScript, SQL, HTML5/CSS3, REST APIs, Git</p>
    `;
  } else if (cmd === 'models') {
    output.innerHTML += `
      <p><span class="term-prompt">sanket@ai-engine:~$</span> eval.models_matrix()</p>
      <p class="term-res"><span class="term-success">[ACCURACY]</span> 99.4% average across CV classification testbeds</p>
      <p class="term-res"><span class="term-success">[INFERENCE]</span> Fast batch processing & web optimization active</p>
    `;
  } else if (cmd === 'bio') {
    output.innerHTML += `
      <p><span class="term-prompt">sanket@ai-engine:~$</span> bio.summary()</p>
      <p class="term-res"><span class="term-info">[BIO]</span> Sanket Sahane is a Software & AI Engineer passionate about building deep learning models, computer vision pipelines, and modern web applications.</p>
    `;
  } else if (cmd === 'contact') {
    output.innerHTML += `
      <p><span class="term-prompt">sanket@ai-engine:~$</span> fetch.contact_info()</p>
      <p class="term-res"><span class="term-success">[EMAIL]</span> sanketsahane56@gmail.com</p>
      <p class="term-res"><span class="term-success">[LOCATION]</span> Pune, Maharashtra, India</p>
      <p class="term-res"><span class="term-success">[STATUS]</span> 🟢 Open for AI & Software Roles</p>
    `;
  } else if (cmd === 'demo') {
    output.innerHTML += `
      <p><span class="term-prompt">sanket@ai-engine:~$</span> run.ai_demo_simulation()</p>
      <p class="term-res"><span class="term-info">[SIMULATOR]</span> Initializing Computer Vision pipeline...</p>
      <p class="term-res"><span class="term-success">[SUCCESS]</span> 42 Objects detected in frame | Confidence: 99.8%</p>
    `;
  }

  output.scrollTop = output.scrollHeight;
};

const DEFAULT_PROJECTS = [
  {
    id: 1,
    title: "Data Science & ML Analytics Dashboard",
    desc: "End-to-end Machine Learning model analysis, dataset exploration, and data analytics dashboard.",
    link: "#",
    img: "data science.png"
  },
  {
    id: 2,
    title: "Interactive Resume Creator",
    desc: "Interactive Resume Creator Website for building custom professional resumes.",
    link: "https://sanketsahane56.github.io/resume-creator-/",
    img: "resumeweb.png"
  },
  {
    id: 3,
    title: "AI & Data Science Portfolio",
    desc: "Fully animated, interactive personal portfolio webpage showcasing AI, ML, Data Science projects & admin suite.",
    link: "#",
    img: "profileweb.png"
  }
];

const DEFAULT_PROFILE = {
  name: "Sanket Sahane",
  tagline: "AI & Data Science Student | Machine Learning & Analytics Specialist | Full Stack Developer",
  location: "Pune, Maharashtra, India",
  expertise: "Data Science, AI/ML & Analytics",
  email: "sanketsahane56@gmail.com",
  badges: [
    "AI & Data Science Student",
    "Data Analytics Specialist",
    "Machine Learning Engineer",
    "Deep Learning Researcher",
    "Python & SQL Developer"
  ]
};


// Cache variables for immediate rendering
let cachedProjects = DEFAULT_PROJECTS;
let cachedProfile = DEFAULT_PROFILE;

async function fetchPortfolioProjectsFromDB() {
  try {
    const res = await fetch("/api/projects");
    if (res.ok) {
      cachedProjects = await res.json();
      localStorage.setItem("portfolio_projects", JSON.stringify(cachedProjects));
      return cachedProjects;
    }
  } catch (e) {
    console.warn("API unavailable, falling back to localStorage", e);
  }
  const data = localStorage.getItem("portfolio_projects");
  cachedProjects = data ? JSON.parse(data) : DEFAULT_PROJECTS;
  return cachedProjects;
}

async function addProjectToDB(proj) {
  try {
    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(proj)
    });
    if (res.ok) {
      await fetchPortfolioProjectsFromDB();
      hydratePortfolioDOM();
      return true;
    }
  } catch (e) {
    console.warn("API unavailable, saving to localStorage", e);
  }
  // LocalStorage fallback
  const projects = getPortfolioProjects();
  projects.push({ ...proj, id: Date.now() });
  savePortfolioProjects(projects);
  return true;
}

async function deleteProjectFromDB(id) {
  try {
    const res = await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      await fetchPortfolioProjectsFromDB();
      hydratePortfolioDOM();
      return true;
    }
  } catch (e) {
    console.warn("API unavailable, deleting from localStorage", e);
  }
  const projects = getPortfolioProjects().filter(p => p.id != id);
  savePortfolioProjects(projects);
  return true;
}

async function fetchPortfolioProfileFromDB() {
  try {
    const res = await fetch("/api/profile");
    if (res.ok) {
      cachedProfile = await res.json();
      localStorage.setItem("portfolio_profile", JSON.stringify(cachedProfile));
      return cachedProfile;
    }
  } catch (e) {
    console.warn("API unavailable, falling back to localStorage", e);
  }
  const data = localStorage.getItem("portfolio_profile");
  cachedProfile = data ? JSON.parse(data) : DEFAULT_PROFILE;
  return cachedProfile;
}

async function saveProfileToDB(prof) {
  try {
    const res = await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(prof)
    });
    if (res.ok) {
      await fetchPortfolioProfileFromDB();
      hydratePortfolioDOM();
      return true;
    }
  } catch (e) {
    console.warn("API unavailable, saving profile to localStorage", e);
  }
  savePortfolioProfile(prof);
  return true;
}

async function resetDBToDefaults() {
  try {
    const res = await fetch("/api/reset", { method: "POST" });
    if (res.ok) {
      await fetchPortfolioProjectsFromDB();
      await fetchPortfolioProfileFromDB();
      hydratePortfolioDOM();
      return true;
    }
  } catch (e) {
    console.warn("API unavailable, resetting localStorage", e);
  }
  resetPortfolioDefaults();
  return true;
}

function getPortfolioProjects() {
  return cachedProjects;
}

function savePortfolioProjects(projects) {
  cachedProjects = projects;
  localStorage.setItem("portfolio_projects", JSON.stringify(projects));
  hydratePortfolioDOM();
}

function getPortfolioProfile() {
  return cachedProfile;
}

function savePortfolioProfile(profile) {
  cachedProfile = profile;
  localStorage.setItem("portfolio_profile", JSON.stringify(profile));
  hydratePortfolioDOM();
}

function resetPortfolioDefaults() {
  cachedProjects = DEFAULT_PROJECTS;
  cachedProfile = DEFAULT_PROFILE;
  localStorage.setItem("portfolio_projects", JSON.stringify(DEFAULT_PROJECTS));
  localStorage.setItem("portfolio_profile", JSON.stringify(DEFAULT_PROFILE));
  hydratePortfolioDOM();
}

// Dynamic DOM Hydration across all pages
function hydratePortfolioDOM() {
  const prof = getPortfolioProfile();

  // Name Highlights & Titles & Logotext
  document.querySelectorAll('.name-highlight, .logo-text, .logo, .prof-name-text').forEach(el => {
    el.textContent = prof.name || "Sanket Sahane";
  });

  // Tagline / Subtitle
  document.querySelectorAll('.tagline, .prof-tagline-text').forEach(el => {
    if (el.id !== 'typed-headline') {
      el.textContent = prof.tagline || "";
    }
  });

  // Contact Email
  document.querySelectorAll('.prof-email-text').forEach(el => {
    el.textContent = prof.email || "sanketsahane56@gmail.com";
  });
  document.querySelectorAll('a[href^="mailto:"]').forEach(el => {
    if (prof.email) el.href = `mailto:${prof.email}`;
  });

  // Location
  document.querySelectorAll('.prof-location-text').forEach(el => {
    el.textContent = prof.location || "Pune, Maharashtra, India";
  });

  // Primary Focus / Expertise
  document.querySelectorAll('.prof-expertise-text').forEach(el => {
    el.textContent = prof.expertise || "Data Science, AI/ML & Analytics";
  });

  // Info boxes (Location, Expertise, Contact)
  const infoBoxes = document.querySelectorAll('.info-box');
  if (infoBoxes.length >= 3) {
    const locSpan = infoBoxes[0].querySelector('span');
    if (locSpan && prof.location) locSpan.textContent = prof.location;

    const expSpan = infoBoxes[1].querySelector('span');
    if (expSpan && prof.expertise) expSpan.textContent = prof.expertise;

    const emailSpan = infoBoxes[2].querySelector('span');
    if (emailSpan && prof.email) emailSpan.textContent = prof.email;
  }

  // Skills Badges
  const badgesContainer = document.querySelector('.skills-badges:not(.hero-badges)');
  if (badgesContainer && prof.badges && Array.isArray(prof.badges)) {
    badgesContainer.innerHTML = prof.badges.map(b => `<span>${b}</span>`).join('');
  }

  // Render Projects & Certifications across all pages
  renderProjectsList();
  renderCertsList();
}
window.hydratePortfolioDOM = hydratePortfolioDOM;

function renderProjectsList() {
  const containers = document.querySelectorAll('#projects-container, .dynamic-projects-grid');
  const certGrid = document.querySelector('.cert-grid');
  const projects = getPortfolioProjects();

  containers.forEach(container => {
    container.innerHTML = "";
    if (projects.length === 0) {
      container.innerHTML = `<p style="color:#aaa; grid-column:span 3; text-align:center; padding:30px;">No projects found.</p>`;
    } else {
      projects.forEach((proj, idx) => {
        const card = document.createElement('div');
        card.className = 'showcase-card';
        card.setAttribute('data-aos', 'fade-up');
        card.setAttribute('data-aos-delay', (idx * 100).toString());

        const liveLinkHtml = proj.link && proj.link !== '#' 
          ? `<a href="${proj.link}" target="_blank" class="overlay-btn"><i class="fa-solid fa-arrow-up-right-from-square"></i> Open App</a>`
          : `<a href="#" class="overlay-btn" onclick="return false;"><i class="fa-solid fa-circle-info"></i> View Details</a>`;

        card.innerHTML = `
          <div class="showcase-img-box">
            <img src="${proj.img || 'profileweb.png'}" alt="${proj.title}" onclick="typeof openLightbox !== 'undefined' ? openLightbox(this.src) : null" onerror="this.src='profileweb.png'">
            <div class="showcase-overlay">
              ${liveLinkHtml}
            </div>
          </div>
          <div class="showcase-info">
            <span class="showcase-tag">AI & Data Science</span>
            <h3>${proj.title}</h3>
            <p>${proj.desc}</p>
            <a href="${proj.link || '#'}" target="${proj.link && proj.link !== '#' ? '_blank' : '_self'}" class="showcase-link">
              Explore Project <i class="fa-solid fa-chevron-right"></i>
            </a>
          </div>
        `;
        container.appendChild(card);
      });
    }
  });

  if (certGrid) {
    certGrid.innerHTML = "";
    projects.forEach(proj => {
      const card = document.createElement('div');
      card.className = 'cert-card';
      card.innerHTML = `
        <img src="${proj.img || 'profileweb.png'}" alt="${proj.title}" onerror="this.src='profileweb.png'">
        <h3>${proj.title}</h3>
        <p>${proj.desc}</p>
        <a href="${proj.link || '#'}" target="${proj.link && proj.link !== '#' ? '_blank' : '_self'}">
          View Project
        </a>
      `;
      certGrid.appendChild(card);
    });
  }
}
window.renderProjectsList = renderProjectsList;

function getAdminCerts() {
  const saved = localStorage.getItem("portfolio_certs");
  return saved ? JSON.parse(saved) : [
    { id: 1, title: "SQL For Data Analytics", desc: "Comprehensive hands-on training with complex database queries, data manipulation, and analytics projects.", img: "SQL.jpg", tag: "Database Analytics" },
    { id: 2, title: "SQL for Data Science Specialization", desc: "Advanced SQL data extraction, statistical aggregation, and relational database modeling for data science pipelines.", img: "data science.png", tag: "Data Science" },
    { id: 3, title: "Generative AI Fundamentals", desc: "Certification covering Large Language Models (LLMs), prompt engineering strategies, and generative neural architectures.", img: "GI.png", tag: "Generative AI" }
  ];
}
window.getAdminCerts = getAdminCerts;

function renderCertsList() {
  const certsContainers = document.querySelectorAll('#certs-container, .dynamic-certs-grid');
  certsContainers.forEach(container => {
    const certs = getAdminCerts();
    container.innerHTML = "";

    if (certs.length === 0) {
      container.innerHTML = `<p style="color:#aaa; grid-column:span 3; text-align:center; padding:30px;">No certifications found.</p>`;
      return;
    }

    certs.forEach((cert, idx) => {
      const card = document.createElement('div');
      card.className = 'showcase-card';
      card.setAttribute('data-aos', 'fade-up');
      card.setAttribute('data-aos-delay', (idx * 100).toString());

      card.innerHTML = `
        <div class="showcase-img-box" style="height: 200px; cursor: pointer;" onclick="typeof openCertModal !== 'undefined' ? openCertModal('${cert.img}') : (typeof openLightbox !== 'undefined' ? openLightbox('${cert.img}') : null)">
          <img src="${cert.img}" alt="${cert.title}" onerror="this.src='profileweb.png'">
          <div class="showcase-overlay">
            <span class="overlay-btn"><i class="fa-solid fa-expand"></i> View High-Res</span>
          </div>
        </div>
        <div class="showcase-info">
          <span class="showcase-tag">${cert.tag || 'Certification'}</span>
          <h3>${cert.title}</h3>
          <p>${cert.desc}</p>
        </div>
      `;
      container.appendChild(card);
    });
  });
}
window.renderCertsList = renderCertsList;

// Real-time Storage Event Listener for instant multi-tab sync
window.addEventListener('storage', (e) => {
  if (['portfolio_projects', 'portfolio_profile', 'portfolio_certs'].includes(e.key)) {
    if (e.key === 'portfolio_projects' && e.newValue) {
      cachedProjects = JSON.parse(e.newValue);
    }
    if (e.key === 'portfolio_profile' && e.newValue) {
      cachedProfile = JSON.parse(e.newValue);
    }
    hydratePortfolioDOM();
  }
});

/* =========================
   GLOBAL ADMIN MODAL & OTP AUTH SYSTEM
   ========================= */

let currentOTPCode = null;

window.ensureAdminModalExists = function() {
  if (document.getElementById('adminModal')) return;

  const modalHtml = `
    <div id="adminModal" class="admin-modal">
      <div class="admin-modal-content">
        <span class="admin-modal-close" onclick="closeAdminModal()">&times;</span>
        
        <!-- Step 1: Login View -->
        <div id="adminLoginStep">
          <div class="admin-modal-header">
            <i class="fa-solid fa-shield-halved" style="font-size:2.5rem; color:var(--neon-cyan); margin-bottom:10px;"></i>
            <h3>Admin Authentication</h3>
            <p style="color:#aaa; font-size:0.85rem; margin-top:5px;">Enter admin password to access control panel</p>
          </div>
          <form onsubmit="submitAdminPassword(event)">
            <div class="admin-input-group">
              <input type="password" id="adminPasswordInput" placeholder="Enter Admin Password" required>
              <button type="submit" class="admin-modal-btn"><i class="fa-solid fa-right-to-bracket"></i> Login to Admin</button>
            </div>
            <div id="adminAuthError" class="admin-auth-error"></div>
          </form>
          <a href="#" class="forgot-pwd-link" onclick="switchAdminModalStep('forgotEmail'); return false;">
            <i class="fa-solid fa-key"></i> Forgot Password?
          </a>
        </div>

        <!-- Step 2: Email Request View -->
        <div id="adminForgotEmailStep" style="display:none;">
          <div class="admin-modal-header">
            <i class="fa-solid fa-envelope-open-text" style="font-size:2.5rem; color:var(--neon-cyan); margin-bottom:10px;"></i>
            <h3>Forgot Admin Password</h3>
            <p style="color:#aaa; font-size:0.85rem; margin-top:5px;">Enter official registered email to receive OTP verification code.</p>
          </div>
          <form onsubmit="sendAdminOTP(event)">
            <div class="admin-input-group">
              <input type="email" id="adminOfficialEmail" value="sanketsahane56@gmail.com" placeholder="official@email.com" required>
              <button type="submit" class="admin-modal-btn"><i class="fa-solid fa-paper-plane"></i> Send OTP Verification Code</button>
            </div>
            <div id="adminForgotError" class="admin-auth-error"></div>
          </form>
          <a href="#" class="forgot-pwd-link" onclick="switchAdminModalStep('login'); return false;">
            <i class="fa-solid fa-arrow-left"></i> Back to Login
          </a>
        </div>

        <!-- Step 3: Enter OTP View -->
        <div id="adminVerifyOTPStep" style="display:none;">
          <div class="admin-modal-header">
            <i class="fa-solid fa-user-shield" style="font-size:2.5rem; color:var(--neon-cyan); margin-bottom:10px;"></i>
            <h3>Enter 6-Digit OTP</h3>
            <p style="color:#aaa; font-size:0.85rem; margin-top:5px;">OTP has been sent to your official email (<span style="color:#00f0ff;">sanketsahane56@gmail.com</span>).</p>
          </div>
          <form onsubmit="verifyAdminOTP(event)">
            <div class="admin-input-group">
              <input type="text" id="adminOTPInput" placeholder="Enter 6-digit OTP code" maxlength="6" pattern="[0-9]{6}" required autocomplete="off" style="letter-spacing:4px; font-weight:bold; text-align:center; font-size:1.2rem;">
              <button type="submit" class="admin-modal-btn"><i class="fa-solid fa-circle-check"></i> Verify OTP Code</button>
            </div>
            <div id="adminOTPNotice" class="security-toast-notice" style="display:none;"></div>
            <div id="adminOTPError" class="admin-auth-error"></div>
          </form>
          <a href="#" class="forgot-pwd-link" onclick="sendAdminOTP(null); return false;">
            <i class="fa-solid fa-rotate"></i> Resend OTP
          </a> | 
          <a href="#" class="forgot-pwd-link" onclick="switchAdminModalStep('login'); return false;">
            Cancel
          </a>
        </div>

        <!-- Step 4: Reset Password View -->
        <div id="adminResetPasswordStep" style="display:none;">
          <div class="admin-modal-header">
            <i class="fa-solid fa-lock" style="font-size:2.5rem; color:var(--neon-cyan); margin-bottom:10px;"></i>
            <h3>Set New Admin Password</h3>
            <p style="color:#aaa; font-size:0.85rem; margin-top:5px;">OTP Verified! Enter your new admin password below.</p>
          </div>
          <form onsubmit="resetAdminPassword(event)">
            <div class="admin-input-group">
              <input type="password" id="newAdminPassword" placeholder="New Password" required minlength="4">
              <input type="password" id="confirmAdminPassword" placeholder="Confirm New Password" required minlength="4">
              <button type="submit" class="admin-modal-btn"><i class="fa-solid fa-floppy-disk"></i> Save New Password</button>
            </div>
            <div id="adminResetError" class="admin-auth-error"></div>
          </form>
        </div>

      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
};

window.switchAdminModalStep = function(step) {
  const loginEl = document.getElementById('adminLoginStep');
  const forgotEmailEl = document.getElementById('adminForgotEmailStep');
  const verifyOTPEl = document.getElementById('adminVerifyOTPStep');
  const resetPwdEl = document.getElementById('adminResetPasswordStep');

  if (loginEl) loginEl.style.display = (step === 'login') ? 'block' : 'none';
  if (forgotEmailEl) forgotEmailEl.style.display = (step === 'forgotEmail') ? 'block' : 'none';
  if (verifyOTPEl) verifyOTPEl.style.display = (step === 'verifyOTP') ? 'block' : 'none';
  if (resetPwdEl) resetPwdEl.style.display = (step === 'resetPwd') ? 'block' : 'none';

  const errs = ['adminAuthError', 'adminForgotError', 'adminOTPError', 'adminResetError'];
  errs.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = "";
  });
};

window.openAdminModal = function() {
  window.ensureAdminModalExists();
  const modal = document.getElementById('adminModal');
  const pwdInput = document.getElementById('adminPasswordInput');

  if (modal) {
    switchAdminModalStep('login');
    if (pwdInput) pwdInput.value = "";
    modal.style.display = 'flex';
    setTimeout(() => { if (pwdInput) pwdInput.focus(); }, 100);
  }
};

window.closeAdminModal = function() {
  const modal = document.getElementById('adminModal');
  if (modal) modal.style.display = 'none';
};

window.getSavedAdminPassword = function() {
  return localStorage.getItem("admin_password") || "sanket9021";
};

window.submitAdminPassword = function(e) {
  if (e) e.preventDefault();
  const inputPwd = document.getElementById('adminPasswordInput').value;
  const errDiv = document.getElementById('adminAuthError');
  const validPwd = getSavedAdminPassword();

  if (inputPwd === validPwd) {
    sessionStorage.setItem("adminLoggedIn", "true");
    window.closeAdminModal();
    window.location.href = "admin.html";
  } else {
    if (errDiv) errDiv.textContent = "❌ Invalid Password! Access Denied.";
  }
};

const EMAILJS_PUBLIC_KEY = "NksTnkaanUQiM4yNf";
const EMAILJS_SERVICE_ID = "service_sqxtsqt";
const EMAILJS_TEMPLATE_ID = "template_hd1nocr";

function initEmailJS() {
  if (typeof emailjs === "undefined") {
    const script = document.createElement("script");
    script.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js";
    script.onload = () => {
      try {
        emailjs.init(EMAILJS_PUBLIC_KEY);
        console.log("[EmailJS] Initialized with public key.");
      } catch (err) {}
    };
    document.head.appendChild(script);
  } else {
    try {
      emailjs.init(EMAILJS_PUBLIC_KEY);
    } catch (err) {}
  }
}
initEmailJS();

window.sendAdminOTP = function(e) {
  if (e) e.preventDefault();
  const emailInput = document.getElementById('adminOfficialEmail').value.trim();
  const errDiv = document.getElementById('adminForgotError');

  if (emailInput.toLowerCase() !== "sanketsahane56@gmail.com") {
    if (errDiv) errDiv.textContent = "❌ Access Denied: Email does not match official admin record.";
    return;
  }

  // Generate 6-digit OTP secretly in memory
  currentOTPCode = Math.floor(100000 + Math.random() * 900000).toString();
  switchAdminModalStep('verifyOTP');

  // Display security notice on screen (NEVER expose OTP code on UI)
  const notice = document.getElementById('adminOTPNotice');
  if (notice) {
    notice.style.display = 'block';
    notice.innerHTML = `📩 <strong>Security Email Dispatched!</strong><br>An OTP verification code has been sent directly to your official email inbox (<b>${emailInput}</b>).<br><span style="font-size:0.8rem; color:#aaa; margin-top:4px; display:inline-block;">Please check your email inbox on your mobile phone or registered device to view your 6-digit code.</span>`;
  }

  const templateParams = {
    to_email: emailInput,
    to_name: "Sanket Sahane",
    from_name: "Portfolio Admin Security",
    otp_code: currentOTPCode,
    otp: currentOTPCode,
    passcode: currentOTPCode,
    message: `Your 6-Digit Admin Password Reset OTP is: ${currentOTPCode}`
  };

  const dispatchEmail = () => {
    if (typeof emailjs !== 'undefined') {
      emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
        .then((res) => {
          console.log("✅ OTP Email Sent Successfully via EmailJS!", res.status, res.text);
        })
        .catch((err) => {
          console.error("❌ EmailJS Delivery Error:", err);
          if (errDiv) errDiv.textContent = "❌ Error sending email via EmailJS: " + JSON.stringify(err);
        });
    }
  };

  if (typeof emailjs === 'undefined') {
    initEmailJS();
    setTimeout(dispatchEmail, 800);
  } else {
    dispatchEmail();
  }

  fetch("/api/send-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: emailInput, otp: currentOTPCode })
  }).catch(() => {});
};

window.verifyAdminOTP = function(e) {
  if (e) e.preventDefault();
  const enteredOTP = document.getElementById('adminOTPInput').value.trim();
  const errDiv = document.getElementById('adminOTPError');

  if (enteredOTP === currentOTPCode) {
    switchAdminModalStep('resetPwd');
  } else {
    if (errDiv) errDiv.textContent = "❌ Incorrect OTP Code! Please try again.";
  }
};

window.resetAdminPassword = function(e) {
  if (e) e.preventDefault();
  const p1 = document.getElementById('newAdminPassword').value;
  const p2 = document.getElementById('confirmAdminPassword').value;
  const errDiv = document.getElementById('adminResetError');

  if (p1 !== p2) {
    if (errDiv) errDiv.textContent = "❌ Passwords do not match!";
    return;
  }

  if (p1.length < 4) {
    if (errDiv) errDiv.textContent = "❌ Password must be at least 4 characters.";
    return;
  }

  localStorage.setItem("admin_password", p1);
  alert("✅ Password changed successfully! You can now login with your new password.");
  switchAdminModalStep('login');
  document.getElementById('adminPasswordInput').value = p1;
};

// Auto open modal if requested
document.addEventListener("DOMContentLoaded", () => {
  window.ensureAdminModalExists();
  if (window.location.search.includes("admin=true") || window.location.hash === "#admin") {
    setTimeout(window.openAdminModal, 300);
  }
});

document.addEventListener("DOMContentLoaded", async () => {
  ensureAdminModalExists();
  await fetchPortfolioProjectsFromDB();
  await fetchPortfolioProfileFromDB();
  hydratePortfolioDOM();
});

// Contact Form Submit safe fallback
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    alert('Message sent successfully!');
    this.reset();
  });
}


// AI Chatbot Demo (Placeholder)
const chatBtn = document.getElementById('chat-btn');
if (chatBtn) {
  chatBtn.addEventListener('click', async () => {
    const input = document.getElementById('chat-input').value;
    const output = document.getElementById('chat-output');
    if (!input) return alert('Type something!');
    output.innerHTML = `You: ${input} <br> AI: This is a demo response.`;
    document.getElementById('chat-input').value = '';
  });
}

// AI Image Generator Demo (Placeholder)
const imgBtn = document.getElementById('img-btn');
if (imgBtn) {
  imgBtn.addEventListener('click', async () => {
    const prompt = document.getElementById('img-prompt').value;
    const output = document.getElementById('img-output');
    if (!prompt) return alert('Enter image description!');
    output.innerHTML = `<p>Generated image for "${prompt}" will appear here (demo).</p>`;
    document.getElementById('img-prompt').value = '';
  });
}

const certUpload = document.getElementById('cert-upload');
const addCertBtn = document.getElementById('add-cert');
const certGrid = document.getElementById('cert-grid');

if (addCertBtn && certUpload && certGrid) {
  addCertBtn.addEventListener('click', () => {
    const files = certUpload.files;
    if (files.length === 0) return alert('Select certificate(s) to upload!');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const certCard = document.createElement('div');
      certCard.classList.add('cert-card');

      // Delete Button
      const delBtn = document.createElement('button');
      delBtn.textContent = '×';
      delBtn.classList.add('delete-btn');
      delBtn.addEventListener('click', () => certCard.remove());
      certCard.appendChild(delBtn);

      if (file.type.startsWith('image/')) {
        // Image certificate
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.alt = file.name;
        certCard.appendChild(img);
      } else if (file.type === "application/pdf") {
        // PDF certificate
        const link = document.createElement('a');
        link.href = URL.createObjectURL(file);
        link.target = "_blank";
        link.textContent = file.name;
        certCard.appendChild(link);
      }

      certGrid.appendChild(certCard);
    }

    certUpload.value = ''; // reset input
  });
}

document.addEventListener("DOMContentLoaded", () => {
  // Subtle parallax background movement
  document.addEventListener("mousemove", (e) => {
    const x = e.clientX / 40;
    const y = e.clientY / 40;
  });
});

document.addEventListener("DOMContentLoaded", () => {
  // Mobile nav drawer toggle & Backdrop overlay management
  let overlay = document.querySelector(".nav-overlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.className = "nav-overlay";
    document.body.appendChild(overlay);
  }

  window.closeMobileMenu = function() {
    const navLinks = document.querySelector(".nav-links");
    const navOverlay = document.querySelector(".nav-overlay");
    const toggles = document.querySelectorAll(".menu-toggle, #menu-toggle-btn");

    if (navLinks) navLinks.classList.remove("active");
    if (navOverlay) navOverlay.classList.remove("active");
    document.body.classList.remove("menu-open");

    toggles.forEach(t => {
      const icon = t.querySelector("i");
      if (icon) icon.className = "fa-solid fa-bars";
    });
  };

  window.toggleMobileMenu = function(e) {
    if (e && e.stopPropagation) e.stopPropagation();
    const navLinks = document.querySelector(".nav-links");
    let navOverlay = document.querySelector(".nav-overlay");
    const toggles = document.querySelectorAll(".menu-toggle, #menu-toggle-btn");

    if (!navOverlay) {
      navOverlay = document.createElement("div");
      navOverlay.className = "nav-overlay";
      document.body.appendChild(navOverlay);
    }
    navOverlay.onclick = window.closeMobileMenu;

    if (!navLinks) return;
    const isOpen = navLinks.classList.toggle("active");
    navOverlay.classList.toggle("active", isOpen);
    document.body.classList.toggle("menu-open", isOpen);

    toggles.forEach(t => {
      const icon = t.querySelector("i");
      if (icon) icon.className = isOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars";
    });
  };

  // Register click/touch event listeners on all menu toggles
  document.querySelectorAll(".menu-toggle, #menu-toggle-btn").forEach(t => {
    t.addEventListener("click", window.toggleMobileMenu);
    t.addEventListener("touchstart", (e) => {
      e.preventDefault();
      window.toggleMobileMenu(e);
    }, { passive: false });
  });

  if (overlay) {
    overlay.addEventListener("click", window.closeMobileMenu);
  }

  // Auto-close menu when clicking any nav link
  document.querySelectorAll(".nav-links a").forEach(link => {
    link.addEventListener("click", window.closeMobileMenu);
  });

  // Close on Escape key press
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      window.closeMobileMenu();
    }
  });

  // Close menu on window resize if expanded to desktop view
  window.addEventListener("resize", () => {
    if (window.innerWidth > 1024) {
      window.closeMobileMenu();
    }
  });

  /* =========================
     3-MODE THEME SYSTEM (Dark -> Sunset -> Light)
     ========================= */
  window.applyTheme = function(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("portfolio_theme", theme);

    document.querySelectorAll(".theme-toggle-btn").forEach(btn => {
      if (theme === "dark") {
        btn.innerHTML = '<i class="fa-solid fa-moon" style="color:#00f0ff;"></i>';
        btn.setAttribute("title", "Mode 1/3: Cyber Void (Click for Sunset Mode)");
      } else if (theme === "sunset") {
        btn.innerHTML = '<i class="fa-solid fa-fire-flame-curved" style="color:#ff9f43;"></i>';
        btn.setAttribute("title", "Mode 2/3: Cyber Sunset (Click for Platinum Light Mode)");
      } else {
        btn.innerHTML = '<i class="fa-solid fa-sun" style="color:#0284c7;"></i>';
        btn.setAttribute("title", "Mode 3/3: Platinum Light (Click for Cyber Void Mode)");
      }
    });
  };

  function initTheme() {
    const saved = localStorage.getItem("portfolio_theme") || "dark";
    window.applyTheme(saved);
  }

  window.toggleTheme = function() {
    const current = document.documentElement.getAttribute("data-theme") || "dark";
    let next = "sunset";
    if (current === "dark") next = "sunset";
    else if (current === "sunset") next = "light";
    else next = "dark";
    window.applyTheme(next);
  };

  // Inject theme toggle button into navbar dynamically if missing
  const navbar = document.querySelector(".navbar-expensive");
  if (navbar && !document.querySelector(".theme-toggle-btn")) {
    const themeBtn = document.createElement("button");
    themeBtn.className = "theme-toggle-btn";
    themeBtn.setAttribute("type", "button");
    themeBtn.onclick = window.toggleTheme;

    const toggleBtn = navbar.querySelector(".menu-toggle");
    if (toggleBtn) {
      navbar.insertBefore(themeBtn, toggleBtn);
    } else {
      navbar.appendChild(themeBtn);
    }
  }

  initTheme();

  // Profile image 3D tilt
  const wrapper = document.querySelector('.profile-image-wrapper');
  const photo = document.querySelector('.profile-img');

  if (wrapper && photo) {
    wrapper.addEventListener('mousemove', (e) => {
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      photo.style.transform = `
        translate(${x / 15}px, ${y / 15}px)
        rotateX(${-y / 25}deg)
        rotateY(${x / 25}deg)
      `;
    });

    wrapper.addEventListener('mouseleave', () => {
      photo.style.transform = '';
    });
  }

  // Resume boxes hover glow
  document.querySelectorAll('.resume-box').forEach(box => {
    if (box) {
      box.addEventListener('mouseenter', () => {
        box.style.boxShadow = '0 0 20px #00ffff';
      });
      box.addEventListener('mouseleave', () => {
        box.style.boxShadow = '';
      });
    }
  });

  // Social icon magnetic hover
  document.querySelectorAll(".platform-icons .icon").forEach(icon => {
    if (icon) {
      icon.addEventListener("mousemove", e => {
        const x = e.offsetX - icon.offsetWidth / 2;
        const y = e.offsetY - icon.offsetHeight / 2;
        icon.style.transform = `translate(${x / 10}px, ${y / 10}px) scale(1.2)`;
      });

      icon.addEventListener("mouseleave", () => {
        icon.style.transform = "";
      });
    }
  });

  // About page photo 3D tilt
  const aboutPhoto = document.querySelector(".about-photo");
  if (aboutPhoto) {
    aboutPhoto.addEventListener("mousemove", (e) => {
      const rect = aboutPhoto.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;

      aboutPhoto.style.transform = `
        rotateX(${-y / 20}deg)
        rotateY(${x / 20}deg)
      `;
    });

    aboutPhoto.addEventListener("mouseleave", () => {
      aboutPhoto.style.transform = "rotateX(0) rotateY(0)";
    });
  }

  // Contact Page Tab Switcher (General Message vs Hire Me Form)
  window.switchContactTab = function(tabName) {
    const msgForm = document.getElementById("general-msg-form");
    const hireForm = document.getElementById("hire-me-form");
    const msgBtn = document.getElementById("tab-btn-msg");
    const hireBtn = document.getElementById("tab-btn-hire");

    if (!msgForm || !hireForm) return;

    if (tabName === "hire") {
      msgForm.style.display = "none";
      hireForm.style.display = "block";
      if (msgBtn) msgBtn.classList.remove("active-tab");
      if (hireBtn) hireBtn.classList.add("active-tab");
    } else {
      hireForm.style.display = "none";
      msgForm.style.display = "block";
      if (hireBtn) hireBtn.classList.remove("active-tab");
      if (msgBtn) msgBtn.classList.add("active-tab");
    }
  };

  // Check URL hash (#hire or #hire-me) on load or hashchange
  function checkContactHash() {
    if (window.location.hash === "#hire" || window.location.hash === "#hire-me") {
      window.switchContactTab("hire");
      const formBox = document.querySelector(".contact-card-box");
      if (formBox) {
        formBox.scrollIntoView({ behavior: "smooth" });
      }
    }
  }

  // Handle select dropdown "Other" choice to reveal custom text inputs
  window.handleSelectChange = function(selectElem, customInputId) {
    const customInput = document.getElementById(customInputId);
    if (!customInput) return;
    if (selectElem.value === "Other") {
      customInput.style.display = "block";
      customInput.required = true;
      customInput.focus();
    } else {
      customInput.style.display = "none";
      customInput.required = false;
      customInput.value = "";
    }
  };

  checkContactHash();
  window.addEventListener("hashchange", checkContactHash);
});

/* Typed.js Headline Initialization */
document.addEventListener("DOMContentLoaded", () => {
  const typedTarget = document.getElementById("typed-headline");
  if (typedTarget && typeof Typed !== "undefined") {
    new Typed("#typed-headline", {
      strings: [
        "Artificial Intelligence Engineer",
        "Machine Learning & DL Specialist",
        "Computer Engineer",
        "Full-Stack Software Developer"
      ],
      typeSpeed: 45,
      backSpeed: 25,
      backDelay: 1800,
      loop: true
    });
  }
});


