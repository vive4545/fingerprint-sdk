import { UAParser } from 'ua-parser-js';

export interface UAData {
  browser: string;
  os: string;
  device: string;
  engine: string;
  ua: string;
}

export function parseUA(uaString: string): UAData {
  const parser = new UAParser(uaString);
  const result = parser.getResult();
  
  return {
    browser: `${result.browser.name || 'Unknown'} ${result.browser.version || ''}`.trim(),
    os: `${result.os.name || 'Unknown'} ${result.os.version || ''}`.trim(),
    device: `${result.device.vendor || ''} ${result.device.model || ''} (${result.device.type || 'desktop'})`.trim(),
    engine: `${result.engine.name || ''} ${result.engine.version || ''}`.trim(),
    ua: uaString,
  };
}
