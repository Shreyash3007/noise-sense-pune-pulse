const https = require('https');
const fs = require('fs');
const path = require('path');

const markers = [
  {
    url: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x.png',
    filename: 'marker-icon-2x.png'
  },
  {
    url: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon.png',
    filename: 'marker-icon.png'
  },
  {
    url: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png',
    filename: 'marker-shadow.png'
  }
];

const publicDir = path.join(__dirname, 'public');

markers.forEach(marker => {
  const file = fs.createWriteStream(path.join(publicDir, marker.filename));
  https.get(marker.url, response => {
    response.pipe(file);
    file.on('finish', () => {
      file.close();
      console.log(`Downloaded ${marker.filename}`);
    });
  }).on('error', err => {
    fs.unlink(path.join(publicDir, marker.filename));
    console.error(`Error downloading ${marker.filename}:`, err.message);
  });
}); 