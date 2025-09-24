function MyProfile() {
  return (
    <div>
      <h1 className="text-2xl text-black font-bold mb-6">My Profile</h1>
      <form className="space-y-4 max-w-lg">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            First Name
          </label>
          <input
            type="text"
            defaultValue="Ferd"
            className="w-full p-2 border rounded-md bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Last Name
          </label>
          <input
            type="text"
            defaultValue="Olaira"
            className="w-full p-2 border rounded-md bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            defaultValue="sinbaggy12@gmail.com"
            className="w-full p-2 border rounded-md bg-gray-100"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date of birth
          </label>
          <input
            type="date"
            className="w-full p-2 border rounded-md bg-gray-100"
          />
        </div>

        <button
          type="submit"
          disabled
          className="w-full py-2 rounded-md bg-gray-200 text-gray-500 cursor-not-allowed"
        >
          Save
        </button>
      </form>
    </div>
  );
}

export default MyProfile;
