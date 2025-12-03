import React, { useState, useEffect } from "react";
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
  Copy,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  collection,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  setDoc,
  getDoc,
  addDoc,
  serverTimestamp, // added
} from "firebase/firestore";
import { db, auth, functions } from "../firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { httpsCallable } from "firebase/functions";

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

// === Temp Password Modal ===
const TempPasswordModal = ({ isOpen, onClose, email, password }) => {
  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(password);
    alert("Password copied to clipboard!");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl relative"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <button
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
              onClick={onClose}
            >
              <X size={20} />
            </button>
            <h2 className="text-xl font-bold mb-4 text-gray-800">Temporary Password Generated</h2>
            <p className="mb-2 text-gray-700">Email: <span className="font-semibold">{email}</span></p>
            <p className="mb-4 text-gray-700">Temporary Password: <span className="font-mono font-bold">{password}</span></p>
            <div className="flex justify-end gap-2">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 bg-coffee-600 hover:bg-coffee-700 text-white px-4 py-2 rounded-lg transition"
              >
                <Copy size={16} /> Copy
              </button>
              <button
                onClick={onClose}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg transition"
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// === User Modal ===
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
            <button onClick={onClose} className="absolute top-4 right-4 text-[#7B4B2A] hover:text-[#5B321B] transition">
              <X size={20} />
            </button>
            <div className="flex items-center gap-2 mb-4">
              <Users className="text-[#7B4B2A] w-5 h-5" />
              <h2 className="text-xl font-semibold text-[#5B321B]">{title}</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[#7B4B2A] mb-1">First Name</label>
                <input
                  type="text"
                  className="w-full border border-[#E3C7A2] rounded-xl px-3 py-2 bg-white text-[#5B321B] focus:ring-2 focus:ring-[#C5A16D] focus:outline-none"
                  value={user.firstName || ""}
                  onChange={(e) => setUser({ ...user, firstName: e.target.value })}
                  placeholder="Enter first name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#7B4B2A] mb-1">Last Name</label>
                <input
                  type="text"
                  className="w-full border border-[#E3C7A2] rounded-xl px-3 py-2 bg-white text-[#5B321B] focus:ring-2 focus:ring-[#C5A16D] focus:outline-none"
                  value={user.lastName || ""}
                  onChange={(e) => setUser({ ...user, lastName: e.target.value })}
                  placeholder="Enter last name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#7B4B2A] mb-1">Email</label>
                <input
                  type="email"
                  className="w-full border border-[#E3C7A2] rounded-xl px-3 py-2 bg-white text-[#5B321B] focus:ring-2 focus:ring-[#C5A16D] focus:outline-none"
                  value={user.email || ""}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  placeholder="example@beansight.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#7B4B2A] mb-1">Contact Number</label>
                <input
                  type="text"
                  className="w-full border border-[#E3C7A2] rounded-xl px-3 py-2 bg-white text-[#5B321B] focus:ring-2 focus:ring-[#C5A16D] focus:outline-none"
                  value={user.contactNumber || ""}
                  onChange={(e) => setUser({ ...user, contactNumber: e.target.value })}
                  placeholder="09927274046"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#7B4B2A] mb-1">Role</label>
                <select
                  className="w-full border border-[#E3C7A2] rounded-xl px-3 py-2 bg-white text-[#5B321B] focus:ring-2 focus:ring-[#C5A16D] focus:outline-none"
                  value={user.role || "staff"}
                  onChange={(e) => setUser({ ...user, role: e.target.value })}
                >
                  <option>admin</option>
                  <option>staff</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#7B4B2A] mb-1">Status</label>
                <select
                  className="w-full border border-[#E3C7A2] rounded-xl px-3 py-2 bg-white text-[#5B321B] focus:ring-2 focus:ring-[#C5A16D] focus:outline-none"
                  value={user.status || "Active"}
                  onChange={(e) => setUser({ ...user, status: e.target.value })}
                >
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Suspended</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button
                className="cursor-pointer px-4 py-2 rounded-xl bg-[#F1E1C8] text-[#5B321B] font-medium hover:bg-[#E9D5AF] transition"
                onClick={onClose}
              >
                ✕ Cancel
              </button>
              <button
                className={`px-4 py-2 rounded-xl text-white font-medium transition ${
                  user.firstName && user.lastName && user.email
                    ? "cursor-pointer bg-[#8B5E3C] hover:bg-[#6F4427]"
                    : "bg-[#C9B5A2] cursor-not-allowed"
                }`}
                onClick={user.firstName && user.lastName && user.email ? onSave : undefined}
                disabled={!user.firstName || !user.lastName || !user.email}
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
const UserTable = ({ users, onEdit, onDelete, onStatusToggle, onAdd }) => {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");
  const [sortKey, setSortKey] = useState("firstName");
  const [sortAsc, setSortAsc] = useState(true);

  const filtered = users
    .filter((u) => {
      const name = ((u.firstName || "") + " " + (u.lastName || "")).toLowerCase();
      const email = (u.email || "").toLowerCase();
      const searchLower = search.toLowerCase();
      const matchesSearch = name.includes(searchLower) || email.includes(searchLower);
      const matchesFilter = filter === "All" || (u.status || "") === filter;
      return matchesSearch && matchesFilter;
    })
    .sort((a, b) => {
      let valA = a[sortKey] || "";
      let valB = b[sortKey] || "";
      if (typeof valA === "string") valA = valA.toLowerCase();
      if (typeof valB === "string") valB = valB.toLowerCase();
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });

  const handleSort = (key) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else {
      setSortKey(key);
      setSortAsc(true);
    }
  };

  return (
    <div className="rounded-2xl shadow-soft-lg p-6 border border-coffee-100">
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
          className="cursor-pointer bg-coffee-600 hover:bg-coffee-700 text-white px-4 py-2 rounded-lg font-semibold shadow transition flex items-center gap-2"
          onClick={onAdd}
        >
          <Plus size={16} /> Add User
        </button>
      </div>

      <div className="overflow-y-auto max-h-[500px] rounded-lg border border-coffee-100">
        <table className="min-w-full text-sm text-gray-900">
          <thead className="sticky top-0 bg-coffee-50 text-coffee-700 z-10">
            <tr>
              {["firstName", "lastName", "email", "role", "status"].map((key) => (
                <th
                  key={key}
                  className="py-3 px-4 text-left font-semibold cursor-pointer select-none"
                  onClick={() => handleSort(key)}
                >
                  <div className="flex items-center gap-1">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                    {sortKey === key
                      ? sortAsc
                        ? <ChevronUp size={14} />
                        : <ChevronDown size={14} />
                      : <ArrowUpDown size={14} className="opacity-40" />}
                  </div>
                </th>
              ))}
              <th className="py-3 px-4 text-left font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-4 text-center text-gray-400">
                  No users found.
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr key={user.id} className="odd:bg-white even:bg-coffee-50 hover:bg-coffee-100 transition">
                  <td className="py-3 px-4">{user.firstName || "N/A"}</td>
                  <td className="py-3 px-4">{user.lastName || "N/A"}</td>
                  <td className="py-3 px-4">{user.email || "N/A"}</td>
                  <td className="py-3 px-4">{user.role || "N/A"}</td>
                  <td className="py-3 px-4">{user.status || "N/A"}</td>
                  <td className="py-3 px-4 flex gap-2 flex-wrap">
                    <button
                      className="cursor-pointer bg-coffee-500 hover:bg-coffee-600 text-white px-3 py-1 rounded text-xs font-semibold transition flex items-center gap-1"
                      onClick={() => onEdit(user)}
                    >
                      <Pencil size={12} /> Edit
                    </button>
                    <button
                      className="cursor-pointer bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs font-semibold transition"
                      onClick={() => onDelete(user)}
                    >
                      Delete
                    </button>
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// === User Management ===
export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [modalUser, setModalUser] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "staff",
    status: "Active",
    contactNumber: "",
  });
  const [tempPasswordData, setTempPasswordData] = useState({ isOpen: false, email: "", password: "" });

  // Fetch users with role in ["admin", "staff"] in real-time
  useEffect(() => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("role", "in", ["admin", "staff"]));

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(data);
    });

    return () => unsub();
  }, []);

  // Add/Edit user
  const handleSaveUser = async () => {
    if (!modalUser.firstName || !modalUser.lastName || !modalUser.email) return alert("Please fill out all required fields.");
    try {
      if (editingUser) {
        const userRef = doc(db, "users", editingUser.id);
        await updateDoc(userRef, modalUser);
      } else {
        // Generate temporary password
        const generateTempPassword = httpsCallable(functions, "generateTempPassword");
        const result = await generateTempPassword({ email: modalUser.email });
        const tempPassword = result.data.tempPassword;

        const userCredential = await createUserWithEmailAndPassword(auth, modalUser.email, tempPassword);
        const uid = userCredential.user.uid;

        await setDoc(doc(db, "users", uid), {
          uid,
          ...modalUser,
          createdAt: new Date(),
          favorites: [],
        });

        setTempPasswordData({
          isOpen: true,
          email: modalUser.email,
          password: tempPassword,
        });
      }
      setShowModal(false);
      setEditingUser(null);
    } catch (err) {
      console.error("Error saving user:", err);
      alert("Error saving user: " + err.message);
    }
  };

  const handleDeleteUser = async (user) => {
    try {
      // get latest user data
      const userRef = doc(db, "users", user.id);
      const snap = await getDoc(userRef);
      const data = snap.exists() ? snap.data() : user;

      // archive user (store originalId and originalData)
      await addDoc(collection(db, "archives"), {
        date: new Date().toISOString(),
        type: "user",
        name: `${data?.firstName || ""} ${data?.lastName || ""}`.trim() || data?.email || "Unknown user",
        details: `Email: ${data?.email || "N/A"} - Role: ${data?.role || "N/A"}`,
        archivedBy: "admin",
        reason: "Deleted",
        originalId: user.id,
        originalData: data || {},
        createdAt: serverTimestamp(),
      });

      // delete original user doc
      await deleteDoc(userRef);
      // update local state
      setUsers(prev => prev.filter(u => u.id !== user.id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusToggle = async (user) => {
    const newStatus = user.status === "Active" ? "Inactive" : user.status === "Inactive" ? "Suspended" : "Active";
    try {
      await updateDoc(doc(db, "users", user.id), { status: newStatus });
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddUser = () => {
    setEditingUser(null);
    setModalUser({ firstName: "", lastName: "", email: "", role: "staff", status: "Active", contactNumber: "" });
    setShowModal(true);
  };

  const handleEditUser = (user) => {
    setEditingUser(user);
    setModalUser({ ...user });
    setShowModal(true);
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-soft-xl p-8 border border-coffee-100">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-extrabold text-coffee-800 mb-2">User Management</h1>
          <p className="text-coffee-600">Manage admins and staff only.</p>
        </header>

        <SummaryCards users={users} />

        <UserTable
          users={users}
          onAdd={handleAddUser}
          onEdit={handleEditUser}
          onDelete={handleDeleteUser}
          onStatusToggle={handleStatusToggle}
        />

        <UserModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onSave={handleSaveUser}
          user={modalUser}
          setUser={setModalUser}
          title={editingUser ? "Edit User" : "Add New User"}
        />

        <TempPasswordModal
          isOpen={tempPasswordData.isOpen}
          onClose={() => setTempPasswordData({ isOpen: false, email: "", password: "" })}
          email={tempPasswordData.email}
          password={tempPasswordData.password}
        />
      </div>
    </div>
  );
}
