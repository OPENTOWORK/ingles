import { createServer as createHttpsServer } from 'https';
import { request as httpRequest } from 'http';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { execFileSync, spawnSync } from 'child_process';
import { networkInterfaces } from 'os';
import { randomBytes } from 'crypto';
import path from 'path';

const ROOT = process.cwd();
const DIR = path.join(ROOT, 'local/speaking-b2-lan');
const KEY_PATH = path.join(DIR, 'access.key');
const CERT_PATH = path.join(DIR, 'lan.crt');
const CERT_KEY_PATH = path.join(DIR, 'lan.key');
const CONFIG_PATH = path.join(DIR, 'config.json');
const TARGET_PORT = Number(process.env.SPEAKING_B2_LAN_TARGET_PORT || 3000);
const LISTEN_PORT = Number(process.env.SPEAKING_B2_LAN_HTTPS_PORT || 3443);

function privateIpv4() {
  const nets = networkInterfaces();
  const found = [];
  for (const list of Object.values(nets)) {
    for (const item of list || []) {
      if (item.family !== 'IPv4' && item.family !== 4) continue;
      if (item.internal) continue;
      if (
        item.address.startsWith('192.168.') ||
        item.address.startsWith('10.') ||
        /^172\.(1[6-9]|2\d|3[0-1])\./.test(item.address)
      ) {
        found.push(item.address);
      }
    }
  }
  return found[0] || '';
}

function ensureDir() {
  mkdirSync(DIR, { recursive: true });
}

function ensureKey() {
  if (existsSync(KEY_PATH)) return readFileSync(KEY_PATH, 'utf8').trim();
  const key = randomBytes(24).toString('base64url');
  writeFileSync(KEY_PATH, `${key}\n`, { encoding: 'utf8' });
  return key;
}

function opensslBin() {
  const git = 'C:\\Program Files\\Git\\usr\\bin\\openssl.exe';
  if (existsSync(git)) return git;
  return 'openssl';
}

function ensureCert(host) {
  if (existsSync(CERT_PATH) && existsSync(CERT_KEY_PATH)) {
    return { cert: readFileSync(CERT_PATH), key: readFileSync(CERT_KEY_PATH) };
  }
  const mkcert = spawnSync('mkcert', ['-install'], { encoding: 'utf8' });
  if (mkcert.status === 0) {
    spawnSync('mkcert', ['-cert-file', CERT_PATH, '-key-file', CERT_KEY_PATH, host, 'localhost'], {
      encoding: 'utf8',
    });
  }
  if (!existsSync(CERT_PATH) || !existsSync(CERT_KEY_PATH)) {
    execFileSync(opensslBin(), [
      'req',
      '-x509',
      '-newkey',
      'rsa:2048',
      '-nodes',
      '-keyout',
      CERT_KEY_PATH,
      '-out',
      CERT_PATH,
      '-days',
      '7',
      '-subj',
      `/CN=${host}`,
      '-addext',
      `subjectAltName=IP:${host},DNS:localhost`,
    ]);
  }
  return { cert: readFileSync(CERT_PATH), key: readFileSync(CERT_KEY_PATH) };
}

function writeConfig(host, keyPresent) {
  writeFileSync(
    CONFIG_PATH,
    JSON.stringify(
      {
        host,
        port: LISTEN_PORT,
        target: `http://127.0.0.1:${TARGET_PORT}`,
        keyPresent,
        createdAt: new Date().toISOString(),
      },
      null,
      2,
    ),
  );
}

const host = process.env.SPEAKING_B2_LAN_HOST || privateIpv4();
if (!host) {
  console.error('No private IPv4 address found. Connect the PC to Wi-Fi.');
  process.exit(1);
}

ensureDir();
const accessKey = ensureKey();
const tls = ensureCert(host);
writeConfig(host, Boolean(accessKey));

const origin = `https://${host}:${LISTEN_PORT}`;
const speakingPath = '/exam-practice/b2/exam-speaking/';
const unlockUrl = `${origin}${speakingPath}?lan=${accessKey}`;
const COOKIE = 'dralo_speaking_lan';

function cookieValue(req, name) {
  const raw = String(req.headers.cookie || '');
  const match = raw.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : '';
}

function requestUrl(req) {
  return new URL(req.url || '/', origin);
}

const server = createHttpsServer({ key: tls.key, cert: tls.cert }, (req, res) => {
  const url = requestUrl(req);
  const offered = url.searchParams.get('lan');
  const hasCookie = cookieValue(req, COOKIE) === accessKey;
  if (offered && offered === accessKey) {
    url.searchParams.delete('lan');
    res.writeHead(302, {
      Location: `${url.pathname}${url.search}`,
      'Set-Cookie': `${COOKIE}=${accessKey}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=28800`,
    });
    res.end();
    return;
  }
  if (!hasCookie) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  const headers = { ...req.headers };
  headers.host = `${host}:${LISTEN_PORT}`;
  headers['x-forwarded-proto'] = 'https';
  headers['x-forwarded-host'] = `${host}:${LISTEN_PORT}`;
  const proxy = httpRequest(
    {
      hostname: '127.0.0.1',
      port: TARGET_PORT,
      path: req.url,
      method: req.method,
      headers,
    },
    (upstream) => {
      res.writeHead(upstream.statusCode || 502, upstream.headers);
      upstream.pipe(res);
    },
  );
  proxy.on('error', () => {
    if (!res.headersSent) res.writeHead(502);
    res.end('Upstream Next.js is not running on port 3000.');
  });
  req.pipe(proxy);
});

server.listen(LISTEN_PORT, '0.0.0.0', () => {
  console.log(
    JSON.stringify(
      {
        ok: true,
        bind: `0.0.0.0:${LISTEN_PORT}`,
        lanHost: host,
        origin,
        speakingUnlockUrl: unlockUrl,
        notes: [
          'LAN only. Do not share the lan key.',
          'Phone and PC must be on the same Wi-Fi.',
          'Accept the certificate warning or install local/speaking-b2-lan/lan.crt.',
          'Do not press Start the interview until authorized.',
        ],
      },
      null,
      2,
    ),
  );
});
