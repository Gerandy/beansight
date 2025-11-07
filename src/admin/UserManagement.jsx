import React, { useState } from "react";
import {
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
  Users,
  UserCheck,
  UserX,
  Pencil,
  Plus,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// === Summary Cards ===
const SummaryCards = ({ users }) => {
  const total = users.length;
  const active = users.filter((u) => u.status === "Active").length;
  const inactive = users.filter((u) => u.status === "Inactive").length;
  const suspended = users.filter((u) => u.status === "Suspended").length;

  const cards = [
    { label: "Total Users", value: total, icon: <Users className="w-5 h-5 text-coffee-700" /> },
    { label: "Active", value: active, icon: <UserCheck className="w-5 h-5 text-green-600" /> },
    { label: "Inactive", value: inactive, icon: <UserX className="w-5 h-5 text-yellow-600" /> },
    { label: "Suspended", value: suspended, icon: <UserX className="w-5 h-5 text-red-600" /> },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {cards.map((c, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 bg-gradient-to-br from-coffee-50 to-white rounded-xl shadow-sm border border-coffee-100 hover:shadow-md transition"
        >
          <div>
            <p className="text-sm text-coffee-600">{c.label}</p>
            <p className="text-2xl font-bold text-coffee-800">{c.value}</p>
          </div>
          <div className="bg-coffee-100 p-2 rounded-full">{c.icon}</div>
        </div>
      ))}
    </div>
  );
};

// === Reusable Modal ===
  const UserModal = ({ isOpen, onClose, onSave, user, setUser, title }) => {
    if (!isOpen) return null;

    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 bg-coffee-900/40 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-gradient-to-br from-[#FFF8F1] to-[#F9EFE6] border border-[#E3C7A2] rounded-2xl shadow-2xl w-full max-w-md p-6 relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.4 }}
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-[#7B4B2A] hover:text-[#5B321B] transition"
              >
                <X size={20} />
              </button>

              {/* Header */}
              <div className="flex items-center gap-2 mb-4">
                <Users className="text-[#7B4B2A] w-5 h-5" />
                <h2 className="text-xl font-semibold text-[#5B321B]">
                  {title}
                </h2>
              </div>

              {/* Form */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#7B4B2A] mb-1">
                    Name
                  </label>
                  <input
                    type="text"
                    className="w-full border border-[#E3C7A2] rounded-xl px-3 py-2 bg-white text-[#5B321B] focus:ring-2 focus:ring-[#C5A16D] focus:outline-none"
                    value={user.name}
                    onChange={(e) => setUser({ ...user, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#7B4B2A] mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    className="w-full border border-[#E3C7A2] rounded-xl px-3 py-2 bg-white text-[#5B321B] focus:ring-2 focus:ring-[#C5A16D] focus:outline-none"
                    value={user.email}
                    onChange={(e) => setUser({ ...user, email: e.target.value })}
                    placeholder="example@beansight.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#7B4B2A] mb-1">
                    Role
                  </label>
                  <select
                    className="w-full border border-[#E3C7A2] rounded-xl px-3 py-2 bg-white text-[#5B321B] focus:ring-2 focus:ring-[#C5A16D] focus:outline-none"
                    value={user.role}
                    onChange={(e) => setUser({ ...user, role: e.target.value })}
                  >
                    <option>Admin</option>
                    <option>Staff</option>
                    <option>Customer</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#7B4B2A] mb-1">
                    Status
                  </label>
                  <select
                    className="w-full border border-[#E3C7A2] rounded-xl px-3 py-2 bg-white text-[#5B321B] focus:ring-2 focus:ring-[#C5A16D] focus:outline-none"
                    value={user.status}
                    onChange={(e) => setUser({ ...user, status: e.target.value })}
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Suspended</option>
                  </select>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  className="px-4 py-2 rounded-xl bg-[#F1E1C8] text-[#5B321B] font-medium hover:bg-[#E9D5AF] transition"
                  onClick={onClose}
                >
                  ✕ Cancel
                </button>
                <button
                  className={`px-4 py-2 rounded-xl text-white font-medium transition ${
                    user.name && user.email
                      ? "bg-[#8B5E3C] hover:bg-[#6F4427]"
                      : "bg-[#C9B5A2] cursor-not-allowed"
                  }`}
                  onClick={user.name && user.email ? onSave : undefined}
                  disabled={!user.name || !user.email}
                >
                  ✓ Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  };


// === User Table ===
function UserTable({ users, isAdmin, onAdd, onEdit, onDelete, onStatusToggle }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sortKey, setSortKey] = useState("name");
  const [sortAsc, setSortAsc] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10);

  const filtered = users
    .filter(
      (u) =>
        (u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())) &&
        (filter === "All" || u.status === filter)
    )
    .sort((a, b) => {
      let valA = a[sortKey] || "";
      let valB = b[sortKey] || "";
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

  const visibleUsers = filtered.slice(0, visibleCount);

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop === e.target.clientHeight;
    if (bottom && visibleCount < filtered.length) {
      setTimeout(() => setVisibleCount((prev) => prev + 10), 400);
    }
  };

  const handleSort = (key) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className=" rounded-2xl shadow-soft-lg p-6 border border-coffee-100">
      {/* Filters + Add */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 mb-4">
        <div className="flex gap-2 w-full sm:w-auto">
          <input
            type="text"
            placeholder="Search..."
            className="border rounded-lg px-3 py-2 text-coffee-700 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-400 w-full sm:w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="border rounded-lg text-coffee-700 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-coffee-400"
          >
            <option>All</option>
            <option>Active</option>
            <option>Inactive</option>
            <option>Suspended</option>
          </select>
        </div>
        <button
          className="bg-coffee-600 hover:bg-coffee-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition flex items-center gap-2"
          onClick={onAdd}
        >
          <Plus size={16} /> Add {isAdmin ? "Admin/Staff" : "Customer"}
        </button>
      </div>

      {/* Scrollable Table */}
      <div className="overflow-y-auto max-h-[500px] rounded-lg border border-coffee-100" onScroll={handleScroll}>
        <table className="min-w-full text-sm text-gray-900">
          <thead className="sticky top-0 bg-coffee-50 text-coffee-700 z-10">
            <tr>
              {["name", "email", ...(isAdmin ? ["role"] : []), "status"].map((key) => (
                <th
                  key={key}
                  className="py-3 px-4 text-left font-semibold cursor-pointer select-none"
                  onClick={() => handleSort(key)}
                >
                  <div className="flex items-center gap-1">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                    {sortKey === key ? (
                      sortAsc ? (
                        <ChevronUp size={14} />
                      ) : (
                        <ChevronDown size={14} />
                      )
                    ) : (
                      <ArrowUpDown size={14} className="opacity-40" />
                    )}
                  </div>
                </th>
              ))}
              <th className="py-3 px-4 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleUsers.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 5 : 4} className="py-4 text-center text-gray-400">
                  No users found.
                </td>
              </tr>
            ) : (
              visibleUsers.map((user) => (
                <tr
                  key={user.id}
                  className="odd:bg-white even:bg-coffee-50 hover:bg-coffee-100 transition"
                >
                  <td className="py-3 px-4 font-medium flex items-center gap-2">
                    <span className="inline-flex items-center justify-center h-8 w-8 rounded-full bg-coffee-200 text-coffee-700 font-bold mr-2">
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                    {user.name}
                  </td>
                  <td className="py-3 px-4">{user.email}</td>
                  {isAdmin && (
                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          user.role === "Admin"
                            ? "bg-coffee-100 text-coffee-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                  )}
                  <td className="py-3 px-4">
                    <button
                      className={`px-2 py-1 rounded-full text-xs font-semibold focus:outline-none ${
                        user.status === "Active"
                          ? "bg-green-100 text-green-700"
                          : user.status === "Inactive"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                      onClick={() => onStatusToggle(user)}
                    >
                      {user.status}
                    </button>
                  </td>
                  <td className="py-3 px-4 flex gap-2 flex-wrap">
                    <button
                      className="bg-coffee-500 hover:bg-coffee-600 text-white px-3 py-1 rounded text-xs font-semibold transition flex items-center gap-1"
                      onClick={() => onEdit(user)}
                    >
                      <Pencil size={12} /> Edit
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
    </div>
  );
}

// === Main Page ===
export default function UserManagementEnhanced() {
  const [users, setUsers] = useState([
    { id: 1, name: "John Doe", email: "john@beansight.com", role: "Admin", status: "Active" },
    { id: 2, name: "Jane Smith", email: "jane@beansight.com", role: "Staff", status: "Inactive" },
    { id: 3, name: "Bob Lee", email: "bob@beansight.com", role: "Staff", status: "Suspended" },
    { id: 4, name: "Maria Garcia", email: "maria@beansight.com", role: "Admin", status: "Active" },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [modalUser, setModalUser] = useState({ name: "", email: "", role: "Staff", status: "Active" });

  const handleAddUser = () => {
    setEditingUser(null);
    setModalUser({ name: "", email: "", role: "Staff", status: "Active" });
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setModalUser(user);
    setShowModal(true);
  };

  const handleSaveUser = () => {
    if (!modalUser.name || !modalUser.email) return alert("Please fill out all fields.");
    if (editingUser) {
      setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? modalUser : u)));
    } else {
      setUsers((prev) => [...prev, { id: Date.now(), ...modalUser }]);
    }
    setShowModal(false);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-soft-xl p-8 border border-coffee-100">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-coffee-800 mb-2">User Management</h1>
          <p className="text-coffee-600">Manage admins, staff, and customers.</p>
        </header>

        <SummaryCards users={users} />

        <UserTable
          users={users}
          isAdmin={true}
          onAdd={handleAddUser}
          onEdit={handleEditUser}
          onDelete={(u) => setUsers((prev) => prev.filter((usr) => usr.id !== u.id))}
          onStatusToggle={(u) =>
            setUsers((prev) =>
              prev.map((usr) =>
                usr.id === u.id
                  ? {
                      ...usr,
                      status:
                        usr.status === "Active"
                          ? "Inactive"
                          : usr.status === "Inactive"
                          ? "Suspended"
                          : "Active",
                    }
                  : usr
              )
            )
          }
        />

        <UserModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSaveUser}
          user={modalUser}
          setUser={setModalUser}
          title={editingUser ? "Edit User" : "Add New User"}
        />
      </div>
    </div>
  );
}