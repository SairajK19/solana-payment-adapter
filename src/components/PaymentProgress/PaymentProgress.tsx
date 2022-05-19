import React, { useEffect, useRef, useState } from "react";
import solanaLogo from "../../assets/solana_logo.png";
import product from "../../assets/product.png";
import usdc from "../../assets/usdc.png";
import ProgressBar from "@ramonak/react-progress-bar";
import { Line, Circle } from "rc-progress";

import "./PaymentProgress.css";
import { Close } from "../Close/Close";
import { useWallet } from "@solana/wallet-adapter-react";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { idl } from "../../idl";
import { TOKEN_PROGRAM_ID, TokenInstructions } from "@project-serum/token";
import {
  getAccount,
  getOrCreateAssociatedTokenAccount,
} from "@solana/spl-token";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

const SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID: PublicKey = new PublicKey(
  "ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL"
);

async function findAssociatedTokenAddress(
  walletAddress: PublicKey,
  tokenMintAddress: PublicKey
): Promise<PublicKey> {
  return (
    await PublicKey.findProgramAddress(
      [
        walletAddress.toBuffer(),
        TOKEN_PROGRAM_ID.toBuffer(),
        tokenMintAddress.toBuffer(),
      ],
      SPL_ASSOCIATED_TOKEN_ACCOUNT_PROGRAM_ID
    )
  )[0];
}

const USDC_MINT = new PublicKey("BCNR5AVuUqUVfm5qhEpAhJa3QTZHZnp7Ma8DvEnpcHSm"); // devnet
// const USDC_MINT = new PublicKey("73P6wmhuwJm661EN6ahFdYDP9dJGmAwjnAsCF2E3ajB9"); // testnet
// const USDC_MINT = new PublicKey("4EQC6nruC7i67bDLWaBqdhmzu7poEZncHPgTb3Db8Lzc"); // localnet

const network = "https://api.devnet.solana.com";
// const network = "https://api.testnet.solana.com";
// const network = "http://127.0.0.1:8899";

const connection = new Connection(network, { commitment: "processed" });

export const PaymentProgress = () => {
  const [payUsdc, setPayUsdc] = useState(false);
  const [usdcBalance, setUSDCBalance] = useState(0);
  const { publicKey, wallet, signAllTransactions, signTransaction } =
    useWallet();

  const [anchorProgram, setAnchorProgram] = useState<any>();
  const [provider, setProvider] = useState<any>();
  const { paymentId } = useParams();
  const [paymentData, setPaymentData] = useState<any>(null);
  const amount = useRef<any>();
  const [lockedSolAmount, setLockedSolAmount] = useState(0);

  const getProvider = () => {
    console.log("Getting provider");
    if (!wallet || !publicKey || !signTransaction || !signAllTransactions) {
      return;
    }

    const signerWallet = {
      publicKey: publicKey,
      signTransaction: signTransaction,
      signAllTransactions: signAllTransactions,
    };

    const provider = new anchor.AnchorProvider(connection, signerWallet, {
      commitment: "processed",
    });

    console.log(provider);

    setProvider(provider);
  };

  const loadAnchor = async () => {
    const programId = new PublicKey(idl.metadata.address);

    if (provider) {
      const myProgram = new anchor.Program(idl, programId, provider);

      console.log(myProgram);
      setAnchorProgram(myProgram);
    } else {
      console.log("No provider");
    }
  };

  const getWalletUSDCBalance = async () => {
    const assTokenAccUSDC = await findAssociatedTokenAddress(
      provider.wallet.publicKey,
      USDC_MINT
    );

    const accountInfo = await getAccount(connection, assTokenAccUSDC);
    console.log(accountInfo);

    setUSDCBalance(Number(accountInfo.amount) / LAMPORTS_PER_SOL);
  };

  useEffect(() => {
    getProvider();
  }, [publicKey, wallet]);

  useEffect(() => {
    loadAnchor();
  }, [provider]);

  useEffect(() => {
    if (anchorProgram) {
      console.log("Loaded anchor")
      anchorProgram.account.paymentChannel
        .fetch(paymentId)
        .then((data: any) => {
          setLockedSolAmount(
            data.lockedSolAmount.toNumber() / LAMPORTS_PER_SOL
          );
          console.log(data)
          setPaymentData(data);
        });

      getWalletUSDCBalance();
    } else {
      console.log("Loading Anchor");
    }
  }, [anchorProgram]);

  //   useEffect(() => {
  //     console.log(paymentData.lockedSolAmount.toNumber());
  //   }, [paymentData]);

  const payUsdcHandler = async () => {
    loadAnchor();

    const data = await anchorProgram.account.paymentChannel.fetch(paymentId);

    if (provider.wallet && paymentId) {
      // const tokenAcc = await (
      //   await findAssociatedTokenAddress(provider.wallet.publicKey, USDC_MINT)
      // ).toString();

      const tokenAcc = await getOrCreateAssociatedTokenAccount(
        connection,
        provider.wallet,
        USDC_MINT,
        provider.wallet.publicKey
      );

      console.log("Token address -> ", tokenAcc.address.toString());

      await anchorProgram.rpc.payAmount(new anchor.BN(amount.current.value), {
        accounts: {
          buyer: tokenAcc.address.toString(),
          seller: data.receiverUsdcAccount,
          authority: provider.wallet.publicKey,
          paymentChannel: new PublicKey(paymentId),
          tokenProgram: TOKEN_PROGRAM_ID,
        },
      });

      setPayUsdc(false);

      anchorProgram.account.paymentChannel
        .fetch(paymentId)
        .then((data: any) => {
          console.log(data);
          setPaymentData(data);
        });
    }
  };

  const withdrawAndPayBalanceHandler = async () => {
    loadAnchor();

    if (paymentData.canWithdraw) {
      await anchorProgram.rpc.withdrawLocked({
        accounts: {
          buyer: provider.wallet.publicKey,
          vaultPda: paymentData.vaultPda,
          paymentChannel: paymentId,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
      });

      toast.success(`Successly withdrew ${lockedSolAmount}SOL  🚀️`, {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    } else {
      console.log("Err");
      toast.error("Cannot withdraw unless paid! 😥️", {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });
    }
  };

  const handleMax = () => {
    // @ts-ignore
    let amountInput = document.getElementById("amount");

    if (amountInput) {
      // @ts-ignore
      amountInput.value = (
        paymentData.itemValue.toNumber() - paymentData.amountPaid.toNumber()
      ).toString();
    }
  };

  return (
    <div className="payment_progress_card">
      <div className="payment_progress_topbar">
        <h6>Payment Due: 27th Nov 2022</h6>
      </div>
      <div className="payment_progress_details_wrapper">
        <div className="payment_progress_details">
          <h6>iPhone X</h6>
          <p>Order Id: {paymentId}</p>
          <p>
            {" "}
            {paymentData !== null
              ? paymentData.lockedSolAmount.toNumber() /
                anchor.web3.LAMPORTS_PER_SOL
              : 0}{" "}
            SOL locked <img src={solanaLogo} />{" "}
          </p>
          <div className="payment_progress_progress">
            <p>
              Payment in progess:{" "}
              {paymentData !== null
                ? ((paymentData.amountPaid.toNumber() /
                    paymentData.itemValue.toNumber()) *
                  100).toFixed(0)
                : 0}
              %
            </p>
            <p>
              ${paymentData !== null ? paymentData.itemValue.toNumber() : 0}{" "}
              USDC{" "}
              {paymentData !== null
                ? paymentData.itemValue.toNumber() ===
                  paymentData.amountPaid.toNumber()
                  ? "Payment Complete!"
                  : ""
                : ""}
            </p>
            <Line
              strokeWidth={1}
              percent={
                paymentData !== null
                  ? (paymentData.amountPaid.toNumber() /
                      paymentData.itemValue.toNumber()) *
                    100
                  : 0
              }
              strokeColor="#23A09A"
              id="progress-bar"
            />
          </div>
          <div className="payment_buttons">
            {/* <button>
              Withdraw SOL and pay balance: $
              {paymentData !== null
                ? paymentData.itemValue.toNumber() -
                  paymentData.amountPaid.toNumber()
                : 0}{" "}
              USDC
            </button> */}
            <button onClick={() => withdrawAndPayBalanceHandler()}>
              Withdraw SOL
            </button>
            <div
              className={`pay_usdc_popup ${
                payUsdc ? `pay_usdc_popup_visible` : `pay_usdc_popup_invisible`
              }`}
            >
              <div className="pay_usdc_card">
                <div className="pay_usdc_card_topbar">
                  <h6>Pay USDC</h6>
                  <Close handler={setPayUsdc} />
                </div>

                <div className="pay_usdc_main">
                  <div className="pay_usdc_input">
                    <input
                      type={"number"}
                      placeholder="  Enter Amount"
                      ref={amount}
                      id="amount"
                    />
                    <button onClick={() => handleMax()}>Max</button>
                  </div>
                  <p>Balance to pay: ${paymentData? paymentData.itemValue - paymentData.amountPaid: "0"} USDC</p>
                </div>

                <div className="pay_button_wrapper">
                  {/* <p>Wallet Balance: {usdcBalance} USDC</p> */}
                  <button onClick={() => payUsdcHandler()}>
                    Pay USDC <img src={usdc} />
                  </button>
                </div>
              </div>
            </div>
            <button onClick={() => setPayUsdc(true)}>
              {" "}
              Pay USDC <img src={usdc} />{" "}
            </button>
          </div>
        </div>
        <div className="payment_progress_product_img">
          <img src={product} />
        </div>
      </div>
    </div>
  );
};
