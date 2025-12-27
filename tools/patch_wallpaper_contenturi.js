const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'services', 'wallpaperService.js');
let s = fs.readFileSync(filePath, 'utf8');

// Replace the block that derives contentUri (between "Android NOTE" and "FINAL CHECK")
const pat = /(\r?\n\s*)\/\/ Android NOTE:[\s\S]*?(?=\r?\n\s*\/\/ FINAL CHECK: MUST be content:\/\/ or FAIL)/m;

const indentMatch = s.match(pat);
if (!indentMatch) {
  console.error('patch failed: could not find Android NOTE -> FINAL CHECK block');
  process.exit(1);
}

const indent = indentMatch[1] || '\n    ';

const replacementBlock =
  `${indent}// Android NOTE:\r\n` +
  `${indent}// On many devices, MediaLibrary returns file:// paths (NOT content://).\r\n` +
  `${indent}// For wallpaper setting we only need a readable content:// URI. The most reliable order is:\r\n` +
  `${indent}// 1) expo-file-system getContentUriAsync(fileUri)  -> content://<your.app>.fileprovider/...\r\n` +
  `${indent}// 2) expo-media-library getContentUriAsync(assetId) -> content://media/...\r\n` +
  `${indent}let contentUri = null;\r\n\r\n` +
  `${indent}// (1) Prefer FileSystem.getContentUriAsync for the downloaded file\r\n` +
  `${indent}try {\r\n` +
  `${indent}  if (Platform.OS === 'android' && FileSystem && typeof FileSystem.getContentUriAsync === 'function') {\r\n` +
  `${indent}    contentUri = await FileSystem.getContentUriAsync(downloadResult.uri);\r\n` +
  `${indent}  }\r\n` +
  `${indent}} catch (e) {\r\n` +
  `${indent}  console.warn('FileSystem.getContentUriAsync failed:', e?.message);\r\n` +
  `${indent}}\r\n\r\n` +
  `${indent}// (2) Try MediaLibrary.getContentUriAsync (if available)\r\n` +
  `${indent}if (!contentUri) {\r\n` +
  `${indent}  try {\r\n` +
  `${indent}    if (Platform.OS === 'android' && typeof MediaLibrary.getContentUriAsync === 'function') {\r\n` +
  `${indent}      contentUri = await MediaLibrary.getContentUriAsync(asset.id);\r\n` +
  `${indent}    }\r\n` +
  `${indent}  } catch (e) {\r\n` +
  `${indent}    console.warn('MediaLibrary.getContentUriAsync failed:', e?.message);\r\n` +
  `${indent}  }\r\n` +
  `${indent}}\r\n\r\n` +
  `${indent}// (3) Fallback: asset info / asset uri (may be file:// on some devices)\r\n` +
  `${indent}if (!contentUri) {\r\n` +
  `${indent}  const assetInfo = await MediaLibrary.getAssetInfoAsync(asset.id);\r\n` +
  `${indent}  contentUri = assetInfo?.localUri || assetInfo?.uri || asset?.uri || null;\r\n` +
  `${indent}}\r\n`;

s = s.replace(pat, replacementBlock);

// Fix mis-encoded checkmark log if present
s = s.replace("console.log('âœ… Got content:// URI:',", "console.log('✅ Got content:// URI:',");

fs.writeFileSync(filePath, s, 'utf8');
console.log('patched:', filePath);


