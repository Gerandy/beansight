import React, { useState, useEffect } from "react";
import { 
  Save, 
  Info, 
  CheckCircle, 
  Plus, 
  Trash2, 
  Calendar, 
  X, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  DollarSign,
  BarChart3,
  AlertCircle,
  RotateCcw,
  Filter
} from "lucide-react";
import { db } from "../../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";

// Success Modal
function SuccessModal({ open, onClose }) {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 relative animate-scaleIn">
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
        
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" strokeWidth={3} />
          </div>
          
          <h3 className="text-2xl font-bold text-coffee-900 mb-2">
            Settings Saved!
          </h3>
          
          <p className="text-gray-600 mb-6">
            Your analytics preferences have been successfully updated.
          </p>
          
          <button
            onClick={onClose}
            className="bg-coffee-700 hover:bg-coffee-800 text-white px-8 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 shadow-lg"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsSettings() {
  // State for settings
  const [settings, setSettings] = useState({
    defaultPeriod: "This Week",
    profitMargin: 30,
    enableAlerts: true,
    alertThreshold: 20,
    goalType: "Daily",
    goalAmount: 5000,
    enableLowStock: true,
    enableSalesUp: true,
    enablePeakHour: true,
    enablePendingOrders: true,
    enableProfitStatus: true,
  });
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Expense Management State
  const [expenses, setExpenses] = useState([]);
  const [newExpense, setNewExpense] = useState({
    category: "",
    amount: "",
    date: new Date().toISOString().split('T')[0],
    description: ""
  });
  const [expenseMessage, setExpenseMessage] = useState("");
  const [filterDate, setFilterDate] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Load settings
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const docRef = await getDoc(doc(db, "settings", "analytics"));
        if (docRef.exists()) {
          const data = docRef.data();
          setSettings(data.settings);
        }
      } catch (err) {
        console.error("Error loading settings:", err);
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  // Load expenses from Firestore
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const snap = await getDocs(collection(db, "expenses"));
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setExpenses(data);
        console.log(data);
      } catch (err) {
        console.error("Error fetching expenses:", err);
      }
    };
    fetchExpenses();
  }, []);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterDate]);

  const handleChange = (key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await setDoc(doc(db, "settings", "analytics"), {
        settings: settings,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error("Error saving settings:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (!window.confirm("Are you sure you want to reset to default settings?")) return;
    
    const defaultSettings = {
      defaultPeriod: "This Month",
      profitMargin: 30,
      enableAlerts: true,
      alertThreshold: 20,
      goalType: "Daily",
      goalAmount: 5000,
      enableLowStock: true,
      enableSalesUp: true,
      enablePeakHour: true,
      enablePendingOrders: true,
      enableProfitStatus: true,
    };
    setSettings(defaultSettings);
  };

  const handleExpenseChange = (key, value) => {
    setNewExpense((prev) => ({ ...prev, [key]: value }));
  };

  const handleAddExpense = async () => {
    if (!newExpense.category || !newExpense.amount || !newExpense.date) {
      setExpenseMessage("Please fill in all required fields (Category, Amount, Date)");
      setTimeout(() => setExpenseMessage(""), 3000);
      return;
    }

    if (parseFloat(newExpense.amount) <= 0) {
      setExpenseMessage("Amount must be greater than 0");
      setTimeout(() => setExpenseMessage(""), 3000);
      return;
    }

    try {
      const expenseData = {
        category: newExpense.category,
        amount: parseFloat(newExpense.amount),
        date: newExpense.date,
        description: newExpense.description || "",
        createdAt: new Date().toISOString()
      };

      const docRef = await addDoc(collection(db, "expenses"), expenseData);
      const newExpenseWithId = { id: docRef.id, ...expenseData };
      setExpenses([newExpenseWithId, ...expenses]);

      setNewExpense({
        category: "",
        amount: "",
        date: new Date().toISOString().split('T')[0],
        description: ""
      });

      setExpenseMessage("Expense added successfully!");
      setTimeout(() => setExpenseMessage(""), 3000);
    } catch (err) {
      console.error("Error adding expense:", err);
      setExpenseMessage("Error adding expense. Please try again.");
      setTimeout(() => setExpenseMessage(""), 3000);
    }
  };

  const handleDeleteExpense = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) {
      return;
    }

    try {
      await deleteDoc(doc(db, "expenses", id));
      setExpenses(expenses.filter(exp => exp.id !== id));
      setExpenseMessage("Expense deleted successfully!");
      setTimeout(() => setExpenseMessage(""), 3000);
    } catch (err) {
      console.error("Error deleting expense:", err);
      setExpenseMessage("Error deleting expense. Please try again.");
      setTimeout(() => setExpenseMessage(""), 3000);
    }
  };

  const clearFilter = () => {
    setFilterDate("");
    setCurrentPage(1);
  };

  // Filter and pagination
  const filteredExpenses = filterDate 
    ? expenses.filter(expense => expense.date === filterDate)
    : expenses;

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentExpenses = filteredExpenses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);

  // Calculate total expenses
  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  if (loading) {
    return (
      <div className="w-full max-w-7xl mx-auto pt-8 px-4 pb-12">
        <div className="animate-pulse space-y-6">
          <div className="h-12 bg-gray-200 rounded-lg w-1/3"></div>
          <div className="h-6 bg-gray-200 rounded w-2/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[1, 2].map(i => (
              <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-7xl mx-auto pt-8 px-4 pb-12">
        <SuccessModal open={saved} onClose={() => setSaved(false)} />
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="bg-coffee-600 p-3 rounded-xl">
              <BarChart3 className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-4xl font-extrabold text-coffee-900">Analytics Settings</h2>
          </div>
          <p className="text-coffee-600 text-lg leading-relaxed max-w-3xl">
            Customize analytics preferences, set sales goals, manage insights, and track business expenses for accurate profit calculations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Left Column: General Settings */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-coffee-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-coffee-100 p-2 rounded-lg">
                <BarChart3 className="w-6 h-6 text-coffee-700" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-coffee-900">General Settings</h3>
                <p className="text-coffee-600 text-sm">Configure dashboard preferences</p>
              </div>
            </div>

            <div className="space-y-5">
              <div className="bg-coffee-50 rounded-xl p-4 border-2 border-coffee-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-coffee-600" />
                    <label className="font-semibold text-coffee-800">Default Time Period</label>
                  </div>
                </div>
                <p className="text-xs text-coffee-600 mb-3">Time range displayed first on Dashboard</p>
                <select
                  value={settings.defaultPeriod}
                  onChange={(e) => handleChange("defaultPeriod", e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-coffee-300 rounded-lg bg-white text-coffee-800 font-medium focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 cursor-pointer transition"
                >
                  <option value="Today">Today</option>
                  <option value="This Week">This Week</option>
                  <option value="This Month">This Month</option>
                  <option value="This Year">This Year</option>
                </select>
              </div>

              <div className="bg-coffee-50 rounded-xl p-4 border-2 border-coffee-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-coffee-600" />
                    <label className="font-semibold text-coffee-800">Sales Goal Type</label>
                  </div>
                </div>
                <p className="text-xs text-coffee-600 mb-3">Set daily, monthly goals, or disable</p>
                <select
                  value={settings.goalType}
                  onChange={(e) => handleChange("goalType", e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-coffee-300 rounded-lg bg-white text-coffee-800 font-medium focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 cursor-pointer transition"
                >
                  <option value="Daily">Daily</option>
                  <option value="Monthly">Monthly</option>
                  <option value="Off">Off</option>
                </select>
              </div>

              {settings.goalType !== "Off" && (
                <div className="bg-green-50 rounded-xl p-4 border-2 border-green-300 ml-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-5 h-5 text-green-600" />
                      <label className="font-semibold text-green-800">Goal Amount (₱)</label>
                    </div>
                  </div>
                  <p className="text-xs text-green-600 mb-3">Target sales for {settings.goalType.toLowerCase()}</p>
                  <input
                    type="number"
                    min="0"
                    value={settings.goalAmount}
                    onChange={(e) => handleChange("goalAmount", parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-2.5 border-2 border-green-300 rounded-lg bg-white text-green-800 font-medium focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="5000"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Dashboard Insights */}
          <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-coffee-100 hover:shadow-xl transition-shadow">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-coffee-100 p-2 rounded-lg">
                <Info className="w-6 h-6 text-coffee-700" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-coffee-900">Dashboard Insights</h3>
                <p className="text-coffee-600 text-sm">Control visible alerts</p>
              </div>
            </div>

            <div className="space-y-4">
              {[
                {
                  key: "enableLowStock",
                  label: "Low Stock Alerts",
                  description: "Warnings for items running low",
                  icon: AlertCircle
                },
                {
                  key: "enableSalesUp",
                  label: "Sales Trend Alerts",
                  description: "Messages about sales increases",
                  icon: TrendingUp
                },
                {
                  key: "enablePeakHour",
                  label: "Peak Hour Suggestions",
                  description: "Staffing recommendations for busy times",
                  icon: Calendar
                },
                {
                  key: "enableProfitStatus",
                  label: "Profit Status",
                  description: "Show profit, loss, or break-even status",
                  icon: DollarSign
                }
              ].map(item => {
                const IconComponent = item.icon;
                return (
                  <div key={item.key} className="flex items-center justify-between p-4 bg-coffee-50 rounded-xl border-2 border-coffee-200 hover:border-coffee-300 transition">
                    <div className="flex items-start gap-3">
                      <IconComponent className="w-6 h-6 text-coffee-600 mt-0.5" />
                      <div>
                        <label className="font-semibold text-coffee-800 block">{item.label}</label>
                        <p className="text-xs text-coffee-600 mt-1">{item.description}</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings[item.key]}
                        onChange={(e) => handleChange(item.key, e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coffee-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-600"></div>
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Expense Management Section */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-coffee-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-coffee-100 p-2 rounded-lg">
              <DollarSign className="w-6 h-6 text-coffee-700" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-coffee-900">Expense Management</h3>
              <p className="text-coffee-600 text-sm">Track expenses for accurate profit calculation</p>
            </div>
          </div>

          {/* Add Expense Form */}
          <div className="bg-gradient-to-br from-coffee-50 to-coffee-100 rounded-xl p-6 mb-6 border-2 border-coffee-200">
            <h4 className="text-lg font-semibold text-coffee-800 mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5" />
              Add New Expense
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-semibold text-coffee-800 mb-2">Category *</label>
                <input
                  type="text"
                  value={newExpense.category}
                  onChange={(e) => handleExpenseChange("category", e.target.value)}
                  placeholder="e.g., Rent, Utilities"
                  className="w-full px-3 py-2.5 border-2 border-coffee-300 rounded-lg bg-white text-coffee-800 focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-coffee-800 mb-2">Amount (₱) *</label>
                <input
                  type="number"
                  value={newExpense.amount}
                  onChange={(e) => handleExpenseChange("amount", e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2.5 border-2 border-coffee-300 rounded-lg bg-white text-coffee-800 focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-coffee-800 mb-2">Date *</label>
                <input
                  type="date"
                  value={newExpense.date}
                  onChange={(e) => handleExpenseChange("date", e.target.value)}
                  className="w-full px-3 py-2.5 border-2 border-coffee-300 rounded-lg bg-white text-coffee-800 focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-coffee-800 mb-2">Description</label>
                <input
                  type="text"
                  value={newExpense.description}
                  onChange={(e) => handleExpenseChange("description", e.target.value)}
                  placeholder="Optional notes"
                  className="w-full px-3 py-2.5 border-2 border-coffee-300 rounded-lg bg-white text-coffee-800 focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 font-medium"
                />
              </div>
            </div>
            <button
              onClick={handleAddExpense}
              className="mt-4 flex items-center gap-2 bg-coffee-700 text-white px-6 py-2.5 rounded-xl hover:bg-coffee-800 transition font-semibold shadow-md"
            >
              <Plus className="w-5 h-5" />
              Add Expense
            </button>
          </div>

          {expenseMessage && (
            <div className={`mb-4 p-4 rounded-xl flex items-center gap-3 ${
              expenseMessage.includes("successfully") || expenseMessage.includes("deleted")
                ? "bg-green-50 border-2 border-green-300 text-green-800"
                : "bg-red-50 border-2 border-red-300 text-red-800"
            }`}>
              {expenseMessage.includes("successfully") || expenseMessage.includes("deleted") ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <AlertCircle className="w-5 h-5" />
              )}
              <span className="font-medium">{expenseMessage}</span>
            </div>
          )}

          {/* Date Filter */}
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-coffee-50 px-4 py-2 rounded-lg border-2 border-coffee-200">
              <Filter className="w-5 h-5 text-coffee-600" />
              <label className="text-sm font-semibold text-coffee-700">Filter by Date:</label>
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="px-3 py-1.5 border-2 border-coffee-300 rounded-lg bg-white text-coffee-800 focus:ring-2 focus:ring-coffee-500 focus:border-coffee-500 font-medium"
              />
            </div>
            {filterDate && (
              <button
                onClick={clearFilter}
                className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition font-semibold border-2 border-red-300"
              >
                <X className="w-4 h-4" />
                Clear Filter
              </button>
            )}
          </div>

          {/* Expense List */}
          <div className="overflow-x-auto">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-bold text-coffee-900">
                {filterDate ? `Expenses on ${new Date(filterDate).toLocaleDateString()}` : 'Recent Expenses'}
              </h4>
              {filteredExpenses.length > 0 && (
                <div className="text-sm text-coffee-600 bg-coffee-50 px-3 py-1 rounded-lg font-medium">
                  Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredExpenses.length)} of {filteredExpenses.length}
                </div>
              )}
            </div>
            
            {filteredExpenses.length === 0 ? (
              <div className="text-center py-12 bg-gradient-to-br from-coffee-50 to-coffee-100 rounded-xl border-2 border-coffee-200">
                <DollarSign className="w-16 h-16 text-coffee-300 mx-auto mb-3" />
                <p className="font-semibold text-coffee-700 text-lg">
                  {filterDate ? "No expenses found for this date" : "No expenses recorded yet"}
                </p>
                <p className="text-sm text-coffee-600 mt-2">
                  {filterDate ? "Try selecting a different date" : "Add your first expense above to start tracking"}
                </p>
              </div>
            ) : (
              <>
                <div className="border-2 border-coffee-200 rounded-xl overflow-hidden shadow-sm">
                  <table className="w-full border-collapse">
                    <thead className="bg-gradient-to-r from-coffee-100 to-coffee-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-bold text-coffee-800">Date</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-coffee-800">Category</th>
                        <th className="px-4 py-3 text-left text-sm font-bold text-coffee-800">Description</th>
                        <th className="px-4 py-3 text-right text-sm font-bold text-coffee-800">Amount</th>
                        <th className="px-4 py-3 text-center text-sm font-bold text-coffee-800">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentExpenses.map((expense, index) => (
                        <tr 
                          key={expense.id} 
                          className={`border-t-2 border-coffee-100 hover:bg-coffee-50 transition ${
                            index % 2 === 0 ? 'bg-white' : 'bg-coffee-50/30'
                          }`}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 text-coffee-800 font-medium">
                              <Calendar className="w-4 h-4 text-coffee-600" />
                              {new Date(expense.date).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-semibold text-coffee-900">{expense.category}</td>
                          <td className="px-4 py-3 text-coffee-600">{expense.description || "—"}</td>
                          <td className="px-4 py-3 text-right font-bold text-coffee-900">
                            ₱{expense.amount.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="text-red-600 hover:text-red-800 hover:bg-red-50 p-2 rounded-lg transition"
                              title="Delete expense"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="flex items-center gap-2 px-4 py-2 bg-coffee-100 text-coffee-800 rounded-xl hover:bg-coffee-200 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold border-2 border-coffee-200"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Previous
                    </button>

                    <div className="flex items-center gap-2">
                      {[...Array(totalPages)].map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentPage(index + 1)}
                          className={`px-4 py-2 rounded-xl transition font-semibold ${
                            currentPage === index + 1
                              ? "bg-coffee-700 text-white shadow-md"
                              : "bg-coffee-100 text-coffee-800 hover:bg-coffee-200 border-2 border-coffee-200"
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="flex items-center gap-2 px-4 py-2 bg-coffee-100 text-coffee-800 rounded-xl hover:bg-coffee-200 disabled:opacity-50 disabled:cursor-not-allowed transition font-semibold border-2 border-coffee-200"
                    >
                      Next
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-end mt-8">
          <button
            onClick={handleReset}
            className="bg-gray-200 text-gray-700 px-8 py-3 rounded-xl font-bold shadow-md hover:bg-gray-300 transition flex items-center justify-center gap-2"
          >
            <RotateCcw className="w-5 h-5" />
            Reset to Defaults
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-coffee-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-coffee-800 hover:shadow-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                Save Changes
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </>
  );
}