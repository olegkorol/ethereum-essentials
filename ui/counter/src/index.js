let app = document.querySelector('#app')
const Web3 = require('web3');
const web3 = new Web3();

web3.setProvider(
  new web3.providers.HttpProvider('http://localhost:8545')
)
window.web3 = web3

// some basic operations on the accounts
window.unlock0 = function() {
  console.log('Unlocking account 0');
  return web3.personal.unlockAccount(web3.eth.accounts[0], 'Test123')
}
window.checkBalance0 = function() {
  console.log('Balance account 0:', web3.fromWei(web3.eth.getBalance(web3.eth.accounts[0]), 'ether') + ' Ether')
}
window.checkBalance1 = function() {
  console.log('Balance account 1:', web3.fromWei(web3.eth.getBalance(web3.eth.accounts[1]), 'ether') + ' Ether')
}

// operations on the test contract
// the process is similar as within the Geth console
const contractAbi = require('./counter_sol_Counter_abi.json');
const contractAddress = '0xF9E3793376090f6dFA1C4b3c30fe7c572E216967';
const myContract = web3.eth.contract(contractAbi).at(contractAddress);

window.myContract = myContract;

// Reference: https://github.com/ethereum/wiki/wiki/JavaScript-API#contract-methods
// Automatically determines the use of call or sendTransaction depending on method type
window.get = function() {
  myContract.get((err, result) => { // or manually... myContract.myMethod.{call()|sendTransaction()}
    if (err) {
      return err
    } else {
      // result is a BigNumber object, and has to be converted
      console.log('Counter:', result.toString(10))
    }
  })
}

window.increment = function() {
  myContract.increment(
    {
      from: web3.eth.accounts[0]
    },
    (err, tx) => {
      if (err) {
        alert(err)
      } else {
        console.log('Transaction successful:\n ' + tx)
      }
    })
}

window.decrement = function() {
  myContract.decrement(
    {
      from: web3.eth.accounts[0]
    },
    (err, tx) => {
      if (err) {
        alert(err)
      } else {
        console.log('Transaction successful:\n ' + tx)
      }
    })
}

app.innerHTML = `
  <h2>Ethereum Essentials</h2>
  <div>
  <button type="button" onClick="unlock0()">Unlock account 0</button>
  </div>
  <div>
    <h3>Account balances:</h3>
    <button type="button" onClick="checkBalance0()">Check balance (account 0)</button><br>
    <button type="button" onClick="checkBalance1()">Check balance (account 1)</button>
  </div>
  <div>
    <h3>Contract methods:</h3>
    <button type="button" onClick="get()">Check count</button><br>
    <button type="button" onClick="increment()">Increment +</button>
    <button type="button" onClick="decrement()">Decrement -</button>
  </div>
`