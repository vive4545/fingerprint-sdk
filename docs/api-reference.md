# API Reference

## FingerprintSDK

### `constructor(options?: FingerprintOptions)`
Initializes the SDK with optional configuration.

### `getFingerprint(): Promise<EnhancedFingerprintResult>`
Runs all collectors and returns the enhanced fingerprint result.

## EnhancedFingerprintResult

- `visitorId`: `string` - The unique SHA-256 identifier.
- `confidence`: `number` - Reliability score (0-100).
- `entropy`: `number` - Estimated bits of entropy.
- `botDetection`: `BotDetectionResult` - Results of automation checks.
- `security`: `SecurityResult` - Results of integrity and tampering checks.
- `telemetry`: `SDKTelemetry` - Performance metrics for each collector.

## FingerprintValidator (Server-side)

### `validate(fingerprint: any): Promise<ValidationResult>`
Calculates a server-side risk score and identifies anomalies.
