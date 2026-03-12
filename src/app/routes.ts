import { createBrowserRouter, Navigate } from "react-router";
import React from "react";
import { Home } from "./pages/Home";
import { PgeCertSuite } from "./pages/pge-tool/cert-suite/CertSuitePage";
import { PgeSplitPdf } from "./pages/pge-tool/split-pdf/SplitPdfPage";
import { PgeRename } from "./pages/pge-tool/rename/RenamePage";
import { QrGenerator } from "./pages/pge-tool/qr-generator/QrGeneratorPage";
import { PgePdfSigner } from "./pages/pge-tool/pdf-signer/PdfSignerPage";

// Other Tools
import { PdfCompress } from "./pages/other-tools/PdfCompress";
import { ImageResize } from "./pages/other-tools/ImageResize";
import { TextCounter } from "./pages/other-tools/TextCounter";

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
  {
    path: "/other/pdf-signer",
    Component: PgePdfSigner,
  },
  {
    path: "/other/pdf-compress",
    Component: PdfCompress,
  },
  {
    path: "/other/image-resize",
    Component: ImageResize,
  },
  {
    path: "/other/text-counter",
    Component: TextCounter,
  },
]);
