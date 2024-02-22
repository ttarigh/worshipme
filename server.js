const express = require("express");
const https = require("https");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const app = express();

const dev = process.env.NODE_ENV === "development";
const port = dev ? 3000 : 80;
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
app.post("/upload", upload.single("photo"), (req, res) => {
  const file = req.file;
  console.log("uploading file");
  if (!file) {
    return res.status(400).send("No file uploaded.");
  }
  imageUrl = `https://worshipme.tina.zone/image/${file.filename}`; // Replace 'yourdomain.com' with your actual domain
  // Redirect to the page showing the uploaded image
  res.redirect(`/image/${file.filename}`);
});

app.get("/image-url", (req, res) => {
  res.json({ imageUrl: imageUrl }); // Assuming imageUrl is the global variable containing the image URL
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
          <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/img/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/img/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/img/favicon-16x16.png"
        />
        <link rel="manifest" href="/img/site.webmanifest" />
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
          window.open(\`/button1.html\`, \`HARDER\`, \`width=100,height=100,left=650,top=150\`); 
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
          default:
            console.log("More than 4 clicks");
            break;
        }
        });
        function isPopupBlocked() {
          // Open a dummy popup
          var popup = window.open("", "test-popup", "width=1,height=1");
          if (!popup || popup.closed || typeof popup.closed === "undefined") {
            // Popup was blocked
            alert("You have popups blocked. Allow popups and reload the page to build your digital shrine!")
            return true;
          }
          // Close the dummy popup
          popup.close();
          // Popup wasn't blocked
          return false;
        }
        </script>
      </html>`
    );
  } else {
    res.status(404).send("Image not found");
  }
});

// Serve static files from 'public' directory
app.use(express.static("public"));

if (dev) {
  app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`); //not always on localhost because sometimes its in production! check port
  });
} else {
  // HTTPS options
  const httpsOptions = {
    key: fs.readFileSync(
      "/etc/letsencrypt/live/worshipme.tina.zone/privkey.pem"
    ),
    cert: fs.readFileSync(
      "/etc/letsencrypt/live/worshipme.tina.zone/fullchain.pem"
    ),
  };

  // Create an HTTPS server
  https.createServer(httpsOptions, app).listen(httpsPort, () => {
    console.log(`Server listening at https://localhost:${httpsPort}`);
  });
}
