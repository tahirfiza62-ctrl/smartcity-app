
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import App from "./App";
import "./index.css";

ReactDOM.createRoot(
  document.getElementById("root")
).render(

    <BrowserRouter>

      <App />

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: "#17153B",
            color: "#ffffff",
            border: "1px solid #635BFF",
            borderRadius: "10px",
            padding: "14px 16px",
          },
          success: {
            iconTheme: {
              primary: "#20B486",
              secondary: "#ffffff",
            },
          },
          error: {
            iconTheme: {
              primary: "#EF5B6B",
              secondary: "#ffffff",
            },
          },
        }}
      />

    </BrowserRouter>

);