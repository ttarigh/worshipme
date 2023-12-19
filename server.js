const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = 3000;

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Create a unique file name
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Serve static files from 'public' directory
app.use(express.static('public'));

// Endpoint to handle file upload
app.post('/upload', upload.single('photo'), (req, res) => {
  const file = req.file;
  if (!file) {
    return res.status(400).send('No file uploaded.');
  }
  // Redirect to the page showing the uploaded image
  res.redirect(`/image/${file.filename}`);
});

// Serve uploaded files directly
app.use('/uploads', express.static('uploads'));

// Add a route for the root URL
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Route to display the image in an HTML page
app.get('/image/:imageName', (req, res) => {
  const imageName = req.params.imageName;
  const imagePath = path.join(__dirname, 'uploads', imageName);

  // Check if the image exists
  if (fs.existsSync(imagePath)) {
    res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Uploaded Image</title>
      <style>
        body, html {
          height: 100%;
          margin: 0;
          background-color: rgb(255, 122, 215);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
        img {
          max-width: 100%;
          max-height: 50%;
          margin-bottom: 20px;
        }
        button {
          padding: 10px 20px;
          font-size: 16px;
          cursor: pointer;
        }
      </style>
    </head>
    <body>
      <img src="/uploads/${imageName}" alt="Uploaded Image">
      <button onclick="window.location.href='/'">Make My Own Shrine</button>
    </body>
    </html>
    `);
  } else {
    res.status(404).send('Image not found');
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
