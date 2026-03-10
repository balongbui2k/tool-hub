import { createBrowserRouter, Navigate } from "react-router";
import React from "react";
import { Home } from "./pages/Home";
import { PgeCertSuite } from "./pages/tools/PgeCertSuite";
import { PgeSplitPdf } from "./pages/tools/PgeSplitPdf";
import { PgeRename } from "./pages/tools/PgeRename";

import { QrGenerator } from "./pages/tools/QrGenerator";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/pge",
    element: React.createElement(Navigate, { to: "/pge/cert-suite", replace: true }),
  },
  {
    path: "/pge/cert-suite",
    Component: PgeCertSuite,
  },
  {
    path: "/pge/split-pdf",
    Component: PgeSplitPdf,
  },
  {
    path: "/pge/rename",
    Component: PgeRename,
  },
  {
    path: "/pge/qr-generator",
    Component: QrGenerator,
  },
]);
