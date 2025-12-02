import React, { useState, useEffect } from "react";
import { Save, Info, CheckCircle, Plus, Trash2, Calendar, X, ChevronLeft, ChevronRight } from "lucide-react";
import { db } from "../../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, getDoc, setDoc } from "firebase/firestore";

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

  // Load settings from localStorage
  useEffect(() => {
    const savedSettings = localStorage.getItem("analyticsSettings");
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);


  useEffect(()=>{
    const loadSettigs = async () =>{
      
      const docRef = await getDoc(doc(db, "settings", "analytics"));
      const data = docRef.data();

      setSettings(data.settings);

    }

    loadSettigs();
  },[])

  // Load expenses from Firestore
  useEffect(() => {
    const fetchExpenses = async () => {
      try {
        const snap = await getDocs(collection(db, "expenses"));
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setExpenses(data);
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
    await setDoc(doc(db, "settings", "analytics"),{
      settings: settings,
      
      })
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleReset = () => {
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
    localStorage.removeItem("analyticsSettings");
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

  return (
    <div className="w-full max-w-6xl mx-auto pt-8">
      <h1 className="text-2xl font-bold text-coffee-800 mb-6 flex items-center gap-2">
        <Info className="w-6 h-6" />
        Analytics Preferences
      </h1>
      <p className="text-coffee-600 mb-8">
        Customize how your analytics work. These settings help make reports easier to understand.
      </p>

      <div className="flex flex-col md:flex-row gap-8 md:gap-10">
        {/* Left Column: General Settings and Notifications */}
        <div className="flex-1">
          <div className="bg-white rounded-2xl shadow-soft-xl p-8 border border-coffee-100">
            {/* General Settings */}
            <section className="mb-8">
              <h2 className="text-lg font-semibold text-coffee-800 mb-4">General Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-coffee-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-coffee-700">Default Time Period</label>
                    <p className="text-xs text-coffee-600">Choose the time range that shows first on Dashboard.</p>
                  </div>
                  <select
                    value={settings.defaultPeriod}
                    onChange={(e) => handleChange("defaultPeriod", e.target.value)}
                    className="border border-coffee-300 rounded-lg px-3 py-2 bg-white text-coffee-800"
                  >
                    <option value="Today">Today</option>
                    <option value="This Week">This Week</option>
                    <option value="This Month">This Month</option>
                    <option value="This Year">This Year</option>
                  </select>
                </div>

                
                <div className="flex items-center justify-between p-4 bg-coffee-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-coffee-700">Sales Goal Type</label>
                    <p className="text-xs text-coffee-600">Set goals for daily, monthly, or turn off.</p>
                  </div>
                  <select
                    value={settings.goalType}
                    onChange={(e) => handleChange("goalType", e.target.value)}
                    className="border border-coffee-300 rounded-lg px-3 py-2 bg-white text-coffee-800"
                  >
                    <option value="Daily">Daily</option>
                    <option value="Monthly">Monthly</option>
                    <option value="Off">Off</option>
                  </select>
                </div>

                {settings.goalType !== "Off" && (
                  <div className="flex items-center justify-between p-4 bg-coffee-50 rounded-lg ml-4 border-l-4 border-coffee-300">
                    <div>
                      <label className="block text-sm font-medium text-coffee-700">Goal Amount (₱)</label>
                      <p className="text-xs text-coffee-600">Target sales for {settings.goalType.toLowerCase()}.</p>
                    </div>
                    <input
                      type="number"
                      min="0"
                      value={settings.goalAmount}
                      onChange={(e) => handleChange("goalAmount", parseInt(e.target.value) || 0)}
                      className="border border-coffee-300 rounded-lg px-3 py-2 bg-white text-coffee-800 w-24"
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Notifications */}
            <section>
              
              
            </section>
          </div>
        </div>

        {/* Right Column: Dashboard Insights */}
        <div className="flex-1 flex">
          <div className="bg-white rounded-2xl shadow-soft-xl p-8 border border-coffee-100 flex flex-col w-full">
            <section>
              <h2 className="text-lg font-semibold text-coffee-800 mb-4">Dashboard Insights</h2>
              <p className="text-xs text-coffee-600 mb-4">Control which alerts appear in the Manager's Insight section.</p>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-coffee-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-coffee-700">Low Stock Alerts</label>
                    <p className="text-xs text-coffee-600">Show warnings for items running low.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableLowStock}
                      onChange={(e) => handleChange("enableLowStock", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-coffee-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coffee-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-coffee-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-coffee-700">Sales Trend Alerts</label>
                    <p className="text-xs text-coffee-600">Show messages about sales increases.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableSalesUp}
                      onChange={(e) => handleChange("enableSalesUp", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-coffee-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coffee-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-coffee-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-coffee-700">Peak Hour Suggestions</label>
                    <p className="text-xs text-coffee-600">Show staffing recommendations for busy times.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enablePeakHour}
                      onChange={(e) => handleChange("enablePeakHour", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-coffee-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coffee-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-600"></div>
                  </label>
                </div>

                

                <div className="flex items-center justify-between p-4 bg-coffee-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-coffee-700">Profit Status</label>
                    <p className="text-xs text-coffee-600">Show whether the business profited, lost, or broke even.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enableProfitStatus}
                      onChange={(e) => handleChange("enableProfitStatus", e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-coffee-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-coffee-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-coffee-600"></div>
                  </label>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Expense Management Section */}
      <div className="mt-8 bg-white rounded-2xl shadow-soft-xl p-8 border border-coffee-100">
        <h2 className="text-xl font-semibold text-coffee-800 mb-4 flex items-center gap-2">
          💰 Expense Management
        </h2>
        <p className="text-coffee-600 mb-6 text-sm">
          Track your business expenses to calculate accurate profit on the dashboard.
        </p>

        {/* Add Expense Form */}
        <div className="bg-coffee-50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-coffee-800 mb-4">Add New Expense</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-2">Category *</label>
              <input
                type="text"
                value={newExpense.category}
                onChange={(e) => handleExpenseChange("category", e.target.value)}
                placeholder="e.g., Rent, Utilities"
                className="w-full px-3 py-2 border border-coffee-300 rounded-lg bg-white text-coffee-800 focus:ring-2 focus:ring-coffee-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-2">Amount (₱) *</label>
              <input
                type="number"
                value={newExpense.amount}
                onChange={(e) => handleExpenseChange("amount", e.target.value)}
                placeholder="0.00"
                min="0"
                step="0.01"
                className="w-full px-3 py-2 border border-coffee-300 rounded-lg bg-white text-coffee-800 focus:ring-2 focus:ring-coffee-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-2">Date *</label>
              <input
                type="date"
                value={newExpense.date}
                onChange={(e) => handleExpenseChange("date", e.target.value)}
                className="w-full px-3 py-2 border border-coffee-300 rounded-lg bg-white text-coffee-800 focus:ring-2 focus:ring-coffee-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-coffee-700 mb-2">Description</label>
              <input
                type="text"
                value={newExpense.description}
                onChange={(e) => handleExpenseChange("description", e.target.value)}
                placeholder="Optional notes"
                className="w-full px-3 py-2 border border-coffee-300 rounded-lg bg-white text-coffee-800 focus:ring-2 focus:ring-coffee-400 focus:outline-none"
              />
            </div>
          </div>
          <button
            onClick={handleAddExpense}
            className="mt-4 flex items-center gap-2 bg-coffee-700 text-white px-4 py-2 rounded-lg hover:bg-coffee-800 transition"
          >
            <Plus className="w-4 h-4" />
            Add Expense
          </button>
        </div>

        {expenseMessage && (
          <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 ${
            expenseMessage.includes("successfully") || expenseMessage.includes("deleted")
              ? "bg-green-50 border border-green-200 text-green-800"
              : "bg-red-50 border border-red-200 text-red-800"
          }`}>
            <CheckCircle className="w-5 h-5" />
            {expenseMessage}
          </div>
        )}

        {/* Date Filter */}
        <div className="mb-4 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-coffee-600" />
            <label className="text-sm font-medium text-coffee-700">Filter by Date:</label>
            <input
              type="date"
              value={filterDate}
              onChange={(e) => setFilterDate(e.target.value)}
              className="px-3 py-2 border border-coffee-300 rounded-lg bg-white text-coffee-800 focus:ring-2 focus:ring-coffee-400 focus:outline-none"
            />
          </div>
          {filterDate && (
            <button
              onClick={clearFilter}
              className="flex items-center gap-1 px-3 py-2 bg-coffee-100 text-coffee-800 rounded-lg hover:bg-coffee-200 transition text-sm"
            >
              <X className="w-4 h-4" />
              Clear Filter
            </button>
          )}
        </div>

        {/* Expense List */}
        <div className="overflow-x-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-coffee-800">
              {filterDate ? `Expenses on ${new Date(filterDate).toLocaleDateString()}` : 'Recent Expenses'}
            </h3>
            {filteredExpenses.length > 0 && (
              <span className="text-sm text-coffee-600">
                Showing {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, filteredExpenses.length)} of {filteredExpenses.length}
              </span>
            )}
          </div>
          {filteredExpenses.length === 0 ? (
            <div className="text-center py-8 text-coffee-600 bg-coffee-50 rounded-lg">
              <p className="font-medium">
                {filterDate ? "No expenses found for this date." : "No expenses recorded yet."}
              </p>
              <p className="text-sm mt-2">
                {filterDate ? "Try selecting a different date." : "Add your first expense above to start tracking."}
              </p>
            </div>
          ) : (
            <>
              <div className="border border-coffee-200 rounded-lg overflow-hidden">
                <table className="w-full border-collapse">
                  <thead className="bg-coffee-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-coffee-800">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-coffee-800">Category</th>
                      <th className="px-4 py-3 text-left text-sm font-semibold text-coffee-800">Description</th>
                      <th className="px-4 py-3 text-right text-sm font-semibold text-coffee-800">Amount</th>
                      <th className="px-4 py-3 text-center text-sm font-semibold text-coffee-800">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentExpenses.map((expense, index) => (
                      <tr 
                        key={expense.id} 
                        className={`border-b border-coffee-100 hover:bg-coffee-50 transition ${
                          index % 2 === 0 ? 'bg-white' : 'bg-coffee-50/30'
                        }`}
                      >
                        <td className="px-4 py-3 text-sm text-coffee-800">
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-coffee-600" />
                            {new Date(expense.date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-coffee-800">{expense.category}</td>
                        <td className="px-4 py-3 text-sm text-coffee-600">{expense.description || "—"}</td>
                        <td className="px-4 py-3 text-sm font-semibold text-coffee-900 text-right">
                          ₱{expense.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleDeleteExpense(expense.id)}
                            className="text-red-600 hover:text-red-800 transition p-1 hover:bg-red-50 rounded"
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
                    className="flex items-center gap-1 px-3 py-2 bg-coffee-100 text-coffee-800 rounded-lg hover:bg-coffee-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </button>

                  <div className="flex items-center gap-2">
                    {[...Array(totalPages)].map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentPage(index + 1)}
                        className={`px-3 py-1 rounded-lg transition ${
                          currentPage === index + 1
                            ? "bg-coffee-700 text-white"
                            : "bg-coffee-100 text-coffee-800 hover:bg-coffee-200"
                        }`}
                      >
                        {index + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="flex items-center gap-1 px-3 py-2 bg-coffee-100 text-coffee-800 rounded-lg hover:bg-coffee-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
      <div className="flex justify-end gap-4 mt-8">
        <button
          onClick={handleReset}
          className="px-4 py-2 bg-gray-200 text-coffee-800 rounded-lg hover:bg-gray-300"
        >
          Reset to Defaults
        </button>
        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-coffee-700 text-white px-6 py-3 rounded-lg hover:bg-coffee-800 transition"
        >
          <Save className="w-5 h-5" />
          Save Changes
        </button>
      </div>

      {saved && (
        <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-800">
          <CheckCircle className="w-5 h-5" />
          Settings saved successfully!
        </div>
      )}
    </div>
  );
}