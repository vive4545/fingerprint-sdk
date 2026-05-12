/**
 * Browser-specific fingerprinting collectors.
 */

export const isBrowser = typeof window !== 'undefined';

export function getCanvasFingerprint(): string {
  if (!isBrowser) return '';
  try {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return '';
    
    // Add some complexity to the canvas drawing
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = '#f60';
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = '#069';
    ctx.fillText('Hello World, how are you?', 2, 15);
    ctx.fillStyle = 'rgba(102, 204, 0, 0.7)';
    ctx.fillText('Hello World, how are you?', 4, 17);
    
    return canvas.toDataURL();
  } catch (e) {
    return '';
  }
}

export function getWebGLFingerprint(): string {
  if (!isBrowser) return '';
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl || !(gl instanceof WebGLRenderingContext)) return '';
    
    const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if (!debugInfo) return '';
    
    const vendor = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
    const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    
    return `${vendor}:::${renderer}`;
  } catch (e) {
    return '';
  }
}

export function getFonts(): string[] {
  if (!isBrowser) return [];
  // A simple font detection list
  const fontList = [
    'Arial', 'Verdana', 'Times New Roman', 'Courier New', 'Georgia', 'Comic Sans MS',
    'Trebuchet MS', 'Arial Black', 'Impact', 'Roboto', 'Open Sans', 'Helvetica'
  ];
  
  const detectedFonts: string[] = [];
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) return [];

  const baseFont = 'monospace';
  ctx.font = `72px ${baseFont}`;
  const baselineWidth = ctx.measureText('mmmmmmmmmmlli').width;

  fontList.forEach(font => {
    ctx.font = `72px ${font}, ${baseFont}`;
    const newWidth = ctx.measureText('mmmmmmmmmmlli').width;
    if (newWidth !== baselineWidth) {
      detectedFonts.push(font);
    }
  });

  return detectedFonts;
}

export function getScreenResolution(): string {
  if (!isBrowser) return '';
  return `${window.screen.width}x${window.screen.height}x${window.screen.colorDepth}`;
}

export function getTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {
    return '';
  }
}

export function getLanguage(): string {
  if (!isBrowser) return '';
  return navigator.language || (navigator as any).userLanguage || '';
}

export async function getIP(): Promise<string> {
  if (!isBrowser) return '';
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    return data.ip || '';
  } catch (e) {
    return '';
  }
}

