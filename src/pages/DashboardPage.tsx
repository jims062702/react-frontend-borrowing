import React, { useEffect, useState } from "react";
import axios from "axios";
import { Package, CheckCircle, XCircle, Clock } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

interface Item {
  id: number;
  name: string;
  quantity: number;
}

interface BorrowedItem {
  id: number;
  item_id: number;
  status: "pending" | "returned";
  quantity: number;
  borrowed_date: string;
  return_date?: string;
}

const COLORS = ["#16a34a", "#dc2626", "#f97316"]; // green, red, orange

const DashboardPage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [borrowedItems, setBorrowedItems] = useState<BorrowedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [itemsRes, borrowedRes] = await Promise.all([
          axios.get("https://laravel-backend-borrowing-production-1df4.up.railway.app/api/items", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("https://laravel-backend-borrowing-production-1df4.up.railway.app/api/borrowed-items", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setItems(itemsRes.data);
        setBorrowedItems(borrowedRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // ✅ Stats
  const totalItems = items.length;
  const borrowed = borrowedItems.filter((b) => b.status === "pending").length;
  const returned = borrowedItems.filter((b) => b.status === "returned").length;
  const available = items.filter((i) => i.quantity > 0).length;

  // ✅ Chart Data
  const chartData = [
    { name: "Available", value: available },
    { name: "Borrowed", value: borrowed },
    { name: "Returned", value: returned },
  ];

  // ✅ Monthly Trends
  const months = [
    "Jan","Feb","Mar","Apr","May","Jun",
    "Jul","Aug","Sep","Oct","Nov","Dec",
  ];

  const monthlyData = months.map((month, idx) => {
    const borrowedCount = borrowedItems.filter((item) => {
      const date = new Date(item.borrowed_date);
      return date.getMonth() === idx && item.status === "pending";
    }).length;

    const returnedCount = borrowedItems.filter((item) => {
      if (!item.return_date) return false;
      const date = new Date(item.return_date);
      return date.getMonth() === idx && item.status === "returned";
    }).length;

    return {
      month,
      Borrowed: borrowedCount,
      Returned: returnedCount,
    };
  });

  // ✅ Pagination for recent items
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = items.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(items.length / itemsPerPage);

  return (
    <div className="space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold text-gray-800">Dashboard Overview</h2>
        <p className="text-gray-600 mt-1">
          Quick insights into items, borrowing activity, and system status.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-blue-50 shadow rounded-xl p-6 flex flex-col items-center">
          <Package className="text-blue-600 w-10 h-10" />
          <h3 className="text-lg font-semibold text-gray-700 mt-2">Total Items</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">
            {loading ? "..." : totalItems}
          </p>
        </div>

        <div className="bg-red-50 shadow rounded-xl p-6 flex flex-col items-center">
          <XCircle className="text-red-600 w-10 h-10" />
          <h3 className="text-lg font-semibold text-gray-700 mt-2">Borrowed Items</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">
            {loading ? "..." : borrowed}
          </p>
        </div>

        <div className="bg-orange-50 shadow rounded-xl p-6 flex flex-col items-center">
          <Clock className="text-orange-600 w-10 h-10" />
          <h3 className="text-lg font-semibold text-gray-700 mt-2">Returned Records</h3>
          <p className="text-3xl font-bold text-orange-600 mt-2">
            {loading ? "..." : returned}
          </p>
        </div>

        <div className="bg-green-50 shadow rounded-xl p-6 flex flex-col items-center">
          <CheckCircle className="text-green-600 w-10 h-10" />
          <h3 className="text-lg font-semibold text-gray-700 mt-2">Available Items</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">
            {loading ? "..." : available}
          </p>
        </div>
      </div>

      {/* Pie Chart Section */}
      <div className="bg-white shadow rounded-xl p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Items Distribution
        </h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {chartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart Section */}
      <div className="bg-white shadow rounded-xl p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Monthly Borrowed vs Returned
        </h3>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Borrowed" fill="#dc2626" />
            <Bar dataKey="Returned" fill="#f97316" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Items Section */}
      <div className="bg-white shadow rounded-xl p-6">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Recent Items Activity
        </h3>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : items.length > 0 ? (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse border border-gray-300 text-sm sm:text-base">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border px-2 sm:px-4 py-2">ID</th>
                    <th className="border px-2 sm:px-4 py-2">Name</th>
                    <th className="border px-2 sm:px-4 py-2">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {currentItems.map((item) => (
                    <tr key={item.id}>
                      <td className="border px-2 sm:px-4 py-2 text-center">{item.id}</td>
                      <td className="border px-2 sm:px-4 py-2">{item.name}</td>
                      <td className="border px-2 sm:px-4 py-2 text-center">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination bottom-left */}
            <div className="flex justify-start items-center space-x-2 mt-4">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((prev) => prev - 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Prev
              </button>
              {Array.from({ length: totalPages || 1 }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === i + 1
                      ? "bg-blue-600 text-white"
                      : "bg-white hover:bg-gray-100"
                  }`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                disabled={currentPage === totalPages || totalPages === 0}
                onClick={() => setCurrentPage((prev) => prev + 1)}
                className="px-3 py-1 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </>
        ) : (
          <p className="text-gray-500">No items found</p>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
