import "./App.css";
import { CollateralPay } from "./components/CollateralPay/CollateralPay";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { PaymentProgress } from "./components/PaymentProgress/PaymentProgress";

import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "react-toastify/dist/ReactToastify.css";
import { clusterApiUrl } from "@solana/web3.js";
import { useMemo } from "react";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import { ToastContainer } from "react-toastify";
const opts = {
  preflightCommitment: "processed",
};

require("@solana/wallet-adapter-react-ui/styles.css");

function App() {
  const network = WalletAdapterNetwork.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], [network]);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="App">
            <header className="App-header">
              <ToastContainer
                position="top-center"
                autoClose={2000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                style={{ fontSize: "1rem" }}
              />
              <Router>
                <Routes>
                  <Route path="/*" element={<CollateralPay />} />
                  <Route
                    path="/payments/:paymentId"
                    element={<PaymentProgress />}
                  />
                </Routes>
              </Router>
            </header>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;
