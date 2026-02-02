import { Navbar } from "@/components/layout/Navbar";

const CookiePolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-24 max-w-4xl">
        <h1 className="text-3xl font-bold mb-2">Cookie Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last Updated: January 26, 2026</p>

        <div className="space-y-8 text-foreground/90">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. What Are Cookies?</h2>
            <p className="leading-relaxed">
              Cookies are small text files that are placed on your computer or mobile device when you visit a website. They allow the website to remember your actions and preferences (such as login) over a period of time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. How We Use Cookies</h2>
            <p className="leading-relaxed mb-2">We use cookies for the following purposes:</p>
            <ul className="list-disc pl-6 space-y-1">
              <li><strong>Authentication:</strong> To identify you when you visit our website and as you navigate our website.</li>
              <li><strong>Security:</strong> To protect user accounts, including preventing fraudulent use of login credentials.</li>
              <li><strong>Preferences:</strong> To store information about your preferences and to personalize the website for you.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Managing Cookies</h2>
            <p className="leading-relaxed">
              Most web browsers allow you to control cookies through their settings preferences. However, if you limit the ability of websites to set cookies, you may worsen your overall user experience, since it will no longer be personalized to you.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;