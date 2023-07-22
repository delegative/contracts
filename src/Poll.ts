import { Field, SmartContract, state, State, method, UInt64, Nullifier, MerkleMap, MerkleMapWitness, CircuitString, Circuit, Mina, PrivateKey, AccountUpdate, Bool, Provable } from 'snarkyjs';

type Vote = { address: String, power: number, variant:number  }


export class Poll extends SmartContract {
  @state(Field) fff = State<Field>()
  @state(Field) endTimestamp = State<Field>()


  // @method init(mycount: Field) {
  //   super.init();
  //   this.required.set(mycount)
  //
  // }

  //Just for testing
  @method setF(qwe: Field) {
    this.fff.set(qwe)
  }

  @method getF() : Field {
    let zzz = this.fff.getAndAssertEquals();
    return zzz
  }

  checkVotes(votes: Field[]) : Bool {
    let x = votes[0] 

    // let qwe = new MerkleMap()
    // qwe.set(Field(1), Field(2))
    let res = x.equals(this.fff.get())
    return res
  }

  //this function receives an array of Vote and checks if there are dublicates
  verifyPoll(votes: Vote[]) : Bool {
    let addresses = votes.map(a => a.address);
    //sorting out all duplicates
    let duplicates = addresses => votes.filter((item, index) => votes.indexOf(item) !== index)

    return Bool(duplicates.length == 0)
  }

  let votes1 = [{address: 'q'}, {address: 'w'}]
  let votes2 = [{address: 'q'}, {address: 'q'}]
  // @method vote(variant : Field) {
  //   // this.votedCount.set(voted.add(Field(1)))
  // }

}

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

let c = zkapp.fff.get()
console.log('the value is ', c.toBigInt())
console.log('doing secdon tx \n\n')


//HERE I UPDATE STATE
// let tx2 = await Mina.transaction(sender, () => {
//   // let senderUpdate = AccountUpdate.fundNewAccount(sender);
//   // senderUpdate.send({ to: zkappAddress, amount: initialBalance });
//   zkapp.setF(Field(5))
// });
// await tx2.prove();
// await tx2.sign([senderKey]).send();
// // console.log(tx2.toPretty())
//
console.log('doing third tx \n\n')

// let tx3 = await Mina.transaction(sender, () => {
//   let zxc = zkapp.getF()
//   console.log('f state variable has value', zxc.toBigInt())
// });
// await tx3.prove();
// await tx3.sign([senderKey]).send();
// console.log(tx3.toPretty())
// console.log(zxc)

// let b = zkapp.fff.get()
// console.log('finally its', b.toBigInt())
// let qqqq = await zkapp.strVote(['qq','ww'])
// console.log('qqqq is', qqqq.toBoolean())
//
// // let iw = await zkapp.checkVotes([Field(4)])
// let iw = await zkapp.strVote(['qq','qq'])
// console.log('qqqq is', iw.toBoolean())

let tx4 = await Mina.transaction(sender, () => {
  let qqqq = zkapp.strVote(['qq','qq'])
  // let zxc = zkapp.checkVotes([Field(5)])
  console.log('assertion has value', qqqq.toBoolean())
  return qqqq
});
await tx4.prove()
console.log('proof tx is', tx4.toPretty())
console.log('proof tx is', tx4.toJSON())
//
// await tx4.prove();
// await tx4.sign([senderKey]).send();
// console.log(tx4.toJSON())
// console.log(zxc)


