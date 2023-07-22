import { Field, SmartContract, state, State, method, UInt64, Nullifier, MerkleMap, MerkleMapWitness, CircuitString, Circuit, Mina, PrivateKey, AccountUpdate } from 'snarkyjs';

export class Poll extends SmartContract {
  @state(Field) required = State<Field>()
  @state(Field) fff = State<Field>()

  @state(Field) nullifierRoot = State<Field>();
  @state(Field) nullifierMessage = State<Field>();

  // @method init(mycount: Field) {
  //   super.init();
  //   this.required.set(mycount)
  //
  // }

  @method setF(qwe: Field) {
    this.fff.set(qwe)
  }

  @method getF() : Field {
    let zzz = this.fff.getAndAssertEquals();
    return zzz
  }

  @method checkVotes() {
    // let a = Circuit.array

    let qwe = new MerkleMap()
    qwe.set(Field(1), Field(2))

  }


  @method vote(variant : Field) {

    // this.votedCount.set(voted.add(Field(1)))

  }

}

let Local = Mina.LocalBlockchain({ proofsEnabled: true });
Mina.setActiveInstance(Local);

const [ { publicKey: sender, privateKey: senderKey }, { publicKey: player2, privateKey: player2Key }, ] = Local.testAccounts;

// let { privateKey: senderKey, publicKey: sender } = Local.testAccounts[0];

// the zkapp account
let zkappKey = PrivateKey.random();
let zkappAddress = zkappKey.toPublicKey();
let zkapp = new Poll(zkappAddress);

console.log('the application will use address', zkappAddress)

console.log('compiling');
await Poll.compile();

console.log('deploying');
let tx = await Mina.transaction(sender, () => {
  let senderUpdate = AccountUpdate.fundNewAccount(sender);
  // senderUpdate.send({ to: zkappAddress, amount: initialBalance });
  zkapp.deploy({ zkappKey });

});
await tx.prove();
await tx.sign([senderKey]).send();
// console.log(tx.toPretty())

let c = zkapp.fff.get()
console.log('the value is ', c)

console.log('doing secdon tx \n\n')

let tx2 = await Mina.transaction(sender, () => {
  // let senderUpdate = AccountUpdate.fundNewAccount(sender);
  // senderUpdate.send({ to: zkappAddress, amount: initialBalance });
  zkapp.setF(Field(14885))

});
await tx2.prove();
await tx2.sign([senderKey]).send();
// console.log(tx2.toPretty())

console.log('doing third tx \n\n')
let tx3 = await Mina.transaction(sender, () => {
  let zxc = zkapp.getF()
  console.log('zxc has value', zxc)
});
await tx3.prove();
await tx3.sign([senderKey]).send();
console.log(tx3.toPretty())
// console.log(zxc)


let b = zkapp.fff.get()
console.log('finally its', b)


