# cosmos-protowriter

A tiny, zero-dependency Protobuf encoder for Cosmos transactions.

**Used in production** by [Atom Registry](https://atomregistry.com) with **200+ flawless mainnet transactions** on `cosmoshub-4`.

Designed for developers who want **maximum control** and **minimum attack surface** — no `@cosmjs`, no heavy dependencies, no supply-chain risk.

### Features

- Zero external dependencies
- Extremely small footprint (~100 lines core)
- Full control over every encoded byte
- Reliable Ledger support via Amino JSON path (most stable on hardware)
- Byte-for-byte compatible with `@cosmjs` (see `tests/`)
- Works with Keplr, Leap, Cosmostation, and Ledger

### Installation

**Copy the single file:**

```bash
curl -O https://raw.githubusercontent.com/atomregistry/cosmos-protowriter/main/src/protowriter.js
```

**Or clone the repo:**

```bash
git clone https://github.com/atomregistry/cosmos-protowriter.git
```

### Basic Usage

```javascript
import { PW, toBase64 } from './src/protowriter.js';

const executeMsg = {
  register_subdomain: { parent: "atom", label: "mytest" }
};

const msgBytes = new PW()
  .s(1, "cosmos1youraddress...")           // sender
  .s(2, "cosmos1contractaddress...")       // contract
  .b(3, new TextEncoder().encode(JSON.stringify(executeMsg)))
  .finish();

console.log("Encoded message (base64):", toBase64(msgBytes));
```

### Important Disclaimers & Warnings

- This library is provided **AS-IS** with **no warranty** of any kind.
- You are fully responsible for auditing and testing this code before using it with real funds.
- Ledger support uses the Amino JSON path, which is currently the most reliable on hardware wallets.
- No official support or maintenance guarantee is provided.
- Contributions are welcome at this time (this is a personal/reference project).
- Use at your own risk.

