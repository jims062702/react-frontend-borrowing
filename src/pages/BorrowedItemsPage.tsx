import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

interface BorrowedItem {
  id: number;
  borrower_name: string;
  item_id: number;
  borrowed_date: string;
  quantity: number;
  status: string;
  item?: { id: number; name: string; quantity?: number };
}

interface Item {
  id: number;
  name: string;
  quantity: number;
}

const BorrowedItemPage: React.FC = () => {
  const [borrowedItems, setBorrowedItems] = useState<BorrowedItem[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [quantityError, setQuantityError] = useState("");
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    borrower_name: "",
    item_id: 0,
    borrowed_date: "",
    quantity: 1,
    status: "pending",
  });

  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const token = localStorage.getItem("token");

  // Fetch borrowed items
  const fetchBorrowedItems = async () => {
    try {
      const res = await axios.get("https://laravel-backend-borrowing-production-1df4.up.railway.app/api/borrowed-items", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setBorrowedItems(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch borrowed items");
    } finally {
      setLoading(false);
    }
  };

  // Fetch available items
  const fetchItems = async () => {
    try {
      const res = await axios.get("https://laravel-backend-borrowing-production-cc2c.up.railway.app/api/items", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data);
    } catch (err) {
      console.error("Failed to fetch items:", err);
    }
  };

  useEffect(() => {
    fetchBorrowedItems();
    fetchItems();
  }, []);

  // Save (Add or Edit)
  const handleSave = async () => {
    const errors: { [key: string]: string } = {};

    if (!form.borrower_name.trim())
      errors.borrower_name = "Borrower Name is required";
    if (form.item_id === 0) errors.item_id = "Please select an item";
    if (!form.borrowed_date) errors.borrowed_date = "Borrowed Date is required";
    if (form.quantity <= 0) errors.quantity = "Quantity must be at least 1";

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) return;

    try {
      const payload = { ...form };

      if (isEdit && editId !== null) {
        await axios.put(
          `https://laravel-backend-borrowing-production-1df4.up.railway.app/api/borrowed-items/${editId}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
      } else {
        await axios.post("https://laravel-backend-borrowing-production-1df4.up.railway.app/api/borrowed-items", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setShowModal(false);
      resetForm();
      fetchBorrowedItems();
    } catch (err) {
      console.error("Error saving borrower:", err);
    }
  };

  // Reset form state
  const resetForm = () => {
    setForm({
      borrower_name: "",
      item_id: 0,
      borrowed_date: "",
      quantity: 1,
      status: "pending",
    });
    setFormErrors({});
    setQuantityError("");
    setIsEdit(false);
    setEditId(null);
  };

  // Delete Borrowed Item
  const handleDelete = (borrowedId: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "This borrowed record will be permanently deleted!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(
            `https://laravel-backend-borrowing-production-1df4.up.railway.app/${borrowedId}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          Swal.fire("Deleted!", "Borrowed record has been deleted.", "success");
          fetchBorrowedItems();
        } catch (err) {
          Swal.fire("Error!", "Failed to delete borrowed record.", "error");
        }
      }
    });
  };

  const filteredItems = borrowedItems.filter((item) =>
    item.borrower_name.toLowerCase().includes(search.toLowerCase())
  );

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-2xl font-bold mb-4">Borrowed Items</h2>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by borrower name..."
        className="mb-4 border px-3 py-2 rounded w-full sm:w-72 block"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Add Button */}
      <button
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full sm:w-auto"
        onClick={() => {
          setShowModal(true);
          setIsEdit(false);
          resetForm();
        }}
      >
        + Add Borrower
      </button>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : (
        <>
          {/* Table wrapper for mobile scroll */}
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-300 text-sm sm:text-base">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border px-2 sm:px-4 py-2">ID</th>
                  <th className="border px-2 sm:px-4 py-2">Borrower</th>
                  <th className="border px-2 sm:px-4 py-2 hidden sm:table-cell">
                    Item
                  </th>
                  <th className="border px-2 sm:px-4 py-2 hidden sm:table-cell">
                    Date
                  </th>
                  <th className="border px-2 sm:px-4 py-2">Qty</th>
                  <th className="border px-2 sm:px-4 py-2">Status</th>
                  <th className="border px-2 sm:px-4 py-2 w-40">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-4">
                      No borrowed items found.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((borrowed) => (
                    <tr key={borrowed.id}>
                      <td className="border px-2 sm:px-4 py-2 text-center">
                        {borrowed.id}
                      </td>
                      <td className="border px-2 sm:px-4 py-2 text-center">
                        {borrowed.borrower_name}
                      </td>
                      <td className="border px-2 sm:px-4 py-2 text-center hidden sm:table-cell">
                        {borrowed.item?.name || "Unknown"}
                      </td>
                      <td className="border px-2 sm:px-4 py-2 text-center hidden sm:table-cell">
                        {new Date(borrowed.borrowed_date).toLocaleDateString()}
                      </td>
                      <td className="border px-2 sm:px-4 py-2 text-center">
                        {borrowed.quantity}
                      </td>
                      <td className="border px-2 sm:px-4 py-2 text-center">
                        {borrowed.status}
                      </td>
                      <td className="border px-2 sm:px-4 py-2 flex flex-col sm:flex-row gap-2 justify-center">
                        {/* Edit */}
                        <button
                          className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600"
                          onClick={() => {
                            setShowModal(true);
                            setIsEdit(true);
                            setEditId(borrowed.id);
                            setForm({
                              borrower_name: borrowed.borrower_name,
                              item_id: borrowed.item_id,
                              borrowed_date: borrowed.borrowed_date,
                              quantity: borrowed.quantity,
                              status: borrowed.status,
                            });
                            setFormErrors({});
                            setQuantityError("");
                          }}
                        >
                          Edit
                        </button>

                        {/* Delete */}
                        <button
                          className="bg-red-600 text-white px-2 py-1 rounded hover:bg-red-700"
                          onClick={() => handleDelete(borrowed.id)}
                        >
                          Delete
                        </button>
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-2">
          <div className="bg-white p-4 sm:p-6 rounded-lg w-[90%] sm:w-96 shadow-lg">
            <h3 className="text-xl font-bold mb-4 text-center">
              {isEdit ? "Edit Borrowed Item" : "Add Borrower"}
            </h3>

            {/* Borrower Name */}
            <input
              type="text"
              placeholder="Borrower Name"
              className={`w-full border px-3 py-2 mb-1 rounded ${
                formErrors.borrower_name ? "border-red-500" : ""
              }`}
              value={form.borrower_name}
              onChange={(e) => {
                setForm({ ...form, borrower_name: e.target.value });
                if (formErrors.borrower_name) {
                  setFormErrors((prev) => ({ ...prev, borrower_name: "" }));
                }
              }}
            />
            {formErrors.borrower_name && (
              <p className="text-red-500 text-sm mb-2">
                {formErrors.borrower_name}
              </p>
            )}

            {/* Item */}
            <select
              className={`w-full border px-3 py-2 mb-1 rounded ${
                formErrors.item_id ? "border-red-500" : ""
              }`}
              value={form.item_id}
              onChange={(e) => {
                setForm({ ...form, item_id: parseInt(e.target.value) });
                if (formErrors.item_id) {
                  setFormErrors((prev) => ({ ...prev, item_id: "" }));
                }
              }}
            >
              <option value={0}>-- Select Item --</option>
              {items.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
            {formErrors.item_id && (
              <p className="text-red-500 text-sm mb-2">{formErrors.item_id}</p>
            )}

            {/* Date */}
            <input
              type="date"
              className={`w-full border px-3 py-2 mb-1 rounded ${
                formErrors.borrowed_date ? "border-red-500" : ""
              }`}
              value={form.borrowed_date}
              onChange={(e) => {
                setForm({ ...form, borrowed_date: e.target.value });
                if (formErrors.borrowed_date) {
                  setFormErrors((prev) => ({ ...prev, borrowed_date: "" }));
                }
              }}
            />
            {formErrors.borrowed_date && (
              <p className="text-red-500 text-sm mb-2">
                {formErrors.borrowed_date}
              </p>
            )}

            {/* Quantity */}
            <input
              type="number"
              placeholder="Quantity"
              className={`w-full border px-3 py-2 mb-1 rounded ${
                formErrors.quantity || quantityError ? "border-red-500" : ""
              }`}
              value={form.quantity}
              onChange={(e) => {
                const val = parseInt(e.target.value);
                setForm({ ...form, quantity: val });

                if (formErrors.quantity) {
                  setFormErrors((prev) => ({ ...prev, quantity: "" }));
                }

                const selectedItem = items.find(
                  (item) => item.id === form.item_id
                );
                if (selectedItem && val > selectedItem.quantity) {
                  setQuantityError(
                    `Available quantity is only ${selectedItem.quantity}`
                  );
                } else {
                  setQuantityError("");
                }
              }}
            />
            {formErrors.quantity && (
              <p className="text-red-500 text-sm mb-2">
                {formErrors.quantity}
              </p>
            )}
            {quantityError && (
              <p className="text-red-500 text-sm mb-2">{quantityError}</p>
            )}

            {/* Status */}
            <select
              className="w-full border px-3 py-2 mb-3 rounded"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="pending">Pending</option>
              <option value="returned">Returned</option>
            </select>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                onClick={handleSave}
                disabled={!!quantityError}
              >
                {isEdit ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BorrowedItemPage;
