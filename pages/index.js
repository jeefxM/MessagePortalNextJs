import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import abi from "./utils/MessagePortal.json";
import { Button, TextField } from "@mui/material";

const getEthereumObject = () => window.ethereum;

/*
 * This function returns the first linked account found.
 * If there is no account linked, it will return null.
 */
const findMetaMaskAccount = async () => {
  try {
    const ethereum = getEthereumObject();

    /*
     * First make sure we have access to the Ethereum object.
     */
    if (!ethereum) {
      alert("Make sure you have Metamask!");
      return null;
    }

    // console.log("We have the Ethereum object", ethereum);
    const accounts = await ethereum.request({ method: "eth_accounts" });

    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      return account;
    } else {
      alert("No authorized account found");
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

const App = () => {
  const [currentAccount, setCurrentAccount] = useState("");
  const [userMessage, setUserMessage] = useState("");
  const [allMessages, setallMessages] = useState([]);
  const [chainId, setChainId] = useState("");
  const [currentMessages, setcurrentMessages] = useState(0);
  const contractAddress = "0x1Ce7a6D57eD253D0271AE1F91c6e3F135f45015a";

  const contractABI = abi.abi;

  function handleChange(event) {
    setUserMessage((prevMessage) => {
      return ([event.target.name] = event.target.value);
    });
  }

  const connectWallet = async () => {
    try {
      const ethereum = getEthereumObject();
      if (!ethereum) {
        alert("Get MetaMask!");
        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.error(error);
    }
  };

  const getAllMessages = async () => {
    const { ethereum } = window;

    if (window.ethereum.chainId != 0x5) {
      alert("Switch to Goerli testnet to use this function!");
      return;
    }

    try {
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const messagePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        setChainId(window.ethereum.chainId);

        const userMessages = await messagePortalContract.getAllMessages();

        const mappedMessages = userMessages.map((userInfo) => {
          return {
            from: userInfo.messageSender,
            message: userInfo.message,
            timestamp: new Date(userInfo.timestamp * 1000),
            luckyNumber: userInfo.luckyNumber.toNumber(),
            hasWon: userInfo.hasWon,
          };
        });
        setallMessages(mappedMessages);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const message = async () => {
    try {
      const { ethereum } = window;

      if (window.ethereum.chainId != 0x5) {
        alert("Switch to Goerli testnet to use this function!");
        return;
      }

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const messagePortalContract = new ethers.Contract(
          contractAddress,
          contractABI,
          signer
        );

        let count = await messagePortalContract.getTotalMessages();
        console.log("Retrieved total message count...", count.toNumber());
        setcurrentMessages(count.toNumber());

        const messageTxn = await messagePortalContract.sendMessage(userMessage);
        console.log("Mining...", messageTxn.hash);

        await messageTxn.wait();
        console.log("Mined -- ", messageTxn.hash);

        count = await messagePortalContract.getTotalMessages();
        console.log("Retrieved total message count...", count.toNumber());
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getAccount = async () => {
    const account = await findMetaMaskAccount();
    if (account !== null) {
      setCurrentAccount(account);
      getAllMessages();
    }
  };

  useEffect(() => {
    getAccount();
  }, []);

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header">Hey there! 👋 </div>

        <div className="bio">
          I am David and I am on my way to become a Blockchain Developer. In
          this contract you can send me a message and it will be stored on the
          blockchain. Currently this Dapp is hosted on Goerli testnet🌋⚒️{" "}
          <br></br> I have also included a prize amount of 0.001 ether if you
          get a random number which is more than or equal to 50 you will win the
          prize! 💸
          <br></br> Merry christmas you filthy animal !
        </div>

        <div className="ButtonGroup">
          <TextField
            name="text"
            placeholder="Type your Text Here ! "
            onChange={handleChange}
          ></TextField>

          {!currentAccount && (
            <Button
              variant="contained"
              className="waveButton"
              onClick={connectWallet}
            >
              Connect Wallet
            </Button>
          )}

          <Button variant="contained" className="waveButton" onClick={message}>
            Send a message
          </Button>

          <Button
            variant="contained"
            className="waveButton"
            onClick={getAllMessages}
          >
            Get all messages
          </Button>

          {/* <Button>click me</Button> */}

          <span>Current Account: {currentAccount}</span>

          {allMessages.map((message, index) => {
            return (
              <div
                key={index}
                style={{
                  backgroundColor: "OldLace",
                  marginTop: "16px",
                  padding: "8px",
                }}
              >
                <div>Address: {message.from}</div>
                <div>Time: {message.timestamp.toString()}</div>
                <div>Message: {message.message}</div>
                <div>Random Number: {message.luckyNumber}</div>
                <div>Won The Prize: {message.hasWon ? "true" : "false"}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default App;
