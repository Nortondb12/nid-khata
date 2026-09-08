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
    <div className="min-h-screen bg-background flex items-center justify-center px-4 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2.5 mb-8 sm:mb-10 group">
          <img src={logo} alt="NID Khata Logo" className="w-11 h-11 sm:w-12 sm:h-12 object-contain rounded-xl group-hover:scale-105 transition-transform shadow-sm" />
          <span className="font-bold text-xl sm:text-2xl text-foreground tracking-tight">NID Khata</span>
        </Link>

        <div className="bg-card border border-border/80 rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-10 shadow-[var(--shadow-elevated)]">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              {mode === "login" ? "ক্লায়েন্ট লগইন" : "অ্যাকাউন্ট তৈরি করুন"}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-2 sm:mt-3 leading-relaxed">
              যে ইমেইল দিয়ে অনুরোধ জমা দিয়েছেন সেই ইমেইল ব্যবহার করুন।
            </p>
          </div>

          <form onSubmit={onSubmit} className="mt-8 sm:mt-10 space-y-5 sm:space-y-6" noValidate>
            <div className="space-y-2.5">
              <Label htmlFor="auth-email" className="text-sm sm:text-base font-medium">ইমেইল</Label>
              <div className="relative">
                <Mail className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="auth-email"
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 sm:h-13 w-full pl-11 sm:pl-12 pr-4 sm:pr-5 rounded-xl bg-muted/40 text-sm sm:text-base border-border/80 focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="auth-password" className="text-sm sm:text-base font-medium">পাসওয়ার্ড</Label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" aria-hidden="true" />
                <Input
                  id="auth-password"
                  type="password"
                  required
                  minLength={6}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 sm:h-13 w-full pl-11 sm:pl-12 pr-4 sm:pr-5 rounded-xl bg-muted/40 text-sm sm:text-base border-border/80 focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {error && (
              <p role="alert" className="text-sm sm:text-base text-destructive bg-destructive/10 border border-destructive/20 rounded-xl p-3 sm:p-4 break-words leading-relaxed">
                {error}
              </p>
            )}
            {message && (
              <p role="status" className="text-sm sm:text-base text-primary bg-primary/10 border border-primary/20 rounded-xl p-3 sm:p-4 break-words leading-relaxed">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full min-h-12 sm:min-h-13 animated-gradient text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 disabled:opacity-70 px-4 sm:px-5 py-3 sm:py-3.5 text-sm sm:text-base hover:opacity-95 transition-opacity mt-2 sm:mt-3"
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
            className="mt-6 sm:mt-7 w-full text-sm sm:text-base text-muted-foreground hover:text-foreground transition-colors py-1 font-medium"
          >
            {mode === "login" ? "অ্যাকাউন্ট নেই? সাইন আপ করুন" : "অ্যাকাউন্ট আছে? লগইন করুন"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;