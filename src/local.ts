import { Poll, Args } from './Poll.js';
import { CircuitString, AccountUpdate, Field, isReady, shutdown, Mina, PrivateKey } from 'snarkyjs';

let Local = Mina.LocalBlockchain({ proofsEnabled: true });
Mina.setActiveInstance(Local);
const [ { publicKey: sender, privateKey: senderKey }, { publicKey: player2, privateKey: player2Key }, ] = Local.testAccounts;

// the zkapp account
let zkappKey = PrivateKey.random();
let zkappAddress = zkappKey.toPublicKey();
let zkapp = new Poll(zkappAddress);

console.log('the application has address', zkappAddress.toJSON())
console.log('compiling');
await Poll.compile();
console.log('deploying');
let tx = await Mina.transaction(sender, () => {
  let senderUpdate = AccountUpdate.fundNewAccount(sender);
  // senderUpdate.send({ to: zkappAddress, amount: initialBalance });
  zkapp.deploy({ zkappKey });
});
await tx.prove();
let pending = await tx.sign([senderKey]).send();
let trans = await pending.wait()
console.log('deployemtn tx hash is', pending.hash())

let c = zkapp.endTimeStamp.get()
console.log('the timestamp is ', c.toBigInt())


let votes1 : Args = {timestamp: Field(1), votes: [
  {address: CircuitString.fromString('q'), power: Field(1), variant: CircuitString.fromString("for")}, 
  {address: CircuitString.fromString('w'), power: Field(2), variant: CircuitString.fromString("against")}]}

let votes2 : Args = {timestamp: Field(20000), 
  votes: [
    {address: CircuitString.fromString('q'), power: Field(1), variant: CircuitString.fromString("for")},
    {address: CircuitString.fromString('q'), power: Field(2), variant: CircuitString.fromString("against")},
    {address: CircuitString.fromString('q'), power: Field(7), variant: CircuitString.fromString("for")}
  ]
}

let votes3 : Args = {timestamp: Field(20000),
  votes: [
    {address: CircuitString.fromString('q'), power: Field(1), variant: CircuitString.fromString("for")}, 
    {address: CircuitString.fromString('w'), power: Field(2), variant: CircuitString.fromString("for")}, 
    {address: CircuitString.fromString('e'), power: Field(7), variant: CircuitString.fromString("against")}
  ]
}

try {
  let res1 = await zkapp.verifyPoll(votes1)
  console.log('res1 is', res1)
} catch (e) {
  console.log(e)
}

try {
  console.log('zzzz')
  let res2 = await zkapp.verifyPoll(votes2)
  console.log('res2 is', res2)
} catch(e) {
  let a = await Mina.getNetworkState()
}
try {
  let res3 = await zkapp.verifyPoll(votes3)
  console.log('res3 is', res3)
} catch(e) {
  let a = await Mina.getNetworkState()
}

