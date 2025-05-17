const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5500;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/songs', express.static(path.join(__dirname, 'songs')));

// API: list all folders (albums) and include audio files
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

        // Parse info.json
        if (fs.existsSync(infoPath)) {
          try {
            info = JSON.parse(fs.readFileSync(infoPath, 'utf-8'));
          } catch (e) {
            console.warn(Invalid info.json in ${folder});
          }
        }

        // Get list of audio files
        const files = fs.readdirSync(folderPath);
        const audio = files
          .filter(file => file.endsWith('.mp3') || file.endsWith('.m4a'))
          .map(file => /songs/${folder}/${file});

        // Get cover file (.jpg, .jpeg, .png)
        const cover = files.find(f => f.startsWith('cover') && /\.(jpg|jpeg|png)$/.test(f));
        const coverUrl = cover ? /songs/${folder}/${cover} : null;

        return {
          folder,
          title: info.title,
          description: info.description,
          cover: coverUrl,
          audio,
        };
      });

    res.json(albumList);
  });
});

app.listen(PORT, () => {
  console.log(Server running on http://localhost:${PORT});
});
