# cosmos-protowriter

A tiny, zero-dependency Protobuf encoder for Cosmos transactions.

Used in production by **[Atom Registry](https://atomregistry.com)** with **200+ flawless mainnet transactions**.

Built for developers who want **maximum control** and **minimum attack surface** — no `@cosmjs`, no heavy dependencies, no supply-chain risk.

### Why This Exists

Most Cosmos dApps pull in hundreds of KB of `@cosmjs` and its transitive dependencies.  
This library is intentionally minimal (~100 lines core) while still handling real `MsgExecuteContract` transactions reliably.

### Features

- Zero external dependencies
- Extremely small footprint
- Full control over every encoded byte
- Supports common Cosmos messages (`MsgExecuteContract`, etc.)
- Works with Keplr, Leap, Cosmostation, and Ledger (Amino path — most reliable)
- Battle-tested on `cosmoshub-4`

### Installation

Just copy the file:

```bash
curl -O https://raw.githubusercontent.com/atomregistry/cosmos-minimal-protowriter/main/src/protowriter.js

Or clone the repo:

git clone https://github.com/atomregistry/cosmos-minimal-protowriter.git

### Basic Usage

import { PW, toBase64 } from './protowriter.js';

const executeMsg = {
  register_subdomain: { parent: "atom", label: "mytest" }
};

const msgBytes = new PW()
  .s(1, "cosmos1youraddress...")           // sender
  .s(2, "cosmos1contractaddress...")       // contract
  .b(3, new TextEncoder().encode(JSON.stringify(executeMsg)))
  .finish();

console.log("Encoded message (base64):", toBase64(msgBytes));

Important Disclaimers & Warnings

This library is provided AS-IS with no warranty of any kind.
You are fully responsible for auditing and testing this code before using it with real funds.
Ledger support uses the Amino JSON path, which is currently the most reliable on hardware wallets.
No official support or maintenance guarantee is provided.
If you find a bug, feel free to open an issue, but understand this is a personal tool released for educational and reference purposes.

Use at your own risk.


