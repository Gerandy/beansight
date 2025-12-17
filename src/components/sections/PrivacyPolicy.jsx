import { Shield } from "lucide-react";

function PrivacyPolicy() {
  return (
    <div className="min-h-screen mt-15">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-coffee-600" />
          </div>
          <h1 className="text-4xl font-bold text-coffee-800 mb-4">Privacy Policy</h1>
          <p className="text-gray-600">Last Updated: December 16, 2025</p>
        </div>

        {/* Content */}
        <div className="bg-white rounded-lg shadow-lg p-8 space-y-8">
          {/* Introduction */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-800 mb-4">1. Introduction</h2>
            <p className="text-gray-700 leading-relaxed">
              At Solace Coffee, we are committed to protecting your privacy and ensuring the security 
              of your personal information. This Privacy Policy explains how we collect, use, disclose, 
              and safeguard your information when you use our website and services. Please read this 
              policy carefully to understand our practices.
            </p>
          </section>

          {/* Information We Collect */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-800 mb-4">2. Information We Collect</h2>
            <div className="space-y-4 text-gray-700 leading-relaxed">
              <div>
                <h3 className="font-semibold text-coffee-700 mb-2">Personal Information</h3>
                <p className="mb-2">We may collect personal information that you provide to us, including:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>Name and contact information (email address, phone number)</li>
                  <li>Delivery address</li>
                  <li>Payment information (processed securely through third-party payment processors)</li>
                  <li>Account credentials (username and password)</li>
                  <li>Order history and preferences</li>
                </ul>
              </div>
              
              <div>
                <h3 className="font-semibold text-coffee-700 mb-2">Automatically Collected Information</h3>
                <p className="mb-2">When you visit our website, we may automatically collect:</p>
                <ul className="list-disc list-inside space-y-1 ml-4">
                  <li>IP address and device information</li>
                  <li>Browser type and version</li>
                  <li>Pages viewed and time spent on our site</li>
                  <li>Referring website addresses</li>
                  <li>Location data (with your permission)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* How We Use Your Information */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-800 mb-4">3. How We Use Your Information</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>We use the information we collect for various purposes, including:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>Processing and fulfilling your orders</li>
                <li>Managing your account and providing customer support</li>
                <li>Sending order confirmations and updates</li>
                <li>Improving our products, services, and website functionality</li>
                <li>Personalizing your experience and providing relevant recommendations</li>
                <li>Communicating promotional offers and updates (with your consent)</li>
                <li>Analyzing usage patterns and trends</li>
                <li>Preventing fraud and ensuring security</li>
                <li>Complying with legal obligations</li>
              </ul>
            </div>
          </section>

          {/* Information Sharing */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-800 mb-4">4. How We Share Your Information</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>We may share your information with:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Service Providers:</strong> Third parties who assist with payment processing, 
                delivery, analytics, and other business operations</li>
                <li><strong>Business Transfers:</strong> In the event of a merger, acquisition, or sale 
                of assets</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights 
                and safety</li>
                <li><strong>With Your Consent:</strong> When you have given us permission to share your 
                information</li>
              </ul>
              <p className="mt-3">
                We do not sell your personal information to third parties for their marketing purposes.
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-800 mb-4">5. Cookies and Tracking Technologies</h2>
            <p className="text-gray-700 leading-relaxed">
              We use cookies and similar tracking technologies to enhance your experience on our website. 
              Cookies are small data files stored on your device that help us remember your preferences, 
              analyze site traffic, and improve functionality. You can control cookie settings through 
              your browser, but disabling cookies may affect some features of our service.
            </p>
          </section>

          {/* Data Security */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-800 mb-4">6. Data Security</h2>
            <p className="text-gray-700 leading-relaxed">
              We implement appropriate technical and organizational security measures to protect your 
              personal information from unauthorized access, disclosure, alteration, or destruction. 
              However, no method of transmission over the internet or electronic storage is 100% secure, 
              and we cannot guarantee absolute security.
            </p>
          </section>

          {/* Data Retention */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-800 mb-4">7. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your personal information for as long as necessary to fulfill the purposes 
              outlined in this Privacy Policy, unless a longer retention period is required or permitted 
              by law. When your information is no longer needed, we will securely delete or anonymize it.
            </p>
          </section>

          {/* Your Rights */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-800 mb-4">8. Your Privacy Rights</h2>
            <div className="space-y-3 text-gray-700 leading-relaxed">
              <p>You have certain rights regarding your personal information:</p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li><strong>Access:</strong> Request access to the personal information we hold about you</li>
                <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Opt-Out:</strong> Unsubscribe from marketing communications at any time</li>
                <li><strong>Data Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Objection:</strong> Object to certain processing of your information</li>
              </ul>
              <p className="mt-3">
                To exercise these rights, please contact us through our customer service channels.
              </p>
            </div>
          </section>

          {/* Third-Party Links */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-800 mb-4">9. Third-Party Links</h2>
            <p className="text-gray-700 leading-relaxed">
              Our website may contain links to third-party websites. We are not responsible for the 
              privacy practices or content of these external sites. We encourage you to review the 
              privacy policies of any third-party sites you visit.
            </p>
          </section>

          {/* Children's Privacy */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-800 mb-4">10. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              Our services are not intended for children under the age of 13. We do not knowingly 
              collect personal information from children. If we become aware that we have collected 
              information from a child without parental consent, we will take steps to delete that 
              information.
            </p>
          </section>

          {/* Changes to Policy */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-800 mb-4">11. Changes to This Privacy Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time to reflect changes in our practices 
              or legal requirements. We will notify you of any material changes by posting the updated 
              policy on this page with a new "Last Updated" date. Your continued use of our services 
              after such changes constitutes your acceptance of the updated policy.
            </p>
          </section>

          {/* Contact Us */}
          <section>
            <h2 className="text-2xl font-bold text-coffee-800 mb-4">12. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our 
              data practices, please contact us through our customer service channels or visit us 
              in-store. We are committed to addressing your privacy concerns promptly and effectively.
            </p>
          </section>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-gray-600">
          <p>Your privacy is important to us. Thank you for trusting Solace Coffee.</p>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicy;
