import { Navbar } from "@/components/layout/Navbar";

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-24 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: January 26, 2026</p>

        <div className="space-y-8 text-foreground/90">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
            <p className="leading-relaxed">
              We collect information you provide directly to us, such as when you create an account, update your profile, or communicate with other users. This may include your name, email address, graduation year, company details, and employment history.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
            <p className="leading-relaxed mb-2">We use the information we collect to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Provide, maintain, and improve our services.</li>
              <li>Verify your identity as an alumnus or student.</li>
              <li>Facilitate networking and mentorship opportunities.</li>
              <li>Send you updates, security alerts, and support messages.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Data Sharing</h2>
            <p className="leading-relaxed">
              We do not sell your personal data. Your profile information is visible to other verified members of the AlumniConnect community to facilitate networking. We may share data with legal authorities if required by law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
            <p className="leading-relaxed">
              We take reasonable measures to help protect information about you from loss, theft, misuse, and unauthorized access. All passwords are hashed and stored securely.
            </p>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-3">5. Contact Us</h2>
            <p className="leading-relaxed">
              If you have any questions about this Privacy Policy, please contact us at privacy@alumniconnect.com.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;