import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Login } from "./pages/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import ProtectedRoutes from "./routes/ProtectedRoutes";
import AdminLayout from "./layout/AdminLayout";
import Orders from "./pages/orders/Orders";
import OrderDetails from "./pages/orders/OrderDetails";
import Products from "./pages/products/Products";
import Categories from "./pages/categories/Categories";
import Retailers from "./pages/retailers/Retailers";
import SubCategories from "./pages/subcategories/SubCategories";
import AddRetailer from "./pages/retailers/AddRetailer";
import EditRetailer from "./pages/retailers/EditRetailer";
import AddProduct from "./pages/products/AddProduct";
import EditProduct from "./pages/products/EditProduct";
import Areas from "./pages/areas/Areas";
import Support from "./pages/support/Support";
import { Toaster } from "react-hot-toast";
import Notifications from "./pages/notifications/Notifications";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />

        {/* Protected Admin Routes */}
        <Route element={<ProtectedRoutes />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/retailers" element={<Retailers />} />
            <Route path="/retailers/add" element={<AddRetailer />} />
            <Route path="/retailers/edit/:id" element={<EditRetailer />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/orders/:id" element={<OrderDetails />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/add" element={<AddProduct />} />
            <Route path="/products/edit/:id" element={<EditProduct />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/subcategories" element={<SubCategories />} />
            <Route path="/areas" element={<Areas />} />
            <Route path="/support" element={<Support />} />
            <Route path="/notifications" element={<Notifications />} />

          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
