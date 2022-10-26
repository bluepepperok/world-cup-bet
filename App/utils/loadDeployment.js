let contracts;

export async function loadDeployment(ethers, ethNode) {
  if (contracts !== undefined) return contracts;

  let artifactWCB;
  if (process.env.NEXT_PUBLIC_NETWORK == "goerli") {
    artifactWCB = require("../../Contract/deployment/goerli/deployment-WorldCupBet.json");
  } else if (process.env.NEXT_PUBLIC_NETWORK == "mainnet") {
    artifactWCB = require("../../Contract/deployment/mainnet/deployment-WorldCupBet.json");
  }
  const provider = new ethers.getDefaultProvider(ethNode);

  const wcb = reifyContract(ethers, artifactWCB, provider);
  const { abi: erc20Abi } = require("./ERC20.json");
  const tokenAddress = await wcb.callStatic.token();
  const token = reifyContract(
    ethers,
    {
      abi: erc20Abi,
      address: tokenAddress,
    },
    provider
  );

  contracts = {
    wcb,
    token,
    abi: {
      token: erc20Abi,
      wcb: artifactWCB.abi,
    },
  };
  return contracts;
}

function reifyContract(ethers, artifact, provider) {
  return new ethers.Contract(artifact.address, artifact.abi, provider);
}
