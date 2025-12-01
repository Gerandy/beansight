

const faqs = [
  {
    question: "How do I place an order?",
    answer:
      "Browse our menu, add your favorite items to the cart, and proceed to checkout. You’ll need to log in or sign up to complete your order.",
  },
  {
    question: "Can I track my order?",
    answer:
      "Yes! Go to the Orders page in your account to view the status and details of your current and past orders.",
  },
  {
    question: "What payment methods are accepted?",
    answer:
      "We accept major credit/debit cards, GCash, and PayPal for online orders.",
  },
  {
    question: "How do I update my delivery address?",
    answer:
      "Visit your Profile under My Account and edit your saved addresses anytime.",
  },
  {
    question: "Is there a loyalty program?",
    answer:
      "Yes! Earn points for every purchase and redeem them for exclusive rewards. Check your points balance in your account.",
  },
  {
    question: "How do I contact customer support?",
    answer:
      "You can reach us via the Contact Us page or message us on Facebook and Instagram. We’re happy to help!",
  },
  
];

function Faq() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center py-16 px-4">
      <div className="bg-white rounded-3xl shadow-soft-xl max-w-2xl w-full p-10 mt-5">
        <h1 className="text-4xl font-bold text-coffee-900 mb-8 logo-font text-center">Frequently Asked Questions</h1>
        <div className="space-y-6">
          {faqs.map((faq, idx) => (
            <div key={idx} className="border-b border-coffee-200 pb-6">
              <h2 className="text-xl font-semibold text-coffee-800 mb-2">{faq.question}</h2>
              <p className="text-coffee-700 text-base">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Faq;