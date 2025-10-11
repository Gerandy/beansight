import React, { useState } from "react";

// sample
const admins = [
  { id: 1, name: "Alice Johnson", email: "alice@beansight.com", role: "Admin", status: "Active" },
  { id: 2, name: "Bob Smith", email: "bob@beansight.com", role: "Staff", status: "Inactive" },
];

const customers = [
  { id: 1, name: "Charlie Brown", email: "charlie@gmail.com", status: "Active" },
  { id: 2, name: "Dana White", email: "dana@gmail.com", status: "Active" },
  { id: 3, name: "Eve Black", email: "eve@gmail.com", status: "Suspended" },
];

// Avatar
function Avatar({ name }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
  return (
    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-blue-200 text-blue-800 font-bold mr-2">
      {initials}
    </span>
  );
}

// Confirmation Modal
function ConfirmModal({ open, onClose, onConfirm, message }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-6 w-80 text-black">
        <div className="mb-4">{message}</div>
        <div className="flex justify-end gap-2">
          <button
            className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-1 rounded bg-red-500 hover:bg-red-600 text-white"
            onClick={onConfirm}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

// Add/Edit Modal
function UserModal({ open, onClose, onSave, user, isAdmin }) {
  const [form, setForm] = useState(
    user || { name: "", email: "", role: isAdmin ? "Staff" : undefined, status: "Active" }
  );

  React.useEffect(() => {
    setForm(user || { name: "", email: "", role: isAdmin ? "Staff" : undefined, status: "Active" });
  }, [user, isAdmin, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96 text-black">
        <h3 className="text-lg font-bold mb-4">{user ? "Edit User" : `Add ${isAdmin ? "Admin/Staff" : "Customer"}`}</h3>
        <div className="space-y-3">
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Name"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
          />
          <input
            className="w-full border rounded px-3 py-2"
            placeholder="Email"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
          {isAdmin && (
            <select
              className="w-full border rounded px-3 py-2"
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
            >
              <option value="Admin">Admin</option>
              <option value="Staff">Staff</option>
            </select>
          )}
          <select
            className="w-full border rounded px-3 py-2"
            value={form.status}
            onChange={e => setForm({ ...form, status: e.target.value })}
          >
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            className="px-4 py-1 rounded bg-gray-200 hover:bg-gray-300 text-gray-800"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-1 rounded bg-green-500 hover:bg-green-600 text-white"
            onClick={() => onSave(form)}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}


function Toast({ message, type, onClose }) {
  if (!message) return null;
  return (
    <div className={`fixed top-6 right-6 z-50 px-4 py-2 rounded shadow-lg text-white ${type === "success" ? "bg-green-500" : "bg-red-500"}`}>
      {message}
      <button className="ml-4" onClick={onClose}>✕</button>
    </div>
  );
}


function UserTable({ title, users, isAdmin, onEdit, onDelete, onAdd, onStatusToggle }) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage] = useState(1);
  const pageSize = 5;

  // Filtering
  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );


  const sorted = [...filtered].sort((a, b) => {
    let valA = a[sortKey] || "";
    let valB = b[sortKey] || "";
    if (typeof valA === "string") valA = valA.toLowerCase();
    if (typeof valB === "string") valB = valB.toLowerCase();
    if (valA < valB) return sortAsc ? -1 : 1;
    if (valA > valB) return sortAsc ? 1 : -1;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / pageSize);
  const paged = sorted.slice((page - 1) * pageSize, page * pageSize);

  const handleSort = (key) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <input
          type="text"
          placeholder="Search..."
          className="border rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm text-black">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="py-2 px-4 text-left cursor-pointer select-none" onClick={() => handleSort("name")}>
                Name {sortKey === "name" && (sortAsc ? "▲" : "▼")}
              </th>
              <th className="py-2 px-4 text-left cursor-pointer select-none" onClick={() => handleSort("email")}>
                Email {sortKey === "email" && (sortAsc ? "▲" : "▼")}
              </th>
              {isAdmin && (
                <th className="py-2 px-4 text-left cursor-pointer select-none" onClick={() => handleSort("role")}>
                  Role {sortKey === "role" && (sortAsc ? "▲" : "▼")}
                </th>
              )}
              <th className="py-2 px-4 text-left cursor-pointer select-none" onClick={() => handleSort("status")}>
                Status {sortKey === "status" && (sortAsc ? "▲" : "▼")}
              </th>
              <th className="py-2 px-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 5 : 4} className="py-4 text-center text-gray-400">
                  No users found.
                </td>
              </tr>
            ) : (
              paged.map((user) => (
                <tr key={user.id} className="border-b hover:bg-gray-50 text-black">
                  <td className="py-2 px-4 font-medium flex items-center gap-2">
                    <Avatar name={user.name} />
                    {user.name}
                  </td>
                  <td className="py-2 px-4">{user.email}</td>
                  {isAdmin && (
                    <td className="py-2 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        user.role === "Admin"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}>
                        {user.role}
                      </span>
                    </td>
                  )}
                  <td className="py-2 px-4">
                    <button
                      className={`px-2 py-1 rounded-full text-xs font-semibold focus:outline-none ${
                        user.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : user.status === "Inactive"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                      onClick={() => onStatusToggle(user)}
                      title="Toggle status"
                    >
                      {user.status}
                    </button>
                  </td>
                  <td className="py-2 px-4 flex gap-2">
                    <button
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs font-semibold transition"
                      onClick={() => onEdit(user)}
                    >
                      Edit
                    </button>
                    <button
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold transition"
                      onClick={() => onDelete(user)}
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
 
      {totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <span className="text-xs text-gray-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-1">
            <button
              className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-xs"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Prev
            </button>
            <button
              className="px-2 py-1 rounded bg-gray-200 hover:bg-gray-300 text-xs"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
      <div className="mt-4 flex justify-end">
        <button
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold shadow transition"
          onClick={onAdd}
        >
          + Add {isAdmin ? "Admin/Staff" : "Customer"}
        </button>
      </div>
    </div>
  );
}

export default function UserManagement() {
 
  const [adminList, setAdminList] = useState(admins);
  const [customerList, setCustomerList] = useState(customers);

 
  const [modalOpen, setModalOpen] = useState(false);
  const [modalUser, setModalUser] = useState(null);
  const [modalIsAdmin, setModalIsAdmin] = useState(false);
  const [deleteUser, setDeleteUser] = useState(null);
  const [deleteIsAdmin, setDeleteIsAdmin] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });

  const handleAdd = (isAdmin) => {
    setModalUser(null);
    setModalIsAdmin(isAdmin);
    setModalOpen(true);
  };
  const handleEdit = (user, isAdmin) => {
    setModalUser(user);
    setModalIsAdmin(isAdmin);
    setModalOpen(true);
  };
  const handleSave = (user) => {
    if (modalIsAdmin) {
      if (modalUser) {
        setAdminList((prev) =>
          prev.map((u) => (u.id === modalUser.id ? { ...user, id: u.id } : u))
        );
        setToast({ message: "Admin/Staff updated!", type: "success" });
      } else {
        setAdminList((prev) => [
          ...prev,
          { ...user, id: Math.max(0, ...prev.map((u) => u.id)) + 1 },
        ]);
        setToast({ message: "Admin/Staff added!", type: "success" });
      }
    } else {
      if (modalUser) {
        setCustomerList((prev) =>
          prev.map((u) => (u.id === modalUser.id ? { ...user, id: u.id } : u))
        );
        setToast({ message: "Customer updated!", type: "success" });
      } else {
        setCustomerList((prev) => [
          ...prev,
          { ...user, id: Math.max(0, ...prev.map((u) => u.id)) + 1 },
        ]);
        setToast({ message: "Customer added!", type: "success" });
      }
    }
    setModalOpen(false);
  };


  const handleDelete = (user, isAdmin) => {
    setDeleteUser(user);
    setDeleteIsAdmin(isAdmin);
  };
  const confirmDelete = () => {
    if (deleteIsAdmin) {
      setAdminList((prev) => prev.filter((u) => u.id !== deleteUser.id));
      setToast({ message: "Admin/Staff deleted!", type: "success" });
    } else {
      setCustomerList((prev) => prev.filter((u) => u.id !== deleteUser.id));
      setToast({ message: "Customer deleted!", type: "success" });
    }
    setDeleteUser(null);
  };

  const handleStatusToggle = (user, isAdmin) => {
    const nextStatus =
      user.status === "Active"
        ? "Inactive"
        : user.status === "Inactive"
        ? "Suspended"
        : "Active";
    if (isAdmin) {
      setAdminList((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
      );
    } else {
      setCustomerList((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u))
      );
    }
    setToast({ message: "Status updated!", type: "success" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 p-8">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "" })} />
      <UserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        user={modalUser}
        isAdmin={modalIsAdmin}
      />
      <ConfirmModal
        open={!!deleteUser}
        onClose={() => setDeleteUser(null)}
        onConfirm={confirmDelete}
        message={`Are you sure you want to delete "${deleteUser?.name}"?`}
      />
      <div className="max-w-5xl mx-auto">
        <header className="mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">User Management</h1>
          <p className="text-gray-600">
            Manage admins, staff, and customer accounts from a single dashboard.
          </p>
        </header>
        <UserTable
          title="Admins / Staff Accounts"
          users={adminList}
          isAdmin
          onEdit={(user) => handleEdit(user, true)}
          onDelete={(user) => handleDelete(user, true)}
          onAdd={() => handleAdd(true)}
          onStatusToggle={(user) => handleStatusToggle(user, true)}
        />
        <UserTable
          title="Customer Accounts"
          users={customerList}
          isAdmin={false}
          onEdit={(user) => handleEdit(user, false)}
          onDelete={(user) => handleDelete(user, false)}
          onAdd={() => handleAdd(false)}
          onStatusToggle={(user) => handleStatusToggle(user, false)}
        />
      </div>
    </div>
  );
}