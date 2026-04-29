import { RouterProvider } from "react-router";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { router } from "./routes";

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem storageKey="piap-ui-theme">
      <RouterProvider router={router} />
      <Toaster richColors position="top-center" closeButton expand className="font-sans" />
    </ThemeProvider>
  );
}
