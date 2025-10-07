import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { RotateCcw } from "lucide-react";
import { z } from "zod";

const returnSchema = z.object({
  amount: z.number().positive({ message: "Amount must be greater than 0" }),
  bankAccount: z.string().min(5, { message: "Invalid bank account" }),
  notes: z.string().max(500).optional(),
});

export default function ReturnAurum() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!user && !loading) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const { data: balance } = useQuery({
    queryKey: ["balance", user?.id],
    queryFn: async () => {
      if (!user) return null;
      const { data, error } = await supabase
        .from("user_balances")
        .select("aurum_balance")
        .eq("user_id", user.id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Mock gold rate
  const goldRateUSD = 1850.25;

  const handleReturn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      amount: parseFloat(formData.get("amount") as string),
      bankAccount: formData.get("bankAccount") as string,
      notes: formData.get("notes") as string,
    };

    try {
      const validated = returnSchema.parse(data);

      if (!balance || Number(balance.aurum_balance) < validated.amount) {
        toast({
          variant: "destructive",
          title: "Insufficient balance",
          description: "You don't have enough Aurum to return this amount.",
        });
        return;
      }

      const usdAmount = validated.amount * goldRateUSD;

      // Create transaction
      const { error: txError } = await supabase.from("transactions").insert({
        user_id: user!.id,
        transaction_type: "return",
        amount: validated.amount,
        gold_rate_usd: goldRateUSD,
        usd_amount: usdAmount,
        status: "pending",
        notes: `Bank: ${validated.bankAccount}. ${validated.notes || ""}`,
      });

      if (txError) throw txError;

      // Update balance
      const newBalance = Number(balance.aurum_balance) - validated.amount;
      const { error: balanceError } = await supabase
        .from("user_balances")
        .update({ aurum_balance: newBalance })
        .eq("user_id", user!.id);

      if (balanceError) throw balanceError;

      toast({
        title: "Return request submitted!",
        description: `Your request to return A ${validated.amount.toFixed(4)} ($${usdAmount.toFixed(2)}) has been submitted for processing.`,
      });

      queryClient.invalidateQueries({ queryKey: ["balance"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      (e.target as HTMLFormElement).reset();
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
          description: "Failed to process return. Please try again.",
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
      <div className="space-y-6 max-w-2xl mx-auto">
        <div>
          <h2 className="text-4xl font-bold mb-2">Return Aurum</h2>
          <p className="text-lg text-muted-foreground">
            Convert your digital gold back to cash
          </p>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5" />
              Return Request
            </CardTitle>
            <CardDescription>
              Available balance: A {balance?.aurum_balance ? Number(balance.aurum_balance).toFixed(4) : "0.0000"}
              <br />
              Current gold rate: ${goldRateUSD.toFixed(2)} USD/oz
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleReturn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Amount (Aurum)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.0001"
                  min="0.0001"
                  placeholder="0.0000"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankAccount">Bank Account Number</Label>
                <Input
                  id="bankAccount"
                  name="bankAccount"
                  type="text"
                  placeholder="Enter your bank account number"
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Additional Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Any special instructions..."
                  disabled={isSubmitting}
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Processing..." : "Submit Return Request"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-warning bg-warning/5">
          <CardHeader>
            <CardTitle className="text-warning">Processing Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Returns are processed within 2-3 business days</p>
            <p>• Funds will be transferred to your registered bank account</p>
            <p>• Processing fees may apply based on the amount</p>
            <p>• You'll receive a confirmation email once processed</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}