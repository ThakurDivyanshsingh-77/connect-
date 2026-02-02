const multer = require('multer');
const path = require('path');
const fs = require('fs');

// 1. Ensure 'uploads' folder exists
const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)){
    fs.mkdirSync(uploadDir);
}

// 2. Storage Configuration (Kahan save karna hai)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // 'uploads' folder mein file jayegi
  },
  filename: (req, file, cb) => {
    // File ka naam unique banao: file-timestamp.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// 3. Initialize Multer (NO FILTER - All files allowed)
const upload = multer({ 
  storage: storage,
  // Limit increased to 50MB (Video/Zip ke liye zaroori hai)
  limits: { fileSize: 50 * 1024 * 1024 } 
});

module.exports = upload;