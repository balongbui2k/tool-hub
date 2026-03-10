import { RouterProvider } from "react-router";
import { router } from "./routes";
import { BackendLoader } from "./components/BackendLoader";

export default function App() {
  return (
    <BackendLoader>
      <RouterProvider router={router} />
    </BackendLoader>
  );
}