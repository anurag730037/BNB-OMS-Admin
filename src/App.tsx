import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Login } from "./pages/Login";
import Dashboard from "./pages/dashboard/Dashboard";
import ProtectedRoutes from "./routes/ProtectedRoutes";
import AdminLayout from "./layout/AdminLayout";
import Orders from "./pages/orders/Orders";
import Products from "./pages/products/Products";
import Categories from "./pages/categories/Categories";
import Retailers from "./pages/retailers/Retailers";
import SubCategories from "./pages/subcategories/SubCategories";
import AddRetailer from "./pages/retailers/AddRetailer";
import EditRetailer from "./pages/retailers/EditRetailer";
import AddProduct from "./pages/products/AddProduct";
import Areas from "./pages/areas/Areas";
import { Toaster } from "react-hot-toast";

function App() {
  return (

    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Public */}
        <Route path="/" element={<Login />} />


        {/* Protected Admin Routes */}
        {/* Protected Group */}
        <Route element={<ProtectedRoutes />}>
          <Route element={<AdminLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/retailers" element={<Retailers />} />
            <Route path="/retailers/add" element={<AddRetailer />} />
            <Route path="/retailers/edit/:id" element={<EditRetailer />} />
            <Route path="/orders" element={<Orders />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/add" element={<AddProduct />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/subcategories" element={<SubCategories />} />
            <Route path="/areas" element={<Areas />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
