import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

function MenuPerformance() {

  const categoryData = [
    { name: "Coffee", sales: 620 },
    { name: "Pastries", sales: 480 },
    { name: "Tea", sales: 210 },
    { name: "Sandwiches", sales: 320 },
    { name: "Cold Drinks", sales: 170 },
  ];

  const topItems = [
    { name: "Cappuccino", sold: 220 },
    { name: "Butter Croissant", sold: 180 },
    { name: "Latte", sold: 160 },
    { name: "Ham & Cheese Sandwich", sold: 120 },
    { name: "Chocolate Muffin", sold: 95 },
  ];

  const lowPerformingItems = [
    { name: "Matcha Latte", sold: 14 },
    { name: "Vegan Brownie", sold: 10 },
    { name: "Egg Salad Sandwich", sold: 8 },
  ];

  const COLORS = ["#DA291C", "#FFC72C", "#FF8C42", "#FFB347", "#F7C948"];

  return (
    <div className="p-6 space-y-8 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">☕ Menu Performance</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-yellow-400">
          <h2 className="text-gray-600 text-sm">Top Category</h2>
          <p className="text-2xl font-bold text-red-600">Coffee</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-yellow-400">
          <h2 className="text-gray-600 text-sm">Total Items Sold</h2>
          <p className="text-2xl font-bold text-red-600">1,500</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-md border-l-4 border-yellow-400">
          <h2 className="text-gray-600 text-sm">Avg. Sales per Item</h2>
          <p className="text-2xl font-bold text-red-600">₱210</p>
        </div>
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

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
