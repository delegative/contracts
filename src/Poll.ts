import { Field, SmartContract, state, State, method, UInt64, Mina, PrivateKey, AccountUpdate, Bool, Provable, CircuitString } from 'snarkyjs';

type Vote = { address: CircuitString, power: Field, variant:CircuitString  }
export type Args = {timestamp: Field, votes: Vote[]}

// to deploy we need to get timesamp from the poll creator:
// timestamp <- await getTimestamp()
let timestamp = Field(148) //dummy value

export class Poll extends SmartContract {

  @state(Field) endTimeStamp = State<Field>()

  @method init() {
    super.init();
    this.endTimeStamp.set(timestamp)
  }

  //initialize with timestamp parameter
  @method setEndTimeStamp(timestamp : Field) {
    this.endTimeStamp.assertEquals(Field(0))
    this.endTimeStamp.set(timestamp)
  }

  //this function receives an array of Vote and checks if there are dublicates
  verifyPoll(args: Args)  {
    //checking timestamp
    let timestamp = args.timestamp
    //check that the provided timestamp is greater than the end of the Poll
    timestamp.assertGreaterThanOrEqual(this.endTimeStamp.get(), "It's too early, wait for the end of the poll.")

    //checking for duplicates in the list of addresses
    //TODO: debug&finish
    let votes = args.votes
    let addresses = votes.map(a => a.address);
    // console.log('addresses', addresses)
    //sorting out all duplicates
    let duplicates = addresses.filter((item, index) => addresses.indexOf(item) !== index)
    // console.log('duplicates', duplicates)
    let duplen = Field(duplicates.length)
    console.log('duplen is', duplen)
    let zero = Field(0)
    zero.assertEquals(duplen, "There are duplicate votes.")

    //
    //Not working
    // let x = votes[0].power
    // console.log(x.toString())
    // // for (let y of [CircuitString.fromString("q") ]) {
    // for (let y of [Field(1) ]) {
    // // for (let y of addresses) {
    //   // console.log(y)
    //   console.log('x', x.toString())
    //   console.log('y', y.toString())
    //   x.equals(y).assertTrue("addresses have duplicates");
    // }

    //counting the votes
    let res: Object = {}
    
    for(let i=0; i<votes.length; i++) {
      let vote = votes[i]
      let propertyName = vote.variant.toString()
      if (res.hasOwnProperty(propertyName)) {
        res[propertyName].add(vote.power)
      } else {
        res[propertyName] = vote.power
      }
    }
    return res
  }

}
