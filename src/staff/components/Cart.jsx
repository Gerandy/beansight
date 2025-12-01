export default function Cart({
  items = [],
  onRemove = () => {},
  onChangeQty = () => {},
}) {
  return (
    <div>
      <h2 className="text-base sm:text-lg font-semibold mb-3">Current Order</h2>

      <div className="max-h-[300px] sm:max-h-[400px] overflow-y-auto">
        {items.length === 0 ? (
          <div className="text-center text-gray-400 py-8 sm:py-12 text-sm">
            No items in cart
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((it) => {
              const quantity = it.quantity ?? it.qty ?? 1;

              return (
                <div
                  key={it.id}
                  className="flex items-center justify-between bg-gray-50 p-2 sm:p-3 rounded-md"
                >
                  {/* Item Info */}
                  <div className="flex-1 min-w-0 mr-2">
                    <div className="font-medium text-xs sm:text-sm truncate">{it.name}</div>
                    <div className="text-[10px] sm:text-xs text-gray-500">
                      ₱{Number(it.price).toFixed(2)}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <button
                      onClick={() => onChangeQty(it.id, -1)}
                      className="cursor-pointer px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-200 rounded-sm text-xs sm:text-sm hover:bg-gray-300 transition"
                    >
                      −
                    </button>

                    <div className="w-6 sm:w-8 text-center text-xs sm:text-sm font-medium">
                      {quantity}
                    </div>

                    <button
                      onClick={() => onChangeQty(it.id, 1)}
                      className="cursor-pointer px-1.5 sm:px-2 py-0.5 sm:py-1 bg-gray-200 rounded-sm text-xs sm:text-sm hover:bg-gray-300 transition"
                    >
                      +
                    </button>

                    {/* Remove Button */}
                    <button
                      onClick={() => onRemove(it.id)}
                      className="cursor-pointer ml-1 sm:ml-2 text-red-500 text-sm sm:text-base hover:text-red-600 transition"
                      title="Remove"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
