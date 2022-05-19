import "react-app-polyfill/ie11";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { CollateralPay } from "../.";

const App = () => {
  return (
    <div>
      <CollateralPay />
    </div>
  );
};

ReactDOM.render(<App />, document.getElementById("root"));
