import { loadDeployment } from "../../utils/loadDeployment";
import { ethers } from "ethers";

export default async function handler(req, res) {
  console.log("REQ METHOD: ", req.method);

  const { wcb, token, abi } = await loadDeployment(ethers, process.env.ETH_NODE);

  res.status(200).json({
    tokenAddress: token.address,
    wcbAddress: wcb.address,
    tokenAbi: abi.token,
    wcbAbi: abi.wcb,
  });
}
