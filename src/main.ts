import { Args, Poll } from './Poll.js';
import { CircuitString, Field, isReady, shutdown, Mina, PrivateKey } from 'snarkyjs';
import { uploadJson } from "./upload";

import fs from 'fs';
import { loopUntilAccountExists, deploy } from './utils.js';
import { ZkProgram } from 'snarkyjs/dist/node/lib/proof_system.js';

await isReady;

console.log('SnarkyJS loaded');

// ----------------------------------------------------

const Berkeley = Mina.Network( 'https://proxy.berkeley.minaexplorer.com/graphql');
Mina.setActiveInstance(Berkeley);

const transactionFee = 100_000_000;

// const deployAlias = process.argv[2];
const deployerKeysFileContents = fs.readFileSync( 'keys/delegative.json', 'utf8');
const deployerPrivateKeyBase58 = JSON.parse(
  deployerKeysFileContents
).privateKey;
const deployerPrivateKey = PrivateKey.fromBase58(deployerPrivateKeyBase58);
const deployerPublicKey = deployerPrivateKey.toPublicKey();

const zkAppPrivateKey = PrivateKey.random()

// ----------------------------------------------------

let account = await loopUntilAccountExists({
  account: deployerPublicKey,
  eachTimeNotExist: () => {
    console.log(
      'Deployer account does not exist. ' +
        'Request funds at faucet ' +
        'https://faucet.minaprotocol.com/?address=' +
        deployerPublicKey.toBase58()
    );
  },
  isZkAppAccount: false,
});

console.log( `Using fee payer account with nonce ${account.nonce}, balance ${account.balance}`);

// ----------------------------------------------------

console.log('Compiling smart contract...');
let { verificationKey } = await Poll.compile();

const zkAppPublicKey = zkAppPrivateKey.toPublicKey();
let zkapp = new Poll(zkAppPublicKey);

// Programmatic deploy:
//   Besides the CLI, you can also create accounts programmatically. This is useful if you need
//   more custom account creation - say deploying a zkApp to a different key than the fee payer
//   key, programmatically parameterizing a zkApp before initializing it, or creating Smart
//   Contracts programmatically for users as part of an application.
await deploy(deployerPrivateKey, zkAppPrivateKey, zkapp, verificationKey, Field(150));

// await loopUntilAccountExists({
//   account: zkAppPublicKey,
//   eachTimeNotExist: () =>
//     console.log('waiting for zkApp account to be deployed...'),
//   isZkAppAccount: true,
// });
//
let votes : Args = {timestamp: Field(2), 
  votes: [
    {address: CircuitString.fromString('q'), power: Field(1), variant: CircuitString.fromString("for")},
    {address: CircuitString.fromString('q'), power: Field(2), variant: CircuitString.fromString("against")},
    {address: CircuitString.fromString('q'), power: Field(7), variant: CircuitString.fromString("for")}
  ]
}

let votesValid : Args = {timestamp: Field(2), 
  votes: [
    {address: CircuitString.fromString('q'), power: Field(1), variant: CircuitString.fromString("for")},
    {address: CircuitString.fromString('q'), power: Field(2), variant: CircuitString.fromString("against")},
    {address: CircuitString.fromString('q'), power: Field(7), variant: CircuitString.fromString("for")}
  ]
}


console.log('trying to prove the invalid votes')
try {
  let result = await zkapp.verifyPoll(votes)
} catch (e) {
  console.log(e)
}

console.log('trying to prove the valid votes')
try {
  let result = await zkapp.verifyPoll(votesValid)
  console.log('got the result', result)

} catch (e) {
  console.log(e)
}



console.log('Shutting down');

await shutdown();
