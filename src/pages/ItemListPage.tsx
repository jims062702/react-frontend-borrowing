import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";

interface Item {
  id: number;
  name: string;
  description?: string; // optional
  quantity: number;
}

const ItemListPage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ id: 0, name: "", description: "", quantity: 0 });
  const [isEdit, setIsEdit] = useState(false);
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const token = localStorage.getItem("token");

  // Fetch items
  const fetchItems = async () => {
    try {
      const res = await axios.get("https://laravel-backend-borrowing-production-cc2c.up.railway.app/api/items", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setItems(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  // Filter items
  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage);

  // Save
  const handleSave = async () => {
    const errors: { [key: string]: string } = {};
    if (!form.name.trim()) errors.name = "Item Name is required";
    if (form.quantity <= 0) errors.quantity = "Quantity must be at least 1";
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;

    try {
      if (isEdit) {
        await axios.put(`https://laravel-backend-borrowing-production-cc2c.up.railway.app/api/items/${form.id}`, form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post("https://laravel-backend-borrowing-production-cc2c.up.railway.app/api/items", form, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setShowModal(false);
      setForm({ id: 0, name: "", description: "", quantity: 0 });
      setIsEdit(false);
      setFormErrors({});
      fetchItems();
    } catch (err) {
      console.error("Error saving item:", err);
    }
  };

  // Delete
  const handleDelete = async (id: number) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await axios.delete(`https://laravel-backend-borrowing-production-1df4.up.railway.app/api/items/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          Swal.fire("Deleted!", "Item has been deleted.", "success");
          fetchItems();
        } catch (err) {
          Swal.fire("Error!", "Failed to delete item.", "error");
        }
      }
    });
  };

  return (
    <div className="p-4 sm:p-6">
      <h2 className="text-2xl font-bold mb-4">Item List</h2>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by name..."
        className="border px-3 py-2 mb-4 rounded w-full sm:w-72 block"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Add Button */}
      <button
        className="mb-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 w-full sm:w-auto"
        onClick={() => {
          setShowModal(true);
          setIsEdit(false);
          setForm({ id: 0, name: "", description: "", quantity: 0 });
          setFormErrors({});
        }}
      >
        + Add Item
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
                  <th className="border px-2 sm:px-4 py-2">Name</th>
                  <th className="border px-2 sm:px-4 py-2 hidden sm:table-cell">
                    Description
                  </th>
                  <th className="border px-2 sm:px-4 py-2">Qty</th>
                  <th className="border px-2 sm:px-4 py-2 w-40">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4">
                      No items found.
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item) => (
                    <tr key={item.id}>
                      <td className="border px-2 sm:px-4 py-2 text-center">
                        {item.id}
                      </td>
                      <td className="border px-2 sm:px-4 py-2 text-center">
                        {item.name}
                      </td>
                      <td className="border px-2 sm:px-4 py-2 text-center hidden sm:table-cell">
                        {item.description}
                      </td>
                      <td className="border px-2 sm:px-4 py-2 text-center">
                        {item.quantity}
                      </td>
                      <td className="border px-2 sm:px-4 py-2 flex flex-col sm:flex-row gap-2 justify-center">
                        {/* Edit */}
                        <button
                          className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                          onClick={() => {
                            setShowModal(true);
                            setIsEdit(true);
                            setForm(item);
                            setFormErrors({});
                          }}
                        >
                          Edit
                        </button>
                        {/* Delete */}
                        <button
                          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
                          onClick={() => handleDelete(item.id)}
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
              {isEdit ? "Edit Item" : "Add Item"}
            </h3>

            {/* Name */}
            <input
              type="text"
              placeholder="Item Name"
              className={`w-full border px-3 py-2 mb-1 rounded ${
                formErrors.name ? "border-red-500" : ""
              }`}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
            {formErrors.name && (
              <p className="text-red-500 text-sm mb-2">{formErrors.name}</p>
            )}

            {/* Description */}
            <textarea
              placeholder="Description"
              className="w-full border px-3 py-2 mb-3 rounded"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />

            {/* Quantity */}
            <input
              type="number"
              placeholder="Quantity"
              className={`w-full border px-3 py-2 mb-1 rounded ${
                formErrors.quantity ? "border-red-500" : ""
              }`}
              value={form.quantity}
              onChange={(e) =>
                setForm({ ...form, quantity: parseInt(e.target.value) })
              }
            />
            {formErrors.quantity && (
              <p className="text-red-500 text-sm mb-2">{formErrors.quantity}</p>
            )}

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
              <button
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleSave}
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

export default ItemListPage;
