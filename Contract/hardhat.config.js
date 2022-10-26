require("@nomicfoundation/hardhat-toolbox");
require("./tasks/deployTestToken");
require("./tasks/deployWorldCupBet");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    hardhat: {
      chainId: 1337,
    },
  },
};
