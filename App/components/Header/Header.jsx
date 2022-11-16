import ReactGA4 from "react-ga4";
import React, { useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { Button, Container, Image, Row, Col } from "react-bootstrap";
import { ethers } from "ethers";
import { useGlobalState } from "../../store/connectionState";
import { getChainId } from "../../frontend/network";

ReactGA4.initialize(process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_GA4_ID);

export default function Header() {
  const [accountConnected, setAccountConnected] = React.useState("");
  const [showBalance, setShowBalance] = React.useState(false);
  const [listeningConnection, setListeningConnection] = React.useState(false);
  const [connectedGlobal, setConnectedGlobal] = useGlobalState("connected");
  const [tokenAddressGlobal, setTokenAddressGlobal] = useGlobalState("tokenAddress");
  const [balanceGlobal, setBalanceGlobal] = useGlobalState("balance");
  const [wrongNetwork, setWrongNetwork] = React.useState(false);
  const [fixedBetAmountGlobal, setFixedBetAmountGlobal] = useGlobalState("fixedBetAmount");
  const [loadedOnce, setLoadedOnce] = React.useState(false);

  const dogeDivisor = ethers.BigNumber.from(10 ** 8);

  useEffect(() => {
    //Google Analytics
    if (process.env.NEXT_PUBLIC_NETWORK == "mainnet") {
      setLoadedOnce(true);
      ReactGA4.send({ hitType: "pageview", page: window.location.pathname });
    }

    //Check if there is a wallet available
    if (window.ethereum) {
      isConnected();

      getBalance();

      //Create only one listener for connections events
      if (!listeningConnection) {
        window.ethereum.on("accountsChanged", function (accounts) {
          isConnected();

          if (accounts.length > 0) {
            getBalance();
          } else {
            setShowBalance(false);
          }
        });
        setListeningConnection(true);
      }

      async function getBalance() {
        const { tokenAbi, tokenAddress } = await getAbi();
        await checkBalance(tokenAbi, tokenAddress, true);
      }
    }
  }, []);

  async function getAbi() {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/abi`);
    const data = await res.json();

    return {
      tokenAbi: data.tokenAbi,
      tokenAddress: data.tokenAddress,
    };
  }

  async function checkBalance(tokenAbi, tokenAddress) {
    //If there is no connection, return
    const conn = await isConnected();
    if (!conn) {
      return;
    }

    //Check network
    const chainId = Number(await ethereum.request({ method: "eth_chainId" }));
    if (chainId !== getChainId(process.env.NEXT_PUBLIC_NETWORK)) {
      setWrongNetwork(true);

      return;
    }

    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts",
    });
    setAccountConnected(accounts[0]);
    setConnectedGlobal(true);

    //Make transaction
    const provider = new ethers.providers.Web3Provider(window.ethereum); // Metamask

    const signer = await provider.getSigner(); //Signer

    const signerAddress = await signer.getAddress();

    const token = new ethers.Contract(
      tokenAddress,
      tokenAbi, //Token abi
      signer
    );

    const signerBalance = await token.balanceOf(signerAddress);

    const humanReadableBalance = signerBalance.div(dogeDivisor).toString();

    setBalanceGlobal(humanReadableBalance);
    setShowBalance(true);
  }

  async function isConnected() {
    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (accounts.length) {
      setAccountConnected(window.ethereum.selectedAddress);
      setConnectedGlobal(true);

      return true;
    } else {
      setConnectedGlobal(false);
      return false;
    }
  }

  async function addToken() {
    // Here we prompt the user to add the WDOGE token

    const tokenOptions = {
      address: tokenAddressGlobal,
      symbol: "WDOGE",
      decimals: 8,
    };
    if (process.env.NEXT_PUBLIC_NETWORK === "mainnet") {
      tokenOptions.image = "https://wdoge.tech/wdoge-symbol.svg";
    }

    try {
      await ethereum.request({
        method: "wallet_watchAsset",
        params: {
          type: "ERC20",
          options: tokenOptions,
        },
      });
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Container fluid className="pt-5   ">
      <Row xs="12" md="3" className="text-center">
        <Col>
          <div
            style={{ justifyContent: "space-between", background: "#fff" }}
            className=" navbar navbar-expand-lg 
    navbar-light fixed-top py-lg-0 "
          >
            <Row xs="12" md="3" className="text-center">
              <Col>
                <a href="https://dogecoin.com/dogeathon/" target="_blank" rel="noreferrer">
                  <Image
                    alt="Dogeathon"
                    className="mt-3 mx-3"
                    style={{ maxWidth: "130px" }}
                    src="/logos/hackaton-logo.png"
                  ></Image>
                </a>
              </Col>

              <Col>
                <a href="https://wdoge.tech/" target="_blank" rel="noreferrer">
                  <Image
                    alt="wDoge"
                    className="mt-2"
                    style={{ maxWidth: "130px" }}
                    src="/logos/wdoge-logo.png"
                  ></Image>
                </a>
              </Col>
              <Col>
                <a href="https://bluepepper.io/" target="_blank" rel="noreferrer">
                  <Image
                    alt="Bluepepper"
                    className="mt-2"
                    style={{ maxWidth: "130px" }}
                    src="/logos/blue-pepper.png"
                  ></Image>
                </a>
              </Col>
            </Row>
            <div className="buttons-header">
              {connectedGlobal && !wrongNetwork && (
                <span style={{ fontSize: "14px" }}>
                  <strong>Connected to: </strong> {accountConnected.substring(0, 4)}...
                  {accountConnected.substring(accountConnected.length - 4, accountConnected.length)}
                </span>
              )}

              {showBalance && (
                <span style={{ fontSize: "14px", marginLeft: "15px" }}>
                  <strong>Balance:</strong>{" "}
                  <span
                    className={
                      Number(balanceGlobal) >= Number(fixedBetAmountGlobal) ? "balance_ok" : "balance_not_ok"
                    }
                  >
                    {balanceGlobal} wDoge
                  </span>
                </span>
              )}

              {connectedGlobal && !wrongNetwork && (
                <Button
                  className="my-2 mx-3"
                  style={{
                    border: "1px solid #ffb300",
                    color: "#000000",
                    padding: "12px 10px",
                    fontSize: "14px",
                  }}
                  variant="outline-primary"
                  onClick={() => addToken()}
                >
                  Show wDoge in Metamask
                </Button>
              )}

              {connectedGlobal && wrongNetwork && (
                <span style={{ color: "red", fontSize: "14px", marginRight: "15px" }}>
                  Please change the network in Metamask to{" "}
                  {process.env.NEXT_PUBLIC_NETWORK.substring(0, 1).toUpperCase() +
                    process.env.NEXT_PUBLIC_NETWORK.substring(1, process.env.NEXT_PUBLIC_NETWORK.length) +
                    " "}
                </span>
              )}
              <a
                className="twitter-share-button"
                href="https://twitter.com/intent/tweet?text=Hey%20%40BluePepperOk%21%20I%20want%20some%20free%20wDoges%20to%20bet%20on%20the%20Dogeathon%20World%20Cup%20Bet%21%20%40wDoge%20%23Doge%20%23dogeathon%20%23WorldCupBet%0D%0A%0D%0Ahttps%3A%2F%2Fworldcup.bluepepper.io"
                target="_blank"
                rel="noreferrer"
              >
                <Button
                  variant="outline-primary"
                  style={{
                    padding: "12px 10px",
                    background: "#f7d592",
                    border: "1px solid #FFD700",
                    color: "#000",
                    fontSize: "14px",
                    marginRight: "15px",
                  }}
                  className="my-2"
                >
                  Get some wDoges
                </Button>
              </a>
            </div>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
