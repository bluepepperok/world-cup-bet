import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import { ethers } from "ethers";
import { Button, Container, Row, Col } from "react-bootstrap";
import { useGlobalState } from "../../store/connectionState";

export default function Welcome(props) {
  const [showMetamaskRequired, setShowMetamaskRequired] = React.useState(false);
  const [accountConnected, setAccountConnected] = React.useState("");
  const [showText, setShowText] = React.useState(false);
  const [connectedGlobal, setConnectedGlobal] = useGlobalState("connected");

  {/* prettier-ignore */}

  const textWelcome = `Hey! The World Cup is coming and what better moment to make a betting game than the international Dogeathon? So, first of all.

  What is wDoge?
  
  wDoge is token on the ethereum Network. To be more precise, it is a wrapped token. It means that each token represents the same amount of another coin, in this case, Dogecoin.
  
  But... Why do we need to wrap Dogecoin?
  
  Well, the answer is simple. Ethereum allows the creation of smart contracts. Programs on the blockchain that allow the creation of open programs that can't be modified by anyone.
  Just like this game, once it is created, the rules are clear and can't be modified.
  
  So, if you want to participate in this game, you need to:
  
  1) Connect your Metamask wallet click on the button.
  2) Choose your favorite team.
  3) Approve the amount of money to bet. The amount is already fixed on 50 wDoges per address. And remember 1 wDoge = 1 Doge!
  4) Wait until the World Cup is over and We know who is the Champion.
  5) Collect your prize if you won.
  
  If there is more than one winner, the Jackpot will be divided equally among them (those who chose the actual champion).
  
  Much luck!`;
  {/* prettier-ignore */}

  useEffect(() => {
    checkWalletInstalled();

    if (window.ethereum) {
      isConnected();

      window.ethereum.on("accountsChanged", function (accounts) {
        isConnected();
      });
    }
  }, []);

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
      console.log("Metamask is not connected");
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

  return (
    <Row className="mt-5 align-items-center text-center justify-content-center text-welcome">
      <Col lg={12} className="text-center ">
        <h1 className="h2">Welcome to the World Cup Bet</h1>
      </Col>
      <Col lg={6} className="text-center">
        <p style={{ whiteSpace: "pre-wrap", textAlign: "left", marginTop: "30px", color: "#676767" }}>
          {showText ? textWelcome : textWelcome.substring(0, 126) + "..."}
          {!showText && (
            <a
              style={{ color: "#373737", textDecoration: "none" }}
              href="#"
              onClick={() => setShowText(true)}
            >
              see more
            </a>
          )}
          {showText && (
            <a
              style={{ color: "#373737", textDecoration: "none" }}
              href="#"
              onClick={() => setShowText(false)}
            >
              {" "}
              see less
            </a>
          )}
        </p>

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
}
