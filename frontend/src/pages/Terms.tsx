import { Navbar } from "@/components/layout/Navbar";

const Terms = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-24 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: January 26, 2026</p>

        <div className="space-y-8 text-foreground/90">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
            <p className="leading-relaxed">
              By accessing or using AlumniConnect, you agree to be bound by these Terms. If you do not agree to these Terms, you may not use our services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. User Accounts</h2>
            <p className="leading-relaxed">
              You are responsible for safeguarding your account password. You agree not to disclose your password to any third party. You must notify us immediately upon becoming aware of any breach of security or unauthorized use of your account.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Code of Conduct</h2>
            <p className="leading-relaxed mb-2">You agree not to:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li>Use the service for any illegal purpose.</li>
              <li>Harass, abuse, or harm another person.</li>
              <li>Post false or misleading information regarding your employment or education.</li>
              <li>Scrape or collect user data without consent.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Termination</h2>
            <p className="leading-relaxed">
              We reserve the right to suspend or terminate your account at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;