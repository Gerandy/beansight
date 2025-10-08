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

const topItems = [
  { id: 1, name: "Big Mac", sales: 520 },
  { id: 2, name: "McChicken", sales: 410 },
  { id: 3, name: "French Fries", sales: 380 },
  { id: 4, name: "Iced Coffee", sales: 350 },
  { id: 5, name: "McSpaghetti", sales: 290 },
];

export default function Dashboard() {
  return (
    <div className="p-6 space-y-8">
      {/* Title */}
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        🍟 Dashboard Overview
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-yellow-400">
          <h2 className="text-gray-500 text-sm">Total Sales Today</h2>
          <p className="text-3xl font-bold text-red-600">₱45,320</p>
          <p className="text-green-600 text-sm mt-1">▲ 12% vs yesterday</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-yellow-400">
          <h2 className="text-gray-500 text-sm">Total Orders</h2>
          <p className="text-3xl font-bold text-red-600">932</p>
          <p className="text-green-600 text-sm mt-1">▲ 5% this week</p>
        </div>

        <div className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-yellow-400">
          <h2 className="text-gray-500 text-sm">New Customers</h2>
          <p className="text-3xl font-bold text-red-600">87</p>
          <p className="text-green-600 text-sm mt-1">▲ 9% this month</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Sales Trend (₱)
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="sales"
                stroke="#DA291C"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Category Performance */}
        <div className="bg-white rounded-2xl shadow-md p-6">
          <h2 className="text-lg font-semibold mb-4 text-gray-700">
            Category Performance (%)
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#FFC72C" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Selling Items */}
      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-700">
          Top Selling Items
        </h2>
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-red-50 text-gray-700">
              <th className="py-2 px-4 rounded-l-lg">#</th>
              <th className="py-2 px-4">Item</th>
              <th className="py-2 px-4 rounded-r-lg">Sales</th>
            </tr>
          </thead>
          <tbody>
            {topItems.map((item) => (
              <tr key={item.id} className="border-b-gray-200 text-black hover:bg-yellow-950 hover:text-white">
                <td className="py-2 px-4">{item.id}</td>
                <td className="py-2 px-4">{item.name}</td>
                <td className="py-2 px-4 text-red-600 font-semibold">
                  {item.sales}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
