// ═══════════════════════════════════════════════════════════════════
//  PORTFOLIO SCRIPT — Sanmugavel B
//  Includes: Intro animation, Scroll navigation, Certifications,
//            Organizations, Timeline — all with admin CRUD
// ═══════════════════════════════════════════════════════════════════

const API_BASE_URL = 'https://resume-portfolio-sanmugavelb.onrender.com/api';

let currentUser  = null;
let portfolioData = {};

// ── INTRO ANIMATION ──────────────────────────────────────────────
(function runIntro() {
  const screen   = document.getElementById('intro-screen');
  const canvas   = document.getElementById('intro-canvas');
  const fill     = document.getElementById('introProgress');
  const label    = document.getElementById('introLabel');
  if (!screen) return;

  // Particle canvas
  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  window.addEventListener('resize', () => {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  });

  const ACCENT = '#00e5c8', ACCENT2 = '#0099ff';
  const nodes = Array.from({ length: 60 }, () => ({
    x: Math.random() * canvas.width,
    y: Math.random() * canvas.height,
    vx: (Math.random() - .5) * .4,
    vy: (Math.random() - .5) * .4,
    r:  Math.random() * 1.8 + .4,
    pulse: Math.random() * Math.PI * 2,
    ps: .015 + Math.random() * .02,
  }));

  let rafId;
  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    nodes.forEach(n => {
      n.x += n.vx; n.y += n.vy; n.pulse += n.ps;
      if (n.x < 0 || n.x > canvas.width)  n.vx *= -1;
      if (n.y < 0 || n.y > canvas.height) n.vy *= -1;
      const g = (Math.sin(n.pulse) + 1) / 2;
      nodes.forEach(m => {
        const dx = n.x-m.x, dy = n.y-m.y, d = Math.sqrt(dx*dx+dy*dy);
        if (d < 140) {
          ctx.beginPath();
          ctx.moveTo(n.x, n.y); ctx.lineTo(m.x, m.y);
          ctx.strokeStyle = `rgba(0,229,200,${(1-d/140)*.12})`;
          ctx.lineWidth = .5; ctx.stroke();
        }
      });
      ctx.beginPath();
      ctx.arc(n.x, n.y, n.r + g*.8, 0, Math.PI*2);
      ctx.fillStyle = `rgba(0,229,200,${.2 + g*.4})`;
      ctx.fill();
    });
    rafId = requestAnimationFrame(drawParticles);
  }
  drawParticles();

  // Progress labels
  const steps = [
    'Booting core systems…',
    'Loading circuit matrix…',
    'Mapping signal routes…',
    'Flashing firmware…',
    'Ready to launch ⚡',
  ];
  let pct = 0;
  const tick = setInterval(() => {
    pct += 2;
    if (fill)  fill.style.width = pct + '%';
    if (label) label.textContent = steps[Math.min(Math.floor(pct / 25), steps.length - 1)];
    if (pct >= 100) {
      clearInterval(tick);
      setTimeout(() => {
        cancelAnimationFrame(rafId);
        screen.classList.add('intro-done');
        screen.addEventListener('transitionend', () => screen.remove(), { once: true });
      }, 400);
    }
  }, 30);
})();

// ── INIT ──────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  checkAuth();
  initScrollNavigation();
  loadAllData();
  initVisualEnhancements();
  // Scroll-to buttons
  document.querySelectorAll('.scroll-to').forEach(a => {
    a.addEventListener('click', e => {
      e.preventDefault();
      const id = a.dataset.target;
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    });
  });
});

// ── AUTH ──────────────────────────────────────────────────────────
function checkAuth() {
  const str = localStorage.getItem('portfolioUser');
  if (!str) { window.location.href = 'login.html'; return; }
  currentUser = JSON.parse(str);
  if (currentUser.role === 'admin') document.body.classList.add('admin');
  const ud = document.getElementById('userDisplay');
  if (ud) ud.textContent = `${currentUser.role === 'admin' ? '👑 Admin' : '👤 Visitor'}: ${currentUser.name}`;
}

function logout() {
  localStorage.removeItem('portfolioUser');
  window.location.href = 'login.html';
}

// ── SCROLL NAVIGATION ─────────────────────────────────────────────
function initScrollNavigation() {
  const navLinks  = document.querySelectorAll('.nav-link');
  const toggle    = document.getElementById('navToggle');
  const menu      = document.getElementById('navMenu');

  // Click on nav link → smooth scroll
  navLinks.forEach(link => {
    link.addEventListener('click', e => {
      e.preventDefault();
      const id = link.dataset.section;
      const target = document.getElementById(id);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
      if (menu) menu.classList.remove('active');
      if (toggle) toggle.classList.remove('active');
    });
  });

  // Hamburger
  if (toggle) toggle.addEventListener('click', () => {
    menu.classList.toggle('active');
    toggle.classList.toggle('active');
  });

  // Highlight active nav on scroll using IntersectionObserver
  const sections = document.querySelectorAll('.scroll-section');
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        navLinks.forEach(l => {
          l.classList.toggle('active', l.dataset.section === id);
        });
      }
    });
  }, { threshold: 0.3 });

  sections.forEach(s => io.observe(s));
}

// legacy compat
function navigateToSection(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth' });
}

// ── DATA LOADING ──────────────────────────────────────────────────
async function loadAllData() {
  try {
    const r = await fetch(`${API_BASE_URL}/portfolio`);
    portfolioData = await r.json();
  } catch {
    portfolioData = {};
  }
  renderAbout();
  renderEducation();
  renderExperience();
  renderProjects();
  renderSkills();
  renderCertifications();
  renderOrganizations();
  renderTimeline();
  loadProfileImage();
}

// ── ABOUT ─────────────────────────────────────────────────────────
function renderAbout() {
  const c = document.getElementById('aboutContent');
  const about = portfolioData.about || { bio: 'B.E. ECE student at Madras Institute of Technology, Anna University with a strong passion for AIoT and Embedded Systems. Hands-on experience in C/C++, Python, MATLAB, and DSA, with practical exposure to robotics, sensor integration, and FPGA-based projects. Motivated to build impactful hardware–software solutions for real-world challenges.', highlights: [] };
  c.innerHTML = `
    <p style="font-size:1.125rem;line-height:1.8;margin-bottom:2rem;color:var(--color-text-secondary);">${about.bio}</p>
    <div class="about-grid">
      ${(about.highlights||[]).map(h=>`
        <div class="about-item">
          <i class="${h.icon}"></i>
          <h3>${h.title}</h3>
          <p>${h.description}</p>
        </div>`).join('')}
    </div>
    <div style="text-align:center;margin-top:3rem;padding-top:2rem;border-top:2px solid var(--color-border);">
      <h3 style="margin-bottom:1.5rem;color:var(--color-text);font-size:1.5rem;"><i class="fas fa-file-alt"></i> My Resume</h3>
      <div style="display:flex;gap:1rem;justify-content:center;flex-wrap:wrap;">
        <a href="Sanmugavel_Resume.pdf" download class="btn btn-primary btn-lg"><i class="fas fa-download"></i> Download Resume</a>
        <a href="Sanmugavel_Resume.pdf" target="_blank" class="btn btn-secondary btn-lg"><i class="fas fa-eye"></i> View Resume</a>
      </div>
    </div>`;
}

// ── EDUCATION ────────────────────────────────────────────────────
function renderEducation() {
  const c = document.getElementById('educationList');
  const list = portfolioData.education || [];
  if (!list.length) { c.innerHTML = '<div class="empty-state"><i class="fas fa-graduation-cap"></i><p>No education records yet</p></div>'; return; }
  c.innerHTML = list.map(edu=>`
    <div class="education-item reveal" onclick="showDetail('education','${edu.id}')">
      <div class="item-header">
        <div class="item-title">
          <h3>${edu.degree}</h3><h4>${edu.institution}</h4>
          <div class="item-meta"><i class="fas fa-calendar"></i> ${edu.period} | <i class="fas fa-map-marker-alt"></i> ${edu.location}${edu.grade?` | <i class="fas fa-award"></i> ${edu.grade}`:''}</div>
        </div>
        ${currentUser.role==='admin'?`<div class="item-actions">
          <button class="btn btn-sm btn-primary" onclick="event.stopPropagation();editEducation('${edu.id}')"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-danger" onclick="event.stopPropagation();deleteEducation('${edu.id}')"><i class="fas fa-trash"></i></button>
        </div>`:''}
      </div>
      ${edu.description?`<p class="item-description">${edu.description}</p>`:''}
    </div>`).join('');
  initScrollReveal();
}

// ── EXPERIENCE ───────────────────────────────────────────────────
function renderExperience() {
  const c = document.getElementById('experienceList');
  const list = portfolioData.experience || [];
  if (!list.length) { c.innerHTML = '<div class="empty-state"><i class="fas fa-briefcase"></i><p>No experience records yet</p></div>'; return; }
  c.innerHTML = list.map(exp=>`
    <div class="experience-item reveal" onclick="showDetail('experience','${exp.id}')">
      <div class="item-header">
        <div class="item-title">
          <h3>${exp.position}</h3><h4>${exp.company}</h4>
          <div class="item-meta"><i class="fas fa-calendar"></i> ${exp.period} | <i class="fas fa-map-marker-alt"></i> ${exp.location}</div>
        </div>
        ${currentUser.role==='admin'?`<div class="item-actions">
          <button class="btn btn-sm btn-primary" onclick="event.stopPropagation();editExperience('${exp.id}')"><i class="fas fa-edit"></i></button>
          <button class="btn btn-sm btn-danger" onclick="event.stopPropagation();deleteExperience('${exp.id}')"><i class="fas fa-trash"></i></button>
        </div>`:''}
      </div>
      ${exp.description?`<p class="item-description">${exp.description}</p>`:''}
    </div>`).join('');
  initScrollReveal();
}

// ── PROJECTS ─────────────────────────────────────────────────────
function renderProjects() {
  const c = document.getElementById('projectsGrid');
  const list = portfolioData.projects || [];
  if (!list.length) { c.innerHTML = '<div class="empty-state"><i class="fas fa-laptop-code"></i><p>No projects yet</p></div>'; return; }
  c.innerHTML = list.map(p=>`
    <div class="project-card reveal" onclick="showDetail('project','${p.id}')">
      <div class="project-image">${p.image?`<img src="${p.image}" alt="${p.title}">`:`<i class="fas fa-code"></i>`}</div>
      <div class="project-content">
        <h3>${p.title}</h3>
        <p class="project-description">${p.description}</p>
        <div class="project-tags">${(p.technologies||[]).map(t=>`<span class="tag">${t}</span>`).join('')}</div>
        <div class="project-footer">
          ${p.github?`<a href="${p.github}" target="_blank" onclick="event.stopPropagation()" class="btn btn-sm btn-secondary"><i class="fab fa-github"></i> Code</a>`:''}
          ${p.demo?`<a href="${p.demo}" target="_blank" onclick="event.stopPropagation()" class="btn btn-sm btn-primary"><i class="fas fa-external-link-alt"></i> Demo</a>`:''}
        </div>
        ${currentUser.role==='admin'?`<div style="margin-top:1rem;padding-top:1rem;border-top:1px solid var(--color-border);display:flex;gap:.5rem;">
          <button class="btn btn-sm btn-primary" onclick="event.stopPropagation();editProject('${p.id}')" style="flex:1"><i class="fas fa-edit"></i> Edit</button>
          <button class="btn btn-sm btn-danger" onclick="event.stopPropagation();deleteProject('${p.id}')" style="flex:1"><i class="fas fa-trash"></i> Delete</button>
        </div>`:''}
      </div>
    </div>`).join('');
  initScrollReveal();
}

// ── SKILLS ───────────────────────────────────────────────────────
function renderSkills() {
  const c = document.getElementById('skillsContainer');
  const skills = portfolioData.skills || {};
  if (!Object.keys(skills).length) { c.innerHTML = '<div class="empty-state"><i class="fas fa-tools"></i><p>No skills added yet</p></div>'; return; }
  c.innerHTML = Object.entries(skills).map(([cat,items])=>`
    <div class="skill-category reveal">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h3>${cat}</h3>
        ${currentUser.role==='admin'?`<button class="btn btn-sm btn-danger" onclick="deleteSkillCategory('${cat}')"><i class="fas fa-trash"></i> Delete Category</button>`:''}
      </div>
      <div class="skills-grid">
        ${items.map(sk=>`
          <div class="skill-item">
            <i class="${sk.icon||'fas fa-check-circle'}"></i>
            <span>${sk.name}</span>
            ${currentUser.role==='admin'?`<button class="btn btn-sm btn-danger" onclick="deleteSkillItem('${cat}','${sk.name}')" style="margin-top:.5rem"><i class="fas fa-trash"></i></button>`:''}
          </div>`).join('')}
      </div>
    </div>`).join('');
  initScrollReveal();
}

// ── CERTIFICATIONS (NEW) ─────────────────────────────────────────
function getDefaultCertifications() {
  return [
    { id:'c1', title:'Programming, Data Structures & Algorithms Using Python', issuer:'NPTEL', date:'2024', icon:'fab fa-python', color:'#3776ab' },
    { id:'c2', title:'Underwater Robotics — Finalist Certificate', issuer:'Kurukshetra\'25, CEG', date:'Jan 2025', icon:'fas fa-robot', color:'#00e5c8' },
    { id:'c3', title:'PERI Project Expo Finalist (National Level)', issuer:'PERI Institute', date:'Feb 2025', icon:'fas fa-microchip', color:'#0099ff' },
    { id:'c4', title:'Sprintathon\'25 — National Hackathon Finalist', issuer:'Sprintathon', date:'Mar 2025', icon:'fas fa-trophy', color:'#f5a623' },
    { id:'c5', title:'2nd Prize — CODEQUEST, AETHORA\'25', issuer:'AETHORA', date:'2025', icon:'fas fa-medal', color:'#22d35e' },
    { id:'c6', title:'2nd Prize — Code Noobies, ChakraVyuha\'25', issuer:'ChakraVyuha', date:'2025', icon:'fas fa-award', color:'#ff6b6b' },
  ];
}

function renderCertifications() {
  const c = document.getElementById('certificationsGrid');
  const list = (portfolioData.certifications && portfolioData.certifications.length)
    ? portfolioData.certifications
    : getDefaultCertifications();
  if (!list.length) { c.innerHTML = '<div class="empty-state"><i class="fas fa-certificate"></i><p>No certifications yet</p></div>'; return; }
  c.innerHTML = list.map(cert=>`
    <div class="cert-card reveal">
      <div class="cert-icon" style="color:${cert.color||'var(--color-primary)'}">
        <i class="${cert.icon||'fas fa-certificate'}"></i>
      </div>
      <div class="cert-content">
        <h3>${cert.title}</h3>
        <p class="cert-issuer"><i class="fas fa-building"></i> ${cert.issuer}</p>
        <p class="cert-date"><i class="fas fa-calendar-alt"></i> ${cert.date}</p>
        ${cert.url?`<a href="${cert.url}" target="_blank" class="btn btn-sm btn-secondary" style="margin-top:.75rem"><i class="fas fa-external-link-alt"></i> View</a>`:''}
      </div>
      ${currentUser.role==='admin'?`<div class="cert-actions">
        <button class="btn btn-sm btn-primary" onclick="editCertification('${cert.id}')"><i class="fas fa-edit"></i></button>
        <button class="btn btn-sm btn-danger" onclick="deleteCertification('${cert.id}')"><i class="fas fa-trash"></i></button>
      </div>`:''}
    </div>`).join('');
  initScrollReveal();
}

// ── ORGANIZATIONS (NEW) ───────────────────────────────────────────
function getDefaultOrganizations() {
  return [
    { id:'o1', name:'NSS — National Service Scheme', role:'Active Volunteer', institution:'Madras Institute of Technology', period:'2024 – Present', description:'Participated in community service drives, blood donation camps, and social awareness programs.', icon:'fas fa-hands-helping', color:'#22d35e' },
    { id:'o2', name:'PDA — Personality Development Association', role:'Event Management Team', institution:'MIT, Anna University', period:'2024 – Present', description:'Organised technical and soft-skills workshops. Managed logistics for inter-college events.', icon:'fas fa-users', color:'#0099ff' },
    { id:'o3', name:'AUSEC — Anna University Student Entrepreneurship Club', role:'Outreach & Engagement Team', institution:'MIT, Anna University', period:'2024 – Present', description:'Promoted startup culture, connected students with mentors, and organised entrepreneurship bootcamps.', icon:'fas fa-lightbulb', color:'#f5a623' },
  ];
}

function renderOrganizations() {
  const c = document.getElementById('orgsGrid');
  const list = (portfolioData.organizations && portfolioData.organizations.length)
    ? portfolioData.organizations
    : getDefaultOrganizations();
  if (!list.length) { c.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><p>No organizations yet</p></div>'; return; }
  c.innerHTML = list.map(org=>`
    <div class="org-card reveal">
      <div class="org-icon" style="color:${org.color||'var(--color-primary)'}">
        <i class="${org.icon||'fas fa-users'}"></i>
      </div>
      <div class="org-content">
        <h3>${org.name}</h3>
        <p class="org-role"><i class="fas fa-id-badge"></i> ${org.role}</p>
        <p class="org-meta"><i class="fas fa-university"></i> ${org.institution} &nbsp;|&nbsp; <i class="fas fa-calendar"></i> ${org.period}</p>
        <p class="org-desc">${org.description||''}</p>
      </div>
      ${currentUser.role==='admin'?`<div class="org-actions">
        <button class="btn btn-sm btn-primary" onclick="editOrganization('${org.id}')"><i class="fas fa-edit"></i></button>
        <button class="btn btn-sm btn-danger" onclick="deleteOrganization('${org.id}')"><i class="fas fa-trash"></i></button>
      </div>`:''}
    </div>`).join('');
  initScrollReveal();
}

// ── TIMELINE (NEW) ───────────────────────────────────────────────
function getDefaultTimeline() {
  return [
    { id:'t1', year:'24 Sep 2005', title:'Born in Pudukkottai', description:'Started the journey in Pudukkottai, Tamil Nadu.', icon:'fas fa-baby', location:'Pudukkottai', type:'personal' },
    { id:'t2', year:'2010 – 2012', title:'AVCC Schooling (1st–3rd)', description:'Early schooling at AVCC, Pudukkottai.', icon:'fas fa-school', location:'Pudukkottai', type:'education' },
    { id:'t3', year:'2012 – 2014', title:'PARI Nursery School (4th–5th)', description:'Continued primary education.', icon:'fas fa-school', location:'Pudukkottai', type:'education' },
    { id:'t4', year:'2016 – 2019', title:'NDHS Schooling (6th–8th)', description:'Developed interest in Science and Mathematics.', icon:'fas fa-graduation-cap', location:'Nagapattinam', type:'education' },
    { id:'t5', year:'2019 – 2021', title:'SPV Schooling (9th–10th)', description:'Completed SSLC with strong academic performance.', icon:'fas fa-graduation-cap', location:'Nagapattinam', type:'education' },
    { id:'t6', year:'2021 – 2023', title:'NHSS — Bio Maths Stream (11th–12th)', description:'Higher Secondary at National Higher Secondary School; strong foundation in Physics, Chemistry, Biology & Maths.', icon:'fas fa-book-open', location:'Nagapattinam', type:'education' },
    { id:'t7', year:'2023', title:'Swimming & Athletics', description:'Active participation in swimming and track events during school years.', icon:'fas fa-swimming-pool', location:'Nagapattinam', type:'achievement' },
    { id:'t8', year:'2024 – Present', title:'B.E. ECE @ MIT Anna University', description:'Pursuing B.E. Electronics & Communication Engineering at Madras Institute of Technology, Chennai. Semester highlights: SEM 1 — C Programming, Volunteering; SEM 2 — C++ & PersoFest\'23; SEM 3 — Java, DSA & Excellia\'24; SEM 4 — MERN Stack & PersoFest\'25.', icon:'fas fa-microchip', location:'Chennai', type:'education' },
    { id:'t9', year:'Jan 2025', title:'Underwater Robotics — Kurukshetra\'25 Finalist', description:'Developed an underwater robot with IMU and ultrasonic sensors.', icon:'fas fa-robot', location:'CEG, Chennai', type:'achievement' },
    { id:'t10', year:'Feb 2025', title:'National Project Expo Finalist — PERI', description:'Presented Underwater Submarine project at national level.', icon:'fas fa-trophy', location:'Chennai', type:'achievement' },
    { id:'t11', year:'Mar 2025', title:'Sprintathon\'25 National Hackathon Finalist', description:'Implemented FPGA-based gunshot detection system.', icon:'fas fa-award', location:'National', type:'achievement' },
    { id:'t12', year:'2025', title:'Web Development — MERN Stack', description:'Built SquadSync and multiple full-stack projects.', icon:'fas fa-laptop-code', location:'Chennai', type:'project' },
  ];
}

function renderTimeline() {
  const c = document.getElementById('timelineContainer');
  const list = (portfolioData.timeline && portfolioData.timeline.length)
    ? portfolioData.timeline
    : getDefaultTimeline();
  if (!list.length) { c.innerHTML = '<div class="empty-state"><i class="fas fa-road"></i><p>No milestones yet</p></div>'; return; }

  const typeColors = { education:'#0099ff', achievement:'#f5a623', personal:'#22d35e', project:'#00e5c8' };

  c.innerHTML = `<div class="timeline-track">` +
    list.map((item, i)=>`
      <div class="timeline-item reveal ${i%2===0?'tl-left':'tl-right'}">
        <div class="timeline-dot" style="background:${typeColors[item.type]||'var(--color-primary)'}">
          <i class="${item.icon||'fas fa-circle'}"></i>
        </div>
        <div class="timeline-card">
          <div class="tl-year">${item.year}</div>
          <h3>${item.title}</h3>
          ${item.location?`<p class="tl-location"><i class="fas fa-map-marker-alt"></i> ${item.location}</p>`:''}
          <p class="tl-desc">${item.description}</p>
          ${currentUser.role==='admin'?`<div class="tl-actions">
            <button class="btn btn-sm btn-primary" onclick="editTimeline('${item.id}')"><i class="fas fa-edit"></i></button>
            <button class="btn btn-sm btn-danger" onclick="deleteTimeline('${item.id}')"><i class="fas fa-trash"></i></button>
          </div>`:''}
        </div>
      </div>`).join('') +
  `</div>`;
  initScrollReveal();
}

// ── DETAIL MODAL ──────────────────────────────────────────────────
function showDetail(type, id) {
  const modal   = document.getElementById('detailModal');
  const content = document.getElementById('detailModalContent');
  let item, html='';

  if (type==='education') {
    item = (portfolioData.education||[]).find(e=>e.id===id); if (!item) return;
    html = `<div class="modal-header"><h2>${item.degree}</h2><button class="modal-close" onclick="closeDetailModal()"><i class="fas fa-times"></i></button></div>
    <div class="modal-body">
      <h3 style="color:var(--color-primary);margin-bottom:1rem">${item.institution}</h3>
      <p style="color:var(--color-text-secondary);margin-bottom:1rem"><i class="fas fa-calendar"></i> ${item.period} | <i class="fas fa-map-marker-alt"></i> ${item.location}${item.grade?` | <i class="fas fa-award"></i> ${item.grade}`:''}</p>
      <div style="line-height:1.8">${item.description||'No additional details.'}</div>
      ${item.achievements?`<div style="margin-top:2rem"><h4 style="margin-bottom:1rem">Achievements</h4><ul style="list-style:none;padding:0">${item.achievements.map(a=>`<li style="padding:.5rem 0;color:var(--color-text-secondary)"><i class="fas fa-check-circle" style="color:var(--color-success);margin-right:.5rem"></i>${a}</li>`).join('')}</ul></div>`:''}
    </div>`;
  } else if (type==='experience') {
    item = (portfolioData.experience||[]).find(e=>e.id===id); if (!item) return;
    html = `<div class="modal-header"><h2>${item.position}</h2><button class="modal-close" onclick="closeDetailModal()"><i class="fas fa-times"></i></button></div>
    <div class="modal-body">
      <h3 style="color:var(--color-primary);margin-bottom:1rem">${item.company}</h3>
      <p style="color:var(--color-text-secondary);margin-bottom:1rem"><i class="fas fa-calendar"></i> ${item.period} | <i class="fas fa-map-marker-alt"></i> ${item.location}</p>
      <div style="line-height:1.8">${item.description||'No additional details.'}</div>
      ${item.responsibilities?`<div style="margin-top:2rem"><h4 style="margin-bottom:1rem">Key Responsibilities</h4><ul style="list-style:none;padding:0">${item.responsibilities.map(r=>`<li style="padding:.5rem 0;color:var(--color-text-secondary)"><i class="fas fa-check-circle" style="color:var(--color-success);margin-right:.5rem"></i>${r}</li>`).join('')}</ul></div>`:''}
    </div>`;
  } else if (type==='project') {
    item = (portfolioData.projects||[]).find(p=>p.id===id); if (!item) return;
    html = `<div class="modal-header"><h2>${item.title}</h2><button class="modal-close" onclick="closeDetailModal()"><i class="fas fa-times"></i></button></div>
    <div class="modal-body">
      ${item.image?`<img src="${item.image}" style="width:100%;border-radius:var(--radius-lg);margin-bottom:1.5rem">`:''}
      <div style="line-height:1.8;margin-bottom:1.5rem">${item.fullDescription||item.description}</div>
      ${item.technologies?`<div style="margin-bottom:1.5rem"><h4 style="margin-bottom:1rem">Technologies Used</h4><div class="project-tags">${item.technologies.map(t=>`<span class="tag">${t}</span>`).join('')}</div></div>`:''}
      ${item.features?`<div style="margin-bottom:1.5rem"><h4 style="margin-bottom:1rem">Key Features</h4><ul style="list-style:none;padding:0">${item.features.map(f=>`<li style="padding:.5rem 0;color:var(--color-text-secondary)"><i class="fas fa-check-circle" style="color:var(--color-success);margin-right:.5rem"></i>${f}</li>`).join('')}</ul></div>`:''}
      <div style="display:flex;gap:1rem;flex-wrap:wrap">
        ${item.github?`<a href="${item.github}" target="_blank" class="btn btn-secondary"><i class="fab fa-github"></i> GitHub</a>`:''}
        ${item.demo?`<a href="${item.demo}" target="_blank" class="btn btn-primary"><i class="fas fa-external-link-alt"></i> Live Demo</a>`:''}
      </div>
    </div>`;
  }
  content.innerHTML = html;
  modal.classList.add('active');
}

function closeDetailModal() { document.getElementById('detailModal').classList.remove('active'); }

// ── ADD MODALS ────────────────────────────────────────────────────
function openAddModal(type) {
  const modal   = document.getElementById('modal');
  const content = document.getElementById('modalContent');
  let html = '';

  if (type==='education') {
    html = `<div class="modal-header"><h2>Add Education</h2><button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button></div>
    <form onsubmit="saveEducation(event)" class="modal-body">
      <div class="form-group"><label>Degree/Program</label><input type="text" class="form-control" name="degree" required></div>
      <div class="form-group"><label>Institution</label><input type="text" class="form-control" name="institution" required></div>
      <div class="form-group"><label>Period</label><input type="text" class="form-control" name="period" placeholder="e.g., 2024 – 2028" required></div>
      <div class="form-group"><label>Location</label><input type="text" class="form-control" name="location" required></div>
      <div class="form-group"><label>Grade/CGPA</label><input type="text" class="form-control" name="grade"></div>
      <div class="form-group"><label>Description</label><textarea class="form-control" name="description" rows="3"></textarea></div>
      <div class="modal-footer"><button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button><button type="submit" class="btn btn-primary">Save</button></div>
    </form>`;
  } else if (type==='experience') {
    html = `<div class="modal-header"><h2>Add Experience</h2><button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button></div>
    <form onsubmit="saveExperience(event)" class="modal-body">
      <div class="form-group"><label>Position/Role</label><input type="text" class="form-control" name="position" required></div>
      <div class="form-group"><label>Company</label><input type="text" class="form-control" name="company" required></div>
      <div class="form-group"><label>Period</label><input type="text" class="form-control" name="period" required></div>
      <div class="form-group"><label>Location</label><input type="text" class="form-control" name="location" required></div>
      <div class="form-group"><label>Description</label><textarea class="form-control" name="description" rows="4"></textarea></div>
      <div class="modal-footer"><button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button><button type="submit" class="btn btn-primary">Save</button></div>
    </form>`;
  } else if (type==='project') {
    html = `<div class="modal-header"><h2>Add Project</h2><button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button></div>
    <form onsubmit="saveProject(event)" class="modal-body">
      <div class="form-group"><label>Title</label><input type="text" class="form-control" name="title" required></div>
      <div class="form-group"><label>Short Description</label><textarea class="form-control" name="description" rows="2" required></textarea></div>
      <div class="form-group"><label>Full Description</label><textarea class="form-control" name="fullDescription" rows="4"></textarea></div>
      <div class="form-group"><label>Technologies (comma-separated)</label><input type="text" class="form-control" name="technologies" placeholder="Arduino, C, Python"></div>
      <div class="form-group"><label>GitHub URL</label><input type="url" class="form-control" name="github"></div>
      <div class="form-group"><label>Demo URL</label><input type="url" class="form-control" name="demo"></div>
      <div class="form-group"><label>Project Image</label><input type="file" class="form-control" name="image" accept="image/*"></div>
      <div class="modal-footer"><button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button><button type="submit" class="btn btn-primary">Save</button></div>
    </form>`;
  } else if (type==='skill') {
    html = `<div class="modal-header"><h2>Add Skill</h2><button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button></div>
    <form onsubmit="saveSkill(event)" class="modal-body">
      <div class="form-group"><label>Category</label><input type="text" class="form-control" name="category" placeholder="e.g., Embedded, Programming" required></div>
      <div class="form-group"><label>Skill Name</label><input type="text" class="form-control" name="name" required></div>
      <div class="form-group"><label>Icon Class (FontAwesome)</label><input type="text" class="form-control" name="icon" placeholder="e.g., fab fa-python"></div>
      <div class="modal-footer"><button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button><button type="submit" class="btn btn-primary">Save</button></div>
    </form>`;
  } else if (type==='certification') {
    html = `<div class="modal-header"><h2>Add Certification</h2><button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button></div>
    <form onsubmit="saveCertification(event)" class="modal-body">
      <div class="form-group"><label>Title</label><input type="text" class="form-control" name="title" required></div>
      <div class="form-group"><label>Issuer</label><input type="text" class="form-control" name="issuer" required></div>
      <div class="form-group"><label>Date</label><input type="text" class="form-control" name="date" placeholder="e.g., Jan 2025"></div>
      <div class="form-group"><label>Icon Class (FontAwesome)</label><input type="text" class="form-control" name="icon" placeholder="fas fa-certificate"></div>
      <div class="form-group"><label>Accent Colour (hex)</label><input type="color" class="form-control" name="color" value="#00e5c8" style="height:45px"></div>
      <div class="form-group"><label>Certificate URL (optional)</label><input type="url" class="form-control" name="url"></div>
      <div class="modal-footer"><button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button><button type="submit" class="btn btn-primary">Save</button></div>
    </form>`;
  } else if (type==='organization') {
    html = `<div class="modal-header"><h2>Add Organization</h2><button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button></div>
    <form onsubmit="saveOrganization(event)" class="modal-body">
      <div class="form-group"><label>Organization Name</label><input type="text" class="form-control" name="name" required></div>
      <div class="form-group"><label>Your Role</label><input type="text" class="form-control" name="role" required></div>
      <div class="form-group"><label>Institution</label><input type="text" class="form-control" name="institution"></div>
      <div class="form-group"><label>Period</label><input type="text" class="form-control" name="period"></div>
      <div class="form-group"><label>Description</label><textarea class="form-control" name="description" rows="3"></textarea></div>
      <div class="form-group"><label>Icon Class (FontAwesome)</label><input type="text" class="form-control" name="icon" placeholder="fas fa-users"></div>
      <div class="form-group"><label>Accent Colour (hex)</label><input type="color" class="form-control" name="color" value="#0099ff" style="height:45px"></div>
      <div class="modal-footer"><button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button><button type="submit" class="btn btn-primary">Save</button></div>
    </form>`;
  } else if (type==='timeline') {
    html = `<div class="modal-header"><h2>Add Milestone</h2><button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button></div>
    <form onsubmit="saveTimeline(event)" class="modal-body">
      <div class="form-group"><label>Year / Date</label><input type="text" class="form-control" name="year" placeholder="e.g., 2024" required></div>
      <div class="form-group"><label>Title</label><input type="text" class="form-control" name="title" required></div>
      <div class="form-group"><label>Location</label><input type="text" class="form-control" name="location"></div>
      <div class="form-group"><label>Description</label><textarea class="form-control" name="description" rows="3"></textarea></div>
      <div class="form-group"><label>Icon Class (FontAwesome)</label><input type="text" class="form-control" name="icon" placeholder="fas fa-star"></div>
      <div class="form-group"><label>Type</label>
        <select class="form-control" name="type">
          <option value="education">Education</option>
          <option value="achievement">Achievement</option>
          <option value="personal">Personal</option>
          <option value="project">Project</option>
        </select>
      </div>
      <div class="modal-footer"><button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button><button type="submit" class="btn btn-primary">Save</button></div>
    </form>`;
  }

  content.innerHTML = html;
  modal.classList.add('active');
}

function openEditModal(type) {
  const modal   = document.getElementById('modal');
  const content = document.getElementById('modalContent');
  const about   = portfolioData.about || {};
  content.innerHTML = `
    <div class="modal-header"><h2>Edit About</h2><button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button></div>
    <form onsubmit="saveAbout(event)" class="modal-body">
      <div class="form-group"><label>Bio</label><textarea class="form-control" name="bio" rows="6" required>${about.bio||''}</textarea></div>
      <div class="modal-footer"><button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button><button type="submit" class="btn btn-primary">Save</button></div>
    </form>`;
  modal.classList.add('active');
}

function closeModal() { document.getElementById('modal').classList.remove('active'); }

// ── LOCAL HELPERS ─────────────────────────────────────────────────
function ensureLocalArray(key) {
  if (!portfolioData[key]) portfolioData[key] = [];
}
function ensureDefaults(key, fn) {
  if (!portfolioData[key] || !portfolioData[key].length) portfolioData[key] = fn();
}

// ── SAVE / API HELPERS ────────────────────────────────────────────
async function apiCall(path, method, body) {
  const r = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });
  return r;
}

// ── ABOUT SAVE ────────────────────────────────────────────────────
async function saveAbout(e) {
  e.preventDefault();
  const data = { bio: new FormData(e.target).get('bio') };
  try { const r = await apiCall('/portfolio/about','PUT',data); if(r.ok){closeModal();await loadAllData();} }
  catch { portfolioData.about = data; closeModal(); renderAbout(); }
}

// ── EDUCATION ─────────────────────────────────────────────────────
async function saveEducation(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const data = { id: Date.now().toString(), degree:fd.get('degree'), institution:fd.get('institution'), period:fd.get('period'), location:fd.get('location'), grade:fd.get('grade'), description:fd.get('description') };
  try { const r = await apiCall('/portfolio/education','POST',data); if(r.ok){closeModal();await loadAllData();} }
  catch { ensureLocalArray('education'); portfolioData.education.push(data); closeModal(); renderEducation(); }
}
async function deleteEducation(id) {
  if (!confirm('Delete this education record?')) return;
  try { const r = await apiCall(`/portfolio/education/${id}`,'DELETE'); if(r.ok){await loadAllData();} }
  catch { portfolioData.education = (portfolioData.education||[]).filter(e=>e.id!==id); renderEducation(); }
}
async function editEducation(id) {
  const item = (portfolioData.education||[]).find(e=>e.id===id); if(!item) return;
  const modal = document.getElementById('modal'), content = document.getElementById('modalContent');
  content.innerHTML = `<div class="modal-header"><h2>Edit Education</h2><button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button></div>
  <form onsubmit="updateEducation(event,'${id}')" class="modal-body">
    <div class="form-group"><label>Degree/Program</label><input type="text" class="form-control" name="degree" value="${item.degree}" required></div>
    <div class="form-group"><label>Institution</label><input type="text" class="form-control" name="institution" value="${item.institution}" required></div>
    <div class="form-group"><label>Period</label><input type="text" class="form-control" name="period" value="${item.period}" required></div>
    <div class="form-group"><label>Location</label><input type="text" class="form-control" name="location" value="${item.location}" required></div>
    <div class="form-group"><label>Grade</label><input type="text" class="form-control" name="grade" value="${item.grade||''}"></div>
    <div class="form-group"><label>Description</label><textarea class="form-control" name="description" rows="3">${item.description||''}</textarea></div>
    <div class="modal-footer"><button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button><button type="submit" class="btn btn-primary">Update</button></div>
  </form>`;
  modal.classList.add('active');
}
async function updateEducation(e, id) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const data = { degree:fd.get('degree'), institution:fd.get('institution'), period:fd.get('period'), location:fd.get('location'), grade:fd.get('grade'), description:fd.get('description') };
  try { const r = await apiCall(`/portfolio/education/${id}`,'PUT',data); if(r.ok){closeModal();await loadAllData();} }
  catch { const idx=(portfolioData.education||[]).findIndex(e=>e.id===id); if(idx>-1){portfolioData.education[idx]={...portfolioData.education[idx],...data};} closeModal(); renderEducation(); }
}

// ── EXPERIENCE ────────────────────────────────────────────────────
async function saveExperience(e) {
  e.preventDefault();
  const fd = new FormData(e.target);
  const data = { id: Date.now().toString(), position:fd.get('position'), company:fd.get('company'), period:fd.get('period'), location:fd.get('location'), description:fd.get('description') };
  try { const r = await apiCall('/portfolio/experience','POST',data); if(r.ok){closeModal();await loadAllData();} }
  catch { ensureLocalArray('experience'); portfolioData.experience.push(data); closeModal(); renderExperience(); }
}
async function deleteExperience(id) {
  if (!confirm('Delete this record?')) return;
  try { await apiCall(`/portfolio/experience/${id}`,'DELETE'); await loadAllData(); }
  catch { portfolioData.experience=(portfolioData.experience||[]).filter(e=>e.id!==id); renderExperience(); }
}
async function editExperience(id) {
  const item=(portfolioData.experience||[]).find(e=>e.id===id); if(!item) return;
  const modal=document.getElementById('modal'), content=document.getElementById('modalContent');
  content.innerHTML=`<div class="modal-header"><h2>Edit Experience</h2><button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button></div>
  <form onsubmit="updateExperience(event,'${id}')" class="modal-body">
    <div class="form-group"><label>Position</label><input type="text" class="form-control" name="position" value="${item.position}" required></div>
    <div class="form-group"><label>Company</label><input type="text" class="form-control" name="company" value="${item.company}" required></div>
    <div class="form-group"><label>Period</label><input type="text" class="form-control" name="period" value="${item.period}" required></div>
    <div class="form-group"><label>Location</label><input type="text" class="form-control" name="location" value="${item.location}" required></div>
    <div class="form-group"><label>Description</label><textarea class="form-control" name="description" rows="4">${item.description||''}</textarea></div>
    <div class="modal-footer"><button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button><button type="submit" class="btn btn-primary">Update</button></div>
  </form>`;
  modal.classList.add('active');
}
async function updateExperience(e,id) {
  e.preventDefault();
  const fd=new FormData(e.target);
  const data={position:fd.get('position'),company:fd.get('company'),period:fd.get('period'),location:fd.get('location'),description:fd.get('description')};
  try { const r=await apiCall(`/portfolio/experience/${id}`,'PUT',data); if(r.ok){closeModal();await loadAllData();} }
  catch { const idx=(portfolioData.experience||[]).findIndex(e=>e.id===id); if(idx>-1) portfolioData.experience[idx]={...portfolioData.experience[idx],...data}; closeModal(); renderExperience(); }
}

// ── PROJECTS ──────────────────────────────────────────────────────
async function saveProject(e) {
  e.preventDefault();
  const fd=new FormData(e.target);
  const imgFile=fd.get('image');
  let imgData=null;
  if(imgFile&&imgFile.size>0) imgData=await new Promise(res=>{const r=new FileReader();r.onload=ev=>res(ev.target.result);r.readAsDataURL(imgFile);});
  const data={id:Date.now().toString(),title:fd.get('title'),description:fd.get('description'),fullDescription:fd.get('fullDescription'),technologies:fd.get('technologies')?.split(',').map(t=>t.trim()).filter(Boolean),github:fd.get('github'),demo:fd.get('demo'),image:imgData};
  try { const r=await apiCall('/portfolio/projects','POST',data); if(r.ok){closeModal();await loadAllData();} }
  catch { ensureLocalArray('projects'); portfolioData.projects.push(data); closeModal(); renderProjects(); }
}
async function deleteProject(id) {
  if(!confirm('Delete project?')) return;
  try { await apiCall(`/portfolio/projects/${id}`,'DELETE'); await loadAllData(); }
  catch { portfolioData.projects=(portfolioData.projects||[]).filter(p=>p.id!==id); renderProjects(); }
}
async function editProject(id) {
  const item=(portfolioData.projects||[]).find(p=>p.id===id); if(!item) return;
  const modal=document.getElementById('modal'), content=document.getElementById('modalContent');
  content.innerHTML=`<div class="modal-header"><h2>Edit Project</h2><button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button></div>
  <form onsubmit="updateProject(event,'${id}')" class="modal-body">
    <div class="form-group"><label>Title</label><input type="text" class="form-control" name="title" value="${item.title}" required></div>
    <div class="form-group"><label>Short Description</label><textarea class="form-control" name="description" rows="2" required>${item.description}</textarea></div>
    <div class="form-group"><label>Full Description</label><textarea class="form-control" name="fullDescription" rows="4">${item.fullDescription||''}</textarea></div>
    <div class="form-group"><label>Technologies (comma-separated)</label><input type="text" class="form-control" name="technologies" value="${(item.technologies||[]).join(', ')}"></div>
    <div class="form-group"><label>GitHub URL</label><input type="url" class="form-control" name="github" value="${item.github||''}"></div>
    <div class="form-group"><label>Demo URL</label><input type="url" class="form-control" name="demo" value="${item.demo||''}"></div>
    <div class="form-group"><label>New Image (leave empty to keep current)</label><input type="file" class="form-control" name="image" accept="image/*"></div>
    <div class="modal-footer"><button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button><button type="submit" class="btn btn-primary">Update</button></div>
  </form>`;
  modal.classList.add('active');
}
async function updateProject(e,id) {
  e.preventDefault();
  const fd=new FormData(e.target);
  const imgFile=fd.get('image'); let imgData=null;
  if(imgFile&&imgFile.size>0) imgData=await new Promise(res=>{const r=new FileReader();r.onload=ev=>res(ev.target.result);r.readAsDataURL(imgFile);});
  const cur=(portfolioData.projects||[]).find(p=>p.id===id);
  const data={title:fd.get('title'),description:fd.get('description'),fullDescription:fd.get('fullDescription'),technologies:fd.get('technologies')?.split(',').map(t=>t.trim()).filter(Boolean),github:fd.get('github'),demo:fd.get('demo'),image:imgData||(cur?.image)};
  try { const r=await apiCall(`/portfolio/projects/${id}`,'PUT',data); if(r.ok){closeModal();await loadAllData();} }
  catch { const idx=(portfolioData.projects||[]).findIndex(p=>p.id===id); if(idx>-1) portfolioData.projects[idx]={...portfolioData.projects[idx],...data}; closeModal(); renderProjects(); }
}

// ── SKILLS ────────────────────────────────────────────────────────
async function saveSkill(e) {
  e.preventDefault();
  const fd=new FormData(e.target);
  const data={category:fd.get('category'),name:fd.get('name'),icon:fd.get('icon')||'fas fa-check-circle'};
  try { const r=await apiCall('/portfolio/skills','POST',data); if(r.ok){closeModal();await loadAllData();} }
  catch {
    if(!portfolioData.skills) portfolioData.skills={};
    if(!portfolioData.skills[data.category]) portfolioData.skills[data.category]=[];
    portfolioData.skills[data.category].push({name:data.name,icon:data.icon});
    closeModal(); renderSkills();
  }
}
async function deleteSkillCategory(cat) {
  if(!confirm(`Delete category "${cat}"?`)) return;
  try { await apiCall(`/portfolio/skills/${encodeURIComponent(cat)}`,'DELETE'); await loadAllData(); }
  catch { delete portfolioData.skills[cat]; renderSkills(); }
}
async function deleteSkillItem(cat,name) {
  if(!confirm(`Delete "${name}"?`)) return;
  try { await apiCall(`/portfolio/skills/${encodeURIComponent(cat)}/${encodeURIComponent(name)}`,'DELETE'); await loadAllData(); }
  catch { if(portfolioData.skills?.[cat]) portfolioData.skills[cat]=portfolioData.skills[cat].filter(s=>s.name!==name); renderSkills(); }
}

// ── CERTIFICATIONS CRUD ───────────────────────────────────────────
async function saveCertification(e) {
  e.preventDefault();
  const fd=new FormData(e.target);
  const data={id:Date.now().toString(),title:fd.get('title'),issuer:fd.get('issuer'),date:fd.get('date'),icon:fd.get('icon')||'fas fa-certificate',color:fd.get('color'),url:fd.get('url')};
  ensureDefaults('certifications', getDefaultCertifications);
  portfolioData.certifications.push(data);
  try { await apiCall('/portfolio/certifications','POST',data); await loadAllData(); } catch { closeModal(); renderCertifications(); }
  closeModal(); renderCertifications();
}
function editCertification(id) {
  ensureDefaults('certifications', getDefaultCertifications);
  const item=portfolioData.certifications.find(c=>c.id===id); if(!item) return;
  const modal=document.getElementById('modal'), content=document.getElementById('modalContent');
  content.innerHTML=`<div class="modal-header"><h2>Edit Certification</h2><button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button></div>
  <form onsubmit="updateCertification(event,'${id}')" class="modal-body">
    <div class="form-group"><label>Title</label><input type="text" class="form-control" name="title" value="${item.title}" required></div>
    <div class="form-group"><label>Issuer</label><input type="text" class="form-control" name="issuer" value="${item.issuer}" required></div>
    <div class="form-group"><label>Date</label><input type="text" class="form-control" name="date" value="${item.date||''}"></div>
    <div class="form-group"><label>Icon</label><input type="text" class="form-control" name="icon" value="${item.icon||'fas fa-certificate'}"></div>
    <div class="form-group"><label>Colour</label><input type="color" class="form-control" name="color" value="${item.color||'#00e5c8'}" style="height:45px"></div>
    <div class="form-group"><label>URL</label><input type="url" class="form-control" name="url" value="${item.url||''}"></div>
    <div class="modal-footer"><button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button><button type="submit" class="btn btn-primary">Update</button></div>
  </form>`;
  modal.classList.add('active');
}
function updateCertification(e,id) {
  e.preventDefault();
  const fd=new FormData(e.target);
  ensureDefaults('certifications', getDefaultCertifications);
  const idx=portfolioData.certifications.findIndex(c=>c.id===id);
  if(idx>-1) portfolioData.certifications[idx]={...portfolioData.certifications[idx],title:fd.get('title'),issuer:fd.get('issuer'),date:fd.get('date'),icon:fd.get('icon'),color:fd.get('color'),url:fd.get('url')};
  closeModal(); renderCertifications();
}
function deleteCertification(id) {
  if(!confirm('Delete this certification?')) return;
  ensureDefaults('certifications', getDefaultCertifications);
  portfolioData.certifications=portfolioData.certifications.filter(c=>c.id!==id);
  renderCertifications();
}

// ── ORGANIZATIONS CRUD ────────────────────────────────────────────
async function saveOrganization(e) {
  e.preventDefault();
  const fd=new FormData(e.target);
  const data={id:Date.now().toString(),name:fd.get('name'),role:fd.get('role'),institution:fd.get('institution'),period:fd.get('period'),description:fd.get('description'),icon:fd.get('icon')||'fas fa-users',color:fd.get('color')};
  ensureDefaults('organizations', getDefaultOrganizations);
  portfolioData.organizations.push(data);
  closeModal(); renderOrganizations();
}
function editOrganization(id) {
  ensureDefaults('organizations', getDefaultOrganizations);
  const item=portfolioData.organizations.find(o=>o.id===id); if(!item) return;
  const modal=document.getElementById('modal'), content=document.getElementById('modalContent');
  content.innerHTML=`<div class="modal-header"><h2>Edit Organization</h2><button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button></div>
  <form onsubmit="updateOrganization(event,'${id}')" class="modal-body">
    <div class="form-group"><label>Name</label><input type="text" class="form-control" name="name" value="${item.name}" required></div>
    <div class="form-group"><label>Role</label><input type="text" class="form-control" name="role" value="${item.role}" required></div>
    <div class="form-group"><label>Institution</label><input type="text" class="form-control" name="institution" value="${item.institution||''}"></div>
    <div class="form-group"><label>Period</label><input type="text" class="form-control" name="period" value="${item.period||''}"></div>
    <div class="form-group"><label>Description</label><textarea class="form-control" name="description" rows="3">${item.description||''}</textarea></div>
    <div class="form-group"><label>Icon</label><input type="text" class="form-control" name="icon" value="${item.icon||'fas fa-users'}"></div>
    <div class="form-group"><label>Colour</label><input type="color" class="form-control" name="color" value="${item.color||'#0099ff'}" style="height:45px"></div>
    <div class="modal-footer"><button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button><button type="submit" class="btn btn-primary">Update</button></div>
  </form>`;
  modal.classList.add('active');
}
function updateOrganization(e,id) {
  e.preventDefault();
  const fd=new FormData(e.target);
  ensureDefaults('organizations', getDefaultOrganizations);
  const idx=portfolioData.organizations.findIndex(o=>o.id===id);
  if(idx>-1) portfolioData.organizations[idx]={...portfolioData.organizations[idx],name:fd.get('name'),role:fd.get('role'),institution:fd.get('institution'),period:fd.get('period'),description:fd.get('description'),icon:fd.get('icon'),color:fd.get('color')};
  closeModal(); renderOrganizations();
}
function deleteOrganization(id) {
  if(!confirm('Delete this organization?')) return;
  ensureDefaults('organizations', getDefaultOrganizations);
  portfolioData.organizations=portfolioData.organizations.filter(o=>o.id!==id);
  renderOrganizations();
}

// ── TIMELINE CRUD ─────────────────────────────────────────────────
async function saveTimeline(e) {
  e.preventDefault();
  const fd=new FormData(e.target);
  const data={id:Date.now().toString(),year:fd.get('year'),title:fd.get('title'),location:fd.get('location'),description:fd.get('description'),icon:fd.get('icon')||'fas fa-star',type:fd.get('type')||'personal'};
  ensureDefaults('timeline', getDefaultTimeline);
  portfolioData.timeline.push(data);
  closeModal(); renderTimeline();
}
function editTimeline(id) {
  ensureDefaults('timeline', getDefaultTimeline);
  const item=portfolioData.timeline.find(t=>t.id===id); if(!item) return;
  const modal=document.getElementById('modal'), content=document.getElementById('modalContent');
  content.innerHTML=`<div class="modal-header"><h2>Edit Milestone</h2><button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button></div>
  <form onsubmit="updateTimeline(event,'${id}')" class="modal-body">
    <div class="form-group"><label>Year / Date</label><input type="text" class="form-control" name="year" value="${item.year}" required></div>
    <div class="form-group"><label>Title</label><input type="text" class="form-control" name="title" value="${item.title}" required></div>
    <div class="form-group"><label>Location</label><input type="text" class="form-control" name="location" value="${item.location||''}"></div>
    <div class="form-group"><label>Description</label><textarea class="form-control" name="description" rows="3">${item.description||''}</textarea></div>
    <div class="form-group"><label>Icon</label><input type="text" class="form-control" name="icon" value="${item.icon||'fas fa-star'}"></div>
    <div class="form-group"><label>Type</label>
      <select class="form-control" name="type">
        <option value="education" ${item.type==='education'?'selected':''}>Education</option>
        <option value="achievement" ${item.type==='achievement'?'selected':''}>Achievement</option>
        <option value="personal" ${item.type==='personal'?'selected':''}>Personal</option>
        <option value="project" ${item.type==='project'?'selected':''}>Project</option>
      </select>
    </div>
    <div class="modal-footer"><button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button><button type="submit" class="btn btn-primary">Update</button></div>
  </form>`;
  modal.classList.add('active');
}
function updateTimeline(e,id) {
  e.preventDefault();
  const fd=new FormData(e.target);
  ensureDefaults('timeline', getDefaultTimeline);
  const idx=portfolioData.timeline.findIndex(t=>t.id===id);
  if(idx>-1) portfolioData.timeline[idx]={...portfolioData.timeline[idx],year:fd.get('year'),title:fd.get('title'),location:fd.get('location'),description:fd.get('description'),icon:fd.get('icon'),type:fd.get('type')};
  closeModal(); renderTimeline();
}
function deleteTimeline(id) {
  if(!confirm('Delete this milestone?')) return;
  ensureDefaults('timeline', getDefaultTimeline);
  portfolioData.timeline=portfolioData.timeline.filter(t=>t.id!==id);
  renderTimeline();
}

// ── PROFILE IMAGE ─────────────────────────────────────────────────
function loadProfileImage() {
  const saved=localStorage.getItem('profileImage');
  if(saved) {
    const ph=document.getElementById('profileImage');
    if(ph) ph.innerHTML=`<img src="${saved}" alt="Profile Photo" style="width:100%;height:100%;object-fit:cover;border-radius:inherit">`;
  }
}
function uploadProfileImage() {
  const input=document.createElement('input'); input.type='file'; input.accept='image/*';
  input.onchange=e=>{
    const file=e.target.files[0]; if(!file) return;
    const reader=new FileReader();
    reader.onload=ev=>{
      localStorage.setItem('profileImage',ev.target.result);
      loadProfileImage();
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

// ── MODAL CLOSE ON OUTSIDE CLICK ─────────────────────────────────
window.addEventListener('click', e => {
  const m=document.getElementById('modal'), dm=document.getElementById('detailModal');
  if(e.target===m) closeModal();
  if(e.target===dm) closeDetailModal();
});

// ═══════════════════════════════════════════════════════════════════
//  VISUAL ENHANCEMENTS
// ═══════════════════════════════════════════════════════════════════
function initVisualEnhancements() {
  injectDOMElements();
  initCircuitCanvas();
  initCursor();
  initScrollReveal();
  initSkillBars();
  initTypewriter();
  injectWaveDivider();
}

function injectDOMElements() {
  if(!document.getElementById('circuit-canvas')) {
    const c=document.createElement('canvas'); c.id='circuit-canvas';
    document.body.insertBefore(c,document.body.firstChild);
  }
  if(!document.getElementById('cursor')) {
    const cu=document.createElement('div'); cu.id='cursor';
    const tr=document.createElement('div'); tr.id='cursor-trail';
    document.body.appendChild(cu); document.body.appendChild(tr);
  }
}

function initCircuitCanvas() {
  const canvas=document.getElementById('circuit-canvas'); if(!canvas) return;
  const ctx=canvas.getContext('2d');
  const ACCENT='#00e5c8', ACCENT2='#0099ff', NODE_COUNT=55;
  let W,H,nodes,edges;
  function resize(){W=canvas.width=window.innerWidth;H=canvas.height=window.innerHeight;}
  function createNodes(){nodes=Array.from({length:NODE_COUNT},()=>({x:Math.random()*W,y:Math.random()*H,vx:(Math.random()-.5)*.35,vy:(Math.random()-.5)*.35,r:Math.random()*1.8+.5,pulse:Math.random()*Math.PI*2,pulseSpeed:Math.random()*.02+.008}));}
  function buildEdges(){edges=[];const DIST=Math.min(W,H)*.22;for(let i=0;i<nodes.length;i++)for(let j=i+1;j<nodes.length;j++){const dx=nodes[i].x-nodes[j].x,dy=nodes[i].y-nodes[j].y;if(Math.sqrt(dx*dx+dy*dy)<DIST)edges.push([i,j]);}}
  const packets=[];
  function spawnPacket(){if(!edges.length)return;const edge=edges[Math.floor(Math.random()*edges.length)];packets.push({edge,t:0,speed:Math.random()*.004+.002,color:Math.random()>.5?ACCENT:ACCENT2});}
  setInterval(spawnPacket,220);
  function draw(ts){
    ctx.clearRect(0,0,W,H);
    nodes.forEach(n=>{n.x+=n.vx;n.y+=n.vy;n.pulse+=n.pulseSpeed;if(n.x<0||n.x>W)n.vx*=-1;if(n.y<0||n.y>H)n.vy*=-1;});
    if(Math.floor(ts/16)%60===0)buildEdges();
    edges.forEach(([i,j])=>{const a=nodes[i],b=nodes[j],dx=a.x-b.x,dy=a.y-b.y,dist=Math.sqrt(dx*dx+dy*dy),DIST=Math.min(W,H)*.22,alpha=(1-dist/DIST)*.18;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.strokeStyle=`rgba(0,229,200,${alpha})`;ctx.lineWidth=.6;ctx.stroke();});
    for(let p=packets.length-1;p>=0;p--){const pkt=packets[p];pkt.t+=pkt.speed;if(pkt.t>1){packets.splice(p,1);continue;}const[i,j]=pkt.edge,a=nodes[i],b=nodes[j],px=a.x+(b.x-a.x)*pkt.t,py=a.y+(b.y-a.y)*pkt.t;ctx.beginPath();ctx.arc(px,py,2.2,0,Math.PI*2);ctx.fillStyle=pkt.color;ctx.shadowColor=pkt.color;ctx.shadowBlur=8;ctx.fill();ctx.shadowBlur=0;}
    nodes.forEach(n=>{const g=(Math.sin(n.pulse)+1)/2;ctx.beginPath();ctx.arc(n.x,n.y,n.r+g*.8,0,Math.PI*2);ctx.fillStyle=`rgba(0,229,200,${.25+g*.35})`;ctx.fill();});
    requestAnimationFrame(draw);
  }
  window.addEventListener('resize',()=>{resize();createNodes();buildEdges();});
  resize();createNodes();buildEdges();requestAnimationFrame(draw);
}

function initCursor() {
  const cur=document.getElementById('cursor'),trail=document.getElementById('cursor-trail');
  if(!cur||!trail)return;
  let mx=0,my=0,tx=0,ty=0;
  document.addEventListener('mousemove',e=>{mx=e.clientX;my=e.clientY;cur.style.left=mx+'px';cur.style.top=my+'px';});
  (function tickTrail(){tx+=(mx-tx)*.12;ty+=(my-ty)*.12;trail.style.left=tx+'px';trail.style.top=ty+'px';requestAnimationFrame(tickTrail);})();
  document.addEventListener('mouseleave',()=>{cur.style.opacity='0';trail.style.opacity='0';});
  document.addEventListener('mouseenter',()=>{cur.style.opacity='1';trail.style.opacity='1';});
}

function initScrollReveal() {
  document.querySelectorAll('.card,.skill-item,.about-content,.contact-item,.contact-form,.section-header,.cert-card,.org-card,.timeline-card,.education-item,.experience-item,.project-card,.skill-category').forEach(el=>{
    if(!el.classList.contains('reveal'))el.classList.add('reveal');
  });
  const io=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');io.unobserve(e.target);}});},{threshold:.1});
  document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
}

function initSkillBars() {
  const bars=document.querySelectorAll('.skill-bar-fill'); if(!bars.length)return;
  const io=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.style.width=e.target.dataset.pct||'80%';io.unobserve(e.target);}});},{threshold:.3});
  bars.forEach(b=>io.observe(b));
}

function initTypewriter() {
  const el=document.querySelector('.hero-subtitle'); if(!el)return;
  const phrases=['ECE Student @ MIT Anna University','Hackathon Explorer','Embedded Systems Enthusiast','VLSI Enthusiast','AIoT Developer'];
  let pi=0,ci=0,deleting=false;
  const tw=el.querySelector('.tw-text'); if(!tw)return;
  function tick(){
    const phrase=phrases[pi];
    if(!deleting){tw.textContent=phrase.slice(0,++ci);if(ci>=phrase.length){deleting=true;setTimeout(tick,1800);return;}setTimeout(tick,55);}
    else{tw.textContent=phrase.slice(0,--ci);if(ci<=0){deleting=false;pi=(pi+1)%phrases.length;setTimeout(tick,400);return;}setTimeout(tick,28);}
  }
  tick();
}

function injectWaveDivider() {
  const hero=document.getElementById('home'); if(!hero)return;
  const div=document.createElement('div');div.className='scope-divider';
  div.innerHTML=`<svg viewBox="0 0 1200 60" preserveAspectRatio="none" fill="none" xmlns="http://www.w3.org/2000/svg"><polyline points="0,30 60,30 80,10 100,50 120,10 140,50 160,30 300,30 320,5 340,55 360,5 380,55 400,30 600,30 620,12 640,48 660,12 680,48 700,30 900,30 920,8 940,52 960,8 980,52 1000,30 1200,30" stroke="#00e5c8" stroke-width="1.2" stroke-linejoin="round" opacity="0.6"/></svg>`;
  hero.after(div);
}
