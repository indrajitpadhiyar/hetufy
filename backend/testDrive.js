const { drive } = require('./services/googleDriveService');

async function testCovers() {
  try {
    const res = await drive.files.list({
      pageSize: 1000,
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      fields: 'files(id, name, mimeType, size, parents)'
    });

    const items = res.data.files || [];
    const audioFiles = items.filter(f => !f.mimeType.includes('folder') && (f.mimeType.includes('audio') || f.name.match(/\.(mp3|wav|m4a|flac|ogg)$/i)));
    const imageFiles = items.filter(f => !f.mimeType.includes('folder') && (f.mimeType.includes('image') || f.name.match(/\.(jpg|jpeg|png|webp|svg)$/i)));

    console.log('--- AUDIO FILES ---');
    console.log(JSON.stringify(audioFiles, null, 2));

    console.log('--- IMAGE COVER FILES ---');
    console.log(JSON.stringify(imageFiles, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testCovers();
