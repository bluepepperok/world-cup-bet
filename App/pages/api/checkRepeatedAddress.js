import { ethers } from "ethers";
import { loadDeployment } from "../../utils/loadDeployment";

export default async function checkRepeatedAddress(req, res) {
  const address = req.query.address;
  console.log(`checkRepeatedAddress ${address} ${typeof address}`);
  if (!ethers.utils.isAddress(address)) {
    res.status(400).json({
      error: "Invalid address",
    });
  }

  const { wcb } = await loadDeployment(ethers, process.env.ETH_NODE);

  const accountBet = await wcb.bets(address);

  const response = {
    team: accountBet.team.toNumber(),
  };

  res.status(200).json(response);
}
