const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection String
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://sanmugavelb1_db_user:Sanmugavel@cluster0.lrndxdi.mongodb.net/portfolioDB?retryWrites=true&w=majority';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static(__dirname));

// MongoDB Schemas
const portfolioSchema = new mongoose.Schema({
    about: {
        bio: String,
        highlights: [{
            icon: String,
            title: String,
            description: String
        }]
    },
    education: [{
        id: String,
        degree: String,
        institution: String,
        period: String,
        location: String,
        grade: String,
        description: String,
        achievements: [String]
    }],
    experience: [{
        id: String,
        position: String,
        company: String,
        period: String,
        location: String,
        description: String,
        responsibilities: [String]
    }],
    projects: [{
        id: String,
        title: String,
        description: String,
        fullDescription: String,
        technologies: [String],
        github: String,
        demo: String,
        image: String,
        features: [String]
    }],
    skills: mongoose.Schema.Types.Mixed,
    profileImage: String
}, { timestamps: true });

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => {
        console.log('✅ MongoDB Connected Successfully!');
        initializeData();
    })
    .catch(err => {
        console.error('❌ MongoDB Connection Error:', err);
        process.exit(1);
    });

// Initialize data if database is empty
async function initializeData() {
    try {
        const count = await Portfolio.countDocuments();
        if (count === 0) {
const initialData = {
    about: {
        bio: "AIoT & Embedded Systems Developer from MIT, Anna University. Passionate about combining hardware and software to build real-world impactful solutions. Hands-on in robotics, sensor systems, embedded programming, AIoT applications, FPGA design, and full-stack prototyping.",
        highlights: [
            {
                icon: "fas fa-microchip",
                title: "AIoT & Embedded Systems",
                description: "Experience with Arduino, ESP32, STM32, IMU fusion, sensor integration, and autonomous robotics."
            },
            {
                icon: "fas fa-robot",
                title: "Robotics & Underwater Systems",
                description: "Developed underwater robots, submarines, and sensor-stabilized autonomous systems."
            },
            {
                icon: "fas fa-code",
                title: "Programming",
                description: "Strong in Python, C, C++, MATLAB and problem-solving (DSA)."
            }
        ]
    },

    education: [
        {
            id: "1",
            degree: "B.E Electronics and Communication Engineering",
            institution: "Madras Institute of Technology, Anna University",
            period: "2024 – 2028",
            location: "Chennai, Tamil Nadu",
            grade: "",
            description: "Specializing in embedded systems, signal processing, robotics, FPGA, and AIoT technologies.",
            achievements: [
                "NSS Volunteer at MIT",
                "Member – Event Management Team, PDA MIT",
                "Member – Outreach & Engagement Team, AUSEC"
            ]
        },
        {
            id: "2",
            degree: "Higher Secondary Education",
            institution: "Sri Ahobila Math Oriental Higher Secondary School",
            period: "2022 – 2024",
            location: "Chennai, Tamil Nadu",
            grade: "",
            description: "",
            achievements: []
        }
    ],

    experience: [], // You are still a student, so leave empty

    projects: [
        {
            id: "1",
            title: "Underwater Welding Robot (Kurukshetra’25)",
            description: "An underwater robotic platform with IMU-based stabilization and multiple sensors.",
            fullDescription: "Developed a basic underwater robotic system integrating IMU (MPU6050), ultrasonic sensors, and navigation control for underwater stability. Designed the CAD body, implemented sensor fusion logic, and built the electronics.",
            technologies: ["Arduino C", "IMU (MPU6050)", "Ultrasonic Sensors", "CAD Design"],
            github: "https://github.com/Sanmugavel1",
            demo: "",
            image: null,
            features: [
                "IMU-based stability control",
                "Multi-sensor fusion",
                "Underwater navigation",
                "CAD-based mechanical structure"
            ]
        },
        {
            id: "2",
            title: "Underwater Submarine – PERI Project Expo (Finalist)",
            description: "An improved version of the underwater weld-bot with improved stabilization and structure.",
            fullDescription: "Extended the underwater robot into a functional submarine. Integrated pressure sensor, improved IMU fusion algorithms, and enhanced navigation capabilities.",
            technologies: ["IMU Fusion", "Arduino", "Pressure Sensor", "Mechanical Modelling"],
            github: "https://github.com/Sanmugavel1",
            demo: "",
            image: null,
            features: [
                "Pressure sensor integration",
                "Improved IMU fusion",
                "Enhanced body design",
                "National-level finalist"
            ]
        },
        {
            id: "3",
            title: "Gunshot Detection Using FPGA (Sprintathon’25 Finalist)",
            description: "Real-time gunshot detection using microphone arrays and FPGA DSP.",
            fullDescription: "Implemented real-time FIR/Bandpass filtering and event detection pipeline using multiple INMP441 microphones on FPGA. Designed a DSP chain for detecting high-energy acoustic signatures.",
            technologies: ["FPGA", "Verilog", "INMP441 Microphones", "Signal Processing"],
            github: "https://github.com/Sanmugavel1",
            demo: "",
            image: null,
            features: [
                "FPGA-based DSP pipeline",
                "Multi-mic audio processing",
                "High-speed real-time detection",
                "National Hackathon Finalist"
            ]
        },
        {
            id: "4",
            title: "SquadSync – Smart Sharing Companion",
            description: "A web app for managing shared tasks among friends.",
            fullDescription: "Developed a responsive web app for smart sharing of tasks created during a technical event. Implemented dynamic UI, JSON backend storage, and interactive features.",
            technologies: ["HTML", "CSS", "JavaScript"],
            github: "https://github.com/Sanmugavel1",
            demo: "",
            image: null,
            features: [
                "Task sharing",
                "Lightweight JSON backend",
                "Responsive design",
                "Real-time collaboration features"
            ]
        }
    ],

    skills: {
        "Programming": [
            { name: "Python", icon: "fab fa-python" },
            { name: "C", icon: "fas fa-code" },
            { name: "C++", icon: "fas fa-code" },
            { name: "MATLAB", icon: "fas fa-square-root-alt" }
        ],
        "Embedded Systems": [
            { name: "Arduino", icon: "fas fa-microchip" },
            { name: "ESP32", icon: "fas fa-broadcast-tower" },
            { name: "STM32", icon: "fas fa-microchip" },
            { name: "IMU Fusion", icon: "fas fa-compass" },
            { name: "Sensor Integration", icon: "fas fa-satellite" }
        ],
        "FPGA & Hardware": [
            { name: "Verilog", icon: "fas fa-microchip" },
            { name: "Vivado", icon: "fas fa-cogs" },
            { name: "DSP on FPGA", icon: "fas fa-wave-square" }
        ],
        "Tools": [
            { name: "Git", icon: "fab fa-git-alt" },
            { name: "Fusion 360", icon: "fas fa-cube" },
            { name: "JLCPCB", icon: "fas fa-layer-group" },
            { name: "STM32CubeIDE", icon: "fas fa-microchip" }
        ],
        "Domains": [
            { name: "IoT", icon: "fas fa-wifi" },
            { name: "Robotics", icon: "fas fa-robot" },
            { name: "AIoT", icon: "fas fa-brain" },
            { name: "Signal Processing", icon: "fas fa-wave-square" }
        ]
    },

    profileImage: null
};

            
            await Portfolio.create(initialData);
            console.log('✅ Initial data created in MongoDB');
        }
    } catch (error) {
        console.error('Error initializing data:', error);
    }
}

// Helper function to get portfolio document
async function getPortfolio() {
    let portfolio = await Portfolio.findOne();
    if (!portfolio) {
        portfolio = await Portfolio.create({
            about: { bio: '', highlights: [] },
            education: [],
            experience: [],
            projects: [],
            skills: {},
            profileImage: null
        });
    }
    return portfolio;
}

// API Routes

// Get all portfolio data
app.get('/api/portfolio', async (req, res) => {
    try {
        const portfolio = await getPortfolio();
        res.json(portfolio);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch data' });
    }
});

// Update About section
app.put('/api/portfolio/about', async (req, res) => {
    try {
        const portfolio = await getPortfolio();
        portfolio.about = { ...portfolio.about, ...req.body };
        await portfolio.save();
        res.json({ success: true, data: portfolio.about });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: 'Failed to update' });
    }
});

// Education CRUD
app.get('/api/portfolio/education', async (req, res) => {
    try {
        const portfolio = await getPortfolio();
        res.json(portfolio.education || []);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch education' });
    }
});

app.post('/api/portfolio/education', async (req, res) => {
    try {
        const portfolio = await getPortfolio();
        portfolio.education.push(req.body);
        await portfolio.save();
        res.json({ success: true, data: req.body });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to add' });
    }
});

app.put('/api/portfolio/education/:id', async (req, res) => {
    try {
        const portfolio = await getPortfolio();
        const index = portfolio.education.findIndex(e => e.id === req.params.id);
        
        if (index !== -1) {
            portfolio.education[index] = { ...portfolio.education[index].toObject(), ...req.body };
            await portfolio.save();
            res.json({ success: true, data: portfolio.education[index] });
        } else {
            res.status(404).json({ success: false, error: 'Not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update' });
    }
});

app.delete('/api/portfolio/education/:id', async (req, res) => {
    try {
        const portfolio = await getPortfolio();
        portfolio.education = portfolio.education.filter(e => e.id !== req.params.id);
        await portfolio.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to delete' });
    }
});

// Experience CRUD
app.get('/api/portfolio/experience', async (req, res) => {
    try {
        const portfolio = await getPortfolio();
        res.json(portfolio.experience || []);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch experience' });
    }
});

app.post('/api/portfolio/experience', async (req, res) => {
    try {
        const portfolio = await getPortfolio();
        portfolio.experience.push(req.body);
        await portfolio.save();
        res.json({ success: true, data: req.body });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to add' });
    }
});

app.put('/api/portfolio/experience/:id', async (req, res) => {
    try {
        const portfolio = await getPortfolio();
        const index = portfolio.experience.findIndex(e => e.id === req.params.id);
        
        if (index !== -1) {
            portfolio.experience[index] = { ...portfolio.experience[index].toObject(), ...req.body };
            await portfolio.save();
            res.json({ success: true, data: portfolio.experience[index] });
        } else {
            res.status(404).json({ success: false, error: 'Not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update' });
    }
});

app.delete('/api/portfolio/experience/:id', async (req, res) => {
    try {
        const portfolio = await getPortfolio();
        portfolio.experience = portfolio.experience.filter(e => e.id !== req.params.id);
        await portfolio.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to delete' });
    }
});

// Projects CRUD
app.get('/api/portfolio/projects', async (req, res) => {
    try {
        const portfolio = await getPortfolio();
        res.json(portfolio.projects || []);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch projects' });
    }
});

app.post('/api/portfolio/projects', async (req, res) => {
    try {
        const portfolio = await getPortfolio();
        portfolio.projects.push(req.body);
        await portfolio.save();
        res.json({ success: true, data: req.body });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to add' });
    }
});

app.put('/api/portfolio/projects/:id', async (req, res) => {
    try {
        const portfolio = await getPortfolio();
        const index = portfolio.projects.findIndex(p => p.id === req.params.id);
        
        if (index !== -1) {
            portfolio.projects[index] = { ...portfolio.projects[index].toObject(), ...req.body };
            await portfolio.save();
            res.json({ success: true, data: portfolio.projects[index] });
        } else {
            res.status(404).json({ success: false, error: 'Not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update' });
    }
});

app.delete('/api/portfolio/projects/:id', async (req, res) => {
    try {
        const portfolio = await getPortfolio();
        portfolio.projects = portfolio.projects.filter(p => p.id !== req.params.id);
        await portfolio.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to delete' });
    }
});

// Skills CRUD
app.get('/api/portfolio/skills', async (req, res) => {
    try {
        const portfolio = await getPortfolio();
        res.json(portfolio.skills || {});
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch skills' });
    }
});

app.post('/api/portfolio/skills', async (req, res) => {
    try {
        const portfolio = await getPortfolio();
        const { category, name, icon } = req.body;
        
        if (!portfolio.skills) portfolio.skills = {};
        if (!portfolio.skills[category]) portfolio.skills[category] = [];
        
        portfolio.skills[category].push({ name, icon });
        portfolio.markModified('skills');
        await portfolio.save();
        
        res.json({ success: true, data: req.body });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to add' });
    }
});

app.delete('/api/portfolio/skills/:category', async (req, res) => {
    try {
        const portfolio = await getPortfolio();
        delete portfolio.skills[req.params.category];
        portfolio.markModified('skills');
        await portfolio.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to delete' });
    }
});

app.delete('/api/portfolio/skills/:category/:skillName', async (req, res) => {
    try {
        const portfolio = await getPortfolio();
        const { category, skillName } = req.params;
        
        if (portfolio.skills[category]) {
            portfolio.skills[category] = portfolio.skills[category].filter(s => s.name !== skillName);
            portfolio.markModified('skills');
            await portfolio.save();
            res.json({ success: true });
        } else {
            res.status(404).json({ success: false, error: 'Category not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to delete' });
    }
});

// Profile Image
app.post('/api/portfolio/profile-image', async (req, res) => {
    try {
        const portfolio = await getPortfolio();
        portfolio.profileImage = req.body.image;
        await portfolio.save();
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Failed to update' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log('');
    console.log('🚀 Portfolio Server with MongoDB is running!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📱 Open your browser: http://localhost:${PORT}/login.html`);
    console.log(`📊 API Endpoint: http://localhost:${PORT}/api`);
    console.log(`💾 Database: MongoDB Atlas (Data persists forever!)`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('🔐 Admin Login:');
    console.log('   Email: sanmugavelbl@gmail.com');
    console.log('   Password: Sanmugavel');
    console.log('');
    console.log('👤 Or click "Enter as Visitor" for read-only mode');
    console.log('');
    console.log('Press Ctrl+C to stop the server');
    console.log('');
});

module.exports = app;