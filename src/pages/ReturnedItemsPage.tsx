import React, { useEffect, useState } from "react";
import axios from "axios";

interface ReturnedItem {
  id: number;
  borrower_name: string;
  item?: { id: number; name: string };
  borrowed_date: string;
  quantity: number;
  return_date: string | null;
}

const ReturnedItemsPage: React.FC = () => {
  const [returnedItems, setReturnedItems] = useState<ReturnedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const token = localStorage.getItem("token");

  const fetchReturnedItems = async () => {
    try {
      const res = await axios.get("https://laravel-backend-borrowing-production-1df4.up.railway.app/api/borrowed-items", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setReturnedItems(
        res.data.filter((item: ReturnedItem) => item.status === "returned")
      );
    } catch (err) {
      console.error(err);
      setError("Failed to fetch returned items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReturnedItems();
  }, []);

  // Filtered items for search
  const filteredItems = returnedItems.filter((item) =>
    item.borrower_name.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-2xl font-bold mb-4">Returned Items</h2>

      <input
        type="text"
        placeholder="Search by borrower name..."
        className="mb-4 border px-3 py-2 rounded w-full sm:w-72"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          {/* Table wrapper for mobile */}
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300 text-sm sm:text-base">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 sm:px-4 py-2">ID</th>
                  <th className="border px-2 sm:px-4 py-2">Borrower</th>
                  <th className="border px-2 sm:px-4 py-2">Item</th>
                  <th className="border px-2 sm:px-4 py-2 hidden sm:table-cell">
                    Borrowed Date
                  </th>
                  <th className="border px-2 sm:px-4 py-2 hidden sm:table-cell">
                    Return Date
                  </th>
                  <th className="border px-2 sm:px-4 py-2">Qty</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-4">
                      No returned items found.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item) => (
                    <tr key={item.id}>
                      <td className="border px-2 sm:px-4 py-2 text-center">
                        {item.id}
                      </td>
                      <td className="border px-2 sm:px-4 py-2 text-center">
                        {item.borrower_name}
                      </td>
                      <td className="border px-2 sm:px-4 py-2 text-center">
                        {item.item?.name || "Unknown"}
                      </td>
                      <td className="border px-2 sm:px-4 py-2 text-center hidden sm:table-cell">
                        {new Date(item.borrowed_date).toLocaleDateString()}
                      </td>
                      <td className="border px-2 sm:px-4 py-2 text-center hidden sm:table-cell">
                        {item.return_date
                          ? new Date(item.return_date).toLocaleDateString()
                          : "-"}
                      </td>
                      <td className="border px-2 sm:px-4 py-2 text-center">
                        {item.quantity}
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

export default ReturnedItemsPage;
