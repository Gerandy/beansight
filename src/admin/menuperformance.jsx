import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

function MenuPerformance() {
  // Mock data — you can later replace with real data from your backend
  const categoryData = [
    { name: "Burgers", sales: 520 },
    { name: "Fries", sales: 410 },
    { name: "Drinks", sales: 380 },
    { name: "Desserts", sales: 250 },
    { name: "Chicken Meals", sales: 340 },
  ];

  const topItems = [
    { name: "Big Mac", sold: 230 },
    { name: "McSpaghetti", sold: 180 },
    { name: "Fries (Large)", sold: 160 },
    { name: "Iced Coffee", sold: 120 },
    { name: "Apple Pie", sold: 95 },
  ];

  const lowPerformingItems = [
    { name: "Tuna Pie", sold: 12 },
    { name: "Salad", sold: 8 },
    { name: "Fish Sandwich", sold: 6 },
  ];

  const COLORS = ["#DA291C", "#FFC72C", "#FF8C42", "#FFB347", "#F7C948"];

  return (
    <div className="p-6 space-y-8 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">🍔 Menu Performance</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-yellow-400">
          <h2 className="text-gray-600 text-sm">Top Category</h2>
          <p className="text-2xl font-bold text-red-600">Burgers</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-yellow-400">
          <h2 className="text-gray-600 text-sm">Total Items Sold</h2>
          <p className="text-2xl font-bold text-red-600">1,600</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-yellow-400">
          <h2 className="text-gray-600 text-sm">Avg. Sales per Item</h2>
          <p className="text-2xl font-bold text-red-600">₱240</p>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bar Chart: Category Performance */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Sales by Category
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="sales" fill="#DA291C" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart: Category Share */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Category Sales Share
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={100}
                fill="#DA291C"
                dataKey="sales"
                label={({ name }) => name}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top & Low Performing Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Top Items */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Top 5 Best-Selling Items
          </h2>
          <ul className="divide-y divide-gray-200">
            {topItems.map((item, index) => (
              <li key={index} className="flex justify-between py-3">
                <span className="font-medium text-gray-800">{item.name}</span>
                <span className="text-gray-500">{item.sold} sold</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Low Performing Items */}
        <div className="bg-white p-6 rounded-2xl shadow-md">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            Low Performing Items
          </h2>
          <ul className="divide-y divide-gray-200">
            {lowPerformingItems.map((item, index) => (
              <li key={index} className="flex justify-between py-3">
                <span className="font-medium text-gray-800">{item.name}</span>
                <span className="text-gray-500">{item.sold} sold</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default MenuPerformance;
