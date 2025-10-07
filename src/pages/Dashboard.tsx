import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, ShoppingCart, Shield, ArrowUpRight, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export default function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user && !loading) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Mock gold rate - in production, fetch from API
  const currentGoldRate = 1850.25;
  const rateChange = 12.5;
  const changePercent = 0.68;

  const { data: recentTransactions } = useQuery({
    queryKey: ["recent-transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div>
          <h2 className="text-4xl font-bold mb-2">Welcome to Aurum</h2>
          <p className="text-lg text-muted-foreground">
            The modern way to invest in gold. Secure, transparent, and easy.
          </p>
        </div>

        {/* Gold Rate Card */}
        <Card className="border-border bg-gradient-to-br from-card to-card/50 shadow-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <h3 className="text-2xl font-bold mb-2">Current Gold Rate</h3>
                <div className="flex items-baseline gap-2">
                  <p className="text-4xl font-bold text-primary">${currentGoldRate.toFixed(2)}</p>
                  <span className="text-lg text-muted-foreground">/ ounce</span>
                </div>
                <div className="flex items-center gap-1 mt-2 text-success">
                  <ArrowUpRight className="h-4 w-4" />
                  <span className="font-semibold">
                    +${rateChange.toFixed(2)} ({changePercent}%) today
                  </span>
                </div>
              </div>
              <Button size="lg" className="shadow-glow-primary" onClick={() => navigate("/gold-rate")}>
                Purchase Aurum
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Get Started Cards */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-semibold">Get Started</h3>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-xl">Register an Account</CardTitle>
                  <Badge className="bg-success/20 text-success hover:bg-success/30">NEW</Badge>
                </div>
                <CardDescription>
                  Create your secure Aurum account using your email or phone number. Or use a social provider for quick access.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ShoppingCart className="h-4 w-4" />
                    Email/Phone
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Easy Setup
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-xl">Verify Your Identity</CardTitle>
                  <Badge variant="secondary">SECURE</Badge>
                </div>
                <CardDescription>
                  We partner with services like Persona to securely verify your government-issued ID, keeping your account safe.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Shield className="h-4 w-4" />
                    Persona
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    5 min
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-xl">Purchase Your First Aurum</CardTitle>
                  <Badge className="bg-primary/20 text-primary hover:bg-primary/30">INVEST</Badge>
                </div>
                <CardDescription>
                  Start your gold investment journey. Purchase Aurum easily and see it reflect in your balance instantly.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <ShoppingCart className="h-4 w-4" />
                    Instant
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="h-4 w-4" />
                    Multiple Methods
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Recent Transactions */}
        {recentTransactions && recentTransactions.length > 0 && (
          <Card className="border-border">
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest Aurum transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div>
                      <p className="font-medium capitalize">{tx.transaction_type}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(tx.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">A {Number(tx.amount).toFixed(4)}</p>
                      <Badge variant={tx.status === "completed" ? "default" : "secondary"}>
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" onClick={() => navigate("/transactions")}>
                View All Transactions
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </Layout>
  );
}