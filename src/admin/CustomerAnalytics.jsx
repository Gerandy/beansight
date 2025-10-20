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
    <div className="p-6 space-y-8 min-h-screen font-sans">
      <h1
        className="text-3xl font-bold mb-6"
        style={{ color: "var(--color-coffee-900)" }}
      >
        👥 Customer Analytics
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { title: "Total Customers", value: "500" },
          { title: "New This Month", value: "120" },
          { title: "Returning Customers", value: "64%" },
          { title: "Avg. Orders per Customer", value: "4.3" },
        ].map((card, i) => (
          <div
            key={i}
            className="bg-white p-6 rounded-2xl shadow-md border-l-4"
            style={{ borderColor: "var(--color-coffee-500)" }}
          >
            <h2
              className="text-sm"
              style={{ color: "var(--color-coffee-700)" }}
            >
              {card.title}
            </h2>
            <p
              className="text-2xl font-bold"
              style={{ color: "var(--color-coffee-800)" }}
            >
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Line Chart: Customer Growth */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2
            className="text-lg font-semibold mb-4"
            style={{ color: "var(--color-coffee-800)" }}
          >
            Customer Growth Over Time
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={customerGrowth}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-coffee-100)"
              />
              <XAxis
                dataKey="month"
                stroke="var(--color-coffee-400)"
                tick={{ fill: "var(--color-coffee-700)" }}
              />
              <YAxis
                stroke="var(--color-coffee-400)"
                tick={{ fill: "var(--color-coffee-700)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-coffee-50)",
                  border: "1px solid var(--color-coffee-200)",
                  color: "var(--color-coffee-900)",
                }}
              />
              <Line
                type="monotone"
                dataKey="customers"
                stroke="var(--color-coffee-600)"
                strokeWidth={3}
                dot={{ r: 4, fill: "var(--color-coffee-500)" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Bar Chart: Daily Active Customers */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2
            className="text-lg font-semibold mb-4"
            style={{ color: "var(--color-coffee-800)" }}
          >
            Active Customers by Day
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activeCustomers}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="var(--color-coffee-100)"
              />
              <XAxis
                dataKey="day"
                stroke="var(--color-coffee-400)"
                tick={{ fill: "var(--color-coffee-700)" }}
              />
              <YAxis
                stroke="var(--color-coffee-400)"
                tick={{ fill: "var(--color-coffee-700)" }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-coffee-50)",
                  border: "1px solid var(--color-coffee-200)",
                  color: "var(--color-coffee-900)",
                }}
              />
              <Bar
                dataKey="active"
                fill="var(--color-coffee-400)"
                radius={[5, 5, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Customers Table */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        <h2
          className="text-lg font-semibold mb-4"
          style={{ color: "var(--color-coffee-800)" }}
        >
          Top Customers
        </h2>
        <div className="overflow-x-auto">
          <table
            className="min-w-full text-left text-sm"
            style={{ color: "var(--color-coffee-800)" }}
          >
            <thead>
              <tr
                className="border-b text-xs uppercase"
                style={{
                  borderColor: "var(--color-coffee-200)",
                  color: "var(--color-coffee-600)",
                }}
              >
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Orders</th>
                <th className="px-4 py-2">Total Spent (₱)</th>
              </tr>
            </thead>
            <tbody>
              {topCustomers.map((customer, index) => (
                <tr
                  key={index}
                  className="border-b hover:opacity-90 transition"
                  style={{ borderColor: "var(--color-coffee-100)" }}
                >
                  <td className="px-4 py-3 font-medium">
                    {customer.name}
                  </td>
                  <td className="px-4 py-3">{customer.orders}</td>
                  <td className="px-4 py-3">
                    ₱{customer.spent.toLocaleString()}
                  </td>
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

