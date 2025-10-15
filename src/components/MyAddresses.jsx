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
      <h1 className="text-4xl border-b text-black font-bold mb-10">My Addresses</h1>

      <div className="space-y-4">
        {addresses.map((address) => (
          <div
            key={address.id}
            className="flex items-start justify-between border-b pb-4"
          >
            
            <div className="flex items-start">
              <input
                type="radio"
                name="address"
                defaultChecked={address.isDefault}
                className="mt-1 mr-3 accent-amber-950"
              />
              <div>
                <h2 className="font-bold text-black">{address.label}</h2>
                <p className="text-sm text-black">{address.details}</p>
              </div>
            </div>

            
            <button className="px-4 py-1 bg-gray-200 rounded-full text-black font-medium hover:bg-gray-300">
              Edit
            </button>
          </div>
        ))}
      </div>

    
      <div className="mt-6">
        <button className="w-full text-white bg-yellow-950 hover:bg-yellow-800 text-black font-bold py-3 rounded-full">
          Add New Address
        </button>
      </div>
    </div>
  );
}

export default MyAddresses;
