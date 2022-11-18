import React, { useEffect, useState } from "react";
import { Spinner, Col, Row, Button, Container, Card } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import { ethers } from "ethers";
import Welcome from "../components/Welcome/Welcome";
import { useGlobalState } from "../store/connectionState";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { getChainId } from "../frontend/network";

const countriesRaw = Object.freeze([
  createCountry("Brazil", "/countryFlags/br-flag.gif", 1),
  createCountry("Cameroon", "/countryFlags/cm-flag.gif", 2),
  createCountry("Germany", "/countryFlags/gm-flag.webp", 3),
  createCountry("France", "/countryFlags/fr-flag.webp", 4),
  createCountry("Costa Rica", "/countryFlags/cs-flag.webp", 5),
  createCountry("Spain", "/countryFlags/sp-flag.webp", 6),
  createCountry("England", "/countryFlags/en-flag.webp", 7),
  createCountry("Argentina", "/countryFlags/ar.gif", 8),
  createCountry("Belgium", "/countryFlags/be-flag.webp", 9),
  createCountry("Canada", "/countryFlags/ca-flag.webp", 10),
  createCountry("Uruguay", "/countryFlags/uy-flag.gif", 11),
  createCountry("Denmark", "/countryFlags/da-flag.webp", 12),
  createCountry("Netherlands", "/countryFlags/nl-flag.webp", 13),
  createCountry("Ghana", "/countryFlags/gh-flag.gif", 14),
  createCountry("Poland", "/countryFlags/pl-flag.webp", 15),
  createCountry("Ecuador", "/countryFlags/ec-flag.webp", 16),
  createCountry("Portugal", "/countryFlags/po-flag.gif", 17),
  createCountry("Switzerland", "/countryFlags/sz-flag.webp", 18),
  createCountry("Wales", "/countryFlags/wa-flag.png", 19),
  createCountry("Australia", "/countryFlags/as-flag.webp", 20),
  createCountry("Croatia", "/countryFlags/hr-flag.webp", 21),
  createCountry("Iran", "/countryFlags/ir-flag.webp", 22),
  createCountry("Denmark", "/countryFlags/da-flag.webp", 23),
  createCountry("Tunisia", "/countryFlags/ts-flag.webp", 24),
  createCountry("Saudi Arabia", "/countryFlags/sa-flag.webp", 25),
  createCountry("Senegal", "/countryFlags/sg-flag.gif", 26),
  createCountry("Morocco", "/countryFlags/mo-flag.gif", 27),
  createCountry("Qatar", "/countryFlags/qa-flag.gif", 28),
  createCountry("Serbia", "/countryFlags/ri-flag.gif", 29),
  createCountry("Mexico", "/countryFlags/mx-flag.webp", 30),
  createCountry("South Korea", "/countryFlags/ks-flag.webp", 31),
  createCountry("Japan", "/countryFlags/ja-flag.webp", 32),
]);

function createCountry(name, flag, id) {
  return {
    name,
    flag,
    id,
    bets: 0,
  };
}

export default function Home() {
  const [countries, setCountries] = useState(() => countriesRaw);
  const [showMetamaskRequired, setShowMetamaskRequired] = React.useState(false);
  const [contractConexionFailure, setContractConexionFailure] = React.useState(false);
  const [fixedBetAmountGlobal, setFixedBetAmountGlobal] = useGlobalState("fixedBetAmount");
  const [jackpot, setJackpot] = React.useState("");
  const [tokenAbi, setTokenAbi] = React.useState();
  const [wcbAbi, setWcbAbi] = React.useState();
  const [wcbAddress, setWcbAddress] = React.useState("");
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
      load();
    }

    const handleAccountsChanged = (accounts) => {
      console.log("Accounts changed!");
      checkRepeated(accounts[0]).catch((error) => {
        console.error(error.stack || error);
      });
    };

    async function load() {
      await getBets();
      await getAbi();
      if (!window.ethereum) {
        return;
      }
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      const selectedAddress = window.ethereum.selectedAddress;
      await checkRepeated(selectedAddress);
    }

    async function checkRepeated(account) {
      if (!account) {
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL}/api/checkRepeatedAddress?address=${account}`
      );
      const data = await response.json();

      setTeamBet(data.team);
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
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/getBets`);
      const data = await res.json();

      //Check if contract is ok
      if (data.contractStatus == "failure") {
        toast.error("There was a problem, please try again later", {
          position: toast.POSITION.TOP_CENTER,
        });

        setContractConexionFailure(true);
        return;
      }

      let fixedBet = ethers.BigNumber.from(data.fixedBetAmount); //Convert to BigNumber
      fixedBet = fixedBet.div(dogeDivisor).toString(); //Convert to Decimal

      setFixedBetAmountSatoshis(data.fixedBetAmount);
      setFixedBetAmountGlobal(fixedBet);

      setJackpot(Number(data.jackpot));
      const tempArr = [...countriesRaw];
      let totalBets = 0;
      for (let i = 0; i < countries.length; i++) {
        tempArr[i].bets = data.betsPerTeam[i];
        totalBets += Number(data.betsPerTeam[i]);
      }
      tempArr.sort((a, b) => b.bets - a.bets);
      setCountries(tempArr);
      setTotalBets(totalBets);
    }

    return () => window.removeEventListener("accountsChanged", handleAccountsChanged);
  }, []);

  async function isConnected() {
    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (accounts.length) {
      return true;
    } else {
      return false;
    }
  }

  function customToastWithSpinner(text, showSpinner = true) {
    const MsgApprove = ({ closeToast, toastProps }) => (
      <div className="text-center">
        {text}
        <br></br>
        {showSpinner && <Spinner variant="success" size="sm" animation="border" role="status"></Spinner>}
      </div>
    );

    let toastObject = toast(MsgApprove, {
      position: toast.POSITION.TOP_CENTER,
      autoClose: false,
      closeOnClick: false,
      draggable: false,
    });

    return toastObject;
  }

  async function bet(numTeam) {
    if (Number(fixedBetAmountGlobal) > Number(balanceGlobal)) {
      toast.error("Not enough wDoge balance", {
        position: toast.POSITION.TOP_CENTER,
      });
      console.error("Not enough wDoge balance");
      return;
    }

    // Check if we already checked for what team we bet.
    // If the account didn't bet, its value will be 0.
    // If we don't know whether it did or didn't bet, its value will be -1.
    if (teamBet < 0) {
      console.error("Metamask not connected");
      return;
    }

    //Check for walllet
    if (!window.ethereum) {
      console.error("No wallet");
      return;
    }

    //Check if user is connected
    const connected = await isConnected();
    if (!connected) {
      toast.error("Please connect your wallet", {
        position: toast.POSITION.TOP_CENTER,
      });
      console.error("Not connected");
      return;
    }

    //Check if user has already bet
    if (teamBet > 0) {
      toast.error("You can make only one bet per address", {
        position: toast.POSITION.TOP_CENTER,
      });
      console.error("Already bet");
      return;
    }

    //Check the network is correct
    const chainId = Number(await ethereum.request({ method: "eth_chainId" }));
    if (chainId !== getChainId(process.env.NEXT_PUBLIC_NETWORK)) {
      console.error("Wrong network");
      return;
    }

    //Show Selected Team
    let nameTeamSelected = countries.filter((country) => country.id == numTeam)[0].name;
    let message = "You selected " + nameTeamSelected;
    const teamSelectedToast = customToastWithSpinner(message, false);

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
    let approvingToast;
    debugger;

    try {
      const txApprove = await token.approve(wcbAddress, betAmount); //Set a limit amount of tokens that the contract may use.

      let message = "Approve TX confirming. Please, wait a few seconds. (step 1 of 2)";

      approvingToast = customToastWithSpinner(message);

      result = await provider.waitForTransaction(txApprove.hash, 1, 900000);
      toast.dismiss(approvingToast);
    } catch (error) {
      toast.dismiss(approvingToast);
      console.error("error approving", error);
      toast.error("Oops! There was a problem approving your tokens", {
        position: toast.POSITION.TOP_CENTER,
      });
      toast.dismiss(teamSelectedToast);
      return;
    }

    if (result.status === 1) {
    } else {
      console.error("Failed approve tx ", result.transactionHash);
      toast.error("Oops! There was a problem approving your tokens", {
        position: toast.POSITION.TOP_CENTER,
      });

      toast.dismiss(teamSelectedToast);
      return;
    }

    let processingToast;
    let txBet;
    try {
      txBet = await worldCupBet.bet(numTeam);

      let message = (
        <span>
          {" "}
          Processing your bet. <br></br> (step 2 of 2){" "}
        </span>
      );

      processingToast = customToastWithSpinner(message);
    } catch (error) {
      toast.dismiss(processingToast);
      console.error("ERROR: ", error);
      toast.error("Error placing your bet", {
        position: toast.POSITION.TOP_CENTER,
      });
      toast.dismiss(teamSelectedToast);
      return;
    }

    let receiptBet = await txBet.wait(1);
    toast.dismiss(processingToast);

    if (process.env.NEXT_PUBLIC_NETWORK == "mainnet") {
      setTxExplorerUrl("https://etherscan.io/tx/");
    } else {
      setTxExplorerUrl("https://goerli.etherscan.io/tx/");
    }

    if (receiptBet.status === 1) {
      toast.success("Yeah! Your bet was placed", {
        position: toast.POSITION.TOP_CENTER,
      });

      toast.dismiss(teamSelectedToast);
      setBetResult(true);

      setTeamBet(numTeam); //Set the team we bet
      updateBetCounter(numTeam); //Update the bets per team
      setBalanceGlobal(balanceGlobal - fixedBetAmountGlobal); //Update the balance

      setBetTxHash(txBet.hash);
    } else {
      console.error("Failed bet tx ", result.transactionHash);
      toast.error("Oops! There was a problem with your bet. Please try again.", {
        position: toast.POSITION.TOP_CENTER,
      });
      toast.dismiss(teamSelectedToast);
    }
  }

  function updateBetCounter(numTeam) {
    const tempArrCountries = [...countries];
    for (const country of tempArrCountries) {
      if (country.id == numTeam) {
        country.bets++;
        break;
      }
    }
    tempArrCountries.sort((a, b) => b.bets - a.bets);
    setCountries(tempArrCountries);
    setJackpot(jackpot + Number(fixedBetAmountGlobal));
    setTotalBets(totalBets + 1);
  }

  return (
    <Container>
      <ToastContainer />

      {!showMetamaskRequired && <Welcome></Welcome>}
      {!fixedBetAmountGlobal && (
        <Row className="mt-4 text-center">
          <Col className=" text-center">
            <Spinner variant="success" animation="border" role="status"></Spinner>
          </Col>
        </Row>
      )}
      {betResult && (
        <Row>
          <Col className="text-center mt-3">
            <span>{betResult}</span>
            <br></br>
            {txExplorerUrl && (
              <div>
                <h3>Yeah! Your bet was placed!</h3>
                <br></br>
                <span className="mt-5">
                  tx:
                  <a target="_blank" rel="noreferrer" href={txExplorerUrl + betTxHash}>
                    {betTxHash}
                  </a>
                </span>
              </div>
            )}
          </Col>
        </Row>
      )}

      {!contractConexionFailure && jackpot != "" && (
        <Row className="my-5 pt-3 pb-4 align-items-center justify-content-center text-center">
          <Col className="text-center my-3" xs="12" md="4" lg="3">
            <Card className="boxes">
              <Card.Body>
                <Card.Title>Bet Amount</Card.Title>
                <Card.Text>
                  <h3>{fixedBetAmountGlobal} wDoge</h3>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col className="text-center my-3" xs="12" md="4" lg="3">
            <Card className="boxes" style={{ border: "2px solid #ffd9007c" }}>
              <Card.Body>
                <Card.Title>Jackpot 👀</Card.Title>
                <Card.Text>
                  <h3>{jackpot} wDoge</h3>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
          <Col className="text-center my-3" xs="12" md="4" lg="3">
            <Card className="boxes">
              <Card.Body>
                <Card.Title>Total Bets</Card.Title>
                <Card.Text>
                  <h3>{totalBets} </h3>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}

      <Row>
        <Col className="text-center">
          <h2>Choose your team</h2>
        </Col>
      </Row>
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
                  className="flag image_hover"
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
