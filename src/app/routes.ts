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
import { AiSummarizer } from "./pages/other-tools/AiSummarizer";
import { AiWriter } from "./pages/other-tools/AiWriter";
import { BackgroundRemover } from "./pages/other-tools/BackgroundRemover";
import { CaseConverter } from "./pages/other-tools/CaseConverter";
import { ImageCompress } from "./pages/other-tools/ImageCompress";
import { PdfMerge } from "./pages/other-tools/PdfMerge";
import { PdfSplit } from "./pages/other-tools/PdfSplit";

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
    path: "/pge/pdf-signer",
    Component: PgePdfSigner,
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
  {
    path: "/other/ai-summarizer",
    Component: AiSummarizer,
  },
  {
    path: "/other/ai-writer",
    Component: AiWriter,
  },
  {
    path: "/other/background-remover",
    Component: BackgroundRemover,
  },
  {
    path: "/other/case-converter",
    Component: CaseConverter,
  },
  {
    path: "/other/image-compress",
    Component: ImageCompress,
  },
  {
    path: "/other/pdf-merge",
    Component: PdfMerge,
  },
  {
    path: "/other/pdf-split",
    Component: PdfSplit,
  },
]);
