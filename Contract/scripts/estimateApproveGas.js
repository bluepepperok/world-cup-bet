const hre = require("hardhat");
const { inspect } = require("util");

async function main() {
  const wdogeAddress = "0x8aa9381b2544b48c26f3b850F6e07E2c5161EB3e";
  const IERC20 = await hre.artifacts.readArtifact("IERC20");
  const token = await hre.ethers.getContractAt(IERC20.abi, wdogeAddress);
  const estimation = await token.estimateGas.approve("0xfafafafafafafafafafafafafafafafafafafafa", 10 ** 8);
  console.log(inspect(estimation, { depth: 5 }));
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
