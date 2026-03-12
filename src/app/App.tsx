import { RouterProvider } from "react-router";
import { router } from "./routes";
import { BackendLoader } from "./components/BackendLoader";
import { Toaster } from "sonner";

export default function App() {
  return (
    <BackendLoader>
      <Toaster position="top-right" richColors />
      <RouterProvider router={router} />
    </BackendLoader>
  );
}