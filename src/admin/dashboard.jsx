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

const COLORS = ["#DA291C", "#FFC72C"];

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
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2 sm:mb-4">
        ☕ Dashboard Overview
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 border-l-4 border-yellow-400">
          <h2 className="text-gray-500 text-xs sm:text-sm">Total Sales Today</h2>
          <p className="text-2xl sm:text-3xl font-bold text-red-600">₱45,320</p>
          <p className="text-green-600 text-xs sm:text-sm mt-1">▲ 12% vs yesterday</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 border-l-4 border-yellow-400">
          <h2 className="text-gray-500 text-xs sm:text-sm">Total Orders</h2>
          <p className="text-2xl sm:text-3xl font-bold text-red-600">932</p>
          <p className="text-green-600 text-xs sm:text-sm mt-1">▲ 5% this week</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 border-l-4 border-yellow-400">
          <h2 className="text-gray-500 text-xs sm:text-sm">New Customers</h2>
          <p className="text-2xl sm:text-3xl font-bold text-red-600">87</p>
          <p className="text-green-600 text-xs sm:text-sm mt-1">▲ 9% this month</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 border-l-4 border-yellow-400">
          <h2 className="text-gray-500 text-xs sm:text-sm">Menu Items Sold</h2>
          <p className="text-2xl sm:text-3xl font-bold text-red-600">1,482</p>
          <p className="text-green-600 text-xs sm:text-sm mt-1">▲ 7% this week</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Sales Trend */}
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
          <div className="flex justify-between items-center mb-2 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-700">
              📊 Sales Report (₱)
            </h2>
            <a
              href="/admin/sales"
              className="text-yellow-950 text-sm hover:underline"
            >
              View Details →
            </a>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="sales" stroke="#DA291C" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Menu Performance */}
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
          <div className="flex justify-between items-center mb-2 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-700">
              🍔 Menu Performance (%)
            </h2>
            <a
              href="/admin/menu-performance"
              className="text-yellow-950 text-sm hover:underline"
            >
              View Details →
            </a>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#FFC72C" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Customer Analytics + Top Selling Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Customer Analytics */}
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
          <div className="flex justify-between items-center mb-2 sm:mb-4">
            <h2 className="text-base sm:text-lg font-semibold text-gray-700">
              👥 Customer Analytics
            </h2>
            <a
              href="/admin/customers"
              className="text-yellow-950 text-sm hover:underline"
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
                fill="#8884d8"
                dataKey="value"
              >
                {customerData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
          <div className="text-center text-gray-600 text-sm mt-2">
            Returning customers: <b>65%</b> | New customers: <b>35%</b>
          </div>
        </div>

        {/* Top Selling Items */}
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6">
          <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-gray-700">
            🏆 Top Selling Items
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[350px]">
              <thead>
                <tr className="bg-red-50 text-gray-700">
                  <th className="py-2 px-4 rounded-l-lg">#</th>
                  <th className="py-2 px-4">Item</th>
                  <th className="py-2 px-4 rounded-r-lg">Sales</th>
                </tr>
              </thead>
              <tbody>
                {topItems.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-gray-200 text-black hover:bg-yellow-950 hover:text-white transition"
                  >
                    <td className="py-2 px-4">{item.id}</td>
                    <td className="py-2 px-4">{item.name}</td>
                    <td className="py-2 px-4 text-red-600 font-semibold">{item.sales}</td>
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

