import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import React, { useEffect, useState } from "react";
import { Close } from "../Close/Close";
import "./CollateralPaymentButton.css";
import product from "../../assets/product.png";
import solanaLogo from "../../assets/solana_logo.png";
import {
  useAnchorWallet,
  useWallet,
  WalletContextState,
} from "@solana/wallet-adapter-react";
import { Connection, PublicKey } from "@solana/web3.js";
import * as anchor from "@project-serum/anchor";
import { idl } from "../../idl";
import {
  createAssociatedTokenAccount,
  createMint,
  findAssociatedTokenAddress,
} from "../utils";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { getOrCreateAssociatedTokenAccount } from "@solana/spl-token";

const USDC_MINT = new PublicKey("BCNR5AVuUqUVfm5qhEpAhJa3QTZHZnp7Ma8DvEnpcHSm"); // devnet
// const USDC_MINT = new PublicKey("73P6wmhuwJm661EN6ahFdYDP9dJGmAwjnAsCF2E3ajB9"); // testnet
// const USDC_MINT = new PublicKey("4EQC6nruC7i67bDLWaBqdhmzu7poEZncHPgTb3Db8Lzc"); // localnet

const network = "https://api.devnet.solana.com";
// const network = "https://api.testnet.solana.com";
// const network = "http://127.0.0.1:8899";

const connection = new Connection(network, { commitment: "processed" });

export const CollateralPaymentButton = () => {
  const [wrapperVisible, setWrapperVisible] = useState(false);
  const { publicKey, wallet, signTransaction, signAllTransactions } =
    useWallet();
  const [anchorProgram, setAnchorProgram] = useState<any>(null);
  const [provider, setProvider] = useState<any>();
  const [paymentPending, setPaymentPending] = useState(true);
  const [paymentChannel, setPaymentChannel] = useState("");

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
    }
  };

  useEffect(() => {
    getProvider();
  }, [wallet, publicKey]);

  useEffect(() => {
    loadAnchor();
  }, [provider]);

  useEffect(() => {
    console.log(anchorProgram);
  }, [anchorProgram]);

  // const mintUSDC = async () => {
  //   const { provider } = anchorProgram;

  //   const USDC_MINT = await createMint(provider, provider.wallet.publicKey);

  //   console.log(USDC_MINT.toString());
  // };

  useEffect(() => {
    console.log(provider);
  }, [provider]);

  const lockSol = async () => {
    await loadAnchor();
    const seller = new anchor.web3.Keypair();
    const paymentChannel = new anchor.web3.Keypair();

    // const seller_usdc_associated_acc = await findAssociatedTokenAddress(
    //   provider.wallet.publicKey,
    //   USDC_MINT
    // );

    const seller_usdc_associated_acc = await getOrCreateAssociatedTokenAccount(
      connection,
      provider.wallet,
      USDC_MINT,
      provider.wallet.publicKey
    ).then((data) => data.address);

    if (provider?.wallet.publicKey) {
      const [vault, nonce] = await anchor.web3.PublicKey.findProgramAddress(
        [provider?.wallet.publicKey.toBuffer()],
        anchorProgram.programId
      );

      toast("Sending data to the blockchain!⌛️", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      let signature = await anchorProgram.rpc.createChannel(
        new anchor.BN(200),
        seller.publicKey,
        seller_usdc_associated_acc,
        vault,
        nonce,
        {
          accounts: {
            buyer: provider.wallet.publicKey,
            paymentChannel: paymentChannel.publicKey,
            systemProgram: anchor.web3.SystemProgram.programId,
          },
          signers: [paymentChannel],
        }
      );

      setPaymentChannel(paymentChannel.publicKey.toString());
      localStorage.setItem(
        "PaymentChannel",
        paymentChannel.publicKey.toString()
      );

      console.log(`Signature -> ${signature}`);

      signature = await anchorProgram.rpc.lockSol(new anchor.BN(2), {
        accounts: {
          buyer: provider.wallet.publicKey,
          vaultPda: vault,
          paymentChannel: paymentChannel.publicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        },
      });

      toast.success("SOL Locked! 🚀️", {
        position: "top-center",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      console.log(`Signature -> ${signature}`);

      if (signature) {
        setPaymentPending(false);
      }
    }
  };

  return (
    <div className="collateral_payment_button_wrapper">
      <div
        className={`${"collateral_payment_card_wrapper"} ${
          wrapperVisible
            ? `collateral_payment_card_wrapper_visible`
            : `collateral_payment_card_wrapper_invisible`
        }`}
      >
        <div className="collateral_payment_card">
          <div className="collateral_payment_card_topbar">
            <h6>Pay using collateral pay</h6>
            <Close handler={setWrapperVisible} />
          </div>
          <div className="collateral_payment_card_main">
            <div className="collateral_payment_card_main_product_img">
              <img src={product} />
            </div>
            {paymentPending ? (
              <PaymentPending lockSol={lockSol} />
            ) : (
              <PaymentSuccess paymentChannel={paymentChannel.toString()} />
            )}
          </div>
          <div className="collateral_payment_card_wallet">
            <WalletMultiButton />
          </div>
        </div>
      </div>
      <div className="collateral_payment_button">
        <button onClick={() => setWrapperVisible(true)}>
          Pay with collateral pay
        </button>
      </div>
    </div>
  );
};

const PaymentSuccess = ({ paymentChannel }: { paymentChannel: string }) => {
  return (
    <div
      className={`collateral_payment_card_main_product_details collateral_payment_success`}
    >
      <h6>IPhone X</h6>
      <h6>Payment Successful! 🌟️</h6>
      <p>
        The payment was successful, you can track you order in your orders tab!
      </p>
      <p>
        Check you{" "}
        <Link to={`/payments/${paymentChannel}`} target="_blank">
          payments
        </Link>{" "}
        tab to withdraw your sol or to track your payment status!
      </p>
    </div>
  );
};

const PaymentPending = ({ lockSol }: { lockSol: any }) => {
  return (
    <div className="collateral_payment_card_main_product_details">
      <h6>IPhone X</h6>
      <p>Payment due: 27th Nov 2022</p>
      <p>SOL to lock: 2 SOL</p>
      <p>Price: $200 USDC</p>
      <div className="lock_sol_btn">
        <p>What is collateral?</p>
        <button onClick={() => lockSol()}>
          {" "}
          <img src={solanaLogo} /> Lock 2 SOL
        </button>
      </div>
    </div>
  );
};
