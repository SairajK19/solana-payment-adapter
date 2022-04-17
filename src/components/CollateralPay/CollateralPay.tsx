import React, { FC, useEffect, useMemo } from "react";
import "./CollateralPay.css";
import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import { clusterApiUrl } from "@solana/web3.js";
import { CollateralPaymentButton } from "../CollateralPaymentButton/CollateralPaymentButton";
import { Connection, PublicKey } from "@solana/web3.js";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const opts = {
  preflightCommitment: "processed",
};

require("@solana/wallet-adapter-react-ui/styles.css");

export const CollateralPay = () => {
  return (
    <>
      <CollateralPaymentButton />
    </>
  );
};
