import { ScrollText } from "lucide-react";

function TermsAndConditions() {
  return (
    <div className="min-h-screen mt-15">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <ScrollText className="h-16 w-16 text-coffee-600" />
          </div>
          <h1 className="text-4xl font-bold text-coffee-800 mb-4">Terms & Conditions</h1>
          <p className="text-gray-600">Last Updated: December 16, 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-800 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              Welcome to Solace Coffee. By accessing our website and using our services, you agree to 
              comply with and be bound by the following terms and conditions. Please review these terms 
              carefully. If you do not agree with these terms, you should not use our services.
            </p>
          </section>

          {/* Use of Service */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-800 mb-4">2. Use of Service</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                Our platform allows you to browse our menu, place orders, and manage your account. 
                You agree to:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Provide accurate and complete information when creating an account</li>
                <li>Maintain the security of your account credentials</li>
                <li>Use the service only for lawful purposes</li>
                <li>Not attempt to gain unauthorized access to our systems</li>
                <li>Not interfere with the proper functioning of the service</li>
              </ul>
            </div>
          </section>

          {/* Orders and Payment */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-800 mb-4">3. Orders and Payment</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                When you place an order through our platform:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>All prices are listed in the local currency and are subject to change</li>
                <li>Payment must be made at the time of order placement</li>
                <li>We reserve the right to refuse or cancel any order</li>
                <li>Order confirmation does not guarantee availability of items</li>
                <li>Delivery fees may apply based on your location</li>
              </ul>
            </div>
          </section>

          {/* Cancellations and Refunds */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-800 mb-4">4. Cancellations and Refunds</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>
                Our cancellation and refund policy:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Orders can be cancelled within 5 minutes of placement</li>
                <li>Refunds will be processed within 5-7 business days</li>
                <li>We reserve the right to issue partial refunds in certain circumstances</li>
                <li>Custom or special orders may not be eligible for cancellation</li>
              </ul>
            </div>
          </section>

          {/* User Accounts */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-800 mb-4">5. User Accounts</h2>
            <p className="text-gray-700 leading-relaxed">
              You are responsible for maintaining the confidentiality of your account information 
              and for all activities that occur under your account. You agree to notify us immediately 
              of any unauthorized use of your account. We reserve the right to suspend or terminate 
              accounts that violate these terms.
            </p>
          </section>

          {/* Intellectual Property */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-800 mb-4">6. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed">
              All content on this platform, including but not limited to text, graphics, logos, images, 
              and software, is the property of Solace Coffee and is protected by copyright and trademark 
              laws. You may not reproduce, distribute, or create derivative works without our express 
              written permission.
            </p>
          </section>

          {/* Limitation of Liability */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-800 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              Solace Coffee shall not be liable for any indirect, incidental, special, or consequential 
              damages arising from your use of our services. Our total liability shall not exceed the 
              amount paid by you for the specific order giving rise to the claim.
            </p>
          </section>

          {/* Product Information */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-800 mb-4">8. Product Information</h2>
            <p className="text-gray-700 leading-relaxed">
              We strive to provide accurate product descriptions and images. However, we do not warrant 
              that product descriptions, images, or other content is accurate, complete, or error-free. 
              Products may vary slightly from images shown.
            </p>
          </section>

          {/* Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-800 mb-4">9. Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Your use of our service is also governed by our Privacy Policy. Please review our Privacy 
              Policy to understand our practices regarding the collection and use of your personal information.
            </p>
          </section>

          {/* Changes to Terms */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-800 mb-4">10. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to modify these terms at any time. Changes will be effective 
              immediately upon posting to this page. Your continued use of the service after changes 
              are posted constitutes your acceptance of the modified terms.
            </p>
          </section>

          {/* Governing Law */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-800 mb-4">11. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These terms shall be governed by and construed in accordance with local laws, without 
              regard to conflict of law principles. Any disputes arising from these terms shall be 
              resolved in the appropriate courts.
            </p>
          </section>

          {/* Contact */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-800 mb-4">12. Contact Information</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions about these Terms and Conditions, please contact us through 
              our customer service channels or visit us in-store.
            </p>
          </section>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-gray-600">
          <p>Thank you for choosing Solace Coffee</p>
        </div>
      </div>
    </div>
  );
}

export default TermsAndConditions;
