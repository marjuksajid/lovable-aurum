import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowDownRight, ArrowUpRight, RotateCcw, ShoppingCart } from "lucide-react";

export default function Transactions() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user && !loading) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  const { data: transactions, isLoading } = useQuery({
    queryKey: ["transactions", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
  });

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "purchase":
        return <ShoppingCart className="h-5 w-5 text-primary" />;
      case "send":
        return <ArrowUpRight className="h-5 w-5 text-destructive" />;
      case "receive":
        return <ArrowDownRight className="h-5 w-5 text-success" />;
      case "return":
        return <RotateCcw className="h-5 w-5 text-accent" />;
      default:
        return <ShoppingCart className="h-5 w-5" />;
    }
  };

  if (loading || !user) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h2 className="text-4xl font-bold mb-2">Transaction History</h2>
          <p className="text-lg text-muted-foreground">
            View all your Aurum transactions and activity
          </p>
        </div>

        <Card className="border-border">
          <CardHeader>
            <CardTitle>All Transactions</CardTitle>
            <CardDescription>
              Complete history of your purchases, transfers, and returns
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8 text-muted-foreground">Loading transactions...</div>
            ) : transactions && transactions.length > 0 ? (
              <div className="space-y-4">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent/5 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                        {getTransactionIcon(tx.transaction_type)}
                      </div>
                      <div>
                        <p className="font-semibold capitalize">{tx.transaction_type}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(tx.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        {tx.recipient_email && (
                          <p className="text-sm text-muted-foreground">
                            To: {tx.recipient_email}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">
                        {tx.transaction_type === "send" ? "-" : "+"}A {Number(tx.amount).toFixed(4)}
                      </p>
                      {tx.usd_amount && (
                        <p className="text-sm text-muted-foreground">
                          ${Number(tx.usd_amount).toFixed(2)} USD
                        </p>
                      )}
                      <Badge
                        variant={
                          tx.status === "completed"
                            ? "default"
                            : tx.status === "failed"
                            ? "destructive"
                            : "secondary"
                        }
                        className="mt-1"
                      >
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-semibold mb-2">No transactions yet</p>
                <p className="text-muted-foreground">
                  Start by purchasing your first Aurum
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}