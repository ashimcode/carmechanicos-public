// Minimal static server for the browser-first CarMechanicOS prototype.
// Cloudflare Tunnel routes carmechanicos.com to port 5501.
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = Number(process.env.CARMECHANICOS_PORT || 5501);
const MIME = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.mp4': 'video/mp4'
};

const SECURITY_HEADERS = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'no-referrer',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    // Report-only keeps the current inline event handlers working while making
    // future CSP violations visible during the migration to nonce-based JS.
    'Content-Security-Policy-Report-Only': [
        "default-src 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
        "script-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'",
        "style-src 'self' https://fonts.googleapis.com 'unsafe-inline'",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data: blob:",
        "connect-src 'self' https://*.supabase.co",
        "form-action 'self'"
    ].join('; ')
};

const PROTECTED_SEGMENTS = new Set([
    '.git',
    '.github',
    '.vscode',
    'backend-config.js',
    '.env',
    'cloudflared.log'
]);

function send(response, statusCode, body, extraHeaders = {}) {
    response.writeHead(statusCode, { ...SECURITY_HEADERS, ...extraHeaders });
    response.end(body);
}

function isProtectedPath(relativePath) {
    const segments = relativePath.replace(/\\/g, '/').split('/').filter(Boolean);
    return segments.some(segment => {
        const lower = segment.toLowerCase();
        return PROTECTED_SEGMENTS.has(lower) ||
            lower.startsWith('.env.') ||
            lower.endsWith('.sqlite') ||
            lower.endsWith('.sqlite3') ||
            lower.endsWith('.db') ||
            lower.endsWith('.key') ||
            lower.endsWith('.pem') ||
            lower.endsWith('.p12') ||
            lower.endsWith('.pfx');
    });
}

const server = http.createServer((request, response) => {
    if (!['GET', 'HEAD'].includes(request.method)) {
        send(response, 405, 'Method Not Allowed', { Allow: 'GET, HEAD' });
        return;
    }

    let requestedPath;
    try {
        requestedPath = decodeURIComponent((request.url || '/').split('?')[0]);
    } catch {
        send(response, 400, 'Bad Request');
        return;
    }

    const relativePath = requestedPath === '/' ? 'index.html' : requestedPath.replace(/^[/\\]+/, '');

    if (isProtectedPath(relativePath)) {
        // Return 404 rather than confirming that a sensitive path exists.
        send(response, 404, 'Not found');
        return;
    }

    const filePath = path.resolve(ROOT, relativePath);

    if (filePath !== ROOT && !filePath.startsWith(`${ROOT}${path.sep}`)) {
        send(response, 403, 'Forbidden');
        return;
    }

    fs.stat(filePath, (statError, stats) => {
        if (statError || !stats.isFile()) {
            send(response, 404, 'Not found');
            return;
        }

        response.writeHead(200, {
            ...SECURITY_HEADERS,
            'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
            'Cache-Control': 'no-cache'
        });
        if (request.method === 'GET') fs.createReadStream(filePath).pipe(response);
        else response.end();
    });
});

server.listen(PORT, '127.0.0.1', () => {
    console.log(`CarMechanicOS local server running at http://127.0.0.1:${PORT}`);
});
