const hre = require("hardhat");

async function main() {
  const ONE_DOGE = 10 ** 8;
  const token = await hre.run("deployToken");
  const wcbet = await hre.run("deployWCBet", {
    token: token.address,
    betAmount: ONE_DOGE,
  });
  const signers = await hre.ethers.getSigners();
  let i = 1;
  for (const signer of signers) {
    let tx = await token.mint(signer.address, 100 * ONE_DOGE);
    await tx.wait(1);

    tx = await token.connect(signer).approve(wcbet.address, ONE_DOGE);
    await tx.wait(1);

    tx = await wcbet.connect(signer).bet(i);
    i++;
    await tx.wait(1);
  }

  let bets = hre.ethers.BigNumber.from(0);
  for (i = 1; i < 33; i++) {
    const teamBets = await wcbet.betsPerTeam(i);
    bets = bets.add(teamBets);
  }
  console.log(`Total bets: ${bets}`);
}

main()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
