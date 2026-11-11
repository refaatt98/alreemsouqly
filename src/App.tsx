import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { RootErrorBoundary } from "@/components/RootErrorBoundary";
import Home from "@/pages/Home";
import ProductRoute from "@/pages/Product";
import AdminRoute from "@/pages/Admin";
import NotFound from "@/pages/NotFound";

const queryClient = new QueryClient();

export default function App() {
  return (
    <RootErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductRoute />} />
            <Route path="/admin" element={<AdminRoute />} />
            <Route path="/admin/orders" element={<AdminRoute />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </QueryClientProvider>
    </RootErrorBoundary>
  );
}
