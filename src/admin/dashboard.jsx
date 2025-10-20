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
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const salesData = [
  { day: "Mon", sales: 5200 },
  { day: "Tue", sales: 7200 },
  { day: "Wed", sales: 6800 },
  { day: "Thu", sales: 8200 },
  { day: "Fri", sales: 9100 },
  { day: "Sat", sales: 10400 },
  { day: "Sun", sales: 8900 },
];

const categoryData = [
  { category: "Burgers", value: 45 },
  { category: "Drinks", value: 25 },
  { category: "Desserts", value: 15 },
  { category: "Fries", value: 10 },
  { category: "Others", value: 5 },
];

const customerData = [
  { name: "Returning", value: 65 },
  { name: "New", value: 35 },
];

const topItems = [
  { id: 1, name: "Kape", sales: 520 },
  { id: 2, name: "Coffee", sales: 410 },
  { id: 3, name: "Hot Coffee", sales: 380 },
  { id: 4, name: "Iced Coffee", sales: 350 },
  { id: 5, name: "Cappuccino", sales: 290 },
];

export default function Dashboard() {
  return (
    <div className="p-2 sm:p-4 md:p-6 space-y-6 md:space-y-8">
      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-bold text-coffee-900 mb-2 sm:mb-4">
        ☕ Dashboard Overview
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {[
          {
            title: "Total Sales Today",
            value: "₱45,320",
            change: "▲ 12% vs yesterday",
          },
          {
            title: "Total Orders",
            value: "932",
            change: "▲ 5% this week",
          },
          {
            title: "New Customers",
            value: "87",
            change: "▲ 9% this month",
          },
          {
            title: "Menu Items Sold",
            value: "1,482",
            change: "▲ 7% this week",
          },
        ].map((card, i) => (
          <div
            key={i}
            className="bg-coffee-50 rounded-2xl shadow-md p-4 sm:p-6 border-l-4 border-coffee-700 hover:shadow-soft-xl transition"
          >
            <h2 className="text-coffee-700 text-xs sm:text-sm">{card.title}</h2>
            <p className="text-2xl sm:text-3xl font-bold text-coffee-800">{card.value}</p>
            <p className="text-green-600 text-xs sm:text-sm mt-1">{card.change}</p>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Sales Trend */}
        <div className="bg-coffee-50 rounded-2xl shadow-md p-4 sm:p-6">
          <div className="flex justify-between items-center mb-2 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-coffee-800">
              📊 Sales Report (₱)
            </h2>
            <a
              href="/admin/sales"
              className="text-coffee-600 text-sm hover:underline"
            >
              View Details →
            </a>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E1B788" />
              <XAxis dataKey="day" stroke="#8E5A3A" />
              <YAxis stroke="#8E5A3A" />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#8E5A3A"
                strokeWidth={3}
                dot={{ fill: "#C28F5E", r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Menu Performance */}
        <div className="bg-coffee-50 rounded-2xl shadow-md p-4 sm:p-6">
          <div className="flex justify-between items-center mb-2 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-coffee-800">
              🍔 Menu Performance (%)
            </h2>
            <a
              href="/admin/menu-performance"
              className="text-coffee-600 text-sm hover:underline"
            >
              View Details →
            </a>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E1B788" />
              <XAxis dataKey="category" stroke="#8E5A3A" />
              <YAxis stroke="#8E5A3A" />
              <Tooltip />
              <Bar
                dataKey="value"
                fill="#C28F5E"
                radius={[8, 8, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Customer Analytics + Top Selling Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Customer Analytics */}
        <div className="bg-coffee-50 rounded-2xl shadow-md p-4 sm:p-6">
          <div className="flex justify-between items-center mb-2 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-coffee-800">
              👥 Customer Analytics
            </h2>
            <a
              href="/admin/customers"
              className="text-coffee-600 text-sm hover:underline"
            >
              View Details →
            </a>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={customerData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={90}
                dataKey="value"
              >
                <Cell fill="#8E5A3A" />
                <Cell fill="#E1B788" />
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center text-coffee-700 text-sm mt-2">
            Returning customers: <b>65%</b> | New customers: <b>35%</b>
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="bg-coffee-50 rounded-2xl shadow-md p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-coffee-800">
            🏆 Top Selling Items
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[350px]">
              <thead>
                <tr className="bg-coffee-200 text-coffee-800">
                  <th className="py-2 px-4 rounded-l-lg">#</th>
                  <th className="py-2 px-4">Item</th>
                  <th className="py-2 px-4 rounded-r-lg">Sales</th>
                </tr>
              </thead>
              <tbody>
                {topItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-coffee-100 text-coffee-900 hover:bg-coffee-700 hover:text-white transition"
                  >
                    <td className="py-2 px-4">{item.id}</td>
                    <td className="py-2 px-4">{item.name}</td>
                    <td className="py-2 px-4 font-semibold">{item.sales}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
