# Fingerprint SDK

A professional, lightweight, and isomorphic digital fingerprinting SDK for Node.js and the Browser.

## Features

- 🕵️‍♂️ **Comprehensive Collection**: Browser info, OS, Device, Screen, Timezone, Language.
- 🎨 **Graphic Fingerprinting**: Canvas and WebGL rendering fingerprints.
- 🔡 **Font Detection**: Identifies installed fonts via side-channel measurements.
- 🆔 **Unique Visitor ID**: Deterministic SHA-256 hash based on device characteristics.
- 📦 **Isomorphic**: Works seamlessly in both Frontend (React, Vue, Vanilla) and Backend (Node.js).
- 🛡️ **TypeScript Ready**: Full type safety included.

## Installation

```bash
npm install fingerprint-sdk
```

## Usage

### In the Browser

```javascript
import { fingerprint } from 'fingerprint-sdk';

async function identify() {
  const data = await fingerprint.getFingerprint();
  console.log(data.visitorId); // Unique hash
  console.log(data.ua.browser); // "Chrome 123"
}
```

### In Node.js (Server Side)

When using on the server, you can pass a custom User-Agent (e.g., from request headers).

```javascript
import { FingerprintSDK } from 'fingerprint-sdk';

const sdk = new FingerprintSDK({ userAgent: req.headers['user-agent'] });
const data = await sdk.getFingerprint();
```

## Collected Data Points

- **User Agent**: Parsed browser, OS, engine, and device info.
- **Canvas**: Unique rendering fingerprint via HTML5 Canvas API.
- **WebGL**: Hardware-specific graphics renderer info.
- **Screen**: Resolution and color depth.
- **Localization**: Timezone and language preferences.
- **Fonts**: Detection of system font availability.

## Development

```bash
npm run build   # Build ESM and CJS bundles
npm test        # Run tests
npm run lint    # Type check
```

## License

MIT
