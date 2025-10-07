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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send } from "lucide-react";
import { z } from "zod";

const sendSchema = z.object({
  recipientEmail: z.string().email({ message: "Invalid email address" }),
  amount: z.number().positive({ message: "Amount must be greater than 0" }),
  notes: z.string().max(500, { message: "Notes must be less than 500 characters" }).optional(),
});

export default function SendAurum() {
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

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      recipientEmail: formData.get("recipientEmail") as string,
      amount: parseFloat(formData.get("amount") as string),
      notes: formData.get("notes") as string,
    };

    try {
      const validated = sendSchema.parse(data);

      if (!balance || Number(balance.aurum_balance) < validated.amount) {
        toast({
          variant: "destructive",
          title: "Insufficient balance",
          description: "You don't have enough Aurum to send this amount.",
        });
        return;
      }

      // Create transaction
      const { error: txError } = await supabase.from("transactions").insert({
        user_id: user!.id,
        transaction_type: "send",
        amount: validated.amount,
        recipient_email: validated.recipientEmail,
        status: "completed",
        notes: validated.notes || null,
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
        title: "Aurum sent successfully!",
        description: `Sent A ${validated.amount.toFixed(4)} to ${validated.recipientEmail}`,
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
          description: "Failed to send Aurum. Please try again.",
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
          <h2 className="text-4xl font-bold mb-2">Send Aurum</h2>
          <p className="text-lg text-muted-foreground">
            Transfer your digital gold to another user instantly
          </p>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Transfer Details
            </CardTitle>
            <CardDescription>
              Available balance: A {balance?.aurum_balance ? Number(balance.aurum_balance).toFixed(4) : "0.0000"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSend} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipientEmail">Recipient Email</Label>
                <Input
                  id="recipientEmail"
                  name="recipientEmail"
                  type="email"
                  placeholder="recipient@example.com"
                  required
                  disabled={isSubmitting}
                />
              </div>

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
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Add a message for the recipient..."
                  disabled={isSubmitting}
                  rows={3}
                />
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Aurum"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="border-warning bg-warning/5">
          <CardHeader>
            <CardTitle className="text-warning">Important Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-muted-foreground">
            <p>• Transfers are instant and cannot be reversed</p>
            <p>• Ensure the recipient email is correct before sending</p>
            <p>• Transaction fees may apply for certain transfers</p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}