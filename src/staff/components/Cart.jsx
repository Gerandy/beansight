export default function Cart({
  items = [],
  onRemove = () => {},
  onChangeQty = () => {},
}) {
  return (
    <div className="mb-4">
      <h2 className="text-sm sm:text-base lg:text-lg font-semibold mb-3 text-[var(--color-coffee-800)]">
        Current Order
      </h2>

      <div className="max-h-[200px] sm:max-h-[250px] md:max-h-[300px] lg:max-h-[350px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-coffee-300 scrollbar-track-coffee-100">
        {items.length === 0 ? (
          <div className="text-center text-gray-400 py-6 sm:py-8 lg:py-10 text-xs sm:text-sm">
            No items in cart
          </div>
        ) : (
          <div className="space-y-2">
            {items.map((it) => {
              const quantity = it.quantity ?? it.qty ?? 1;

              return (
                <div
                  key={it.id}
                  className="flex items-center justify-between bg-[var(--color-coffee-50)] p-2 sm:p-3 rounded-md border border-[var(--color-coffee-100)] hover:bg-[var(--color-coffee-100)] transition-colors"
                >
                  {/* Item Info */}
                  <div className="flex-1 min-w-0 mr-2">
                    <div className="font-medium text-xs sm:text-sm text-[var(--color-coffee-800)] truncate">
                      {it.name}
                    </div>
                    <div className="text-[10px] sm:text-xs text-[var(--color-coffee-600)] mt-0.5">
                      ₱{Number(it.price).toFixed(2)} × {quantity}
                    </div>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <button
                      onClick={() => onChangeQty(it.id, -1)}
                      className="cursor-pointer px-1.5 sm:px-2 py-0.5 sm:py-1 bg-[var(--color-coffee-200)] text-[var(--color-coffee-800)] rounded text-xs sm:text-sm hover:bg-[var(--color-coffee-300)] transition active:scale-95"
                    >
                      −
                    </button>

                    <div className="w-6 sm:w-8 text-center text-xs sm:text-sm font-semibold text-[var(--color-coffee-800)]">
                      {quantity}
                    </div>

                    <button
                      onClick={() => onChangeQty(it.id, 1)}
                      className="cursor-pointer px-1.5 sm:px-2 py-0.5 sm:py-1 bg-[var(--color-coffee-200)] text-[var(--color-coffee-800)] rounded text-xs sm:text-sm hover:bg-[var(--color-coffee-300)] transition active:scale-95"
                    >
                      +
                    </button>

                    {/* Remove Button */}
                    <button
                      onClick={() => onRemove(it.id)}
                      className="cursor-pointer ml-1 sm:ml-2 text-red-500 text-sm sm:text-base hover:text-red-600 transition active:scale-95 p-1"
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

      {/* Subtotal Display */}
      {items.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[var(--color-coffee-200)]">
          <div className="flex justify-between items-center text-xs sm:text-sm">
            <span className="text-[var(--color-coffee-700)]">Items Subtotal:</span>
            <span className="font-semibold text-[var(--color-coffee-800)]">
              ₱{items.reduce((sum, it) => sum + (Number(it.price) * (it.quantity ?? it.qty ?? 1)), 0).toFixed(2)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
