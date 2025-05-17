const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5500;

app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/songs', express.static(path.join(__dirname, 'songs')));

// Route 1: Return only folder names
app.get('/api/songs', (req, res) => {
  const songsDir = path.join(__dirname, 'songs');

  fs.readdir(songsDir, (err, folders) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to read songs directory' });
    }

    const onlyFolders = folders.filter(folder =>
      fs.statSync(path.join(songsDir, folder)).isDirectory()
    );

    res.json(onlyFolders);
  });
});

// Route 2: Return details of a specific folder
app.get('/api/songs/:folder', (req, res) => {
  const folder = req.params.folder;
  const folderPath = path.join(__dirname, 'songs', folder);

  if (!fs.existsSync(folderPath) || !fs.statSync(folderPath).isDirectory()) {
    return res.status(404).json({ error: 'Folder not found' });
  }

  const infoPath = path.join(folderPath, 'info.json');
  let info = { title: folder, description: '' };

  if (fs.existsSync(infoPath)) {
    try {
      info = JSON.parse(fs.readFileSync(infoPath, 'utf-8'));
    } catch (e) {
      console.warn(`Invalid info.json in ${folder}`);
    }
  }

  const files = fs.readdirSync(folderPath);
  const audio = files
    .filter(file => file.endsWith('.mp3') || file.endsWith('.m4a'))
    .map(file => `/songs/${folder}/${file}`);

  const cover = files.find(f => f.startsWith('cover') && /\.(jpg|jpeg|png)$/.test(f));
  const coverUrl = cover ? `/songs/${folder}/${cover}` : null;

  res.json({
    folder,
    title: info.title,
    description: info.description,
    cover: coverUrl,
    audio,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
