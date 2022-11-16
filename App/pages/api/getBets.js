// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ethers } from "ethers";
import { loadDeployment } from "../../utils/loadDeployment";
import { inspect } from "util";

// We define this divisor to observe two numbers after the comma
const dogeDecimalsSignificantDivisor = ethers.BigNumber.from(10 ** 6);
const twoDecimalsDivisor = ethers.BigNumber.from(10 ** 2);

let fixedBetAmountMemoized;
async function getFixedBetAmount(wcb) {
  if (fixedBetAmountMemoized !== undefined) return fixedBetAmountMemoized;

  fixedBetAmountMemoized = await wcb.FIX_BET_AMOUNT();
  return fixedBetAmountMemoized;
}

let lastBlock;
let betsCache;
let jackpotCache;
async function getBettingStatus(wcb, token) {
  const currentBlock = await wcb.provider.getBlockNumber();
  if (lastBlock === currentBlock) return { bets: betsCache, jackpot: jackpotCache };

  {
    [betsCache, jackpotCache] = await Promise.all([wcb.getBetsOfAllTeams(), token.balanceOf(wcb.address)]);
  }
  lastBlock = currentBlock;
  return { bets: betsCache, jackpot: jackpotCache };
}

export default async function getBets(req, res) {
  const { wcb, token } = await loadDeployment(ethers, process.env.ETH_NODE);

  let fixedBetAmount;
  let bets, jackpot;
  try {
    fixedBetAmount = await getFixedBetAmount(wcb);
    ({ bets, jackpot } = await getBettingStatus(wcb, token));
  } catch (error) {
    // Inform failure to frontend if the contract is unavailable
    console.error("CONTRACT ERROR: ", error);
    res.status(200).json({ contractStatus: "failure" });
    return;
  }

  const jackpotString = buildJackpotString(jackpot);

  const response = {
    contract_status: "success",
    betsPerTeam: bets.map((bet) => bet.toString()),
    fixedBetAmount: fixedBetAmount.toString(),
    jackpot: jackpotString,
  };

  console.log(`CONTRACT STATUS: ${inspect(response, { depth: 5 })}`);

  res.status(200).json(response);
}

// We take just two decimals after the comma for WDOGE tokens
function buildJackpotString(totalBets) {
  const significantPart = totalBets.div(dogeDecimalsSignificantDivisor);
  const wholePart = significantPart.div(twoDecimalsDivisor);
  const fractionalPart = significantPart.mod(twoDecimalsDivisor);
  if (fractionalPart.gt(0)) {
    const fractionalPartString = fractionalPart.toString().padStart("0", 2);
    return `${wholePart}.${fractionalPartString}`;
  }

  return wholePart.toString();
}
