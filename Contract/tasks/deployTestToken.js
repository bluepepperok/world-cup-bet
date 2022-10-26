const chalk = require("chalk");
const { task, types } = require("hardhat/config");

const { deploymentExists, storeDeployment, xor } = require("./common");

/**
 * This script always deploys the production token.
 */
const deployCommand = async function (
  { confirmations },
  hre
) {
  if (confirmations < 1) {
    throw new Error("Confirmations can't be lower than 1.");
  }

  const contractName = "TestToken";

  if (
    hre.network.name !== "hardhat" && hre.network.name !== "localhost" &&
    (await deploymentExists(hre, contractName))
  ) {
    // We support only one deployment for each network for now.
    throw new Error(`A deployment for ${hre.network.name} already exists.`);
  }

  const [deployer] = await hre.ethers.getSigners();
  const tokenFactory = await hre.ethers.getContractFactory(
    contractName,
    deployer
  );
  const { abi } = await hre.artifacts.readArtifact(contractName);
  const token = await tokenFactory.deploy();
  await token.deployTransaction.wait(confirmations);

  console.log(`Deployed token!
  Token owner is ${chalk.green(deployer.address)}
  Token address is ${chalk.green(token.address)}`);

  await storeDeployment(hre, {
    name: contractName,
    abi,
    address: token.address,
  });
  return token;
};

const deployTaskName = "deployToken";

task(deployTaskName, "Deploys test token.")
  .addOptionalParam(
    "confirmations",
    "The number of confirmations that the deploy task will wait for the tx.",
    1,
    types.int
  )
  .setAction(deployCommand);
