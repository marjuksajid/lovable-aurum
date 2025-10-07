import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { TrendingUp, ArrowUpRight, ShoppingCart, DollarSign } from "lucide-react";
import { z } from "zod";

const purchaseSchema = z.object({
  usdAmount: z.number().positive({ message: "Amount must be greater than 0" }).min(10, { message: "Minimum purchase is $10" }),
});

export default function GoldRate() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [usdAmount, setUsdAmount] = useState<string>("");

  useEffect(() => {
    if (!user && !loading) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  // Mock gold rate - in production, fetch from API
  const goldRateUSD = 1850.25;
  const rateChange = 12.5;
  const changePercent = 0.68;
  const ouncesPerUSD = 1 / goldRateUSD;

  const aurumAmount = usdAmount ? (parseFloat(usdAmount) * ouncesPerUSD).toFixed(4) : "0.0000";

  const handlePurchase = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const validated = purchaseSchema.parse({ usdAmount: parseFloat(usdAmount) });
      const aurumPurchased = validated.usdAmount * ouncesPerUSD;

      // Create transaction
      const { error: txError } = await supabase.from("transactions").insert({
        user_id: user!.id,
        transaction_type: "purchase",
        amount: aurumPurchased,
        gold_rate_usd: goldRateUSD,
        usd_amount: validated.usdAmount,
        status: "completed",
      });

      if (txError) throw txError;

      // Update balance
      const { data: currentBalance } = await supabase
        .from("user_balances")
        .select("aurum_balance")
        .eq("user_id", user!.id)
        .single();

      const newBalance = Number(currentBalance?.aurum_balance || 0) + aurumPurchased;

      const { error: balanceError } = await supabase
        .from("user_balances")
        .update({ aurum_balance: newBalance })
        .eq("user_id", user!.id);

      if (balanceError) throw balanceError;

      toast({
        title: "Purchase successful!",
        description: `You've purchased A ${aurumPurchased.toFixed(4)} for $${validated.usdAmount.toFixed(2)}`,
      });

      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setUsdAmount("");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          variant: "destructive",
          title: "Validation error",
          description: error.errors[0].message,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to complete purchase. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !user) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-4xl font-bold mb-2">Current Gold Rate</h2>
          <p className="text-lg text-muted-foreground">
            Live gold prices and purchase options
          </p>
        </div>

        {/* Live Rate Card */}
        <Card className="border-border bg-gradient-to-br from-card to-card/50 shadow-xl">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center flex-col text-center">
              <div className="h-16 w-16 rounded-full bg-gradient-primary flex items-center justify-center mb-4 shadow-glow-primary">
                <TrendingUp className="h-8 w-8 text-primary-foreground" />
              </div>
              <h3 className="text-2xl font-bold mb-2">Live Gold Rate</h3>
              <div className="flex items-baseline gap-2 mb-2">
                <p className="text-5xl font-bold text-primary">${goldRateUSD.toFixed(2)}</p>
                <span className="text-xl text-muted-foreground">/ ounce</span>
              </div>
              <div className="flex items-center gap-1 text-success">
                <ArrowUpRight className="h-5 w-5" />
                <span className="font-semibold text-lg">
                  +${rateChange.toFixed(2)} ({changePercent}%) today
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Purchase Form */}
        <div className="grid md:grid-cols-2 gap-6">
          <Card className="border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Purchase Aurum
              </CardTitle>
              <CardDescription>
                Enter the USD amount you want to invest
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePurchase} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="usdAmount">Amount (USD)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="usdAmount"
                      name="usdAmount"
                      type="number"
                      step="0.01"
                      min="10"
                      placeholder="100.00"
                      value={usdAmount}
                      onChange={(e) => setUsdAmount(e.target.value)}
                      className="pl-9"
                      required
                      disabled={isSubmitting}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">Minimum purchase: $10.00</p>
                </div>

                <div className="p-4 bg-accent/10 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">You will receive:</span>
                    <span className="text-lg font-bold text-primary">A {aurumAmount}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Rate:</span>
                    <span className="text-sm font-medium">1 oz = ${goldRateUSD.toFixed(2)}</span>
                  </div>
                </div>

                <Button type="submit" className="w-full shadow-glow-primary" disabled={isSubmitting || !usdAmount}>
                  {isSubmitting ? "Processing..." : "Purchase Now"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Info Card */}
          <div className="space-y-6">
            <Card className="border-border">
              <CardHeader>
                <CardTitle>Why Invest in Gold?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary font-bold text-xs">1</span>
                  </div>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Hedge Against Inflation:</strong> Gold historically maintains value during economic uncertainty
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary font-bold text-xs">2</span>
                  </div>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Portfolio Diversification:</strong> Reduce risk by adding precious metals to your investments
                  </p>
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-primary font-bold text-xs">3</span>
                  </div>
                  <p className="text-muted-foreground">
                    <strong className="text-foreground">Instant Liquidity:</strong> Convert your gold to cash anytime with our easy return process
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border bg-success/5">
              <CardHeader>
                <CardTitle className="text-success">Security & Protection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-muted-foreground">
                <p>✓ Fully insured digital gold holdings</p>
                <p>✓ Backed by physical gold reserves</p>
                <p>✓ Bank-grade security infrastructure</p>
                <p>✓ Transparent pricing with no hidden fees</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}