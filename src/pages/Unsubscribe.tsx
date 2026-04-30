import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Mail, MailX, CheckCircle2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

type State = "loading" | "ready" | "already" | "invalid" | "done" | "error";

const Unsubscribe = () => {
  const [params] = useSearchParams();
  const token = params.get("token");
  const [state, setState] = useState<State>("loading");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!token) { setState("invalid"); return; }
    (async () => {
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/handle-email-unsubscribe?token=${encodeURIComponent(token)}`, {
          headers: { apikey: SUPABASE_ANON_KEY },
        });
        const data = await res.json();
        if (data.valid) setState("ready");
        else if (data.reason === "already_unsubscribed") setState("already");
        else setState("invalid");
      } catch {
        setState("error");
      }
    })();
  }, [token]);

  const confirm = async () => {
    if (!token) return;
    setSubmitting(true);
    try {
      const { data, error } = await supabase.functions.invoke("handle-email-unsubscribe", { body: { token } });
      if (error || !(data as any)?.success) setState("error");
      else setState("done");
    } catch {
      setState("error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto grid min-h-screen max-w-md place-items-center px-5 py-12">
      <div className="w-full rounded-3xl bg-card p-8 text-center shadow-card">
        {state === "loading" && (
          <>
            <Mail className="mx-auto size-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Loading…</p>
          </>
        )}
        {state === "ready" && (
          <>
            <MailX className="mx-auto size-12 text-primary" />
            <h1 className="mt-4 text-xl font-bold">Unsubscribe from Big Moon English emails?</h1>
            <p className="mt-2 text-sm text-muted-foreground">You will no longer receive weekly learning reports.</p>
            <Button className="mt-6 w-full" onClick={confirm} disabled={submitting}>
              {submitting ? "Unsubscribing…" : "Confirm unsubscribe"}
            </Button>
          </>
        )}
        {state === "done" && (
          <>
            <CheckCircle2 className="mx-auto size-12 text-emerald-500" />
            <h1 className="mt-4 text-xl font-bold">You have been unsubscribed.</h1>
            <p className="mt-2 text-sm text-muted-foreground">Sorry to see you go. You can re-enable anytime in your account.</p>
          </>
        )}
        {state === "already" && (
          <>
            <CheckCircle2 className="mx-auto size-12 text-emerald-500" />
            <h1 className="mt-4 text-xl font-bold">Already unsubscribed</h1>
            <p className="mt-2 text-sm text-muted-foreground">This email is no longer subscribed.</p>
          </>
        )}
        {(state === "invalid" || state === "error") && (
          <>
            <AlertCircle className="mx-auto size-12 text-destructive" />
            <h1 className="mt-4 text-xl font-bold">{state === "invalid" ? "Invalid link" : "Something went wrong"}</h1>
            <p className="mt-2 text-sm text-muted-foreground">Please try again or contact support.</p>
          </>
        )}
      </div>
    </main>
  );
};

export default Unsubscribe;