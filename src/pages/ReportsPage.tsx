import React, { useEffect, useState } from "react";
import axios from "axios";

interface Item {
  id: number;
  name: string;
  quantity: number;
}

interface BorrowedItem {
  id: number;
  borrower_name: string;
  item?: { id: number; name: string };
  borrowed_date: string;
  status: string;
  quantity: number;
}

const ReportsPage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [borrowedItems, setBorrowedItems] = useState<BorrowedItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const token = localStorage.getItem("token");

  const fetchReports = async () => {
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
    } catch (err) {
      console.error("Error fetching reports:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Report calculations
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalBorrowed = borrowedItems.filter((b) => b.status === "pending").length;
  const totalReturned = borrowedItems.filter((b) => b.status === "returned").length;

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = borrowedItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(borrowedItems.length / itemsPerPage);

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-2xl font-bold mb-4">Reports</h2>

      {loading ? (
        <p>Loading reports...</p>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="bg-white shadow p-4 rounded-lg text-center">
              <h3 className="text-base sm:text-lg font-semibold">Total Stock</h3>
              <p className="text-xl sm:text-2xl font-bold text-blue-600">{totalItems}</p>
            </div>
            <div className="bg-white shadow p-4 rounded-lg text-center">
              <h3 className="text-base sm:text-lg font-semibold">Borrowed Items</h3>
              <p className="text-xl sm:text-2xl font-bold text-yellow-600">{totalBorrowed}</p>
            </div>
            <div className="bg-white shadow p-4 rounded-lg text-center">
              <h3 className="text-base sm:text-lg font-semibold">Returned Items</h3>
              <p className="text-xl sm:text-2xl font-bold text-green-600">{totalReturned}</p>
            </div>
          </div>

          {/* Recent Transactions */}
          <h3 className="text-xl font-bold mb-2">Recent Borrowing History</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300 text-sm sm:text-base">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 sm:px-4 py-2">ID</th>
                  <th className="border px-2 sm:px-4 py-2">Borrower</th>
                  <th className="border px-2 sm:px-4 py-2">Item</th>
                  <th className="border px-2 sm:px-4 py-2">Qty</th>
                  {/* Hide these on mobile */}
                  <th className="border px-2 sm:px-4 py-2 hidden sm:table-cell">Date</th>
                  <th className="border px-2 sm:px-4 py-2 hidden sm:table-cell">Status</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      No borrowing history.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((b) => (
                    <tr key={b.id}>
                      <td className="border px-2 sm:px-4 py-2 text-center">{b.id}</td>
                      <td className="border px-2 sm:px-4 py-2 text-center">{b.borrower_name}</td>
                      <td className="border px-2 sm:px-4 py-2 text-center">
                        {b.item?.name || "Unknown"}
                      </td>
                      <td className="border px-2 sm:px-4 py-2 text-center">{b.quantity}</td>
                      <td className="border px-2 sm:px-4 py-2 text-center hidden sm:table-cell">
                        {new Date(b.borrowed_date).toLocaleDateString()}
                      </td>
                      <td
                        className={`border px-2 sm:px-4 py-2 text-center hidden sm:table-cell ${
                          b.status === "pending" ? "text-yellow-600" : "text-green-600"
                        }`}
                      >
                        {b.status}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination at bottom-left */}
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
      )}
    </div>
  );
};

export default ReportsPage;
