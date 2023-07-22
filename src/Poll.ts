import { Field, SmartContract, state, State, method, UInt64 } from 'snarkyjs';

/**
 * Basic Example
 * See https://docs.minaprotocol.com/zkapps for more info.
 *
 * The Add contract initializes the state variable 'num' to be a Field(1) value by default when deployed.
 * When the 'update' method is called, the Add contract adds Field(2) to its 'num' contract state.
 *
 * This file is safe to delete and replace with your own contract.
 */
export class Poll extends SmartContract {
  @state(Field) num = State<Field>();

  @state(Field) votedCount = State<Field>();

  @method init() {
    super.init();
    this.num.set(Field(1));
    this.votedCount.set(Field(0));
  }


  @method vote(variant : Field) {

    let voted = this.votedCount.get()

    this.votedCount.set(voted.add(Field(1)))


  }

  @method update() {
    const currentState = this.num.getAndAssertEquals();
    const newState = currentState.add(2);
    this.num.set(newState);
  }
}
