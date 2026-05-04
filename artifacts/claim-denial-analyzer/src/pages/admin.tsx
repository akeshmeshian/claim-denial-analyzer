import { useState } from "react";
import { Link } from "wouter";
import { Loader2, Shield, ExternalLink } from "lucide-react";

interface AdminReport {
  id: string;
  email: string;
  claimType: string;
  paymentStatus: string;
  createdAt: string;
}

export default function AdminPage() {
  const [password, setPassword] = useState("");
  const [reports, setReports] = useState<AdminReport[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/reports", {
        headers: { Authorization: `Bearer ${password}` },
      });
      if (res.status === 401) {
        setError("Incorrect password");
        return;
      }
      if (!res.ok) throw new Error("Failed to fetch reports");
      setReports(await res.json());
    } catch {
      setError("Failed to load reports");
    } finally {
      setLoading(false);
    }
  }

  if (!reports) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-6">
            <Shield className="h-10 w-10 text-primary mx-auto mb-2" />
            <h1 className="text-2xl font-bold">Admin Access</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div>
              <label className="block text-sm font-medium mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Admin password"
                required
                data-testid="input-admin-password"
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-2.5 text-sm font-semibold text-white hover:bg-primary/90 disabled:opacity-60"
              data-testid="btn-admin-login"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mx-auto" /> : "Access Dashboard"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-10 px-4">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold" data-testid="admin-heading">Admin Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">{reports.length} reports total</p>
          </div>
          <button
            onClick={() => setReports(null)}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Sign out
          </button>
        </div>

        <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Report ID</th>
                  <th className="text-left px-4 py-3 font-semibold">Email</th>
                  <th className="text-left px-4 py-3 font-semibold">Claim Type</th>
                  <th className="text-left px-4 py-3 font-semibold">Payment</th>
                  <th className="text-left px-4 py-3 font-semibold">Created</th>
                  <th className="text-left px-4 py-3 font-semibold">Link</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.id} className="border-b border-border hover:bg-muted/20 transition-colors" data-testid={`admin-row-${r.id}`}>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{r.id.split("-")[0]}...</td>
                    <td className="px-4 py-3">{r.email}</td>
                    <td className="px-4 py-3">{r.claimType}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        r.paymentStatus === "paid"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}>
                        {r.paymentStatus}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      {r.paymentStatus === "paid" ? (
                        <Link href={`/report/${r.id}`}>
                          <span className="inline-flex items-center gap-1 text-primary hover:underline cursor-pointer">
                            View <ExternalLink className="h-3 w-3" />
                          </span>
                        </Link>
                      ) : (
                        <Link href={`/preview/${r.id}`}>
                          <span className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground hover:underline cursor-pointer">
                            Preview <ExternalLink className="h-3 w-3" />
                          </span>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
                {reports.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-10 text-muted-foreground">
                      No reports yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
