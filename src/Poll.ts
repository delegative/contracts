import { Field, SmartContract, state, State, method, UInt64, Nullifier, MerkleMap, MerkleMapWitness, CircuitString, Circuit, Mina, PrivateKey, AccountUpdate, Bool, Provable } from 'snarkyjs';
import { Prover } from 'snarkyjs/dist/node/lib/proof_system';

type Vote = { address: String, power: number, variant:number  }
type Result = {success: boolean, direction: boolean}
type Args = {timestamp: Field, votes: Vote[]}

//TODO: change result value of verifyPoll function to -> (success: bool, direction: true/false/null (if success is
//false)

// to deploy we need to get timesamp from the poll creator:
// timestamp <- await getTimestamp()
let timestamp = Field(148) //dummy value

export class Poll extends SmartContract {
  @state(Field) endTimeStamp = State<Field>()

  @method init() {
    super.init();
    this.endTimeStamp.set(timestamp)
  }

  //this function receives an array of Vote and checks if there are dublicates
  verifyPoll(args: Args)  {
    //checking timestamp
    let timestamp = args.timestamp
    //check that the provided timestamp is greater than the end of the Poll
    timestamp.assertGreaterThanOrEqual(this.endTimeStamp.get(), "It's too early, wait for the end of the poll.")

    //checking for duplicates in the list of addresses
    let votes = args.votes
    let addresses = votes.map(a => a.address);
    console.log(addresses)
    //sorting out all duplicates
    let duplicates = addresses.filter((item, index) => addresses.indexOf(item) !== index)
    // let res = duplicates(addresses)
    console.log(duplicates)
    console.log(duplicates.length)

    //counting the votes
    //
    // res: Result {success: false,
    let res: Object = {}
    
    for(let i=0; i<votes.length; i++) {
      let vote = votes[i]
      let propertyName = vote.variant.toString()
      if (res.hasOwnProperty(propertyName)) {
        res[propertyName] += vote.power
      } else {
        res[propertyName] = vote.power
      }
    }
    return res
  }

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

let c = zkapp.endTimeStamp.get()
console.log('the timestamp is ', c.toBigInt())


let votes1 : Args = {timestamp: Field(1), votes: [{address: 'q', power: 1, variant: 1}, {address: 'w', power: 2, variant: 2}]}
let votes2 : Args = {timestamp: Field(20000), votes: [{address: 'q', power: 1, variant: 1}, {address: 'q', power: 2, variant: 2}, {address: 'q', power: 1, variant: 1}]}
try {
  let res1 = await zkapp.verifyPoll(votes1)
  console.log('res1 is', res1)
} catch (e) {
  console.log(e)
}
try {
  let res2 = await zkapp.verifyPoll(votes2)
  console.log('res2 is', res2)
} catch(e) {
  let a = await Mina.getNetworkState()
}

