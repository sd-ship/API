const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5500;

app.use(cors());

// Serve static frontend files (optional, if you're running frontend from same server)
app.use(express.static(path.join(__dirname, 'public')));

// Serve song assets like audio, cover images, and info.json
app.use('/songs', express.static(path.join(__dirname, 'songs')));

// API: list all folders (albums)
app.get('/api/songs', (req, res) => {
  const songsDir = path.join(__dirname, 'songs');

  fs.readdir(songsDir, (err, folders) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read songs directory' });
    }

    const albumList = folders
      .filter(folder => fs.statSync(path.join(songsDir, folder)).isDirectory())
      .map(folder => {
        const folderPath = path.join(songsDir, folder);
        const infoPath = path.join(folderPath, 'info.json');
        let info = { title: folder, description: '' };

        if (fs.existsSync(infoPath)) {
          try {
            info = JSON.parse(fs.readFileSync(infoPath, 'utf-8'));
          } catch (e) {
            console.warn(`Invalid info.json in ${folder}`);
          }
        }

        return {
          folder,
          title: info.title,
          description: info.description,
          cover: `/songs/${folder}/cover.jpg` // You may need to add logic to support .jpeg/.png
        };
      });

    res.json(albumList);
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});