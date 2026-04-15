# Wallet & Signing Logic – cosmos-protowriter

This document contains **all wallet connection and transaction signing logic** used in Atom Registry (Keplr, Leap, Cosmostation, and Ledger).

It is extracted from the working `ledger.html` implementation.

## 1. Configuration & State

```js
var CFG = {
  CHAIN_ID: 'cosmoshub-4',
  DENOM: 'uatom',
  // ... other config
};

var userAddress = null;
var pubKey = null;
var walletType = null;           // "keplr" | "leap" | "cosmostation" | "ledger"
var walletPrefersAmino = false;  // true for Ledger-backed Keplr accounts
var ledgerApp = null;
var ledgerTransport = null;
```

## 2. AuthInfo Helpers (Critical for Ledger)

```js
// Used only for gas simulation
function authInfoDirect(pk, seq, fee, gas) { ... }

// Used for Ledger signing
function authInfoAmino(pk, seq, fee, gas) { ... }

// Internal helpers
function signerInfoDirect(pk, seq) { ... }   // SIGN_MODE_DIRECT = 1
function signerInfoAmino(pk, seq) { ... }    // SIGN_MODE_LEGACY_AMINO_JSON = 127
```

## 3. Core Signing Function – `walletSign()`

```js
async function walletSign(bodyBytes, authBytesDirect, authBytesAmino, acct, executeMsg, fundsUatom, contractAddr, feeAmount, gasLimit) {

  if (walletType === 'ledger') {
    // ── LEDGER PATH ──
    console.log('[Ledger] Forcing Amino JSON signing path');

    const signDoc = buildAminoSignDoc(acct, executeMsg, fundsUatom, contractAddr, feeAmount, gasLimit);
    const res = await ledgerApp.sign([44, 118, 0, 0, 0], JSON.stringify(signDoc));

    const signature = derToCompact(res.signature);
    return txRaw(bodyBytes, authBytesAmino, signature);   // ← Use Amino authInfo
  }

  // ── SOFTWARE WALLETS ──
  if (walletType === 'keplr' || walletType === 'leap') {
    const w = walletType === 'keplr' ? window.keplr : window.leap;

    // Auto-fallback for Ledger-backed Keplr accounts
    if (walletType === 'keplr' && walletPrefersAmino && typeof w.signAmino === 'function') {
      const aminoResp = await w.signAmino(CFG.CHAIN_ID, userAddress, buildAminoSignDoc(...));
      return txRaw(bodyBytes, authBytesAmino, unb64(aminoResp.signature.signature));
    }

    // Normal Direct path
    const resp = await w.signDirect(CFG.CHAIN_ID, userAddress, {
      bodyBytes, authInfoBytes: authBytesDirect, ...
    });
    return txRaw(resp.signed.bodyBytes, resp.signed.authInfoBytes, unb64(resp.signature.signature));
  }

  if (walletType === 'cosmostation') {
    // ... existing cosmostation direct signing code ...
  }

  throw new Error('No wallet connected');
}
```

## 4. Transaction Building Flow (`signAndBroadcast`)

```js
async function signAndBroadcast(...) {
  // 1. Build message body (same for all wallets)
  const msgBytes = encodeMsgExecute(...);
  const bodyBytes = txBody(msgBytes);

  // 2. Simulate gas using Direct mode (required by /simulate endpoint)
  const authDirect = authInfoDirect(pubKey, seq, phFee, ph);
  const gasLimit = await simulateGas(bodyBytes, authDirect);

  // 3. Build final authInfo for both modes
  const finalDirect = authInfoDirect(...);
  const finalAmino  = authInfoAmino(...);

  // 4. Sign with correct mode
  const rawBytes = await walletSign(bodyBytes, finalDirect, finalAmino, ...);

  // 5. Broadcast
  return broadcast(rawBytes);
}
```

## 5. Ledger Connection & Helpers

```js
async function reconnectLedgerDevice() { ... }

function buildAminoSignDoc(...) { ... }   // deterministic Amino JSON

function derToCompact(der) { ... }        // converts DER → 64-byte compact signature
```

## 6. Wallet Connection (`connectWallet`)

- Keplr / Leap → `enable()` + `getKey()`
- Cosmostation → two paths (provider or cosmos.request)
- Ledger → `reconnectLedgerDevice()` (uses `@ledgerhq` via esm.sh)

## Summary of Modes

| Wallet          | Signing Mode Used          | AuthInfo Used     |
|-----------------|----------------------------|-------------------|
| Keplr (software)| Direct (fallback Amino)    | Direct / Amino    |
| Leap            | Direct                     | Direct            |
| Cosmostation    | Direct                     | Direct            |
| Ledger          | Amino JSON                 | Amino             |

This architecture ensures:
- Gas simulation always works
- Ledger never sees Direct mode
- Keplr with hardware fallback works automatically

**File:** `sample.html` contains the complete working reference implementation.

---
