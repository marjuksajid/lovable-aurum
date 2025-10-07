import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Coins, TrendingUp, Shield, Zap, ArrowRight, CheckCircle } from "lucide-react";

export default function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && !loading) {
      navigate("/dashboard");
    }
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="border-b border-border">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Aurum
            </h1>
          </div>
          <Button onClick={() => navigate("/auth")}>Get Started</Button>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="py-20 px-4">
          <div className="container mx-auto text-center max-w-4xl">
            <h2 className="text-5xl md:text-6xl font-bold mb-6">
              The Modern Way to <span className="bg-gradient-accent bg-clip-text text-transparent">Invest in Gold</span>
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Secure, transparent, and easy digital gold investment platform. Start building your wealth today.
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Button size="lg" className="shadow-glow-primary" onClick={() => navigate("/auth")}>
                Start Investing <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline">
                Learn More
              </Button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-20 px-4 bg-card">
          <div className="container mx-auto max-w-6xl">
            <h3 className="text-3xl font-bold text-center mb-12">Why Choose Aurum?</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-6 hover:shadow-lg transition-shadow border-border">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-xl font-bold mb-2">Secure & Verified</h4>
                <p className="text-muted-foreground">
                  Bank-level security with KYC verification powered by trusted partners.
                </p>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow border-border">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-xl font-bold mb-2">Instant Transactions</h4>
                <p className="text-muted-foreground">
                  Buy, sell, and transfer gold instantly with real-time market rates.
                </p>
              </Card>

              <Card className="p-6 hover:shadow-lg transition-shadow border-border">
                <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <h4 className="text-xl font-bold mb-2">Live Market Rates</h4>
                <p className="text-muted-foreground">
                  Access real-time gold prices and make informed investment decisions.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section className="py-20 px-4">
          <div className="container mx-auto max-w-4xl">
            <h3 className="text-3xl font-bold text-center mb-12">Get Started in 3 Easy Steps</h3>
            <div className="space-y-8">
              <div className="flex gap-4 items-start">
                <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow-primary">
                  <span className="text-xl font-bold text-primary-foreground">1</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Create Your Account</h4>
                  <p className="text-muted-foreground">
                    Sign up with your email or phone number in seconds. No complicated forms.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow-primary">
                  <span className="text-xl font-bold text-primary-foreground">2</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Verify Your Identity</h4>
                  <p className="text-muted-foreground">
                    Quick KYC verification to ensure secure transactions. Takes just 5 minutes.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="h-12 w-12 rounded-full bg-gradient-primary flex items-center justify-center flex-shrink-0 shadow-glow-primary">
                  <span className="text-xl font-bold text-primary-foreground">3</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold mb-2">Start Investing</h4>
                  <p className="text-muted-foreground">
                    Purchase your first Aurum and watch your digital gold portfolio grow.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 text-center">
              <Button size="lg" className="shadow-glow-primary" onClick={() => navigate("/auth")}>
                Create Free Account <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="py-20 px-4 bg-card">
          <div className="container mx-auto max-w-6xl">
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-4xl font-bold text-primary mb-2">$1,850+</p>
                <p className="text-muted-foreground">Current Gold Rate</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary mb-2">100%</p>
                <p className="text-muted-foreground">Secure & Verified</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-primary mb-2">24/7</p>
                <p className="text-muted-foreground">Trading Available</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border py-8 px-4">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>&copy; 2025 Aurum. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <a href="#" className="hover:text-primary transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-primary transition-colors">Limits & Charges</a>
          </div>
        </div>
      </footer>
    </div>
  );
}