import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import Mask from "./Mask";

ReactDOM.render(
  <React.StrictMode>
    <App />
    <Mask />
  </React.StrictMode>,
  document.getElementById("root")
);
