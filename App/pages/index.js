import React, { useEffect, useState } from "react";
import { Col, Row, Button, Container, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { ethers } from "ethers";
import Welcome from "../components/Welcome/Welcome";
import { useGlobalState } from "../store/connectionState";

export default function Home() {
  let countriesRaw = [
    { name: "Brazil", flag: "/countryFlags/br-flag.gif", bets: "", id: 1 },
    { name: "Cameroon", flag: "/countryFlags/cm-flag.gif", bets: "", id: 2 },
    { name: "Germany", flag: "/countryFlags/gm-flag.webp", bets: "", id: 3 },
    { name: "France", flag: "/countryFlags/fr-flag.webp", bets: "", id: 4 },
    { name: "Costa Rica", flag: "/countryFlags/cs-flag.webp", bets: "", id: 5 },
    { name: "Spain", flag: "/countryFlags/sp-flag.webp", bets: "", id: 6 },
    { name: "England", flag: "/countryFlags/en-flag.webp", bets: "", id: 7 },
    { name: "Argentina", flag: "/countryFlags/ar.gif", bets: "", id: 8 },
    { name: "Belgium", flag: "/countryFlags/be-flag.webp", bets: "", id: 9 },
    { name: "Canada", flag: "/countryFlags/ca-flag.webp", bets: "", id: 10 },
    { name: "Uruguay", flag: "/countryFlags/uy-flag.gif", bets: "", id: 11 },
    { name: "Denmark", flag: "/countryFlags/da-flag.webp", bets: "", id: 12 },
    {
      name: "Netherlands",
      flag: "/countryFlags/nl-flag.webp",
      bets: "",
      id: 13,
    },
    { name: "Ghana", flag: "/countryFlags/gh-flag.gif", bets: "", id: 14 },
    { name: "Poland", flag: "/countryFlags/pl-flag.webp", bets: "", id: 15 },
    { name: "Ecuador", flag: "/countryFlags/ec-flag.webp", bets: "", id: 16 },
    { name: "Portugal", flag: "/countryFlags/po-flag.gif", bets: "", id: 17 },
    {
      name: "Switzerland",
      flag: "/countryFlags/sz-flag.webp",
      bets: "",
      id: 18,
    },
    { name: "Wales", flag: "/countryFlags/wa-flag.png", bets: "", id: 19 },
    { name: "Australia", flag: "/countryFlags/as-flag.webp", bets: "", id: 20 },
    { name: "Croatia", flag: "/countryFlags/hr-flag.webp", bets: "", id: 21 },
    { name: "Iran", flag: "/countryFlags/ir-flag.webp", bets: "", id: 22 },
    { name: "Denmark", flag: "/countryFlags/da-flag.webp", bets: "", id: 23 },
    { name: "Tunisia", flag: "/countryFlags/ts-flag.webp", bets: "", id: 24 },
    {
      name: "Saudi Arabia",
      flag: "/countryFlags/sa-flag.webp",
      bets: "",
      id: 25,
    },
    { name: "Senegal", flag: "/countryFlags/sg-flag.gif", bets: "", id: 26 },
    { name: "Morocco", flag: "/countryFlags/mo-flag.gif", bets: "", id: 27 },
    { name: "Qatar", flag: "/countryFlags/qa-flag.gif", bets: "", id: 28 },
    { name: "Serbia", flag: "/countryFlags/ri-flag.gif", bets: "", id: 29 },
    { name: "Mexico", flag: "/countryFlags/mx-flag.webp", bets: "", id: 30 },
    {
      name: "South Korea",
      flag: "/countryFlags/ks-flag.webp",
      bets: "",
      id: 31,
    },
    { name: "Japan", flag: "/countryFlags/ja-flag.webp", bets: "", id: 32 },
  ];

  const [countries, setCountries] = useState(() => countriesRaw);
  const [showMetamaskRequired, setShowMetamaskRequired] = React.useState(false);
  const [contractConexionFailure, setContractConexionFailure] = React.useState(false);
  const [fixedBetAmountGlobal, setFixedBetAmountGlobal] = useGlobalState("fixedBetAmount");
  const [jackpot, setJackpot] = React.useState("");
  const [tokenAbi, setTokenAbi] = React.useState();
  const [wcbAbi, setWcbAbi] = React.useState();
  const [wcbAddress, setWcbAddress] = React.useState("");
  const [repeatedAddress, setRepeatedAddress] = React.useState(false);
  const [showMessageAlreadyBet, setShowMessageAlreadyBet] = React.useState(false);
  const [firstLoad, setFirstLoad] = React.useState(false);
  const [betResult, setBetResult] = React.useState("");
  const [txExplorerUrl, setTxExplorerUrl] = React.useState("");
  const [betTxHash, setBetTxHash] = React.useState("");
  const [totalBets, setTotalBets] = React.useState("");
  const [teamBet, setTeamBet] = React.useState(-1);
  const [tokenAddressGlobal, setTokenAddressGlobal] = useGlobalState("tokenAddress");
  const [balanceGlobal, setBalanceGlobal] = useGlobalState("balance");
  const [fixedBetAmountSatoshis, setFixedBetAmountSatoshis] = React.useState(0);

  const dogeDivisor = ethers.BigNumber.from(10 ** 8);

  useEffect(() => {
    if (!firstLoad) {
      setFirstLoad(true);
      getBets();
      console.log("BETS: ", countries);
      getAbi();
      checkRepeated();
    }

    async function checkRepeated() {
      if (!window.ethereum || !window.ethereum.selectedAddress) return;
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/checkRepeatedAddress?address=${window.ethereum.selectedAddress}`
      );
      const data = await response.json();

      if (data.repeatedAddress) {
        setRepeatedAddress(true);
      }

      setTeamBet(data.team || "");
    }

    async function getAbi() {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/abi`);
      const data = await res.json();
      setTokenAbi(data.tokenAbi);
      setWcbAbi(data.wcbAbi);
      setTokenAddressGlobal(data.tokenAddress);
      setWcbAddress(data.wcbAddress);
    }

    async function getBets() {
      console.log("GETTING BETS FROM ");
      console.log(process.env.NEXT_PUBLIC_BASE_URL);

      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/getBets`);
      const data = await res.json();

      console.log("DATA: ", data);

      //Check if contract is ok
      if (data.contractStatus == "failure") {
        setContractConexionFailure(true);
        return;
      }

      let fixedBet = ethers.BigNumber.from(data.fixedBetAmount); //Convert to BigNumber
      fixedBet = fixedBet.div(dogeDivisor).toString(); //Convert to Decimal

      setFixedBetAmountSatoshis(data.fixedBetAmount);
      setFixedBetAmountGlobal(fixedBet);

      setJackpot(data.jackpot);
      let tempArr = [...countriesRaw];
      let totalBets = 0;
      for (let i = 0; i < countries.length; i++) {
        tempArr[i].bets = data.betsPerTeam[i];
        totalBets += Number(data.betsPerTeam[i]);
      }
      console.log("COUNTRIES ", tempArr);
      tempArr.sort((a, b) => b.bets - a.bets);
      setCountries(tempArr);
      setTotalBets(totalBets);
    }
  }, []);

  async function isConnected() {
    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (accounts.length) {
      return true;
    } else {
      return false;
    }
  }

  async function bet(numTeam) {
    // Check if we already checked for what team we bet.
    // If none is 0, if we don't know yet is -1.
    if (Number(fixedBetAmountGlobal) > Number(balanceGlobal)) {
      setBetResult("Not enough wDoge balance");
      return;
    }

    if (teamBet < 0) {
      return;
    }

    //Check for walllet
    if (!window.ethereum) {
      return;
    }

    //Check if user is connected
    let connected = await isConnected();
    if (!connected) {
      setBetResult("Please connect your wallet");
      return;
    }

    //Check if user has already bet
    if (repeatedAddress) {
      setShowMessageAlreadyBet(true);
      return;
    }

    //Check the network is correct
    const chainId = await ethereum.request({ method: "eth_chainId" });
    if (chainId !== process.env.NEXT_PUBLIC_NETWORK_ID) {
      return;
    }

    //Make transaction
    const provider = new ethers.providers.Web3Provider(window.ethereum); // Metamask

    const signer = await provider.getSigner(); //Signer

    const token = new ethers.Contract(
      tokenAddressGlobal,
      tokenAbi, //Token abi
      signer
    );

    const worldCupBet = new ethers.Contract(wcbAddress, wcbAbi, signer);
    const betAmount = fixedBetAmountSatoshis;

    let result;

    try {
      let txApprove = await token.approve(wcbAddress, betAmount); //Set a limit amount of tokens that the contract may use.
      setBetResult("aprove tx confirming... please, wait a few seconds...");
      result = await provider.waitForTransaction(txApprove.hash, 1, 300000);
    } catch (error) {
      console.log("error approving", error);
      setBetResult("Error approving tokens");
      return;
    }

    if (result.status) {
    } else {
      setBetResult("Oops! There was a problem approving your tokens");
      return;
    }

    setBetResult("Processing your bet");
    let txBet;
    try {
      debugger;
      txBet = await worldCupBet.bet(numTeam);
    } catch (error) {
      console.log("ERROR: ", error);
      setBetResult("Error placing your bet");
      return;
    }

    let receiptBet = await txBet.wait(1);
    console.log("receiptBet:", receiptBet);

    if (process.env.NEXT_PUBLIC_NETWORK == "mainnet") {
      setTxExplorerUrl("https://etherscan.io/tx/");
    } else {
      setTxExplorerUrl("https://goerli.etherscan.io/tx/");
    }

    if (receiptBet.status === 1) {
      setBetResult("Yeah! Your bet was placed");
      setTeamBet(numTeam); //Set the team we bet
      updateBetCounter(numTeam); //Update the bets per team

      setBetTxHash(txBet.hash);
    } else {
      setBetResult("Oops! There was a problem with your bet. Please try again.");
      return;
    }
  }

  function updateBetCounter(numTeam) {
    let tempArrCountries = [...countries];
    for (let i = 1; i < tempArrCountries.length; i++) {
      if (tempArrCountries[i].id == numTeam) {
        tempArrCountries[i].bets++;
      }
    }
    tempArrCountries.sort((a, b) => b.bets - a.bets);
    setCountries([...tempArrCountries]);
  }

  return (
    <Container>
      {!showMetamaskRequired && <Welcome></Welcome>}
      {betResult && (
        <Row>
          <Col className="text-center mt-5">
            <span>{betResult}</span>
            <br></br>
            {txExplorerUrl && (
              <span ç>
                tx:
                <a target="_blank" rel="noreferrer" href={txExplorerUrl + betTxHash}>
                  {betTxHash}
                </a>
              </span>
            )}
          </Col>
        </Row>
      )}
      {contractConexionFailure && (
        <Row>
          <Col className="text-center mt-5">
            <span>There was a problem, please try again later</span>
          </Col>
        </Row>
      )}
      {showMessageAlreadyBet && (
        <Row>
          <Col className="text-center mt-4">
            <span>You can make only one bet per address</span>
          </Col>
        </Row>
      )}
      {!contractConexionFailure && jackpot != "" && (
        <Row>
          <Col className="text-center mt-4">
            <span> Jackpot: wDoge{jackpot}</span>
            <br></br>
            <span>Bet Amount: {fixedBetAmountGlobal} wDoge</span>
            <br></br>
            <span>
              Total Bets: {totalBets} <br></br>
            </span>
          </Col>
        </Row>
      )}
      <Row lg={6} className="mt-5 text-center align-items-center justify-items-center">
        {!contractConexionFailure &&
          countries.map((country, i) => (
            <Col key={i} xs="6" md="3">
              <Card
                onClick={() => bet(country.id)}
                className={
                  teamBet === country.id ? "team_bet_selected mb-5 border-0" : "mb-5 border-0 team_bet"
                }
                style={{ maxWidth: "150px", margin: "auto" }}
              >
                <Card.Img
                  className="image_hover"
                  style={{
                    height: "110px",
                    overflow: "hidden",
                    objectFit: "cover",
                  }}
                  src={country.flag}
                />
                <Card.Body>
                  <Card.Title style={{ fontSize: "15px" }}>
                    <span>
                      {" "}
                      {teamBet === country.id ? "Your bet is" : "Bet For "} <br></br>
                      {country.name}
                    </span>
                  </Card.Title>
                  <Card.Text style={{ fontSize: "16px" }}> Bets {country.bets || ""}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
      </Row>
    </Container>
  );
}
