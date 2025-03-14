const express = require("express");
const https = require("https");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const pool = require('./config/database');
require('dotenv').config();
const app = express();

// Create uploads directory if it doesn't exist
if (!fs.existsSync("uploads")) {
  fs.mkdirSync("uploads");
}

const dev = process.env.NODE_ENV === "development";
const port = process.env.PORT || 3000;
const httpsPort = 443; // HTTPS port

// Set up storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    // Create a unique file name
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});

const upload = multer({ storage: storage });

let imageUrl = ""; // Declare imageUrl globally

// Endpoint to handle file upload
app.post("/upload", upload.single("photo"), async (req, res) => {
  const file = req.file;
  console.log("uploading file");
  
  if (!file) {
    return res.status(400).send("No file uploaded.");
  }

  try {
    // Store image info in database
    const result = await pool.query(
      'INSERT INTO images (filename, filepath, created_at) VALUES ($1, $2, NOW()) RETURNING id',
      [file.filename, `/uploads/${file.filename}`]
    );
    
    const imageId = result.rows[0].id;
    imageUrl = `/image/${file.filename}`;
    
    res.redirect(`/image/${file.filename}`);
  } catch (err) {
    console.error('Error storing image info:', err);
    res.status(500).send('Error uploading image');
  }
});

app.get("/image-url", async (req, res) => {
  try {
    // Get the most recent image upload
    const result = await pool.query(
      'SELECT id, filepath FROM images ORDER BY created_at DESC LIMIT 1'
    );
    
    if (result.rows.length > 0) {
      res.json({ 
        imageUrl: imageUrl,
        id: result.rows[0].id 
      });
    } else {
      res.status(404).json({ error: 'No images found' });
    }
  } catch (err) {
    console.error('Error fetching image:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Serve uploaded files directly
app.use("/uploads", express.static("uploads"));

app.get("/tina", (req, res) => {
  res.send("hello");
});

// Route to display the image in an HTML page
app.get("/image/:imageName", (req, res) => {
  const imageName = req.params.imageName;
  const imagePath = path.join(__dirname, "uploads", imageName);
  console.log("displaying image: ", imagePath);

  // Check if the image exists
  if (fs.existsSync(imagePath)) {
    res.send(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Uploaded Image</title>
          <link href="https://fonts.googleapis.com/css2?family=Dancing+Script:wght@700&display=swap" rel="stylesheet">
          <link rel="apple-touch-icon" sizes="180x180" href="/img/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/img/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/img/favicon-16x16.png" />
          <link rel="manifest" href="/img/site.webmanifest" />
          <style>
            body, html {
              height: 100%;
              margin: 0;
              background-color: rgb(255, 106, 230);
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
            .worship-text {
              font-family: 'Dancing Script', cursive;
              font-size: 4em;
              color: #FFD700;  /* Gold color */
              text-shadow: 2px 2px 4px rgb(145, 0, 98);
              margin-bottom: 20px;
              animation: glow 2s ease-in-out infinite alternate;
            }
            @keyframes glow {
              from {
                text-shadow: 0 0 5px rgb(145, 0, 98), 0 0 10px rgb(145, 0, 98), 0 0 15px #FFD700, 0 0 20px #FFD700;
              }
              to {
                text-shadow: 0 0 10px rgb(145, 0, 98), 0 0 20px rgb(145, 0, 98), 0 0 30px #FFD700, 0 0 40px #FFD700;
              }
            }
            #popup-warning {
              background: rgba(255, 255, 255, 0.9);
              padding: 20px;
              border-radius: 10px;
              text-align: center;
              position: fixed;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              display: none;
            }
          </style>
        </head>
        <body>
          <div class="worship-text">WORSHIP ME</div>
          <div id="popup-warning">
            <h2>Please Enable Popups</h2>
            <p>This experience requires popups to be enabled. Please enable popups and refresh the page.</p>
          </div>
          <img src="/uploads/${imageName}" alt="Uploaded Image" />
          <script>
            function checkPopups() {
              var popup = window.open('', 'test', 'width=1,height=1');
              if (!popup || popup.closed || typeof popup.closed === 'undefined') {
                document.getElementById('popup-warning').style.display = 'block';
                return false;
              }
              popup.close();
              return true;
            }

            function startExperience() {
              if (checkPopups()) {
                // Calculate positions based on screen size
                const screenWidth = window.innerWidth;
                const screenHeight = window.innerHeight;
                
                // Position big candles on either side of the image
                const leftCandle = Math.floor(screenWidth * 0.15);  // 15% from left
                const rightCandle = Math.floor(screenWidth * 0.75); // 75% from left
                const candleTop = Math.floor(screenHeight * 0.2);   // 20% from top
                
                // Center the HARDER button
                const buttonLeft = Math.floor(screenWidth * 0.45);  // 45% from left
                const buttonTop = Math.floor(screenHeight * 0.1);   // 10% from top

                window.open(
                  \`/candle.html?popup=1&candleSource=candle3.gif\`, 
                  \`big candle 1\`, 
                  \`width=200,height=500,left=\${leftCandle},top=\${candleTop}\`
                );
                window.open(
                  \`/candle.html?popup=2&candleSource=candle3.gif\`, 
                  \`big candle 2\`, 
                  \`width=200,height=500,left=\${rightCandle},top=\${candleTop}\`
                );
                window.open(
                  \`/button1.html\`, 
                  \`HARDER\`, 
                  \`width=100,height=100,left=\${buttonLeft},top=\${buttonTop}\`
                );
              }
            }

            // Start the experience automatically when page loads
            window.onload = startExperience;
          </script>
        </body>
      </html>`
    );
  } else {
    res.status(404).send("Image not found");
  }
});

// Serve static files from 'public' directory
app.use(express.static("public"));

// Add endpoint to get image by ID
app.get("/shrine/:id", async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM images WHERE id = $1', [req.params.id]);
    
    if (result.rows.length === 0) {
      return res.status(404).send('Shrine not found');
    }
    
    const image = result.rows[0];
    res.redirect(`/image/${image.filename}`);
  } catch (err) {
    console.error('Error fetching shrine:', err);
    res.status(500).send('Error loading shrine');
  }
});

app.get("/test-db", async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ success: true, timestamp: result.rows[0].now });
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
