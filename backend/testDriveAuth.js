require('dotenv').config();
const path = require('path');
const fs = require('fs');
const {
  resolveGoogleCredentials,
  getDriveClient,
  resetDriveClient,
  listAudioFilesFromDrive,
  listCoverImagesFromDrive,
  getFileMetadata,
  getFileStream,
} = require('./services/googleDriveService');

async function runTestSuite() {
  console.log('====================================================');
  console.log('🧪 Starting Google Drive Credentials & Auth Test Suite');
  console.log('====================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  // --- Test 1: Priority Resolution with GOOGLE_APPLICATION_CREDENTIALS ---
  console.log('--- Test 1: Priority 1 (GOOGLE_APPLICATION_CREDENTIALS) ---');
  const localKeyPath = path.resolve(__dirname, 'google-service-account.json');
  const originalGac = process.env.GOOGLE_APPLICATION_CREDENTIALS;
  const originalKeyFile = process.env.GOOGLE_KEY_FILE;

  try {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = localKeyPath;
    const resolved1 = resolveGoogleCredentials();
    assert(
      resolved1 !== null && resolved1.type === 'file' && resolved1.filePath === localKeyPath,
      'resolveGoogleCredentials() picks GOOGLE_APPLICATION_CREDENTIALS when valid'
    );
    assert(
      resolved1 && resolved1.source.includes('GOOGLE_APPLICATION_CREDENTIALS'),
      'resolveGoogleCredentials() correctly attributes source to GOOGLE_APPLICATION_CREDENTIALS'
    );
  } finally {
    if (originalGac !== undefined) {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = originalGac;
    } else {
      delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    }
  }

  // --- Test 2: Fallback when GOOGLE_APPLICATION_CREDENTIALS points to missing file ---
  console.log('\n--- Test 2: Invalid GOOGLE_APPLICATION_CREDENTIALS Fallback ---');
  try {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = '/non/existent/path/creds.json';
    process.env.GOOGLE_KEY_FILE = 'google-service-account.json';
    const resolved2 = resolveGoogleCredentials();
    assert(
      resolved2 !== null && resolved2.filePath.includes('google-service-account.json'),
      'resolveGoogleCredentials() safely skips missing GOOGLE_APPLICATION_CREDENTIALS and falls back'
    );
  } finally {
    if (originalGac !== undefined) {
      process.env.GOOGLE_APPLICATION_CREDENTIALS = originalGac;
    } else {
      delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    }
    if (originalKeyFile !== undefined) {
      process.env.GOOGLE_KEY_FILE = originalKeyFile;
    } else {
      delete process.env.GOOGLE_KEY_FILE;
    }
  }

  // --- Test 3: Local Dev Resolution with GOOGLE_KEY_FILE ---
  console.log('\n--- Test 3: GOOGLE_KEY_FILE Resolution ---');
  try {
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    process.env.GOOGLE_KEY_FILE = 'google-service-account.json';
    const resolved3 = resolveGoogleCredentials();
    assert(
      resolved3 !== null && resolved3.filePath.endsWith('google-service-account.json'),
      'resolveGoogleCredentials() finds local key file via GOOGLE_KEY_FILE'
    );
    assert(
      resolved3 && !resolved3.credentials,
      'Resolved object does not expose raw credentials object for file type'
    );
    assert(
      resolved3 && resolved3.clientEmail && typeof resolved3.clientEmail === 'string',
      'Resolved object extracts safe clientEmail identifier'
    );
  } finally {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = originalGac;
    process.env.GOOGLE_KEY_FILE = originalKeyFile;
  }

  // --- Test 4: Default Local Discovery without explicit env vars ---
  console.log('\n--- Test 4: Dynamic Discovery Fallback ---');
  try {
    delete process.env.GOOGLE_APPLICATION_CREDENTIALS;
    delete process.env.GOOGLE_KEY_FILE;
    const resolved4 = resolveGoogleCredentials();
    assert(
      resolved4 !== null && fs.existsSync(resolved4.filePath),
      'resolveGoogleCredentials() discovers local service account JSON dynamically'
    );
  } finally {
    process.env.GOOGLE_APPLICATION_CREDENTIALS = originalGac;
    process.env.GOOGLE_KEY_FILE = originalKeyFile;
  }

  // --- Test 5: Real Google Drive Client Initialization ---
  console.log('\n--- Test 5: Google Drive Client Initialization ---');
  resetDriveClient();
  const driveClient = getDriveClient();
  assert(driveClient !== null && typeof driveClient.files === 'object', 'getDriveClient() successfully returns authenticated Drive client');

  // --- Test 6: Verify Service Account Access to Audio Files ---
  console.log('\n--- Test 6: Verify Access to Google Drive Audio Files ---');
  const audioFiles = await listAudioFilesFromDrive();
  assert(
    Array.isArray(audioFiles) && audioFiles.length > 0,
    `Service account has permission to list audio tracks (Found: ${audioFiles.length} tracks)`
  );

  // --- Test 7: Verify Service Account Access to Cover Images ---
  console.log('\n--- Test 7: Verify Access to Google Drive Cover Images ---');
  const coverFiles = await listCoverImagesFromDrive();
  assert(
    Array.isArray(coverFiles) && coverFiles.length > 0,
    `Service account has permission to list cover images (Found: ${coverFiles.length} images)`
  );

  // --- Test 8: Verify File Metadata Retrieval ---
  console.log('\n--- Test 8: Verify getFileMetadata ---');
  if (audioFiles.length > 0) {
    const testFile = audioFiles[0];
    const metadata = await getFileMetadata(testFile.id);
    assert(
      metadata && metadata.id === testFile.id && metadata.name === testFile.name,
      `getFileMetadata() successfully retrieved metadata for track "${testFile.name}"`
    );
  }

  // --- Test 9: Verify Audio Streaming (HTTP Range Partial Content) ---
  console.log('\n--- Test 9: Verify Audio Stream Support ---');
  if (audioFiles.length > 0) {
    const testFile = audioFiles[0];
    try {
      const streamRes = await getFileStream(testFile.id, { range: 'bytes=0-1024' });
      const streamSuccess = Boolean(streamRes && streamRes.data && typeof streamRes.data.pipe === 'function');
      assert(
        streamSuccess,
        `getFileStream() successfully opened streaming pipeline for "${testFile.name}"`
      );
    } catch (err) {
      assert(false, `getFileStream() failed: ${err.message}`);
    }
  }

  // --- Test Summary ---
  console.log('\n====================================================');
  console.log(`📊 Test Summary: ${passed} Passed, ${failed} Failed`);
  console.log('====================================================');

  if (failed > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal Test Error:', err);
  process.exit(1);
});
