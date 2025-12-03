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
              const uniqueKey = it.uniqueId || it.id;

              return (
                <div
                  key={uniqueKey}
                  className="bg-[var(--color-coffee-50)] p-2 sm:p-3 rounded-md border border-[var(--color-coffee-100)] hover:bg-[var(--color-coffee-100)] transition-colors"
                >
                  <div className="flex items-start justify-between">
                    {/* Item Info */}
                    <div className="flex-1 min-w-0 mr-2">
                      <div className="font-medium text-xs sm:text-sm text-[var(--color-coffee-800)]">
                        {it.name}
                      </div>
                      
                      {/* Size */}
                      {it.size && (
                        <div className="text-[10px] sm:text-xs text-[var(--color-coffee-600)] mt-0.5">
                          Size: <span className="font-semibold">{it.size}</span>
                        </div>
                      )}

                      {/* Add-ons */}
                      {it.addons && it.addons.length > 0 && (
                        <div className="mt-1 pl-2 border-l-2 border-coffee-300 space-y-0.5">
                          {it.addons.map((addon, idx) => (
                            <div key={idx} className="text-[10px] sm:text-xs text-[var(--color-coffee-600)] flex justify-between items-center">
                              <span>
                                + {addon.name} {addon.qty > 1 && `(×${addon.qty})`}
                              </span>
                              <span className="ml-2 font-medium">
                                ₱{(addon.price * addon.qty).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Price */}
                      <div className="text-[10px] sm:text-xs text-[var(--color-coffee-600)] mt-1">
                        ₱{Number(it.price).toFixed(2)} × {quantity} = 
                        <span className="font-semibold ml-1">
                          ₱{(Number(it.price) * quantity).toFixed(2)}
                        </span>
                      </div>

                      {/* Add-ons total */}
                      {it.addons && it.addons.length > 0 && (
                        <div className="text-[10px] sm:text-xs text-[var(--color-coffee-600)]">
                          Add-ons: 
                          <span className="font-semibold ml-1">
                            ₱{(it.addons.reduce((sum, addon) => sum + (addon.price * addon.qty), 0) * quantity).toFixed(2)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-end gap-1 sm:gap-2 flex-shrink-0">
                      <div className="flex items-center gap-1 sm:gap-2">
                        <button
                          onClick={() => onChangeQty(uniqueKey, -1)}
                          className="cursor-pointer px-1.5 sm:px-2 py-0.5 sm:py-1 bg-[var(--color-coffee-200)] text-[var(--color-coffee-800)] rounded text-xs sm:text-sm hover:bg-[var(--color-coffee-300)] transition active:scale-95"
                        >
                          −
                        </button>

                        <div className="w-6 sm:w-8 text-center text-xs sm:text-sm font-semibold text-[var(--color-coffee-800)]">
                          {quantity}
                        </div>

                        <button
                          onClick={() => onChangeQty(uniqueKey, 1)}
                          className="cursor-pointer px-1.5 sm:px-2 py-0.5 sm:py-1 bg-[var(--color-coffee-200)] text-[var(--color-coffee-800)] rounded text-xs sm:text-sm hover:bg-[var(--color-coffee-300)] transition active:scale-95"
                        >
                          +
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        onClick={() => onRemove(uniqueKey)}
                        className="cursor-pointer text-red-500 text-xs sm:text-sm hover:text-red-600 transition active:scale-95 px-2 py-1 rounded hover:bg-red-50"
                        title="Remove"
                      >
                        Remove
                      </button>
                    </div>
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
