# World Cup Bet

## Running tests

```shell
npx hardhat test
```

## Deployment

There are two deployment tasks:

- `deployWCBet`: deploys the betting contract. It has the following parameters:
    - `--token`: Required. This is the WDOGE token address.
    - `--bet-amount`: Required. This is the fixed bet amount.
- `deployToken`: deploys a token contract that can be used to test the betting contract.

### Deploying on goerli

1. Set the `networks` property of your [hardhat config] like this:
```ts
const config = {
  networks: {
    goerli: {
      url: "https://:your-secret@goerli.infura.io/v3/your-project-id",
      accounts: ["your-hex-encoded-deployer-private-key"],
    },
  },
  // other config fields
};
```
2. Run `hh compile`.
3. Run `hh --network goerli deployToken`.
4. Copy the token address.
5. Run `hh --network goerli deployWCBet --token <token address> --bet-amount <fixed bet amount>`.
6. Run `hh --network goerli verify <token address>`.
7. Run `hh --network goerli verify <world cup bet address> <token address> <fixed bet amount>`.

### Deploying on mainnet

1. Take note of the WDOGE token address.
2. Set the `networks` property of your [hardhat config] like this:
```ts
const config = {
  networks: {
    mainnet: {
      url: "https://:your-secret@mainnet.infura.io/v3/your-project-id",
      accounts: ["your-hex-encoded-deployer-private-key"],
    },
  },
  // other config fields
};
```
3. Run `hh compile`.
4. Run `hh --network mainnet deployWCBet --token <token address> --bet-amount <fixed bet amount>`.
5. Run `hh --network mainnet verify <world cup bet address> <token address> <fixed bet amount>`.