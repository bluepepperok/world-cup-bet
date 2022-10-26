// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import { ethers } from "ethers";
import { loadDeployment } from "../../utils/loadDeployment";
import { inspect } from "util";

// We define this divisor to observe two numbers after the comma
const dogeDecimalsSignificantDivisor = ethers.BigNumber.from(10 ** 6);
const twoDecimalsDivisor = ethers.BigNumber.from(10 ** 2);

export default async function getBets(req, res) {
  console.log("REQ METHOD", req.method);

  const teams = [
    { name: "Brazil", flag: "/countryFlags/br-flag.gif" },
    { name: "Cameroon", flag: "/countryFlags/cm-flag.gif" },
    { name: "Germany", flag: "/countryFlags/gm-flag.webp" },
    { name: "France", flag: "/countryFlags/fr-flag.webp" },
    { name: "Costa Rica", flag: "/countryFlags/cs-flag.webp" },
    { name: "Spain", flag: "/countryFlags/sp-flag.webp" },
    { name: "England", flag: "/countryFlags/en-flag.webp" },
    { name: "Argentina", flag: "/countryFlags/ar.gif" },
    { name: "Belgium", flag: "/countryFlags/be-flag.webp" },
    { name: "Canada", flag: "/countryFlags/ca-flag.webp" },
    { name: "Uruguay", flag: "/countryFlags/uy-flag.gif" },
    { name: "Denmark", flag: "/countryFlags/da-flag.webp" },
    { name: "Netherlands", flag: "/countryFlags/nl-flag.webp" },
    { name: "Ghana", flag: "/countryFlags/gh-flag.gif" },
    { name: "Poland", flag: "/countryFlags/pl-flag.webp" },
    { name: "Ecuador", flag: "/countryFlags/ec-flag.webp" },
    { name: "Portugal", flag: "/countryFlags/po-flag.gif" },
    { name: "Switzerland", flag: "/countryFlags/sz-flag.webp" },
    { name: "Wales", flag: "/countryFlags/wa-flag.png" },
    { name: "Australia", flag: "/countryFlags/as-flag.webp" },
    { name: "Croatia", flag: "/countryFlags/hr-flag.webp" },
    { name: "Iran", flag: "/countryFlags/ir-flag.webp" },
    { name: "Denmark", flag: "/countryFlags/da-flag.webp" },
    { name: "Tunisia", flag: "/countryFlags/ts-flag.webp" },
    { name: "Saudi Arabia", flag: "/countryFlags/sa-flag.webp" },
    { name: "Senegal", flag: "/countryFlags/sg-flag.gif" },
    { name: "Morocco", flag: "/countryFlags/mo-flag.gif" },
    { name: "Qatar", flag: "/countryFlags/qa-flag.gif" },
    { name: "Serbia", flag: "/countryFlags/ri-flag.gif" },
    { name: "Mexico", flag: "/countryFlags/mx-flag.webp" },
    { name: "South Korea", flag: "/countryFlags/ks-flag.webp" },
    { name: "Japan", flag: "/countryFlags/ja-flag.webp" },
  ];

  console.log("entró a getBets");

  const { wcb, token } = await loadDeployment(ethers, process.env.ETH_NODE);

  //Get fix bet amount.
  let fixedBetAmount;
  try {
    fixedBetAmount = await wcb.FIX_BET_AMOUNT();
  } catch (error) {
    //If Fails to connect to contract, return failure to frontend
    console.error("CONTRACT ERROR: ", error);
    res.status(200).json({ contractStatus: "failure" });
    return;
  }

  //Get bets per team
  const bets = await wcb.getBetsOfAllTeams();

  const jackpot = await token.balanceOf(wcb.address);
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
