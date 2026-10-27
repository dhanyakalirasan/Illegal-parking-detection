const express = require('express');
const { upload } = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/', protect, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No image uploaded' });
  }
  
  let imageUrl = req.file.path;
  
  // If it's a local upload, format the URL properly
  if (!req.file.path.startsWith('http')) {
    // Assuming server runs on localhost:5000 (can be improved with dynamic host)
    imageUrl = `http://localhost:5000/uploads/${req.file.filename}`;
  }

  res.status(200).json({
    message: 'Image uploaded successfully',
    imageUrl: imageUrl
  });
});

module.exports = router;
