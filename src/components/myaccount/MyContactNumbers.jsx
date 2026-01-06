import { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, getDocs, addDoc, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { Phone, Trash2 } from "lucide-react";

function MyContactNumbers() {
  const [contacts, setContacts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [formData, setFormData] = useState({
    label: "",
    number: "",
    isDefault: false,
  });
  const [errors, setErrors] = useState({});

  const contactLabels = ["Mobile", "Home", "Office", "Emergency"];
  const userId = localStorage.getItem("authToken");

  // Fetch contact numbers
  useEffect(() => {
    const fetchContacts = async () => {
      if (!userId) return;
      try {
        const colRef = collection(db, "users", userId, "contactNumbers");
        const snapshot = await getDocs(colRef);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setContacts(data);
      } catch (err) {
        console.error("Error fetching contacts:", err);
      }
    };
    fetchContacts();
  }, [userId]);

  // Validate form
  const validate = () => {
    const newErrors = {};
    if (!formData.label) newErrors.label = "Please select a label";
    if (!formData.number || formData.number.length < 10) {
      newErrors.number = "Please enter a valid 10-digit number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle submit (add or edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const contactData = {
        label: formData.label,
        number: formData.number,
        isDefault: formData.isDefault,
      };

      if (editingContact) {
        const docRef = doc(db, "users", userId, "contactNumbers", editingContact.id);
        await updateDoc(docRef, contactData);
        setContacts(contacts.map(c => c.id === editingContact.id ? { ...c, ...contactData } : c));
      } else {
        const colRef = collection(db, "users", userId, "contactNumbers");
        const docRef = await addDoc(colRef, contactData);
        setContacts([...contacts, { id: docRef.id, ...contactData }]);
      }

      setFormData({ label: "", number: "", isDefault: false });
      setEditingContact(null);
      setShowForm(false);
      setErrors({});
    } catch (err) {
      console.error("Error saving contact:", err);
    }
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setFormData(contact);
    setShowForm(true);
    setErrors({});
  };

  const handleDelete = async (contactId) => {
    if (!window.confirm("Are you sure you want to delete this contact number?")) return;
    try {
      const docRef = doc(db, "users", userId, "contactNumbers", contactId);
      await deleteDoc(docRef);
      setContacts(contacts.filter(c => c.id !== contactId));
    } catch (err) {
      console.error("Error deleting contact:", err);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingContact(null);
    setFormData({ label: "", number: "", isDefault: false });
    setErrors({});
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <h1 className="text-2xl sm:text-3xl lg:text-4xl pb-4 text-coffee-900 font-bold mb-6 lg:mb-10">
        My Contact Numbers
      </h1>

      <div className="space-y-4">
        {contacts.map(contact => (
          <div key={contact.id} className="flex items-start gap-4 p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow">
            <input 
              type="radio" 
              name="contact" 
              defaultChecked={contact.isDefault} 
              className="cursor-pointer mt-1 accent-coffee-700 w-5 h-5" 
            />
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-base sm:text-lg text-coffee-900 mb-1 flex items-center gap-2">
                <Phone size={18} className="text-coffee-600" />
                {contact.label}
              </h2>
              <p className="text-sm text-coffee-700 leading-relaxed">+63 {contact.number}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <button 
                onClick={() => handleEdit(contact)} 
                className="cursor-pointer px-3 sm:px-4 py-2 bg-coffee-400 text-white rounded-lg font-medium hover:bg-coffee-500 transition-colors text-sm"
              >
                Edit
              </button>
              <button 
                onClick={() => handleDelete(contact.id)} 
                className="cursor-pointer px-3 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors text-sm"
                title="Delete"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mt-6 border border-coffee-200 rounded-lg p-4 bg-coffee-50 space-y-4">
          <h3 className="text-lg font-semibold text-coffee-900 mb-4">
            {editingContact ? "Edit Contact Number" : "Add New Contact Number"}
          </h3>

          <div>
            <label className="block text-sm font-medium text-coffee-800 mb-2">Contact Label</label>
            <select
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              className="cursor-pointer w-full border px-3 py-2 rounded-lg focus:outline-none focus:ring-2 border-coffee-300 ring-coffee-700"
            >
              <option value="">Select Label</option>
              {contactLabels.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>
            {errors.label && <p className="text-red-600 text-sm mt-1">{errors.label}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-coffee-800 mb-2">Phone Number</label>
            <div className="flex items-center">
              <span className="px-3 py-2 bg-coffee-100 border border-coffee-300 rounded-l-lg text-coffee-800 font-medium border-r-0">
                +63
              </span>
              <input
                type="text"
                maxLength="10"
                placeholder="9123456789"
                value={formData.number}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '');
                  setFormData({ ...formData, number: value });
                }}
                className={`flex-1 border px-3 py-2 rounded-r-lg focus:outline-none focus:ring-2 ${
                  errors.number ? "border-red-600 ring-red-500" : "border-coffee-300 ring-coffee-700"
                }`}
              />
            </div>
            {errors.number && <p className="text-red-600 text-sm mt-1">{errors.number}</p>}
          </div>

          <div className="flex items-center mb-3">
            <input
              type="checkbox"
              checked={!!formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="cursor-pointer mr-2 accent-coffee-700"
            />
            <label className="text-sm text-coffee-900">Set as default contact</label>
          </div>

          <div className="flex gap-3">
            <button 
              type="submit" 
              className="cursor-pointer flex-1 bg-coffee-700 text-white py-2 rounded-lg hover:bg-coffee-800 transition-colors font-medium"
            >
              {editingContact ? "Save Changes" : "Add Contact"}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="cursor-pointer flex-1 bg-coffee-200 text-coffee-900 py-2 rounded-lg hover:bg-coffee-300 transition-colors font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {!showForm && (
        <button 
          onClick={() => setShowForm(true)} 
          className="cursor-pointer w-full text-white bg-coffee-700 hover:bg-coffee-800 font-bold py-3 sm:py-3.5 rounded-lg transition-colors text-sm sm:text-base mt-4"
        >
          Add New Contact Number
        </button>
      )}
    </div>
  );
}

export default MyContactNumbers;
