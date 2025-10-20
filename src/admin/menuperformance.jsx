import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

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

  return (
    <div className="p-6 space-y-8 min-h-screen font-[var(--font-sans)]">
      <h1 className="text-3xl font-bold text-[var(--color-coffee-900)] mb-6">
        ☕ Menu Performance
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-[var(--radius-2xl)] bg-white border-l-4 border-[var(--color-coffee-600)]">
          <h2 className="text-[var(--color-coffee-700)] text-sm">Top Category</h2>
          <p className="text-2xl font-bold text-[var(--color-coffee-800)]">Coffee</p>
        </div>
        <div className="p-6 rounded-[var(--radius-2xl)] bg-white border-l-4 border-[var(--color-coffee-600)]">
          <h2 className="text-[var(--color-coffee-700)] text-sm">Total Items Sold</h2>
          <p className="text-2xl font-bold text-[var(--color-coffee-800)]">1,500</p>
        </div>
        <div className="p-6 rounded-[var(--radius-2xl)] bg-white border-l-4 border-[var(--color-coffee-600)]">
          <h2 className="text-[var(--color-coffee-700)] text-sm">Avg. Sales per Item</h2>
          <p className="text-2xl font-bold text-[var(--color-coffee-800)]">₱210</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-[var(--radius-2xl)]">
          <h2 className="text-lg font-semibold text-[var(--color-coffee-800)] mb-4">
            Sales by Category
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-coffee-200)" />
              <XAxis dataKey="name" stroke="var(--color-coffee-700)" />
              <YAxis stroke="var(--color-coffee-700)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-coffee-50)",
                  border: "1px solid var(--color-coffee-200)",
                  color: "var(--color-coffee-900)",
                }}
              />
              <Bar dataKey="sales" fill="var(--color-coffee-600)" radius={[5, 5, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-6 rounded-[var(--radius-2xl)]">
          <h2 className="text-lg font-semibold text-[var(--color-coffee-800)] mb-4">
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
                dataKey="sales"
                label={({ name }) => name}
              >
                <Cell fill="var(--color-coffee-400)" />
                <Cell fill="var(--color-coffee-500)" />
                <Cell fill="var(--color-coffee-600)" />
                <Cell fill="var(--color-coffee-700)" />
                <Cell fill="var(--color-coffee-800)" />
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-coffee-50)",
                  border: "1px solid var(--color-coffee-200)",
                  color: "var(--color-coffee-900)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top & Low Performing Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-[var(--radius-2xl)]">
          <h2 className="text-lg font-semibold text-[var(--color-coffee-800)] mb-4">
            Top 5 Best-Selling Items
          </h2>
          <ul className="divide-y divide-[var(--color-coffee-200)]">
            {topItems.map((item, index) => (
              <li key={index} className="flex justify-between py-3">
                <span className="font-medium text-[var(--color-coffee-900)]">{item.name}</span>
                <span className="text-[var(--color-coffee-700)]">{item.sold} sold</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white p-6 rounded-[var(--radius-2xl)]">
          <h2 className="text-lg font-semibold text-[var(--color-coffee-800)] mb-4">
            Low Performing Items
          </h2>
          <ul className="divide-y divide-[var(--color-coffee-200)]">
            {lowPerformingItems.map((item, index) => (
              <li key={index} className="flex justify-between py-3">
                <span className="font-medium text-[var(--color-coffee-900)]">{item.name}</span>
                <span className="text-[var(--color-coffee-700)]">{item.sold} sold</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default MenuPerformance;

