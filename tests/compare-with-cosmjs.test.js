// tests/compare-with-cosmjs.test.js
import { PW, toBase64 } from '../src/protowriter.js';
import { Registry } from '@cosmjs/proto-signing';
import { cosmwasm } from 'cosmjs-types';
import { assert } from 'chai';

describe('cosmos-protowriter vs @cosmjs', function () {

  it('produces identical MsgExecuteContract encoding', async function () {
    const sender = "cosmos1testsender1234567890abcdef";
    const contract = "cosmos1testcontract1234567890abcdef";
    const executeMsg = {
      register_subdomain: {
        parent: "atom",
        label: "comparetest"
      }
    };

    // Your minimal protowriter
    const minimalBytes = new PW()
      .s(1, sender)
      .s(2, contract)
      .b(3, new TextEncoder().encode(JSON.stringify(executeMsg)))
      .finish();

    // @cosmjs reference
    const registry = new Registry([
      ["/cosmwasm.wasm.v1.MsgExecuteContract", cosmwasm.wasm.v1.MsgExecuteContract],
    ]);

    const cosmjsMsg = {
      typeUrl: "/cosmwasm.wasm.v1.MsgExecuteContract",
      value: {
        sender,
        contract,
        msg: new TextEncoder().encode(JSON.stringify(executeMsg)),
        funds: []
      }
    };

    const cosmjsBytes = registry.encodeAsAny(cosmjsMsg).value;

    assert.deepEqual(
      Array.from(minimalBytes),
      Array.from(cosmjsBytes),
      "Output must be byte-for-byte identical to @cosmjs"
    );

    console.log("✅ Byte-for-byte match confirmed with @cosmjs");
  });
});
