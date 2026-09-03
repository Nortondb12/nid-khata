import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Loader2, LogIn, Mail, KeyRound, ShieldCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Auth = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "ক্লায়েন্ট লগইন | NID সার্ভার কপি";
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate("/status", { replace: true });
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate("/status", { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (mode === "signup") {
        const { error: err } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: `${window.location.origin}/status` },
        });
        if (err) throw err;
        setMessage("অ্যাকাউন্ট তৈরি হয়েছে। ইমেইলে পাঠানো নিশ্চিতকরণ লিংকে ক্লিক করে লগইন করুন।");
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (err) throw err;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "কিছু সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-6">
          <div className="w-9 h-9 rounded-xl animated-gradient flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-primary-foreground" aria-hidden="true" />
          </div>
          <span className="font-bold text-foreground">NID সার্ভার কপি</span>
        </Link>

        <div className="bg-card border border-border/80 rounded-2xl p-6 sm:p-8 shadow-[var(--shadow-elevated)]">
          <h1 className="text-2xl font-bold text-foreground">
            {mode === "login" ? "ক্লায়েন্ট লগইন" : "অ্যাকাউন্ট তৈরি করুন"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            যে ইমেইল দিয়ে অনুরোধ জমা দিয়েছেন সেই ইমেইল ব্যবহার করুন।
          </p>

          <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="auth-email">ইমেইল</Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="auth-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 pl-11 rounded-xl bg-muted/40"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="auth-password">পাসওয়ার্ড</Label>
              <div className="relative">
                <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="auth-password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pl-11 rounded-xl bg-muted/40"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <p role="alert" className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-3">
                {error}
              </p>
            )}
            {message && (
              <p role="status" className="text-sm text-primary bg-primary/10 border border-primary/20 rounded-xl p-3">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-12 animated-gradient text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" aria-hidden="true" /> : <LogIn className="w-5 h-5" aria-hidden="true" />}
              <span>{mode === "login" ? "লগইন করুন" : "সাইন আপ করুন"}</span>
            </button>
          </form>

          <button
            type="button"
            onClick={() => {
              setMode(mode === "login" ? "signup" : "login");
              setError(null);
              setMessage(null);
            }}
            className="mt-4 w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {mode === "login" ? "অ্যাকাউন্ট নেই? সাইন আপ করুন" : "অ্যাকাউন্ট আছে? লগইন করুন"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
