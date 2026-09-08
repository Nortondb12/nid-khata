import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Loader2, LogIn, Mail, KeyRound } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/assets/logo.png";

const Auth = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectPath = searchParams.get("next") === "/admin" ? "/admin" : "/status";
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    document.title = "ক্লায়েন্ট লগইন | NID Khata";
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate(redirectPath, { replace: true });
    });
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate(redirectPath, { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate, redirectPath]);

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
          options: { emailRedirectTo: `${window.location.origin}${redirectPath}` },
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
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 py-8 sm:py-10 md:py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-6 group">
          <img src={logo} alt="NID Khata Logo" className="w-10 h-10 sm:w-11 sm:h-11 object-contain rounded-xl group-hover:scale-105 transition-transform" />
          <span className="font-bold text-lg sm:text-xl text-foreground">NID Khata</span>
        </Link>

        <div className="bg-card border border-border/80 rounded-2xl p-5 sm:p-6 md:p-8 shadow-[var(--shadow-elevated)]">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            {mode === "login" ? "ক্লায়েন্ট লগইন" : "অ্যাকাউন্ট তৈরি করুন"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            যে ইমেইল দিয়ে অনুরোধ জমা দিয়েছেন সেই ইমেইল ব্যবহার করুন।
          </p>

          <form onSubmit={onSubmit} className="mt-4 sm:mt-5 md:mt-6 space-y-3 sm:space-y-4" noValidate>
            <div className="space-y-2">
              <Label htmlFor="auth-email" className="text-sm sm:text-base">ইমেইল</Label>
              <div className="relative">
                <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="auth-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 sm:h-12 w-full pl-10 sm:pl-11 pr-3 sm:pr-4 rounded-xl bg-muted/40 text-sm sm:text-base"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="auth-password" className="text-sm sm:text-base">পাসওয়ার্ড</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="auth-password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 sm:h-12 w-full pl-10 sm:pl-11 pr-3 sm:pr-4 rounded-xl bg-muted/40 text-sm sm:text-base"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <p role="alert" className="text-xs sm:text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-2.5 sm:p-3 break-words">
                {error}
              </p>
            )}
            {message && (
              <p role="status" className="text-xs sm:text-sm text-primary bg-primary/10 border border-primary/20 rounded-xl p-2.5 sm:p-3 break-words">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-11 sm:min-h-12 animated-gradient text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-70 px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base"
            >
              {loading ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" aria-hidden="true" /> : <LogIn className="w-4 h-4 sm:w-5 sm:h-5" aria-hidden="true" />}
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
            className="mt-3 sm:mt-4 w-full text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            {mode === "login" ? "অ্যাকাউন্ট নেই? সাইন আপ করুন" : "অ্যাকাউন্ট আছে? লগইন করুন"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;