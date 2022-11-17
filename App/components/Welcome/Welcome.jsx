import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { ethers } from "ethers";
import { Button, Container, Row, Col, Image } from "react-bootstrap";
import { useGlobalState } from "../../store/connectionState";

export default function Welcome() {
  const [showMetamaskRequired, setShowMetamaskRequired] = React.useState(false);
  const [accountConnected, setAccountConnected] = React.useState("");
  const [showText, setShowText] = React.useState(false);
  const [connectedGlobal, setConnectedGlobal] = useGlobalState("connected");
  const [useGoogleChromeMessage, setUseGoogleChromeMessage] = React.useState(false);

  useEffect(() => {
    checkWalletInstalled();
    setUseGoogleChromeMessage(!isGoogleChromeOrFirefox());

    if (window.ethereum) {
      isConnected();

      window.ethereum.on("accountsChanged", function (accounts) {
        isConnected();
      });
    }
  }, []);

  function isGoogleChromeOrFirefox() {
    let isChromium = window.chrome;
    let winNav = window.navigator;
    let isOpera = typeof window.opr !== "undefined";
    let isIEedge = winNav.userAgent.indexOf("Edg") > -1;
    let isIOSChrome = winNav.userAgent.match("CriOS");
    let isFirefox = winNav.userAgent.toLowerCase().indexOf("firefox") > -1;

    if (isIOSChrome || isFirefox) {
      return true;
    } else if (
      isChromium !== null &&
      typeof isChromium !== "undefined" &&
      isOpera === false &&
      isIEedge === false
    ) {
      return true;
    } else {
      return false;
    }
  }

  function checkWalletInstalled() {
    if (typeof window.ethereum === "undefined") {
      setShowMetamaskRequired(true);
      return false;
    }
  }

  async function isConnected() {
    const accounts = await ethereum.request({ method: "eth_accounts" });
    if (accounts.length) {
      console.log(`You're connected to: ${accounts[0]}`);

      setAccountConnected(window.ethereum.selectedAddress);
      setConnectedGlobal(true);

      return true;
    } else {
      setConnectedGlobal(false);
      return false;
    }
  }

  async function handleConnection() {
    //Check if Metamask is installed
    if (!window.ethereum) {
      setShowMetamaskRequired(true);
      return;
    }

    // A Web3Provider wraps a standard Web3 provider, which is
    // what MetaMask injects as window.ethereum into each page
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    // MetaMask requires requesting permission to connect users accounts
    await provider.send("eth_requestAccounts", []);
  }
  /* prettier-ignore */
  return (
    <Row className="mt-5 align-items-center text-center justify-content-center text-welcome">
      <Col lg={12} className="text-center ">
        <Image src="shiba-soccer.png" style={{maxWidth:"150px"}} alt="" ></Image>
        <h1 className="h2">Welcome to the Wow Cup Bet!</h1>
      </Col>
      <Col lg={6} className="text-center">
        <p style={{ whiteSpace: "pre-wrap", textAlign: "left", marginTop: "30px", color: "#676767" }}>
          {showText && (
            <p style={{padding:"20px", border:"1px solid #ccc", borderRadius:"15px"}}>
              {" "}

              The World Cup bet is a demo game developed as part of the Dogecoin Hackathon 2022 in Australia 🔥<br></br>
              <br></br>              
              The goal is to show the posibilities that <a target="_blank" rel="noreferrer" href="https://wdoge.tech/">wDoge</a>  brings to the Dogecoin ecosystem through
              the use of smart contracts and dapps. 👀<br></br><br></br>

              If you want to participate in this game 😎, you need to:<br></br><br></br>

              1) Have 50 wDoges in your wallet 🐶. If you don&apos;t, let us know by clicking the &apos;Get some wDoges&apos; button and we&aposll give you some for free.<br></br><br></br>
              2) Once you have wDoges, connect your Metamask wallet by clicking on the button &apos;Connect wallet to bet&apos;. Select the account where you have the wDoges.<br></br><br></br>
              3) If you don&apos;t see your wDoges in Metamask, Click on &apos;Show wDoge on Metamask&apos;. <br></br><br></br>
              4) Click on your favorite national team&apos;s flag to bet for it. 🤞<br></br><br></br>
              5) A transaction will pop up in Metamask. Approve the amount of money to bet. The amount is fixed to 50 wDoges per address.<br></br><br></br>
              6) A second transaction will pop up in metamask. Please Approve that one too. ✅<br></br><br></br>
              7) Wait until the World Cup 2022 is over and collect the prize if you bet for the winner. 😱 <br></br><br></br>
              
              The whole Jackpot will be divided equally among the winners. 🎉<br></br><br></br>

              <strong>Much luck!</strong><br></br><br></br>

              IMPORTANT: This is just a demo game in the context of the Dogecoin Hackathon in Australia.
              It&apos;s not intended to be a gambling site and no company will make a profit out of it.
              All wDoges for this game will be given to hackathon participants for free.
                        
            </p>
          )}
          {!showText && " The World Cup bet is a demo game developed as part of the Dogecoin Hackathon 2022 in Australia 🔥  "}
          {!showText && (
            <a
              style={{ color: "#373737", textDecoration: "none" }}
              href="#"
              onClick={() => setShowText(true)}
            >
              See more
            </a>
          )}
          {showText && (
            <a
              style={{ color: "#373737", textDecoration: "none" }}
              href="#"
              onClick={() => setShowText(false)}
            >
              {" "}
              See less
            </a>
          )}
        </p>

        {useGoogleChromeMessage && 
        (<Row className="">
          <Col>
            <span style={{ color: "red" }}>Bets are only available on Google Chrome and Mozilla Firefox.</span>
          </Col>
        </Row>
        )}

        {!connectedGlobal && !showMetamaskRequired && (
          <Row className="d-none d-lg-block">
            <Col>
              <Button onClick={() => handleConnection()} className="mt-4">
                Connect Wallet to Bet
              </Button>
            </Col>
          </Row>
        )}

        <Row className="d-block d-lg-none">
          <Col>
            <span style={{ color: "red" }}>Bets are only available on desktop version.</span>
          </Col>
        </Row>

        {showMetamaskRequired && (
          <span>
            You will need to install{" "}
            <a target="_blank" rel="noreferrer" href="https://metamask.io/download/">
              Metamask Chrome Extension
            </a>
          </span>
        )}
      </Col>
    </Row>
  );
  /* prettier-ignore */
}
