import { FingerprintSDK, EnhancedFingerprintResult } from '../../src/index';
import { FingerprintValidator } from '../../packages/server/index';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Server-side fingerprint generation from request headers.
 */
export async function getServerFingerprint(request: NextRequest): Promise<Partial<EnhancedFingerprintResult>> {
  const userAgent = request.headers.get('user-agent') || '';
  const acceptLanguage = request.headers.get('accept-language') || '';
  
  const forwarded = request.headers.get('x-forwarded-for');
  const ipAddress = forwarded ? forwarded.split(',')[0] : (request as any).ip;

  const components = {
    userAgent,
    language: acceptLanguage,
    ip: ipAddress,
  };

  const sdk = new FingerprintSDK({ userAgent });
  const result = await sdk.getFingerprint();

  return {
    ...result,
    metadata: {
      ...result.metadata,
      environment: 'node'
    }
  };
}

/**
 * Middleware for automatic fingerprint validation.
 */
export function createFingerprintMiddleware(validator: FingerprintValidator) {
  return async function fingerprintMiddleware(request: NextRequest) {
    const visitorId = request.headers.get('x-fingerprint-id') || request.cookies.get('fingerprint_id')?.value;

    if (!visitorId) {
      return NextResponse.next({
        headers: { 'x-fingerprint-status': 'missing' }
      });
    }

    // Validation requires the full fingerprint object or just the ID depending on server impl
    // For this example, we'll assume the validator can handle basic request data
    const validation = await validator.validate({ 
        visitorId, 
        components: { ua: { value: { ua: request.headers.get('user-agent') } } } 
    });

    if (!validation.isValid) {
      return NextResponse.json({ error: 'Suspicious activity detected' }, { status: 403 });
    }

    const response = NextResponse.next();
    response.headers.set('x-fingerprint-risk', validation.riskScore.toString());
    return response;
  };
}
