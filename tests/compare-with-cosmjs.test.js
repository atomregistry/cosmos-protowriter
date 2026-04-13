// tests/compare-with-cosmjs.test.js
// Byte-for-byte comparison test between cosmos-minimal-protowriter and @cosmjs

import { PW, toBase64 } from '../src/protowriter.js';
import { DirectSecp256k1HdWallet } from '@cosmjs/proto-signing';
import { SigningStargateClient } from '@cosmjs/stargate';
import { cosmos, cosmwasm } from 'cosmjs-types';
import { Registry } from '@cosmjs/proto-signing';
import { assert } from 'chai';

// Note: This test requires @cosmjs packages to be installed for comparison.
// Run with: npm test (or manually)

const CHAIN_ID = 'cosmoshub-4';
const CONTRACT = 'cosmos1testcontract1234567890abcdef';
const SENDER = 'cosmos1testsender1234567890abcdef';

describe('Protowriter vs @cosmjs byte equality', function () {

  it('should produce identical MsgExecuteContract encoding', async function () {
    const executeMsg = {
      register_subdomain: {
        parent: "atom",
        label: "testcompare"
      }
    };

    // === Your minimal protowriter (Pepsi) ===
    const pwBytes = new PW()
      .s(1, SENDER)
      .s(2, CONTRACT)
      .b(3, new TextEncoder().encode(JSON.stringify(executeMsg)))
      .finish();

    console.log("Minimal protowriter output (base64):", toBase64(pwBytes));

    // === @cosmjs reference (Coke) ===
    const registry = new Registry([
      ["/cosmwasm.wasm.v1.MsgExecuteContract", cosmwasm.wasm.v1.MsgExecuteContract],
    ]);

    const msg = {
      typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
      value: {
        sender: SENDER,
        contract: CONTRACT,
        msg: new TextEncoder().encode(JSON.stringify(executeMsg)),
        funds: []
      }
    };

    // Simulate encoding the same way @cosmjs does internally
    const encoded = registry.encodeAsAny(msg).value;   // .value contains the raw protobuf bytes

    console.log("@cosmjs output (base64):", toBase64(encoded));

    // Byte-for-byte comparison
    assert.deepEqual(
      Array.from(pwBytes),
      Array.from(encoded),
      "Output bytes must match exactly between minimal protowriter and @cosmjs"
    );

    console.log("✅ Byte-for-byte match confirmed!");
  });

  it('should handle funds correctly', async function () {
    const executeMsg = { ping: {} };

    const pwBytes = new PW()
      .s(1, SENDER)
      .s(2, CONTRACT)
      .b(3, new TextEncoder().encode(JSON.stringify(executeMsg)))
      .b(5, new PW()
        .s(1, "uatom")
        .s(2, "1000000")
        .finish()
      )
      .finish();

    // @cosmjs version with funds
    const registry = new Registry([
      ["/cosmwasm.wasm.v1.MsgExecuteContract", cosmwasm.wasm.v1.MsgExecuteContract],
    ]);

    const msg = {
      typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
      value: {
        sender: SENDER,
        contract: CONTRACT,
        msg: new TextEncoder().encode(JSON.stringify(executeMsg)),
        funds: [{ denom: "uatom", amount: "1000000" }]
      }
    };

    const encoded = registry.encodeAsAny(msg).value;

    assert.deepEqual(Array.from(pwBytes), Array.from(encoded));
    console.log("✅ Funds encoding matches");
  });
});
