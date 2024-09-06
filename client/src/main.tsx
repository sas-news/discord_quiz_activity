import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import SocketsProvider from "./context/socket.context";

createRoot(document.getElementById("app")!).render(
  <SocketsProvider>
    <StrictMode>
      <App />
    </StrictMode>
  </SocketsProvider>
);
