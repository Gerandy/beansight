

// Skeleton Card Component
export function SkeletonCard() {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-md border-l-4 border-gray-300 animate-pulse">
      <div className="h-3 bg-gray-200 rounded w-1/3 mb-3"></div>
      <div className="h-8 bg-gray-300 rounded w-2/3 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
    </div>
  );
}

// Skeleton Chart Component
export function SkeletonChart() {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 animate-pulse">
      <div className="flex justify-between items-center mb-4">
        <div className="h-5 bg-gray-200 rounded w-1/3"></div>
        <div className="h-8 bg-gray-200 rounded w-32"></div>
      </div>
      <div className="h-64 bg-gray-100 rounded"></div>
    </div>
  );
}

// Skeleton Table Component
export function SkeletonTable({ rows = 5 }) {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-1/3 mb-4"></div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex justify-between items-center">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/3"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Skeleton Pie Chart Component
export function SkeletonPieChart() {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 flex flex-col items-center animate-pulse">
      <div className="h-5 bg-gray-200 rounded w-1/2 mb-4"></div>
      <div className="w-56 h-56 bg-gray-200 rounded-full mb-4"></div>
      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
    </div>
  );
}

// Skeleton Financial Card Component
export function SkeletonFinancialCard() {
  return (
    <div
      className="relative rounded-2xl shadow-sm md:col-span-2 p-6 overflow-hidden animate-pulse"
      style={{ background: "linear-gradient(135deg,#FBF6EE 0%,#F3E8D8 50%,#EFE1C8 100%)" }}
    >
      <div className="flex flex-col items-center justify-center text-center h-40">
        <div className="h-4 bg-gray-300 rounded w-24 mb-2"></div>
        <div className="h-16 bg-gray-400 rounded w-48 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-32"></div>
      </div>
      <div className="absolute left-6 right-6 bottom-4 flex items-center justify-between">
        <div className="flex flex-col">
          <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
          <div className="h-4 bg-gray-300 rounded w-24"></div>
        </div>
        <div className="flex flex-col text-right">
          <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
          <div className="h-4 bg-gray-300 rounded w-24"></div>
        </div>
      </div>
    </div>
  );
}

// Skeleton Goal Widget Component
export function SkeletonGoalWidget() {
  return (
    <div className="bg-white rounded-2xl shadow-md p-6 mb-5 my-2 animate-pulse">
      <div className="flex items-center justify-between mb-2">
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-6 bg-gray-200 rounded w-20"></div>
      </div>
      <div className="w-full h-6 bg-gray-200 rounded-full mb-2"></div>
      <div className="h-3 bg-gray-200 rounded w-2/3"></div>
    </div>
  );
}

// CSS Animation Styles (add to your global CSS or use styled-jsx)
export const skeletonStyles = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  .animate-pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  }
`;