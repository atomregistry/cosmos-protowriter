// examples/basic-tx.js
// Simple example showing how to encode a MsgExecuteContract using cosmos-protowriter

import { PW, toBase64 } from '../src/protowriter.js';

console.log("=== cosmos-protowriter Basic Example ===\n");

// Example MsgExecuteContract payload
const executeMsg = {
  register_subdomain: {
    parent: "atom",
    label: "test123"
  }
};

const sender = "cosmos1exampleaddress1234567890";
const contract = "cosmos1contractaddress1234567890abcdef";

const msgBytes = new PW()
  .s(1, sender)                                      // sender
  .s(2, contract)                                    // contract
  .b(3, new TextEncoder().encode(JSON.stringify(executeMsg)))  // msg (JSON)
  .finish();

console.log("Encoded MsgExecuteContract (base64):");
console.log(toBase64(msgBytes));
console.log("\nLength:", msgBytes.length, "bytes");
