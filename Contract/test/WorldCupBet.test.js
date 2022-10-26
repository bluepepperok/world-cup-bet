const {
 time,
 loadFixture,
} = require("@nomicfoundation/hardhat-network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");

describe("World Cup", function () {
  const ONE_DOGE = 100_000_000;

  async function deployFixture() {
    const betAmount = ONE_DOGE;

    // Contracts are deployed using the first signer/account by default
    const [owner] = await ethers.getSigners();

    const TestToken = await ethers.getContractFactory("TestToken", owner);
    const token = await TestToken.deploy();

    const WorldCupBet = await ethers.getContractFactory("WorldCupBet");
    const worldCupBet = await WorldCupBet.deploy(token.address, betAmount);

    return { token, worldCupBet, betAmount, owner };
  }

  async function betAndAdvanceTimeFixture() {
    const { token, worldCupBet, betAmount, owner } = await loadFixture(deployFixture);
    const [, user] = await ethers.getSigners();
    
    const winnerTeam = 5;

    await token.approve(worldCupBet.address, betAmount);
    await worldCupBet.bet(winnerTeam);

    await token.mint(user.address, 10 * betAmount);
    await token.connect(user).approve(worldCupBet.address, betAmount);
    await worldCupBet.connect(user).bet(15);

    await time.increaseTo(1670025600 + 1);

    await worldCupBet.setWinnerTeam(winnerTeam);

    return { token, worldCupBet, betAmount, owner, user, winnerTeam };
  }

  describe("Deployment", function () {
    it("Simple deploy contract", async function () {
      const { worldCupBet, betAmount } = await loadFixture(deployFixture);

      expect(await worldCupBet.FIX_BET_AMOUNT()).to.equal(betAmount);
    });
  });

  describe("Basic functionality", function () {
    it("Should set the right owner", async function () {
      const { worldCupBet, owner } = await loadFixture(deployFixture);

      expect(await worldCupBet.owner()).to.equal(owner.address);
    });

    it("Should fail if non-owner calls setWinnerTeam", async function () {
      const { worldCupBet } = await loadFixture(deployFixture);

      const [, user] = await hre.ethers.getSigners();

      expect(worldCupBet.connect(user).setWinnerTeam(5)).to.be.rejectedWith("Only owner can call this function");
    });
  });

  describe("Betting", function () {
    it("Should allow betting", async function () {
      const { worldCupBet, betAmount, token, owner } = await loadFixture(deployFixture);

      const [, user] = await hre.ethers.getSigners();

      const team = 5;

      expect(await worldCupBet.betsPerTeam(team)).to.equal(0);

      await token.mint(user.address, 10 * betAmount);
      await token.connect(user).approve(worldCupBet.address, betAmount);
      const tx = await worldCupBet.connect(user).bet(team);

      expect(await worldCupBet.betsPerTeam(team)).to.equal(1);
    });

    it("Should fail betting when not approving enough tokens", async function () {
      const { worldCupBet, betAmount, token, owner } = await loadFixture(deployFixture);

      const [, user] = await hre.ethers.getSigners();

      const team = 5;

      await token.mint(user.address, 10 * betAmount);
      await expect(worldCupBet.connect(user).bet(team)).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("Should fail betting for an invalid team", async function () {
      const { worldCupBet, betAmount, token, owner } = await loadFixture(deployFixture);

      const [, user] = await hre.ethers.getSigners();

      const team = 33;

      await token.mint(user.address, 10 * betAmount);
      await token.connect(user).approve(worldCupBet.address, betAmount);
      await expect(worldCupBet.connect(user).bet(team)).to.be.revertedWith("Team must be a number between 1 and 32");
    });

    it("Should fail betting twice", async function () {
      const { worldCupBet, betAmount, token, owner } = await loadFixture(deployFixture);

      const [, user] = await hre.ethers.getSigners();

      const team = 5;

      await token.mint(user.address, 10 * betAmount);
      await token.connect(user).approve(worldCupBet.address, 2 * betAmount);
      const userWorldCupBet = worldCupBet.connect(user);
      await userWorldCupBet.bet(team);
      await expect(userWorldCupBet.bet(team)).to.be.revertedWith("You cannot participate twice");
    });

    it("Should fail betting when the tournament started", async function () {
      const { worldCupBet, betAmount, token, owner } = await loadFixture(deployFixture);

      const [, user] = await hre.ethers.getSigners();

      const team = 5;

      await time.increaseTo(1670025600 + 1);

      await token.mint(user.address, 10 * betAmount);
      await token.connect(user).approve(worldCupBet.address, betAmount);
      await expect(worldCupBet.connect(user).bet(team)).to.be.revertedWith("Bets are closed");
    });
  });

  describe("Setting winning team", function () {
    it("Should fail setting winning team before tournament starts", async function () {
      const { worldCupBet } = await loadFixture(deployFixture);

      const team = 5;

      await expect(worldCupBet.setWinnerTeam(team)).to.be.revertedWith("Bets must be closed");
    });

    it("Should allow a team with no bets", async function () {
      const { worldCupBet } = await loadFixture(deployFixture);

      const team = 5;

      await time.increaseTo(1670025600 + 1);

      await worldCupBet.setWinnerTeam(team);
      expect(await worldCupBet.prizeAmountPerWinner()).to.equal(0);
    });

    it("Should allow a team with some bets", async function () {
      const { worldCupBet, betAmount, token } = await loadFixture(deployFixture);

      const team = 5;

      await token.approve(worldCupBet.address, betAmount);
      await worldCupBet.bet(team);

      await time.increaseTo(1670025600 + 1);

      await worldCupBet.setWinnerTeam(team);
      expect(await worldCupBet.prizeAmountPerWinner()).to.equal(betAmount);
    });
  });

  describe("Claiming prize", function () {
    it("Should fail claiming the prize before the winner is decided", async function () {
      const { worldCupBet, owner, token } = await loadFixture(deployFixture);

      expect(worldCupBet.collectPrize()).to.be.revertedWith("Winner of the world cup has not been decided yet");
    });

    it("Should allow claiming the prize when betting for the winning team", async function () {
      const { worldCupBet, owner, token, winnerTeam } = await loadFixture(betAndAdvanceTimeFixture);

      const balance = await token.balanceOf(owner.address);
      const prizeAmountPerWinner = await worldCupBet.prizeAmountPerWinner();

      await worldCupBet.collectPrize();

      expect(await token.balanceOf(owner.address)).to.equal(balance.add(prizeAmountPerWinner));
    });

    it("Should fail when claiming without betting", async function () {
      const { worldCupBet } = await loadFixture(betAndAdvanceTimeFixture);

      const [, user] = await hre.ethers.getSigners();

      await expect(worldCupBet.connect(user).collectPrize()).to.be.revertedWith("Unfortunately you have not betted to the winner team");
    });

    it("Should fail claiming the prize twice", async function () {
      const { worldCupBet, owner, token, winnerTeam } = await loadFixture(betAndAdvanceTimeFixture);

      const balance = await token.balanceOf(owner.address);
      const prizeAmountPerWinner = await worldCupBet.prizeAmountPerWinner();

      await worldCupBet.collectPrize();

      await expect(worldCupBet.collectPrize()).to.be.revertedWith("Already paid to you!");
    });
  });

});
