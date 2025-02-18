import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";

import { TempoDevtools } from "tempo-devtools";
import { scheduleNewsUpdates } from "./lib/automation/newsFeeds";
import { scheduleModerationQueue } from "./lib/automation/moderationQueue";

TempoDevtools.init();

// Start automation if not in development
if (process.env.NODE_ENV === "production") {
  scheduleNewsUpdates();
  scheduleModerationQueue();
}

const basename = import.meta.env.BASE_URL;

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
