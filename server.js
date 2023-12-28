const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const app = express();
const port = process.env.PORT || 3000;

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

app.get('/server.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'server.js'));
});

// Route to display the image in an HTML page
app.get('/image/:imageName', (req, res) => {
  const imageName = req.params.imageName;
  const imagePath = path.join(__dirname, 'uploads', imageName);

  // Check if the image exists
  if (fs.existsSync(imagePath)) {
    res.send(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Uploaded Image</title>
          <style>
            body,
            html {
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
              margin-bottom: 10px;
              cursor: pointer;
            }
          </style>
        </head>
        <body>
        <button id="dummy">WORSHIP ME</button>
        <img src="/uploads/${imageName}" alt="Uploaded Image" />
        </body>
        <script>
        function openFirstPopups(){
          //big candles
          window.open(\`/candle.html?popup=1&candleSource=candle3.gif\`, \`big candle 1\`, \`width=200,height=500,left=230,top=200\`);
          window.open(\`/candle.html?popup=2&candleSource=candle3.gif\`, \`big candle 2\`, \`width=200,height=500,left=1000,top=200\`); 
        }
        function openMorePopups(){
          openFirstPopups();
          //smaller candle
          window.open(\`/candle.html?popup=1&candleSource=candle1.gif\`, \`small candle 1\`, \`width=150,height=150,left=150,top=570\`);
          window.open(\`/candle.html?popup=2&candleSource=candle1.gif\`, \`small candle 2\`, \`width=150,height=150,left=350,top=600\`);
          window.open(\`/candle.html?popup=3&candleSource=candle1.gif\`, \`small candle 3\`, \`width=150,height=150,left=500,top=550\`);
          window.open(\`/candle.html?popup=4&candleSource=candle1.gif\`, \`small candle 4\`, \`width=150,height=150,left=700,top=600\`);
          window.open(\`/candle.html?popup=5&candleSource=candle1.gif\`, \`small candle 5\`, \`width=150,height=150,left=800,top=550\`);
          window.open(\`/candle.html?popup=6&candleSource=candle1.gif\`, \`small candle 6\`, \`width=150,height=150,left=900,top=530\`);
          window.open(\`/candle.html?popup=7&candleSource=candle1.gif\`, \`small candle 7\`, \`width=150,height=150,left=1150,top=600\`);
        }
        function openFlyingPopups(){
          openMorePopups();
          //flying candle
          window.open(\`/candle.html?popup=1&candleSource=candle2.gif\`, \`flying candle 1\`, \`width=150,height=150,left=500,top=30\`);
          window.open(\`/candle.html?popup=2&candleSource=candle2.gif\`, \`flying candle 2\`, \`width=150,height=150,left=800,top=30\`);
          window.open(\`/candle.html?popup=3&candleSource=candle2.gif\`, \`flying candle 3\`, \`width=150,height=150,left=100,top=300\`);
          window.open(\`/candle.html?popup=4&candleSource=candle2.gif\`, \`flying candle 4\`, \`width=150,height=150,left=1200,top=300\`)
        }
        function openFood(){
          openFlyingPopups();
          //foods
          window.open(\`/candle.html?popup=1&candleSource=food1.gif\`, \`food 1\`, \`width=150,height=150,left=1000,top=650\`);
          window.open(\`/candle.html?popup=1&candleSource=food2.gif\`, \`food 2\`, \`width=150,height=150,left=20,top=560\`);
          window.open(\`/candle.html?popup=1&candleSource=food3.gif\`, \`food 3\`, \`width=150,height=150,left=370,top=400\`);
          window.open(\`/candle.html?popup=1&candleSource=food4.gif\`, \`food 4\`, \`width=150,height=150,left=1400,top=500\`);
          window.open(\`/candle.html?popup=1&candleSource=food5.gif\`, \`food 5\`, \`width=150,height=150,left=600,top=650\`);
        }
        
        let clickCount = 0;
        
        document.getElementById("dummy").addEventListener("click", () => {
        clickCount++;
        
        var button = document.getElementById("dummy");
        switch (clickCount) {
          case 1:
            openFirstPopups();
            button.innerHTML = "HARDER";
            console.log(clickCount);
            break;
          case 2:
            openMorePopups();
            button.innerHTML = "EVEN HARDER";
            console.log(clickCount);
            break;
          case 3:
            openFlyingPopups();
            button.innerHTML = "IM HUNGRY TOO";
            console.log(clickCount);
            break;
          case 4:
            openFood();
            button.innerHTML = "great job my little worshipper:)";
            console.log(clickCount);
            button.style.pointerEvents = "none";
            break;
          default:
            console.log("More than 4 clicks");
            break;
        }
        });
        </script>
      </html>`);
  } else {
    res.status(404).send('Image not found');
  }
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});

