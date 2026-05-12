# Getting Started with Fingerprint SDK

The Fingerprint SDK is a professional, high-entropy device identification tool for both browser and server environments.

## Installation

```bash
npm install @fingerprint-sdk/client
```

## Basic Usage

### Browser
```javascript
import { fingerprint } from '@fingerprint-sdk/client';

async function init() {
  const result = await fingerprint.getFingerprint();
  console.log('Visitor ID:', result.visitorId);
}
```

### React
```jsx
import { FingerprintProvider, useFingerprint } from '@fingerprint-sdk/react';

function App() {
  return (
    <FingerprintProvider config={{ privacy: { mode: 'balanced' } }}>
      <MyComponent />
    </FingerprintProvider>
  );
}
```

## Advanced Configuration

The SDK supports several configuration options:

| Option | Type | Description |
| --- | --- | --- |
| `privacy.mode` | `'strict' \| 'balanced' \| 'minimal'` | Controls which collectors are active. |
| `cache.enabled` | `boolean` | Enables localStorage persistence. |
| `includeIP` | `boolean` | Fetches the public IP address of the client. |
