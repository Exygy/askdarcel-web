import React from "react";
import ReactDOM from "react-dom";
import ReactModal from "react-modal";
import { BrowserRouter } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { CookiesProvider } from "react-cookie";
import * as Sentry from "@sentry/react";

import config from "./config";
import { App } from "./App";

require("instantsearch.css/themes/reset.css");
require("./styles/main.scss");

if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn: `https://${config.SENTRY_PUBLIC_KEY}.ingest.us.sentry.io/${config.SENTRY_PROJECT_ID}`,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.browserProfilingIntegration(),
      Sentry.replayIntegration(),
    ],
    // Tracing
    tracesSampleRate: 1.0, //  Capture 100% of the transactions
    // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
    tracePropagationTargets: ["localhost", /^https:\/\/yourserver\.io\/api/],
    // Set profilesSampleRate to 1.0 to profile every transaction.
    // Since profilesSampleRate is relative to tracesSampleRate,
    // the final profiling rate can be computed as tracesSampleRate * profilesSampleRate
    // For example, a tracesSampleRate of 0.5 and profilesSampleRate of 0.5 would
    // results in 25% of transactions being profiled (0.5*0.5=0.25)
    profilesSampleRate: 1.0,
    // Session Replay
    replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
    replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
  });
} else {
  // /* eslint-disable no-console */
  // (Sentry as any).captureException = (e: any) => console.error(e);
  // (Sentry as any).captureMessage = (m: any) => console.error(m);
  // /* eslint-enable no-console */
}

const rootElement = document.getElementById("root")!;
ReactModal.setAppElement(rootElement);

ReactDOM.render(
  <BrowserRouter>
    <HelmetProvider>
      <CookiesProvider>
        <App />
      </CookiesProvider>
    </HelmetProvider>
  </BrowserRouter>,
  rootElement
);
