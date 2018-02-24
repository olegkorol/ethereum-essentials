# Ethereum Essentials

This is a short guide showing the essential components of Ethereum and its Smart Contracts, with some sample code.

To make things more comprehensive, it is broken down into 3 blocks:

- Geth client
- Contracts
- UI

## Geth client

>`geth` is the the command line interface for running a full ethereum node implemented in Go.

You can find a general reference for Geth [here](https://github.com/ethereum/go-ethereum/wiki/Geth).

### Download geth

Download and install the [geth client](https://github.com/ethereum/go-ethereum/wiki/Building-Ethereum).

### Initialize network and perform actions

To initialize a custom node you will need a `genesis.json` file, which you can find [here](https://github.com/ethereum/go-ethereum/#defining-the-private-genesis-state).

And then run `geth --datadir=./datadir init genesis.json`

A folder called `datadir` will be generated, which will be used as kind of a DB for the blockchain.

### Creating an account

In order to make any interactions, you will need some accounts. To create one, run:

`geth --datadir=./datadir account new`

The account will be saved in `./datadir/keystore`.

The contents of this folder are totally confidential and should not be shared.

Note that accounts are created offline. This address remains unknown to the network until it is part of a transaction.

### Listing accounts

`geth --datadir=./datadir account list`

### Using the geth console

`geth --datadir=./datadir console`

#### List of console commands

Account:

- `eth.accounts`
- `eth.getBalance('accAddress')`
- `personal.newAccount('pwdForAccount')`
- `personal.unlockAccount('account', 'pwd')`
- `personal.unlockAccount('account', 'pwd', 60*60*24)` (unlock for 24 hours)

Transactions (unlock account first):

- `eth.sendTransaction({from: eth.accounts[0], to: eth.accounts[1], value: web3.toWei(1, 'ether')})` (send 1 ether from account 0 to account 1)
- `eth.getTransaction('transactionHash')` (get transaction details)
- `debug.traceTransaction('transactionHash')` (for debugging a transaction)
- Deploy contract:

```javascript
eth.sendTransaction(
    {
      from: eth.accounts[0],
      data: "0x" + contractCode, // contractCode = binary code
      gas: 1000000
    },
    function(err, tx) {
      console.log(err, tx) // tx = transaction
    }
)

// the output contract=xxx is the address of the contract
// SAVE it for any further interactions with the contract
// if eth.getCode(contractAddress) !== '0x', then it has already been mined
```

Mining & General:

- `miner.start(numberOfThreads)` / `miner.stop()`
- `eth.blockNumber`
- `eth.getBlock('blockHash')` (get info about specific block)
- `web3.fromWei(amountOfWei, 'targetUnit')` (converts wei to ether)
- `web3.toWei(amountOfUnit, 'initialUnit')` (e.g. (1, 'ether'))
- `eth.getCode(contractAddress)` (get contract)
- `loadScript('./path-to-script')`

Contract Methods:

- For getters: `myContract.myMethod(...params)`
- For setters: `myContract.myMethod(...params, {from: 'address'})`

### Enable RPC to access node

If we want to enable access to the node via RPC from e.g. our browser using Web3, then run:

`geth --datadir=./datadir --nodiscover --rpc --rpcapi "db,personal,eth,net,web3,debug" --rpccorsdomain="*" --rpcaddr="localhost" --rpcport 8545 console`

_UI: You will set the HttpProvider on the web3 instance to use the URL specified above._

### Enable RPC and Websockets

`geth --datadir=./datadir --nodiscover --rpc --rpcapi "db,personal,eth,net,web3,debug" --rpccorsdomain="*" --rpcaddr="localhost" --rpcport 8545 --ws --wsapi "db,personal,eth,net,web3,debug" --wsorigins="*" --wsaddr="localhost" --wsport 8546 console`

## Smart Contracts

### Basic concepts

Smart contracts run on the EVM (Ethereum Virtual Machine).

EVM is an assembly-like programming environment.

We write contracts in the Solidity language and those will be compiled down to binary code, which will be deployed to the network.

Every single node on the network will run this code in order to verify its correctness.

Further, contracts will only run in response to a transaction. So they are reactive.

### Gas

To run our contract(s) on the network has a cost: gas.

The EVM runs byte-code operations, called `opcodes`. Each type of opcode has a different price.
The cost of the opcodes is always fixed. The total gas equals the total cost of opcodes.

The gas is then paid with ether. The price of gas is dynamically decided by the miners.

Solc and Remix provide tools to estimate gas.

Gas prices can be found [here](https://ethstats.net/).

### Compiler

The main compiler for Solidity is called `solc` (written in C++).

There is a JavaScript version called `solcjs` (`npm i -g solc` to get it).

Once you have written a contract, to generate the binary you will run:

`solcjs --bin contract.sol`

... and to generate both the binary code and the ABI (the contract's interface), you will run:

`solcjs --bin --abi contract.sol`

### Immutability

Nothe that a contract's code is immutable. Once it is instantiated, it cannot be changed.

### Deployment and instantiation

- After compaling, copy the `contract.bin` code
- Open the geth console and save the code above into a variable (e.g. contractCode)
- Unlock the account which will perform the deployment transaction
- And send the transaction:

```javascript
eth.sendTransaction(
    {
      from: eth.accounts[0],
      data: "0x" + counterCode,
      gas: 1000000
    },
    function(err, tx) {
      console.log(err, tx)
    }
)
```

- Save the contract address that comes from the output (as contract=xxx) e.g. "0xF9E3793376090f6dFA1C4b3c30fe7c572E216967"
- Make sure the transaction gets mined into a block, check with `eth.getCode(contractAddress)`
- The we will create a JavaScript Proxy with the ABI that describes the contract's interface
- Copy the contract.abi and parse it to JSON -> `var abi = JSON.parse(abiCode)`
- Create a class for the contract -> `var Contract = eth.contract(abi)`
- Create an instance -> `var contract = Contract.at(contractAddress)`
- With the instance created, the methods of the contract can be accessed now

e.g. counter.sol contract: `contract.get()` will return 1

While getters can be accessed locally, setters cannot: e.g. `contract.increment()` will throw an error

To access to setters we have to send a transaction on that method of the contract: e.g. `contract.increment.sendTransaction({from: eth.accounts[0]})`

### Conclusion

Resuming, the complete lifecycle of a contract would be:

- Contract is written in Solidity.
- It gets compiled to bytecode with solcjs.
- A transaction is submitted to create an instance of the contract (class) on the network.

### Truffle

There is a framework called Truffle which simplifies this process pretty much.

_*Todo:* create a version of the sample contract using Truffle._

## User Interface

To access an Ethereum network and its contracts from a user interface (from browser), we will need [web3](https://github.com/ethereum/wiki/wiki/JavaScript-API).

Web3 helps to establish the connection to an Ethereum node, which in turn has access to the EVM.

So basically, we create the connection with only these piece of code:

```javascript
const Web3 = require('web3');
const web3 = new Web3();

web3.setProvider(
  new web3.providers.HttpProvider('http://localhost:8545')
)
```

## References and info sources

### Bitcoin

Mastering Bitcoin 2nd Edition - Programming the Open Blockchain - [link](https://github.com/bitcoinbook/bitcoinbook)

### Ethereum

White Paper (with some background about Bitcoin) - [link](https://github.com/ethereum/wiki/wiki/White-Paper)

Good overview and starting point - [link](https://medium.com/@ConsenSys/a-101-noob-intro-to-programming-smart-contracts-on-ethereum-695d15c1dab4)

Tutorials - [link](https://www.newline.co/)

Testing client - [link](https://github.com/trufflesuite/ganache-cli)

Have a look - [link](https://blockapps.net/)

Lis of DApps - [link](https://www.stateofthedapps.com/)