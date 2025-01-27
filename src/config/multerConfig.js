const multer = require('multer');
const path = require('path');

// Set up storage for multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Correct the path: move one level up to access the 'public' folder
    cb(null, path.join(__dirname, '../../public/uploads')); // Going up two levels to get to the 'public/uploads' directory
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // Save the file with a unique name
  }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif/;
  const extname = fileTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = fileTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed.'));
  }
};

// Create the upload middleware
const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter
});

module.exports = upload;
