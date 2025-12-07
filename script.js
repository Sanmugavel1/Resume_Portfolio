// API Configuration
const API_BASE_URL = 'https://resume-portfolio-sanmugavelb.onrender.com/api';

// Global State
let currentUser = null;
let portfolioData = {};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    checkAuth();
    initializeNavigation();
    loadAllData();
});

// Authentication Check
function checkAuth() {
    const userStr = localStorage.getItem('portfolioUser');
    if (!userStr) {
        window.location.href = 'login.html';
        return;
    }
    
    currentUser = JSON.parse(userStr);
    
    // Set admin class on body if user is admin
    if (currentUser.role === 'admin') {
        document.body.classList.add('admin');
    }
    
    // Update user display
    const userDisplay = document.getElementById('userDisplay');
    if (userDisplay) {
        userDisplay.textContent = `${currentUser.role === 'admin' ? '👑 Admin' : '👤 Visitor'}: ${currentUser.name}`;
    }
}

// Logout Function
function logout() {
    localStorage.removeItem('portfolioUser');
    window.location.href = 'login.html';
}

// Navigation
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const navToggle = document.getElementById('navToggle');
    const navMenu = document.getElementById('navMenu');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionId = link.dataset.section;
            navigateToSection(sectionId);
            
            // Close mobile menu
            if (navMenu) navMenu.classList.remove('active');
        });
    });
    
    // Mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', () => {
            navMenu.classList.toggle('active');
            navToggle.classList.toggle('active');
        });
    }
}

function navigateToSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update nav links
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.section === sectionId) {
            link.classList.add('active');
        }
    });
}

// Load All Data
async function loadAllData() {
    try {
        const response = await fetch(`${API_BASE_URL}/portfolio`);
        portfolioData = await response.json();
        
        renderAbout();
        renderEducation();
        renderExperience();
        renderProjects();
        renderSkills();
        loadProfileImage();
    } catch (error) {
        console.error('Error loading data:', error);
    }
}

// About Section
function renderAbout() {
    const container = document.getElementById('aboutContent');
    const about = portfolioData.about || {
        bio: 'Passionate full stack developer with expertise in building scalable web applications...',
        highlights: []
    };
    
    container.innerHTML = `
        <p style="font-size: 1.125rem; line-height: 1.8; margin-bottom: 2rem; color: var(--color-text-secondary);">
            ${about.bio}
        </p>
        <div class="about-grid">
            ${about.highlights.map(h => `
                <div class="about-item">
                    <i class="${h.icon}"></i>
                    <h3>${h.title}</h3>
                    <p>${h.description}</p>
                </div>
            `).join('')}
        </div>
    `;
}

// Education Section
function renderEducation() {
    const container = document.getElementById('educationList');
    const education = portfolioData.education || [];
    
    if (education.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-graduation-cap"></i><p>No education records yet</p></div>';
        return;
    }
    
    container.innerHTML = education.map(edu => `
        <div class="education-item" onclick="showDetail('education', '${edu.id}')">
            <div class="item-header">
                <div class="item-title">
                    <h3>${edu.degree}</h3>
                    <h4>${edu.institution}</h4>
                    <div class="item-meta">
                        <i class="fas fa-calendar"></i> ${edu.period} | 
                        <i class="fas fa-map-marker-alt"></i> ${edu.location}
                        ${edu.grade ? ` | <i class="fas fa-award"></i> ${edu.grade}` : ''}
                    </div>
                </div>
                ${currentUser.role === 'admin' ? `
                <div class="item-actions">
                    <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); editEducation('${edu.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); deleteEducation('${edu.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                ` : ''}
            </div>
            ${edu.description ? `<p class="item-description">${edu.description}</p>` : ''}
        </div>
    `).join('');
}

// Experience Section
function renderExperience() {
    const container = document.getElementById('experienceList');
    const experience = portfolioData.experience || [];
    
    if (experience.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-briefcase"></i><p>No experience records yet</p></div>';
        return;
    }
    
    container.innerHTML = experience.map(exp => `
        <div class="experience-item" onclick="showDetail('experience', '${exp.id}')">
            <div class="item-header">
                <div class="item-title">
                    <h3>${exp.position}</h3>
                    <h4>${exp.company}</h4>
                    <div class="item-meta">
                        <i class="fas fa-calendar"></i> ${exp.period} | 
                        <i class="fas fa-map-marker-alt"></i> ${exp.location}
                    </div>
                </div>
                ${currentUser.role === 'admin' ? `
                <div class="item-actions">
                    <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); editExperience('${exp.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); deleteExperience('${exp.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
                ` : ''}
            </div>
            ${exp.description ? `<p class="item-description">${exp.description}</p>` : ''}
        </div>
    `).join('');
}

// Projects Section
function renderProjects() {
    const container = document.getElementById('projectsGrid');
    const projects = portfolioData.projects || [];
    
    if (projects.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-laptop-code"></i><p>No projects yet</p></div>';
        return;
    }
    
    container.innerHTML = projects.map(project => `
        <div class="project-card" onclick="showDetail('project', '${project.id}')">
            <div class="project-image">
                ${project.image ? `<img src="${project.image}" alt="${project.title}">` : `<i class="fas fa-code"></i>`}
            </div>
            <div class="project-content">
                <h3>${project.title}</h3>
                <p class="project-description">${project.description}</p>
                <div class="project-tags">
                    ${project.technologies ? project.technologies.map(tech => `<span class="tag">${tech}</span>`).join('') : ''}
                </div>
                <div class="project-footer">
                    ${project.github ? `<a href="${project.github}" target="_blank" onclick="event.stopPropagation()" class="btn btn-sm btn-secondary">
                        <i class="fab fa-github"></i> Code
                    </a>` : ''}
                    ${project.demo ? `<a href="${project.demo}" target="_blank" onclick="event.stopPropagation()" class="btn btn-sm btn-primary">
                        <i class="fas fa-external-link-alt"></i> Demo
                    </a>` : ''}
                </div>
                ${currentUser.role === 'admin' ? `
                <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--color-border); display: flex; gap: 0.5rem;">
                    <button class="btn btn-sm btn-primary" onclick="event.stopPropagation(); editProject('${project.id}')" style="flex: 1;">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="event.stopPropagation(); deleteProject('${project.id}')" style="flex: 1;">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
                ` : ''}
            </div>
        </div>
    `).join('');
}

// Skills Section
function renderSkills() {
    const container = document.getElementById('skillsContainer');
    const skills = portfolioData.skills || {};
    
    if (Object.keys(skills).length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-tools"></i><p>No skills added yet</p></div>';
        return;
    }
    
    container.innerHTML = Object.entries(skills).map(([category, items]) => `
        <div class="skill-category">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h3>${category}</h3>
                ${currentUser.role === 'admin' ? `
                <button class="btn btn-sm btn-danger" onclick="deleteSkillCategory('${category}')">
                    <i class="fas fa-trash"></i> Delete Category
                </button>
                ` : ''}
            </div>
            <div class="skills-grid">
                ${items.map(skill => `
                    <div class="skill-item">
                        <i class="${skill.icon || 'fas fa-check-circle'}"></i>
                        <span>${skill.name}</span>
                        ${currentUser.role === 'admin' ? `
                        <button class="btn btn-sm btn-danger" onclick="deleteSkillItem('${category}', '${skill.name}')" style="margin-top: 0.5rem;">
                            <i class="fas fa-trash"></i>
                        </button>
                        ` : ''}
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Detail Modal
function showDetail(type, id) {
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('detailModalContent');
    
    let item;
    if (type === 'education') {
        item = portfolioData.education.find(e => e.id === id);
        if (!item) return;
        
        content.innerHTML = `
            <div class="modal-header">
                <h2>${item.degree}</h2>
                <button class="modal-close" onclick="closeDetailModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <h3 style="color: var(--color-primary); margin-bottom: 1rem;">${item.institution}</h3>
                <p style="color: var(--color-text-secondary); margin-bottom: 1rem;">
                    <i class="fas fa-calendar"></i> ${item.period} | 
                    <i class="fas fa-map-marker-alt"></i> ${item.location}
                    ${item.grade ? ` | <i class="fas fa-award"></i> ${item.grade}` : ''}
                </p>
                <div style="line-height: 1.8;">
                    ${item.description || 'No additional details available.'}
                </div>
                ${item.achievements ? `
                <div style="margin-top: 2rem;">
                    <h4 style="margin-bottom: 1rem; color: var(--color-text);">Achievements</h4>
                    <ul style="list-style: none; padding: 0;">
                        ${item.achievements.map(a => `<li style="padding: 0.5rem 0; color: var(--color-text-secondary);"><i class="fas fa-check-circle" style="color: var(--color-success); margin-right: 0.5rem;"></i>${a}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
            </div>
        `;
    } else if (type === 'experience') {
        item = portfolioData.experience.find(e => e.id === id);
        if (!item) return;
        
        content.innerHTML = `
            <div class="modal-header">
                <h2>${item.position}</h2>
                <button class="modal-close" onclick="closeDetailModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                <h3 style="color: var(--color-primary); margin-bottom: 1rem;">${item.company}</h3>
                <p style="color: var(--color-text-secondary); margin-bottom: 1rem;">
                    <i class="fas fa-calendar"></i> ${item.period} | 
                    <i class="fas fa-map-marker-alt"></i> ${item.location}
                </p>
                <div style="line-height: 1.8;">
                    ${item.description || 'No additional details available.'}
                </div>
                ${item.responsibilities ? `
                <div style="margin-top: 2rem;">
                    <h4 style="margin-bottom: 1rem; color: var(--color-text);">Key Responsibilities</h4>
                    <ul style="list-style: none; padding: 0;">
                        ${item.responsibilities.map(r => `<li style="padding: 0.5rem 0; color: var(--color-text-secondary);"><i class="fas fa-check-circle" style="color: var(--color-success); margin-right: 0.5rem;"></i>${r}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
            </div>
        `;
    } else if (type === 'project') {
        item = portfolioData.projects.find(p => p.id === id);
        if (!item) return;
        
        content.innerHTML = `
            <div class="modal-header">
                <h2>${item.title}</h2>
                <button class="modal-close" onclick="closeDetailModal()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div class="modal-body">
                ${item.image ? `<img src="${item.image}" style="width: 100%; border-radius: var(--radius-lg); margin-bottom: 1.5rem;">` : ''}
                <div style="line-height: 1.8; margin-bottom: 1.5rem;">
                    ${item.fullDescription || item.description}
                </div>
                ${item.technologies ? `
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="margin-bottom: 1rem; color: var(--color-text);">Technologies Used</h4>
                    <div class="project-tags">
                        ${item.technologies.map(tech => `<span class="tag">${tech}</span>`).join('')}
                    </div>
                </div>
                ` : ''}
                ${item.features ? `
                <div style="margin-bottom: 1.5rem;">
                    <h4 style="margin-bottom: 1rem; color: var(--color-text);">Key Features</h4>
                    <ul style="list-style: none; padding: 0;">
                        ${item.features.map(f => `<li style="padding: 0.5rem 0; color: var(--color-text-secondary);"><i class="fas fa-check-circle" style="color: var(--color-success); margin-right: 0.5rem;"></i>${f}</li>`).join('')}
                    </ul>
                </div>
                ` : ''}
                <div style="display: flex; gap: 1rem;">
                    ${item.github ? `<a href="${item.github}" target="_blank" class="btn btn-secondary"><i class="fab fa-github"></i> View Code</a>` : ''}
                    ${item.demo ? `<a href="${item.demo}" target="_blank" class="btn btn-primary"><i class="fas fa-external-link-alt"></i> Live Demo</a>` : ''}
                </div>
            </div>
        `;
    }
    
    modal.classList.add('active');
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.remove('active');
}

// Profile Image Upload
function uploadProfileImage() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const response = await fetch(`${API_BASE_URL}/portfolio/profile-image`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ image: event.target.result })
                    });
                    
                    if (response.ok) {
                        loadProfileImage();
                        alert('Profile image updated successfully!');
                    }
                } catch (error) {
                    console.error('Error uploading image:', error);
                    alert('Failed to upload image');
                }
            };
            reader.readAsDataURL(file);
        }
    };
    input.click();
}

function loadProfileImage() {
    const placeholder = document.getElementById('profileImage');
    if (portfolioData.profileImage) {
        placeholder.innerHTML = `
            <img src="${portfolioData.profileImage}" alt="Profile">
            <button class="btn btn-primary btn-sm admin-only" onclick="uploadProfileImage()" style="position: absolute; bottom: 1rem; left: 50%; transform: translateX(-50%);">
                <i class="fas fa-camera"></i> Change Photo
            </button>
        `;
    }
}

// Contact Form
//function handleContactForm(e) {
//    e.preventDefault();
   // alert('Thank you for your message! I will get back to you soon.');
  //  e.target.reset();
//}
// Check for success parameter
window.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
        alert('✅ Thank you! Your message has been sent successfully. I\'ll get back to you soon!');
        // Clean URL
        window.history.replaceState({}, document.title, window.location.pathname);
    }
});
// CRUD Operations
function openAddModal(type) {
    const modal = document.getElementById('modal');
    const content = document.getElementById('modalContent');
    
    let formHTML = '';
    
    if (type === 'education') {
        formHTML = `
            <div class="modal-header">
                <h2>Add Education</h2>
                <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
            </div>
            <form onsubmit="saveEducation(event)" class="modal-body">
                <div class="form-group">
                    <label>Degree/Program</label>
                    <input type="text" class="form-control" name="degree" required>
                </div>
                <div class="form-group">
                    <label>Institution</label>
                    <input type="text" class="form-control" name="institution" required>
                </div>
                <div class="form-group">
                    <label>Period</label>
                    <input type="text" class="form-control" name="period" placeholder="e.g., 2018 - 2022" required>
                </div>
                <div class="form-group">
                    <label>Location</label>
                    <input type="text" class="form-control" name="location" required>
                </div>
                <div class="form-group">
                    <label>Grade/CGPA (Optional)</label>
                    <input type="text" class="form-control" name="grade">
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea class="form-control" name="description" rows="4"></textarea>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save</button>
                </div>
            </form>
        `;
    } else if (type === 'experience') {
        formHTML = `
            <div class="modal-header">
                <h2>Add Experience</h2>
                <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
            </div>
            <form onsubmit="saveExperience(event)" class="modal-body">
                <div class="form-group">
                    <label>Position/Role</label>
                    <input type="text" class="form-control" name="position" required>
                </div>
                <div class="form-group">
                    <label>Company</label>
                    <input type="text" class="form-control" name="company" required>
                </div>
                <div class="form-group">
                    <label>Period</label>
                    <input type="text" class="form-control" name="period" placeholder="e.g., Jan 2022 - Present" required>
                </div>
                <div class="form-group">
                    <label>Location</label>
                    <input type="text" class="form-control" name="location" required>
                </div>
                <div class="form-group">
                    <label>Description</label>
                    <textarea class="form-control" name="description" rows="4"></textarea>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save</button>
                </div>
            </form>
        `;
    } else if (type === 'project') {
        formHTML = `
            <div class="modal-header">
                <h2>Add Project</h2>
                <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
            </div>
            <form onsubmit="saveProject(event)" class="modal-body">
                <div class="form-group">
                    <label>Project Title</label>
                    <input type="text" class="form-control" name="title" required>
                </div>
                <div class="form-group">
                    <label>Short Description</label>
                    <textarea class="form-control" name="description" rows="2" required></textarea>
                </div>
                <div class="form-group">
                    <label>Full Description</label>
                    <textarea class="form-control" name="fullDescription" rows="4"></textarea>
                </div>
                <div class="form-group">
                    <label>Technologies (comma-separated)</label>
                    <input type="text" class="form-control" name="technologies" placeholder="React, Node.js, MongoDB">
                </div>
                <div class="form-group">
                    <label>GitHub URL</label>
                    <input type="url" class="form-control" name="github">
                </div>
                <div class="form-group">
                    <label>Demo URL</label>
                    <input type="url" class="form-control" name="demo">
                </div>
                <div class="form-group">
                    <label>Project Image</label>
                    <input type="file" class="form-control" name="image" accept="image/*">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save</button>
                </div>
            </form>
        `;
    } else if (type === 'skill') {
        formHTML = `
            <div class="modal-header">
                <h2>Add Skill</h2>
                <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
            </div>
            <form onsubmit="saveSkill(event)" class="modal-body">
                <div class="form-group">
                    <label>Category</label>
                    <input type="text" class="form-control" name="category" placeholder="e.g., Frontend, Backend, Tools" required>
                </div>
                <div class="form-group">
                    <label>Skill Name</label>
                    <input type="text" class="form-control" name="name" required>
                </div>
                <div class="form-group">
                    <label>Icon Class (FontAwesome)</label>
                    <input type="text" class="form-control" name="icon" placeholder="e.g., fab fa-react">
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                    <button type="submit" class="btn btn-primary">Save</button>
                </div>
            </form>
        `;
    }
    
    content.innerHTML = formHTML;
    modal.classList.add('active');
}

function openEditModal(type) {
    const modal = document.getElementById('modal');
    const content = document.getElementById('modalContent');
    
    const about = portfolioData.about || {};
    
    content.innerHTML = `
        <div class="modal-header">
            <h2>Edit About</h2>
            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
        </div>
        <form onsubmit="saveAbout(event)" class="modal-body">
            <div class="form-group">
                <label>Bio</label>
                <textarea class="form-control" name="bio" rows="5" required>${about.bio || ''}</textarea>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Save</button>
            </div>
        </form>
    `;
    
    modal.classList.add('active');
}

function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

// Save Functions
async function saveAbout(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = { bio: formData.get('bio') };
    
    try {
        const response = await fetch(`${API_BASE_URL}/portfolio/about`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            closeModal();
            await loadAllData();
            alert('About section updated!');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to update');
    }
}

async function saveEducation(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
        id: Date.now().toString(),
        degree: formData.get('degree'),
        institution: formData.get('institution'),
        period: formData.get('period'),
        location: formData.get('location'),
        grade: formData.get('grade'),
        description: formData.get('description')
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/portfolio/education`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            closeModal();
            await loadAllData();
            alert('Education added!');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to add education');
    }
}

async function saveExperience(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
        id: Date.now().toString(),
        position: formData.get('position'),
        company: formData.get('company'),
        period: formData.get('period'),
        location: formData.get('location'),
        description: formData.get('description')
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/portfolio/experience`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            closeModal();
            await loadAllData();
            alert('Experience added!');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to add experience');
    }
}

async function saveProject(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const imageFile = formData.get('image');
    let imageData = null;
    
    if (imageFile && imageFile.size > 0) {
        imageData = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(imageFile);
        });
    }
    
    const data = {
        id: Date.now().toString(),
        title: formData.get('title'),
        description: formData.get('description'),
        fullDescription: formData.get('fullDescription'),
        technologies: formData.get('technologies')?.split(',').map(t => t.trim()),
        github: formData.get('github'),
        demo: formData.get('demo'),
        image: imageData
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/portfolio/projects`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            closeModal();
            await loadAllData();
            alert('Project added!');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to add project');
    }
}

async function saveSkill(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
        category: formData.get('category'),
        name: formData.get('name'),
        icon: formData.get('icon') || 'fas fa-check-circle'
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/portfolio/skills`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            closeModal();
            await loadAllData();
            alert('Skill added!');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to add skill');
    }
}

// Delete Functions
async function deleteEducation(id) {
    if (!confirm('Are you sure you want to delete this education record?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/portfolio/education/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadAllData();
            alert('Education deleted!');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete');
    }
}

async function deleteExperience(id) {
    if (!confirm('Are you sure you want to delete this experience record?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/portfolio/experience/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadAllData();
            alert('Experience deleted!');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete');
    }
}

async function deleteProject(id) {
    if (!confirm('Are you sure you want to delete this project?')) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/portfolio/projects/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadAllData();
            alert('Project deleted!');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete');
    }
}

async function deleteSkillCategory(category) {
    if (!confirm(`Are you sure you want to delete the entire "${category}" category?`)) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/portfolio/skills/${encodeURIComponent(category)}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadAllData();
            alert('Category deleted!');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete');
    }
}

async function deleteSkillItem(category, skillName) {
    if (!confirm(`Are you sure you want to delete "${skillName}"?`)) return;
    
    try {
        const response = await fetch(`${API_BASE_URL}/portfolio/skills/${encodeURIComponent(category)}/${encodeURIComponent(skillName)}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            await loadAllData();
            alert('Skill deleted!');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to delete');
    }
}

// Edit Functions
async function editEducation(id) {
    const item = portfolioData.education.find(e => e.id === id);
    if (!item) return;
    
    const modal = document.getElementById('modal');
    const content = document.getElementById('modalContent');
    
    content.innerHTML = `
        <div class="modal-header">
            <h2>Edit Education</h2>
            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
        </div>
        <form onsubmit="updateEducation(event, '${id}')" class="modal-body">
            <div class="form-group">
                <label>Degree/Program</label>
                <input type="text" class="form-control" name="degree" value="${item.degree}" required>
            </div>
            <div class="form-group">
                <label>Institution</label>
                <input type="text" class="form-control" name="institution" value="${item.institution}" required>
            </div>
            <div class="form-group">
                <label>Period</label>
                <input type="text" class="form-control" name="period" value="${item.period}" required>
            </div>
            <div class="form-group">
                <label>Location</label>
                <input type="text" class="form-control" name="location" value="${item.location}" required>
            </div>
            <div class="form-group">
                <label>Grade/CGPA</label>
                <input type="text" class="form-control" name="grade" value="${item.grade || ''}">
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea class="form-control" name="description" rows="4">${item.description || ''}</textarea>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Update</button>
            </div>
        </form>
    `;
    
    modal.classList.add('active');
}

async function updateEducation(e, id) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
        degree: formData.get('degree'),
        institution: formData.get('institution'),
        period: formData.get('period'),
        location: formData.get('location'),
        grade: formData.get('grade'),
        description: formData.get('description')
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/portfolio/education/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            closeModal();
            await loadAllData();
            alert('Education updated!');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to update');
    }
}

async function editExperience(id) {
    const item = portfolioData.experience.find(e => e.id === id);
    if (!item) return;
    
    const modal = document.getElementById('modal');
    const content = document.getElementById('modalContent');
    
    content.innerHTML = `
        <div class="modal-header">
            <h2>Edit Experience</h2>
            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
        </div>
        <form onsubmit="updateExperience(event, '${id}')" class="modal-body">
            <div class="form-group">
                <label>Position/Role</label>
                <input type="text" class="form-control" name="position" value="${item.position}" required>
            </div>
            <div class="form-group">
                <label>Company</label>
                <input type="text" class="form-control" name="company" value="${item.company}" required>
            </div>
            <div class="form-group">
                <label>Period</label>
                <input type="text" class="form-control" name="period" value="${item.period}" required>
            </div>
            <div class="form-group">
                <label>Location</label>
                <input type="text" class="form-control" name="location" value="${item.location}" required>
            </div>
            <div class="form-group">
                <label>Description</label>
                <textarea class="form-control" name="description" rows="4">${item.description || ''}</textarea>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Update</button>
            </div>
        </form>
    `;
    
    modal.classList.add('active');
}

async function updateExperience(e, id) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
        position: formData.get('position'),
        company: formData.get('company'),
        period: formData.get('period'),
        location: formData.get('location'),
        description: formData.get('description')
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/portfolio/experience/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            closeModal();
            await loadAllData();
            alert('Experience updated!');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to update');
    }
}

async function editProject(id) {
    const item = portfolioData.projects.find(p => p.id === id);
    if (!item) return;
    
    const modal = document.getElementById('modal');
    const content = document.getElementById('modalContent');
    
    content.innerHTML = `
        <div class="modal-header">
            <h2>Edit Project</h2>
            <button class="modal-close" onclick="closeModal()"><i class="fas fa-times"></i></button>
        </div>
        <form onsubmit="updateProject(event, '${id}')" class="modal-body">
            <div class="form-group">
                <label>Project Title</label>
                <input type="text" class="form-control" name="title" value="${item.title}" required>
            </div>
            <div class="form-group">
                <label>Short Description</label>
                <textarea class="form-control" name="description" rows="2" required>${item.description}</textarea>
            </div>
            <div class="form-group">
                <label>Full Description</label>
                <textarea class="form-control" name="fullDescription" rows="4">${item.fullDescription || ''}</textarea>
            </div>
            <div class="form-group">
                <label>Technologies (comma-separated)</label>
                <input type="text" class="form-control" name="technologies" value="${item.technologies ? item.technologies.join(', ') : ''}">
            </div>
            <div class="form-group">
                <label>GitHub URL</label>
                <input type="url" class="form-control" name="github" value="${item.github || ''}">
            </div>
            <div class="form-group">
                <label>Demo URL</label>
                <input type="url" class="form-control" name="demo" value="${item.demo || ''}">
            </div>
            <div class="form-group">
                <label>Project Image</label>
                <input type="file" class="form-control" name="image" accept="image/*">
                ${item.image ? `<p style="margin-top: 0.5rem; color: var(--color-text-secondary); font-size: 0.875rem;">Current image will be kept if no new image is uploaded</p>` : ''}
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
                <button type="submit" class="btn btn-primary">Update</button>
            </div>
        </form>
    `;
    
    modal.classList.add('active');
}

async function updateProject(e, id) {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const imageFile = formData.get('image');
    let imageData = null;
    
    if (imageFile && imageFile.size > 0) {
        imageData = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.readAsDataURL(imageFile);
        });
    }
    
    const currentProject = portfolioData.projects.find(p => p.id === id);
    
    const data = {
        title: formData.get('title'),
        description: formData.get('description'),
        fullDescription: formData.get('fullDescription'),
        technologies: formData.get('technologies')?.split(',').map(t => t.trim()).filter(t => t),
        github: formData.get('github'),
        demo: formData.get('demo'),
        image: imageData || currentProject.image
    };
    
    try {
        const response = await fetch(`${API_BASE_URL}/portfolio/projects/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            closeModal();
            await loadAllData();
            alert('Project updated!');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Failed to update');
    }
}

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('modal');
    const detailModal = document.getElementById('detailModal');
    
    if (e.target === modal) {
        closeModal();
    }
    if (e.target === detailModal) {
        closeDetailModal();
    }

});



