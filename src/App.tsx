import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import AdminDashboard from "./pages/AdminDashboard";
import DashboardPage from "./pages/DashboardPage";
import ItemListPage from "./pages/ItemListPage";
import BorrowedItemsPage from "./pages/BorrowedItemsPage";
import ReturnedItemsPage from "./pages/ReturnedItemsPage";
import ReportsPage from "./pages/ReportsPage";

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="items" element={<ItemListPage />} />
          <Route path="borrowed" element={<BorrowedItemsPage />} />
          <Route path="returned" element={<ReturnedItemsPage />} />
          <Route path="reports" element={<ReportsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default App;
