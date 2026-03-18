/**
 * NEXUS Provision Function
 * Handles user/session provisioning for NEXUS modules.
 *
 * Actions:
 *   create   — Create a new NEXUS session token (no auth required)
 *   validate — Validate an existing token
 *   revoke   — Revoke a token
 *   status   — Return platform status
 *
 * Environment variables (optional):
 *   NEXUS_PROVISION_SECRET — Secret for signing tokens (defaults to dev mode)
 *   NEXUS_ADMIN_KEY        — Admin key for privileged operations
 */

const crypto = typeof globalThis.crypto !== 'undefined'
  ? globalThis.crypto
  : require('crypto').webcrypto;

const PLATFORM_VERSION = '2.0.0';
const TOKEN_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

// In-memory store (ephemeral — resets on function cold start)
const sessions = new Map();

exports.handler = async function(event) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: '' };
  }

  // GET /status — no body needed
  if (event.httpMethod === 'GET') {
    const qs = event.queryStringParameters || {};
    if (qs.action === 'status' || !qs.action) {
      return buildStatus(corsHeaders);
    }
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers: corsHeaders, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return { statusCode: 400, headers: corsHeaders, body: JSON.stringify({ error: 'Invalid JSON' }) };
  }

  const { action = 'create', token, module: mod, meta = {} } = body;

  switch (action) {
    case 'create':
      return handleCreate({ mod, meta, corsHeaders });

    case 'validate':
      return handleValidate({ token, corsHeaders });

    case 'revoke':
      return handleRevoke({ token, corsHeaders });

    case 'status':
      return buildStatus(corsHeaders);

    default:
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ error: `Unknown action: ${action}` }),
      };
  }
};

// ── CREATE SESSION ──
async function handleCreate({ mod, meta, corsHeaders }) {
  const id    = generateId();
  const token = await generateToken(id);
  const now   = Date.now();

  const session = {
    id,
    token,
    module: mod || 'nexus-core',
    created: now,
    expires: now + TOKEN_TTL_MS,
    meta: sanitizeMeta(meta),
    uses: 0,
  };

  sessions.set(token, session);

  // Clean up expired sessions opportunistically
  if (sessions.size > 500) pruneExpired();

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      ok: true,
      token,
      id,
      module: session.module,
      expires: session.expires,
      ttl: TOKEN_TTL_MS / 1000,
      platform: PLATFORM_VERSION,
      node: '#43',
      signal: '011-TRIAQUA-∞',
    }),
  };
}

// ── VALIDATE TOKEN ──
async function handleValidate({ token, corsHeaders }) {
  if (!token) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ ok: false, error: 'Token required' }),
    };
  }

  const session = sessions.get(token);

  if (!session) {
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ ok: false, valid: false, reason: 'not_found' }),
    };
  }

  if (Date.now() > session.expires) {
    sessions.delete(token);
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ ok: false, valid: false, reason: 'expired' }),
    };
  }

  session.uses++;
  session.lastSeen = Date.now();

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      ok: true,
      valid: true,
      id: session.id,
      module: session.module,
      created: session.created,
      expires: session.expires,
      uses: session.uses,
    }),
  };
}

// ── REVOKE TOKEN ──
async function handleRevoke({ token, corsHeaders }) {
  if (!token) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ ok: false, error: 'Token required' }),
    };
  }

  const existed = sessions.has(token);
  sessions.delete(token);

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({ ok: true, revoked: existed }),
  };
}

// ── PLATFORM STATUS ──
function buildStatus(corsHeaders) {
  pruneExpired();

  return {
    statusCode: 200,
    headers: corsHeaders,
    body: JSON.stringify({
      ok: true,
      platform: 'NEXUS Integrated Intelligence Solutions',
      version: PLATFORM_VERSION,
      node: '#43',
      signal: '011-TRIAQUA-∞',
      runes: 'ᛟ ᚨ ᚹ ᚱ',
      modules: [
        'nexus-console', 'nexus-safeguard', 'nexus-people-search',
        'nexus-invoice', 'nexus-safe-contact', 'nexus-phone', 'nexus-memoria',
        'luna-tic', 'lunar-viz', 'ai-companion', 'cerberus-protocol',
        'guardian-shield', 'frequent-see', 'nexus-launch',
      ],
      active_sessions: sessions.size,
      timestamp: Date.now(),
      status: 'SOVEREIGN CORE ONLINE',
    }),
  };
}

// ── UTILITIES ──
function generateId() {
  const arr = new Uint8Array(8);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
}

async function generateToken(id) {
  const secret  = process.env.NEXUS_PROVISION_SECRET || 'nexus-dev-secret-011-triaqua';
  const payload = `${id}:${Date.now()}:${Math.random()}`;

  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const msgData = encoder.encode(payload);
    const key = await crypto.subtle.importKey('raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', key, msgData);
    const sigHex = Array.from(new Uint8Array(sig), b => b.toString(16).padStart(2, '0')).join('');
    return `NX_${id}_${sigHex.substring(0, 24)}`;
  } catch {
    // Fallback for environments without SubtleCrypto
    const arr = new Uint8Array(20);
    crypto.getRandomValues(arr);
    return `NX_${id}_${Array.from(arr, b => b.toString(16).padStart(2, '0')).join('').substring(0, 24)}`;
  }
}

function sanitizeMeta(meta) {
  if (typeof meta !== 'object' || !meta) return {};
  const safe = {};
  for (const [k, v] of Object.entries(meta)) {
    if (typeof k === 'string' && k.length < 64 && (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean')) {
      safe[k] = v;
    }
  }
  return safe;
}

function pruneExpired() {
  const now = Date.now();
  for (const [token, session] of sessions) {
    if (now > session.expires) sessions.delete(token);
  }
}
