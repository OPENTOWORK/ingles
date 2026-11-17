/**
 * Verificación de transacciones de StoreKit 2 (solo servidor).
 * La transacción firmada trae la cadena de certificados de Apple. Se acepta
 * solo si la firma encadena hasta Apple Root CA G3 y el bundle es el de Dralo.
 */
import { createVerify, X509Certificate } from 'crypto';
import { STORE_PACKAGE_NAME } from './products.js';

/** Apple Root CA - G3. Certificado público de Apple, no es un secreto. */
const APPLE_ROOT_PEM = `-----BEGIN CERTIFICATE-----
MIICQzCCAcmgAwIBAgIILcX8iNLFS5UwCgYIKoZIzj0EAwMwZzEbMBkGA1UEAwwS
QXBwbGUgUm9vdCBDQSAtIEczMSYwJAYDVQQLDB1BcHBsZSBDZXJ0aWZpY2F0aW9u
IEF1dGhvcml0eTETMBEGA1UECgwKQXBwbGUgSW5jLjELMAkGA1UEBhMCVVMwHhcN
MTQwNDMwMTgxOTA2WhcNMzkwNDMwMTgxOTA2WjBnMRswGQYDVQQDDBJBcHBsZSBS
b290IENBIC0gRzMxJjAkBgNVBAsMHUFwcGxlIENlcnRpZmljYXRpb24gQXV0aG9y
aXR5MRMwEQYDVQQKDApBcHBsZSBJbmMuMQswCQYDVQQGEwJVUzB2MBAGByqGSM49
AgEGBSuBBAAiA2IABJjpLz1AcqTtkyJygRMc3RCV8cWjTnHcFBbZDuWmBSp3ZHtf
TjjTuxxEtX/1H7YyYl3J6YRbTzBPEVoA/VhYDKX1DyxNB0cTddqXl5dvMVztK517
IDvYuVTZXpmkOlEKMaNCMEAwHQYDVR0OBBYEFLuw3qFYM4iapIqZ3r6966/ayySr
MA8GA1UdEwEB/wQFMAMBAf8wDgYDVR0PAQH/BAQDAgEGMAoGCCqGSM49BAMDA2gA
MGUCMQCD6cHEFl4aXTQY2e3v9GwOAEZLuN+yRhHFD/3meoyhpmvOwgPUnPWTxnS4
at+qIxUCMG1mihDK1A3UT82NQz60imOlM27jbdoXt2QfyFMm+YhidDkLF1vLUagM
6BgD56KyKA==
-----END CERTIFICATE-----`;

const appleRoot = new X509Certificate(APPLE_ROOT_PEM);

function certFromX5c(value) {
  const der = Buffer.from(value, 'base64');
  return new X509Certificate(der);
}

/** ES256 firma en crudo (R||S). Node verifica ECDSA en formato DER. */
function rawEcSignatureToDer(raw) {
  if (raw.length !== 64) {
    throw new Error('La firma de Apple no tiene el formato esperado.');
  }
  function part(buf) {
    let start = 0;
    while (start < buf.length - 1 && buf[start] === 0) start += 1;
    let body = buf.subarray(start);
    if (body[0] & 0x80) body = Buffer.concat([Buffer.from([0x00]), body]);
    return Buffer.concat([Buffer.from([0x02, body.length]), body]);
  }
  const body = Buffer.concat([part(raw.subarray(0, 32)), part(raw.subarray(32))]);
  return Buffer.concat([Buffer.from([0x30, body.length]), body]);
}

export function entitlementFromAppleTransaction(payload) {
  const expiresMs = Number(payload?.expiresDate);
  const revoked = payload?.revocationDate != null;
  const stillInPeriod = Number.isFinite(expiresMs) && expiresMs > Date.now();
  const active = !revoked && stillInPeriod;
  const transactionId = payload?.originalTransactionId || payload?.transactionId || null;
  return {
    active,
    status: active ? 'active' : 'canceled',
    cancelAtPeriodEnd: false,
    productId: payload?.productId || null,
    expiresAt: Number.isFinite(expiresMs) ? new Date(expiresMs).toISOString() : null,
    transactionId: transactionId == null ? null : String(transactionId),
  };
}

/** @returns {Record<string, unknown>} payload verificado de la transacción */
export function verifyAppleSignedTransaction(signedTransaction) {
  const parts = String(signedTransaction || '').split('.');
  if (parts.length !== 3) {
    const error = new Error('Apple no devolvió una transacción válida.');
    error.status = 400;
    throw error;
  }

  let header;
  try {
    header = JSON.parse(Buffer.from(parts[0], 'base64url').toString('utf8'));
  } catch {
    const error = new Error('Apple no devolvió una transacción válida.');
    error.status = 400;
    throw error;
  }

  const chain = Array.isArray(header.x5c) ? header.x5c.map(certFromX5c) : [];
  if (!chain.length) {
    const error = new Error('La compra no está firmada por Apple.');
    error.status = 402;
    throw error;
  }

  const signed = Buffer.from(`${parts[0]}.${parts[1]}`);
  const signature = rawEcSignatureToDer(Buffer.from(parts[2], 'base64url'));
  const verifier = createVerify('SHA256');
  verifier.update(signed);
  if (!verifier.verify(chain[0].publicKey, signature)) {
    const error = new Error('La firma de la compra de Apple no es válida.');
    error.status = 402;
    throw error;
  }

  for (let i = 0; i < chain.length - 1; i += 1) {
    if (!chain[i].verify(chain[i + 1].publicKey)) {
      const error = new Error('La cadena de certificados de Apple no es válida.');
      error.status = 402;
      throw error;
    }
  }
  if (!chain[chain.length - 1].verify(appleRoot.publicKey)) {
    const error = new Error('La compra no está firmada por Apple.');
    error.status = 402;
    throw error;
  }

  let payload;
  try {
    payload = JSON.parse(Buffer.from(parts[1], 'base64url').toString('utf8'));
  } catch {
    const error = new Error('Apple no devolvió una transacción válida.');
    error.status = 400;
    throw error;
  }

  if (payload.bundleId !== STORE_PACKAGE_NAME) {
    const error = new Error('La compra no corresponde a Dralo Academy.');
    error.status = 402;
    throw error;
  }
  return payload;
}
