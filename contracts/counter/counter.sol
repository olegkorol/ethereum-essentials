pragma solidity ^0.4.18;
// NOTE: different versions of the compiler could lead to different bytecode

contract Counter {
  // these values will be stored on every node (not for free)
  uint count;

  // constructor (always same name as the class)
  function Counter() public {
    count = 1;
  }

  // methods

  // to call methods that change the value of count, a transaction has to be dispatched:
  // it is then included in a block, the miners verify that block and finally the state of count gets changed 
  function increment() public {
    count += 1;
  }

  function decrement() public {
    count -= 1;
  }

  // can be executed 'for free', because the value of count is already on the network.
  function get() public constant returns (uint) {
    return count;
  }


}