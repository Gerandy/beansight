import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

const dailySales = [
  { day: "Mon", amount: 4200 },
  { day: "Tue", amount: 5200 },
  { day: "Wed", amount: 6100 },
  { day: "Thu", amount: 7800 },
  { day: "Fri", amount: 9100 },
  { day: "Sat", amount: 10400 },
  { day: "Sun", amount: 8700 },
];

const categorySales = [
  { category: "Burgers", sales: 45000 },
  { category: "Drinks", sales: 25000 },
  { category: "Desserts", sales: 13000 },
  { category: "Fries", sales: 17000 },
  { category: "Others", sales: 8000 },
];

const recentOrders = [
  { id: "#A1021", item: "Big Mac Meal", date: "Oct 6, 2025", total: "₱280" },
  { id: "#A1022", item: "McSpaghetti", date: "Oct 6, 2025", total: "₱120" },
  { id: "#A1023", item: "Chicken McDo", date: "Oct 6, 2025", total: "₱150" },
  { id: "#A1024", item: "Iced Coffee", date: "Oct 6, 2025", total: "₱90" },
  { id: "#A1025", item: "Fries (Large)", date: "Oct 6, 2025", total: "₱85" },
];

export default function Sales() {
  return (
    <div className="p-6 space-y-8 font-sans">
      {/* Title */}
      <h1 className="text-3xl font-bold text-coffee-800 mb-4">
        ☕ Sales Analytics
      </h1>

      {/* KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-5 rounded-2xl shadow-md border-l-4 border-coffee-600">
          <h2 className="text-sm text-coffee-500">Total Revenue</h2>
          <p className="text-3xl font-bold text-coffee-700">₱145,300</p>
          <p className="text-green-600 text-sm">▲ 8% from last week</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-md border-l-4 border-coffee-600">
          <h2 className="text-sm text-coffee-500">Average Order Value</h2>
          <p className="text-3xl font-bold text-coffee-700">₱155</p>
          <p className="text-green-600 text-sm">▲ 4% this week</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-md border-l-4 border-coffee-600">
          <h2 className="text-sm text-coffee-500">Orders Today</h2>
          <p className="text-3xl font-bold text-coffee-700">284</p>
          <p className="text-green-600 text-sm">▲ 6% vs yesterday</p>
        </div>

        <div className="bg-white p-5 rounded-2xl shadow-md border-l-4 border-coffee-600">
          <h2 className="text-sm text-coffee-500">Total Discounts</h2>
          <p className="text-3xl font-bold text-coffee-700">₱2,430</p>
          <p className="text-green-600 text-sm">▲ 1% applied</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Sales Trend */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-coffee-800">
            Daily Sales (₱)
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" stroke="#6A3D26" />
              <YAxis stroke="#6A3D26" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="amount"
                stroke="#8E5A3A"
                strokeWidth={3}
                dot={{ r: 4, fill: "#C28F5E" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-coffee-800">
            Sales by Category (₱)
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categorySales}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" stroke="#6A3D26" />
              <YAxis stroke="#6A3D26" />
              <Tooltip />
              <Bar
                dataKey="sales"
                fill="#C28F5E"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4 text-coffee-800">
          Recent Orders
        </h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-coffee-100 text-coffee-800">
              <th className="py-2 px-4 rounded-l-lg">Order ID</th>
              <th className="py-2 px-4">Item</th>
              <th className="py-2 px-4">Date</th>
              <th className="py-2 px-4 rounded-r-lg">Total</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((order) => (
              <tr
                key={order.id}
                className="border-b border-coffee-100 text-coffee-900 hover:bg-coffee-800 hover:text-coffee-50 transition"
              >
                <td className="py-2 px-4">{order.id}</td>
                <td className="py-2 px-4">{order.item}</td>
                <td className="py-2 px-4">{order.date}</td>
                <td className="py-2 px-4 text-coffee-600 font-semibold">
                  {order.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

