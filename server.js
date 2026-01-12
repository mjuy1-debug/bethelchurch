const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Request Logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.originalUrl}`);
    next();
});

// Explicit Redirect for /admin to /admin/login.html
app.get('/admin', (req, res) => {
    res.redirect('/admin/login.html');
});

// Static Files
// Serve the entire current directory as static files strictly for development convenience
// In production, you'd serve specific folders. Here we serve the root so index.html works from http://localhost:3000
app.use(express.static(__dirname));

// Specifically serve uploads folder (redundant if using root static, but good for clarity)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadDir = 'uploads/';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir);
        }
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Generate unique filename: timestamp-originalName
        // Use regex to sanitize filename if needed, or just keep rough original
        // Encoding for Korean files can be tricky, using timestamp is safest
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, 'file-' + uniqueSuffix + ext);
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Routes
// Use 'image' as key for images, but works for any file if we don't filter MimeType
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Return relative path (from root) to access the file
    // Using ./uploads ensures it works with index.html at root
    const fileUrl = `./uploads/${req.file.filename}`;

    res.json({
        message: 'File uploaded successfully',
        url: fileUrl
    });
});

// New Endpoint: Save Data to File
app.post('/save-data', (req, res) => {
    const data = req.body;

    // Format the data as a JavaScript file content
    const fileContent = `const defaultData = ${JSON.stringify(data, null, 4)};\n`;

    const dataFilePath = path.join(__dirname, 'js', 'data.js');

    fs.writeFile(dataFilePath, fileContent, 'utf8', (err) => {
        if (err) {
            console.error('Error saving data:', err);
            return res.status(500).json({ error: 'Failed to save data' });
        }
        res.json({ message: 'Data saved successfully to js/data.js' });
    });
});

// Start Server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log(`- Homepage: http://localhost:${PORT}/index.html`);
    console.log(`- Upload API: http://localhost:${PORT}/upload`);
});
