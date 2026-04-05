import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { usePageMeta } from "@/hooks/usePageMeta";
import { apiRequest } from "@/lib/queryClient";
import SectionTag from "@/components/SectionTag";
import {
  ArrowRight, ArrowLeft, Check, User, Mail, Phone,
  Shield, Lock, CreditCard, FileText, CheckCircle2, AlertCircle, Zap
} from "lucide-react";

// ─── Schema ──────────────────────────────────────────────────────────────────

const step1Schema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(10, "Please enter a valid US phone number"),
  dateOfBirth: z.string().regex(/^\d{2}\/\d{2}\/\d{4}$/, "Use MM/DD/YYYY format"),
  ssn4: z.string().regex(/^\d{4}$/, "Must be exactly 4 digits"),
  street: z.string().min(4, "Street address is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().length(2, "Use 2-letter state code (e.g. FL)"),
  zip: z.string().regex(/^\d{5}$/, "Use 5-digit ZIP code"),
});

const step2Schema = z.object({
  authorizeFCRA: z.literal(true, {
    errorMap: () => ({ message: "You must authorize the credit pull to proceed" }),
  }),
  understandCancellation: z.literal(true, {
    errorMap: () => ({ message: "You must acknowledge the cancellation policy" }),
  }),
  agreeTerms: z.literal(true, {
    errorMap: () => ({ message: "You must agree to the Service Agreement to proceed" }),
  }),
});

const fullSchema = step1Schema.merge(step2Schema);
type FormValues = z.infer<typeof fullSchema>;

// US States list
const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT",
  "VA","WA","WV","WI","WY","DC",
];

// ─── Step Indicator ───────────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  const pct = Math.round((step / total) * 100);
  const labels = ["Personal Info", "Authorization", "Review & Pay"];
  return (
    <div className="mb-10">
      <div className="flex justify-between mb-2">
        {labels.map((label, i) => (
          <div key={i} className={`flex flex-col items-center gap-1 text-center ${i < step ? "text-gold" : i === step ? "text-white" : "text-slate-600"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-all ${
              i < step ? "bg-gold border-gold text-dark-slate" :
              i === step ? "bg-gold/10 border-gold text-gold" :
              "bg-transparent border-slate-700 text-slate-600"
            }`}>
              {i < step ? <Check className="w-4 h-4" /> : i + 1}
            </div>
            <span className="hidden sm:block text-[10px] font-mono uppercase tracking-wider">{label}</span>
          </div>
        ))}
      </div>
      <div className="relative h-1 bg-dark-slate-light rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full bg-gold rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-xs font-mono text-gold/60 mt-2 text-right">Step {step + 1} of {total}</p>
    </div>
  );
}

// ─── Step 1: Personal Info ────────────────────────────────────────────────────

function Step1({ form }: { form: ReturnType<typeof useForm<FormValues>> }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl text-white tracking-wide mb-1">Personal Information</h2>
        <p className="text-slate-400 text-sm">Enter your legal information exactly as it appears on government-issued ID.</p>
      </div>

      {/* Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="firstName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-300 text-xs font-bold uppercase tracking-wider">First Name</FormLabel>
              <FormControl>
                <Input placeholder="John" className="bg-dark-slate border-gold/20 text-white placeholder:text-slate-600 h-12" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="lastName"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-300 text-xs font-bold uppercase tracking-wider">Last Name</FormLabel>
              <FormControl>
                <Input placeholder="Smith" className="bg-dark-slate border-gold/20 text-white placeholder:text-slate-600 h-12" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-300 text-xs font-bold uppercase tracking-wider">Email Address</FormLabel>
              <FormControl>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input type="email" placeholder="you@email.com" className="bg-dark-slate border-gold/20 text-white placeholder:text-slate-600 pl-10 h-12" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-300 text-xs font-bold uppercase tracking-wider">Phone Number</FormLabel>
              <FormControl>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-mono">+1</span>
                  <Input type="tel" placeholder="(555) 123-4567" className="bg-dark-slate border-gold/20 text-white placeholder:text-slate-600 pl-10 h-12" {...field} />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* DOB + SSN4 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="dateOfBirth"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-300 text-xs font-bold uppercase tracking-wider">Date of Birth</FormLabel>
              <FormControl>
                <Input placeholder="MM/DD/YYYY" maxLength={10} className="bg-dark-slate border-gold/20 text-white placeholder:text-slate-600 h-12 font-mono" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="ssn4"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-300 text-xs font-bold uppercase tracking-wider">
                Last 4 of SSN
              </FormLabel>
              <FormControl>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    type="text"
                    inputMode="numeric"
                    placeholder="••••"
                    maxLength={4}
                    className="bg-dark-slate border-gold/20 text-white placeholder:text-slate-600 pl-10 h-12 font-mono tracking-[0.3em]"
                    {...field}
                  />
                </div>
              </FormControl>
              <p className="text-[10px] text-slate-500 font-mono mt-1 flex items-center gap-1">
                <Lock className="w-3 h-3" /> We never store your full SSN — only used for secure credit pull via CRC
              </p>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* Address */}
      <div className="space-y-3">
        <FormField
          control={form.control}
          name="street"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-slate-300 text-xs font-bold uppercase tracking-wider">Street Address</FormLabel>
              <FormControl>
                <Input placeholder="123 Main Street" className="bg-dark-slate border-gold/20 text-white placeholder:text-slate-600 h-12" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <FormField
            control={form.control}
            name="city"
            render={({ field }) => (
              <FormItem className="sm:col-span-1">
                <FormLabel className="text-slate-300 text-xs font-bold uppercase tracking-wider">City</FormLabel>
                <FormControl>
                  <Input placeholder="Miami" className="bg-dark-slate border-gold/20 text-white placeholder:text-slate-600 h-12" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300 text-xs font-bold uppercase tracking-wider">State</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-dark-slate border-gold/20 text-white h-12">
                      <SelectValue placeholder="FL" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="bg-dark-slate-light border-gold/20 max-h-56">
                    {US_STATES.map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="zip"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-slate-300 text-xs font-bold uppercase tracking-wider">ZIP Code</FormLabel>
                <FormControl>
                  <Input placeholder="33101" maxLength={5} inputMode="numeric" className="bg-dark-slate border-gold/20 text-white placeholder:text-slate-600 h-12 font-mono" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Step 2: Authorization & Legal ───────────────────────────────────────────

function Step2({ form }: { form: ReturnType<typeof useForm<FormValues>> }) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-white tracking-wide mb-1">Authorization & Legal Disclosures</h2>
        <p className="text-slate-400 text-sm">
          Florida law (CROA) requires written authorization before we can begin your audit. Please read and confirm each item below.
        </p>
      </div>

      {/* Florida CROA notice banner */}
      <div className="flex gap-3 bg-gold/5 border border-gold/20 rounded-xl p-4">
        <AlertCircle className="w-5 h-5 text-gold shrink-0 mt-0.5" />
        <p className="text-slate-300 text-sm leading-relaxed">
          <span className="text-gold font-bold">Florida CROA Notice:</span> You have the right to cancel this agreement
          within <strong className="text-white">3 business days</strong> of signing for a full refund. You may not be charged
          any fee before services are fully performed.
        </p>
      </div>

      {/* Checkbox 1 */}
      <FormField
        control={form.control}
        name="authorizeFCRA"
        render={({ field }) => (
          <FormItem className="flex items-start gap-4 space-y-0 bg-dark-slate rounded-xl p-5 border border-gold/10">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                className="border-gold/40 data-[state=checked]:bg-gold data-[state=checked]:border-gold mt-0.5 w-5 h-5 shrink-0"
                data-testid="checkbox-fcra-auth"
              />
            </FormControl>
            <div>
              <FormLabel className="text-white text-sm font-bold leading-snug cursor-pointer">
                FCRA Authorization
              </FormLabel>
              <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                I authorize <strong className="text-white">700 Credit Club Experts</strong> (Florida licensed credit services organization)
                to pull my tri-bureau credit reports (Equifax, TransUnion, Experian) and dispute inaccurate
                items on my behalf under 15 USC 1681 (FCRA) and 15 USC 1692 (FDCPA).
              </p>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />

      {/* Checkbox 2 */}
      <FormField
        control={form.control}
        name="understandCancellation"
        render={({ field }) => (
          <FormItem className="flex items-start gap-4 space-y-0 bg-dark-slate rounded-xl p-5 border border-gold/10">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                className="border-gold/40 data-[state=checked]:bg-gold data-[state=checked]:border-gold mt-0.5 w-5 h-5 shrink-0"
                data-testid="checkbox-cancellation"
              />
            </FormControl>
            <div>
              <FormLabel className="text-white text-sm font-bold leading-snug cursor-pointer">
                3-Day Cancellation Right (Florida Law)
              </FormLabel>
              <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                I understand I have a <strong className="text-white">3-business-day cancellation period</strong> under
                Florida law (§ 817.7001). No advance payment is required beyond the <strong className="text-white">$149 one-time fee</strong>.
                I may cancel by contacting us at{" "}
                <a href="mailto:sales@700creditclubexperts.com" className="text-gold hover:underline">
                  sales@700creditclubexperts.com
                </a>{" "}
                within 3 days for a full refund.
              </p>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />

      {/* Service Agreement Preview */}
      <div className="bg-dark-slate rounded-xl border border-gold/10 p-5">
        <div className="flex items-center gap-2 mb-3">
          <FileText className="w-4 h-4 text-gold" />
          <span className="text-white text-sm font-bold">Service Agreement Preview</span>
        </div>
        <div className="bg-dark-slate-light rounded-lg p-4 max-h-40 overflow-y-auto text-xs text-slate-400 font-mono leading-relaxed space-y-2">
          <p><strong className="text-gold">700 CREDIT CLUB EXPERTS — SERVICE AGREEMENT</strong></p>
          <p>This agreement is between 700 Credit Club Experts ("Company"), a credit services organization licensed in the State of Florida, and the Client identified above.</p>
          <p><strong className="text-slate-300">SCOPE OF SERVICES:</strong> Company will perform a tri-bureau credit audit using AI-assisted analysis, identify FCRA violations and inaccuracies, and submit Round 1 dispute letters to all three credit bureaus on Client's behalf.</p>
          <p><strong className="text-slate-300">FEE:</strong> $149 one-time, non-recurring fee. No monthly charges. No advance fee collected before service commencement beyond this initial fee.</p>
          <p><strong className="text-slate-300">CANCELLATION:</strong> Client may cancel within 3 business days of execution for a full refund per Florida Statute § 817.7001.</p>
          <p><strong className="text-slate-300">NO GUARANTEE:</strong> While Company uses legally-grounded strategies, no specific outcome is guaranteed. Individual results depend on credit bureau responses and the accuracy of disputed information.</p>
          <p><strong className="text-slate-300">COMPLIANCE:</strong> All dispute methods are grounded in 15 USC 1681 (FCRA) and 15 USC 1692 (FDCPA). Company does not use illegal, unethical, or deceptive practices.</p>
        </div>
        <a
          href="/service-agreement.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-gold text-xs font-mono mt-3 hover:underline"
        >
          <FileText className="w-3 h-3" /> Download Full Service Agreement (PDF)
        </a>
      </div>

      {/* Checkbox 3 */}
      <FormField
        control={form.control}
        name="agreeTerms"
        render={({ field }) => (
          <FormItem className="flex items-start gap-4 space-y-0 bg-gold/5 rounded-xl p-5 border border-gold/20">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                className="border-gold data-[state=checked]:bg-gold data-[state=checked]:border-gold mt-0.5 w-5 h-5 shrink-0"
                data-testid="checkbox-agree-terms"
              />
            </FormControl>
            <div>
              <FormLabel className="text-white text-sm font-bold leading-snug cursor-pointer">
                I agree to the Service Agreement & Privacy Policy
              </FormLabel>
              <p className="text-slate-400 text-sm mt-1 leading-relaxed">
                I have read and agree to the full{" "}
                <a href="/service-agreement.pdf" target="_blank" rel="noopener noreferrer" className="text-gold hover:underline">Service Agreement</a>
                {" "}and{" "}
                <a href="/privacy-policy" className="text-gold hover:underline">Privacy Policy</a>.
                I understand 700 Credit Club Experts is a licensed Florida credit services organization, not a law firm.
              </p>
              <FormMessage />
            </div>
          </FormItem>
        )}
      />
    </div>
  );
}

// ─── Step 3: Review & Pay ─────────────────────────────────────────────────────

function Step3({ form, isSubmitting }: { form: ReturnType<typeof useForm<FormValues>>; isSubmitting: boolean }) {
  const v = form.getValues();
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl text-white tracking-wide mb-1">Review & Pay</h2>
        <p className="text-slate-400 text-sm">Confirm your information below, then complete your secure payment to start your audit.</p>
      </div>

      {/* Order Summary */}
      <div className="bg-dark-slate-light border border-gold/30 rounded-xl p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-gold/15 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-gold" />
          </div>
          <div>
            <p className="text-white font-bold">Credit Audit + Round 1</p>
            <p className="text-gold/70 text-xs font-mono">AI-Automated · One-Time · No Subscription</p>
          </div>
          <div className="ml-auto text-right">
            <p className="font-display text-3xl text-gold">$149</p>
            <p className="text-slate-500 text-xs font-mono">One-Time</p>
          </div>
        </div>
        <div className="border-t border-gold/10 pt-4 space-y-1.5">
          {[
            "Full tri-bureau AI audit (JECI AI powered)",
            "Round 1 FCRA-grounded dispute letters",
            "Consumer Law strategy review",
            "Client portal access",
            "Email support",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-slate-300 text-sm">
              <Check className="w-3.5 h-3.5 text-gold shrink-0" />
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Client Summary */}
      <div className="bg-dark-slate border border-gold/10 rounded-xl p-5">
        <p className="text-xs font-mono uppercase tracking-widest text-gold/60 mb-3">Your Information</p>
        <div className="grid grid-cols-2 gap-y-2 text-sm">
          {[
            ["Name", `${v.firstName} ${v.lastName}`],
            ["Email", v.email],
            ["Phone", v.phone],
            ["Date of Birth", v.dateOfBirth],
            ["SSN (last 4)", `•••-••-${v.ssn4}`],
            ["Address", `${v.street}, ${v.city}, ${v.state} ${v.zip}`],
          ].map(([label, val]) => (
            <div key={label} className="col-span-2 sm:col-span-1">
              <span className="text-slate-500 font-mono text-xs uppercase">{label}: </span>
              <span className="text-white font-medium">{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Pay Button */}
      <div className="space-y-4">
        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="w-full bg-gold text-dark-slate font-bold text-base py-6 shadow-[0_20px_40px_rgba(234,179,8,0.2)] no-default-hover-elevate"
          data-testid="button-pay-and-start"
        >
          {isSubmitting ? (
            "Processing…"
          ) : (
            <>
              <CreditCard className="w-5 h-5 mr-2" />
              Pay $149 &amp; Start Your Audit Now
              <ArrowRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>

        {/* Trust badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
          {[
            { icon: Shield, text: "Florida Licensed" },
            { icon: Zap, text: "Powered by JECI AI" },
            { icon: Lock, text: "Secure Checkout" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 text-slate-500 text-xs font-mono">
              <Icon className="w-3.5 h-3.5 text-gold/60" />
              {text}
            </div>
          ))}
        </div>

        <p className="text-center text-slate-500 text-xs font-mono leading-relaxed">
          You will be redirected to Stripe's secure checkout page. Your audit begins immediately after payment confirmation.
          3-day cancellation window applies per Florida law.
        </p>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StartAuditPage() {
  usePageMeta({
    title: "Start Your Credit Audit — $149 | 700 Credit Club Experts",
    description: "Begin your FCRA-grounded tri-bureau credit audit. Consumer Law Restoration powered by JECI AI. Florida licensed. Starting at $149 — no subscription.",
  });

  const [step, setStep] = useState(0);
  const { toast } = useToast();
  const TOTAL_STEPS = 3;

  const form = useForm<FormValues>({
    resolver: zodResolver(fullSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      dateOfBirth: "",
      ssn4: "",
      street: "",
      city: "",
      state: "",
      zip: "",
      authorizeFCRA: undefined,
      understandCancellation: undefined,
      agreeTerms: undefined,
    },
    mode: "onTouched",
  });

  const mutation = useMutation({
    mutationFn: async (data: FormValues) => {
      const res = await apiRequest("POST", "/api/intake", {
        name: `${data.firstName} ${data.lastName}`,
        email: data.email,
        phone: data.phone,
        contactTime: "anytime",
        goals: ["Improve Score Fast"],
        budget: "100-199",
        source: "direct",
        consent: true,
        affiliateCode: new URLSearchParams(window.location.search).get("ref") ?? undefined,
      });
      return res.json();
    },
    onSuccess: () => {
      // Redirect to Stripe payment link
      window.location.href = "https://buy.stripe.com/14AdR80Pog5o6nignxfEk00";
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  const step1Fields: (keyof FormValues)[] = ["firstName", "lastName", "email", "phone", "dateOfBirth", "ssn4", "street", "city", "state", "zip"];
  const step2Fields: (keyof FormValues)[] = ["authorizeFCRA", "understandCancellation", "agreeTerms"];

  async function next() {
    const fields = step === 0 ? step1Fields : step === 1 ? step2Fields : [];
    const valid = await form.trigger(fields);
    if (!valid) return;
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function prev() {
    setStep((s) => Math.max(s - 1, 0));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function onSubmit(data: FormValues) {
    mutation.mutate(data);
  }

  return (
    <div className="bg-dark-slate min-h-screen pt-24 sm:pt-28 pb-28">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">

        {/* Page header */}
        <div className="text-center mb-8">
          <SectionTag>Credit Audit + Round 1 — $149</SectionTag>
          <h1 className="font-display text-4xl sm:text-5xl text-white tracking-wide mb-3">
            START YOUR <span className="text-gold">CREDIT AUDIT</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            Florida licensed · JECI AI powered · FCRA compliant · 3-day cancellation guarantee
          </p>
        </div>

        <ProgressBar step={step} total={TOTAL_STEPS} />

        {/* Form card */}
        <div className="bg-dark-slate-light border border-gold/10 rounded-xl p-6 sm:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} noValidate>

              {step === 0 && <Step1 form={form} />}
              {step === 1 && <Step2 form={form} />}
              {step === 2 && <Step3 form={form} isSubmitting={mutation.isPending} />}

              {/* Nav buttons */}
              {step < 2 && (
                <div className="flex items-center justify-between gap-4 mt-8 pt-6 border-t border-gold/10">
                  {step > 0 ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={prev}
                      className="border-gold/20 text-gold bg-transparent no-default-hover-elevate"
                      data-testid="button-prev"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" /> Back
                    </Button>
                  ) : (
                    <div />
                  )}
                  <Button
                    type="button"
                    onClick={next}
                    className="bg-gold text-dark-slate font-bold no-default-hover-elevate"
                    data-testid="button-next"
                  >
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              )}

              {step === 2 && (
                <div className="mt-6 pt-6 border-t border-gold/10">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prev}
                    className="border-gold/20 text-gold bg-transparent no-default-hover-elevate text-sm"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                </div>
              )}

            </form>
          </Form>
        </div>

        {/* Bottom trust */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {[
            { icon: Shield, text: "Licensed · State of Florida" },
            { icon: Lock, text: "256-bit SSL Encrypted" },
            { icon: CheckCircle2, text: "FCRA / FDCPA Compliant" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2 text-slate-500 text-xs font-mono">
              <Icon className="w-3.5 h-3.5 text-gold/50" />
              {text}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
