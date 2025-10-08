import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function CustomerAnalytics() {
  // 📈 Mock data — replace later with your actual backend data
  const customerGrowth = [
    { month: "Jan", customers: 80 },
    { month: "Feb", customers: 120 },
    { month: "Mar", customers: 180 },
    { month: "Apr", customers: 220 },
    { month: "May", customers: 300 },
    { month: "Jun", customers: 340 },
    { month: "Jul", customers: 420 },
    { month: "Aug", customers: 470 },
    { month: "Sep", customers: 500 },
  ];

  const repeatCustomers = [
    { name: "Returning", value: 320 },
    { name: "New", value: 180 },
  ];

  const activeCustomers = [
    { day: "Mon", active: 60 },
    { day: "Tue", active: 85 },
    { day: "Wed", active: 90 },
    { day: "Thu", active: 70 },
    { day: "Fri", active: 100 },
    { day: "Sat", active: 120 },
    { day: "Sun", active: 80 },
  ];

  const topCustomers = [
    { name: "John Dela Cruz", orders: 25, spent: 4500 },
    { name: "Maria Santos", orders: 22, spent: 4200 },
    { name: "Carlos Reyes", orders: 19, spent: 3900 },
    { name: "Anna Lopez", orders: 15, spent: 3100 },
    { name: "Mark Mendoza", orders: 14, spent: 2800 },
  ];

  return (
    <div className="p-6 space-y-8  min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">👥 Customer Analytics</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-yellow-400">
          <h2 className="text-gray-600 text-sm">Total Customers</h2>
          <p className="text-2xl font-bold text-red-600">500</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-yellow-400">
          <h2 className="text-gray-600 text-sm">New This Month</h2>
          <p className="text-2xl font-bold text-red-600">120</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-yellow-400">
          <h2 className="text-gray-600 text-sm">Returning Customers</h2>
          <p className="text-2xl font-bold text-red-600">64%</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-yellow-400">
          <h2 className="text-gray-600 text-sm">Avg. Orders per Customer</h2>
          <p className="text-2xl font-bold text-red-600">4.3</p>
        </div>
      </div>

      {/* Growth and Activity Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Line Chart: Customer Growth */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Customer Growth Over Time
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={customerGrowth}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="customers"
                stroke="#DA291C"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart: Daily Active Customers */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Active Customers by Day
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activeCustomers}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="active" fill="#FFC72C" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Customers Table */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">
          Top Customers
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-gray-700">
            <thead>
              <tr className="border-b border-gray-200 text-sm uppercase text-gray-500">
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Orders</th>
                <th className="px-4 py-2">Total Spent (₱)</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.map((customer, index) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium">{customer.name}</td>
                  <td className="px-4 py-3">{customer.orders}</td>
                  <td className="px-4 py-3">₱{customer.spent.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default CustomerAnalytics;
