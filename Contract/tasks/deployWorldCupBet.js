const chalk = require("chalk");
const { task, types } = require("hardhat/config");

const { deploymentExists, storeDeployment, xor } = require("./common");

/**
 * This script always deploys the production token.
 */
const deployCommand = async function (
  { confirmations, token, betAmount },
  hre
) {
  if (!hre.ethers.utils.isAddress(token)) {
    throw new Error("Invalid token address!");
  }

  if (betAmount <= 0) {
    throw new Error("Invalid bet amount. It must be greater than zero.");
  }

  if (confirmations < 1) {
    throw new Error("Confirmations can't be lower than 1.");
  }

  const contractName = "WorldCupBet";

  if (
    hre.network.name !== "hardhat" && hre.network.name !== "localhost" &&
    (await deploymentExists(hre, contractName))
  ) {
    // We support only one deployment for each network for now.
    throw new Error(`A deployment for ${hre.network.name} already exists.`);
  }

  const [deployer] = await hre.ethers.getSigners();
  const wcbFactory = await hre.ethers.getContractFactory(
    contractName,
    deployer
  );
  const { abi } = await hre.artifacts.readArtifact(contractName);
  const wcb = await wcbFactory.deploy(token, betAmount);
  await wcb.deployTransaction.wait(confirmations);

  console.log(`Deployed world cup bet contract!
  Owner is ${chalk.green(deployer.address)}
  Address is ${chalk.green(wcb.address)}`);

  await storeDeployment(hre, {
    name: contractName,
    abi,
    address: wcb.address,
  });
  return wcb;
};

const deployTaskName = "deployWCBet";

task(deployTaskName, "Deploys world cup bet contract.")
  .addParam(
    "token",
    "Address of the token contract used for betting.",
    undefined,
    types.string
  )
  .addParam(
    "betAmount",
    "Value of each individual bet. Given in indivisible units of the token.",
    undefined,
    types.int
  )
  .addOptionalParam(
    "confirmations",
    "The number of confirmations that the deploy task will wait for the tx.",
    1,
    types.int
  )
  .setAction(deployCommand);
