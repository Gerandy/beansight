function MyAddresses() {
  const addresses = [
    {
      id: 1,
      label: "One25 Driving School Sampaloc, Barangay 375 Santa Cruz",
      details:
        "One25 Driving School Sampaloc, Barangay 375 Santa Cruz, Manila City, Metro Manila, 1014, National Capital Region (NCR), Philippines",
      isDefault: true,
    },
    {
      id: 2,
      label: "Blk 14 Lot 28, Garnette Street",
      details:
        "Blk 14 Lot 28, Garnette Street, Silvertowne IV, Malagasang II-B, Imus City, Cavite, 4103, CALABARZON (Region IV-A), Philippines",
      isDefault: false,
    },
    {
      id: 3,
      label: "Blk 14 Lot 28, Garnette Street",
      details:
        "Blk 14 Lot 28, Garnette Street, Silvertowne IV, Malagasang II-B, Imus City, Cavite, 4103, CALABARZON (Region IV-A), Philippines",
      isDefault: false,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-black mb-6">My Addresses</h1>

      <div className="space-y-4">
        {addresses.map((address) => (
          <div
            key={address.id}
            className="flex items-start justify-between border-b pb-4"
          >
            {/* Left: radio + address */}
            <div className="flex items-start">
              <input
                type="radio"
                name="address"
                defaultChecked={address.isDefault}
                className="mt-1 mr-3 accent-yellow-500"
              />
              <div>
                <h2 className="font-bold text-black">{address.label}</h2>
                <p className="text-sm text-black">{address.details}</p>
              </div>
            </div>

            {/* Right: Edit button */}
            <button className="px-4 py-1 bg-gray-200 rounded-full text-black font-medium hover:bg-gray-300">
              Edit
            </button>
          </div>
        ))}
      </div>

      {/* Add new address button */}
      <div className="mt-6">
        <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 rounded-full">
          Add New Address
        </button>
      </div>
    </div>
  );
}

export default MyAddresses;
