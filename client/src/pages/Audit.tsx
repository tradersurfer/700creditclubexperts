import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { usePageMeta } from "@/hooks/usePageMeta";
import { apiRequest } from "@/lib/queryClient";
import { insertLeadSchema } from "@shared/schema";
import SectionTag from "@/components/SectionTag";
import { ArrowRight, ArrowLeft, Check, User, Mail, Phone, Target, CheckCircle2 } from "lucide-react";

const auditFormSchema = insertLeadSchema.extend({
  name: z.string().min(2, "Please enter your full name"),
  email: z.string().email("Please enter a valid email"),
  phone: z.string().min(7, "Please enter a valid phone number"),
  contactTime: z.string().min(1, "Please select a time"),
  goals: z.array(z.string()).min(1, "Please select at least one goal"),
  source: z.string().min(1, "Please let us know how you heard about us"),
  budget: z.string().min(1, "Please select a budget range"),
  consent: z.literal(true, { errorMap: () => ({ message: "You must consent to be contacted" }) }),
});

type AuditFormValues = z.infer<typeof auditFormSchema>;

const goalOptions = [
  "Remove Collections",
  "Buy a Home",
  "Build Business Credit",
  "Improve Score Fast",
  "Remove Inquiries",
  "Fix Late Payments",
  "VIP Coaching",
  "Bankruptcy Recovery",
];

const sourceOptions = [
  "Google Search",
  "Facebook",
  "Instagram",
  "Referral",
  "Skool Community",
  "Other",
];

function StepIndicator({ currentStep, totalSteps }: { currentStep: number; totalSteps: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8" data-testid="step-indicator">
      {Array.from({ length: totalSteps }, (_, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
            i < currentStep ? "bg-gold text-dark-slate" :
            i === currentStep ? "bg-gold/20 text-gold border border-gold" :
            "bg-dark-slate-light text-slate-500 border border-gold/10"
          }`}>
            {i < currentStep ? <Check className="w-4 h-4" /> : i + 1}
          </div>
          {i < totalSteps - 1 && (
            <div className={`w-8 sm:w-12 h-0.5 ${i < currentStep ? "bg-gold" : "bg-gold/10"}`} />
          )}
        </div>
      ))}
    </div>
  );
}

export default function AuditPage() {
  usePageMeta({
    title: "Start Your Credit Audit | 700 Credit Club Experts",
    description: "Begin your Consumer Law credit audit with 700 Credit Club Experts. Licensed in the State of Florida.",
  });

  const [step, setStep] = useState(0);
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const form = useForm<AuditFormValues>({
    resolver: zodResolver(auditFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      contactTime: "",
      goals: [],
      source: "",
      budget: "",
      consent: undefined,
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: AuditFormValues) => {
      const res = await apiRequest("POST", "/api/intake", data);
      return res.json();
    },
    onSuccess: () => {
      navigate("/thank-you");
    },
    onError: (error: Error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "Please try again.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: AuditFormValues) {
    mutation.mutate(data);
  }

  async function nextStep() {
    if (step === 0) {
      const valid = await form.trigger(["name", "email", "phone"]);
      if (!valid) return;
    } else if (step === 1) {
      const valid = await form.trigger(["goals", "contactTime"]);
      if (!valid) return;
    } else if (step === 2) {
      const valid = await form.trigger(["source", "budget", "consent"]);
      if (!valid) return;
    }
    setStep((s) => Math.min(s + 1, 3));
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 0));
  }

  const stepTitles = ["Your Information", "Credit Goals", "Final Details", "Review & Submit"];

  return (
    <div className="bg-dark-slate min-h-screen pt-24 sm:pt-28 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-8">
          <SectionTag>Step {step + 1} of 4</SectionTag>
          <h1 className="font-display text-4xl sm:text-5xl text-white tracking-wide mb-2" data-testid="text-audit-title">
            START YOUR <span className="text-gold">CREDIT AUDIT</span>
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-lg mx-auto leading-relaxed">
            {stepTitles[step]}
          </p>
        </div>

        <StepIndicator currentStep={step} totalSteps={4} />

        <div className="bg-dark-slate-light border border-gold/10 rounded-xl p-6 sm:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              {step === 0 && (
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300 text-sm font-bold uppercase tracking-wider">Full Name</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <Input
                              placeholder="Your full name"
                              className="bg-dark-slate border-gold/20 text-white placeholder:text-slate-600 pl-10 h-12"
                              data-testid="input-name"
                              {...field}
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-slate-300 text-sm font-bold uppercase tracking-wider">Email</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                              <Input
                                type="email"
                                placeholder="you@email.com"
                                className="bg-dark-slate border-gold/20 text-white placeholder:text-slate-600 pl-10 h-12"
                                data-testid="input-email"
                                {...field}
                              />
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
                          <FormLabel className="text-slate-300 text-sm font-bold uppercase tracking-wider">Phone</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                              <Input
                                type="tel"
                                placeholder="(555) 123-4567"
                                className="bg-dark-slate border-gold/20 text-white placeholder:text-slate-600 pl-10 h-12"
                                data-testid="input-phone"
                                {...field}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="goals"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-slate-300 text-sm font-bold uppercase tracking-wider">What do you need help with?</FormLabel>
                        <p className="text-slate-500 text-xs font-mono mb-3">Select all that apply</p>
                        <div className="grid grid-cols-2 gap-3">
                          {goalOptions.map((goal) => (
                            <FormField
                              key={goal}
                              control={form.control}
                              name="goals"
                              render={({ field }) => {
                                const isSelected = field.value?.includes(goal);
                                return (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      if (isSelected) {
                                        field.onChange(field.value?.filter((v: string) => v !== goal));
                                      } else {
                                        field.onChange([...field.value, goal]);
                                      }
                                    }}
                                    className={`p-3 rounded-xl border text-sm font-bold text-left transition-all ${
                                      isSelected
                                        ? "bg-gold/10 border-gold text-gold"
                                        : "bg-dark-slate border-gold/10 text-slate-400 hover:border-gold/30"
                                    }`}
                                    data-testid={`toggle-goal-${goal.toLowerCase().replace(/\s/g, "-")}`}
                                  >
                                    <div className="flex items-center gap-2">
                                      {isSelected && <CheckCircle2 className="w-4 h-4 text-gold shrink-0" />}
                                      <span>{goal}</span>
                                    </div>
                                  </button>
                                );
                              }}
                            />
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactTime"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300 text-sm font-bold uppercase tracking-wider">Best Time to Contact</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-dark-slate border-gold/20 text-white h-12" data-testid="select-contact-time">
                              <SelectValue placeholder="Select a time" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-dark-slate-light border-gold/20">
                            <SelectItem value="morning">Morning</SelectItem>
                            <SelectItem value="afternoon">Afternoon</SelectItem>
                            <SelectItem value="evening">Evening</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 2 && (
                <div className="space-y-5">
                  <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300 text-sm font-bold uppercase tracking-wider">How did you hear about us?</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-dark-slate border-gold/20 text-white h-12" data-testid="select-source">
                              <SelectValue placeholder="Select a source" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-dark-slate-light border-gold/20">
                            {sourceOptions.map((src) => (
                              <SelectItem key={src} value={src.toLowerCase().replace(/\s/g, "-")}>{src}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-slate-300 text-sm font-bold uppercase tracking-wider">Budget for Credit Services</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-dark-slate border-gold/20 text-white h-12" data-testid="select-budget">
                              <SelectValue placeholder="Select your budget" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-dark-slate-light border-gold/20">
                            <SelectItem value="0-99">$0 - $99</SelectItem>
                            <SelectItem value="100-199">$100 - $199</SelectItem>
                            <SelectItem value="200-499">$200 - $499</SelectItem>
                            <SelectItem value="500+">$500+</SelectItem>
                            <SelectItem value="not-sure">Not Sure</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="consent"
                    render={({ field }) => (
                      <FormItem className="flex items-start gap-3 space-y-0 pt-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            className="border-gold/30 data-[state=checked]:bg-gold data-[state=checked]:border-gold mt-0.5"
                            data-testid="checkbox-consent"
                          />
                        </FormControl>
                        <FormLabel className="text-slate-400 text-sm font-normal leading-relaxed">
                          I agree to be contacted by 700 Credit Club Experts regarding my credit audit request.
                        </FormLabel>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4" data-testid="review-section">
                  <h3 className="font-display text-xl text-gold tracking-wide mb-4">REVIEW YOUR INFORMATION</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Name", value: form.getValues("name") },
                      { label: "Email", value: form.getValues("email") },
                      { label: "Phone", value: form.getValues("phone") },
                      { label: "Contact Time", value: form.getValues("contactTime") },
                      { label: "Goals", value: form.getValues("goals")?.join(", ") },
                      { label: "Source", value: form.getValues("source") },
                      { label: "Budget", value: form.getValues("budget") },
                    ].map((item, i) => (
                      <div key={i} className="flex items-start justify-between py-2 border-b border-gold/5">
                        <span className="text-slate-400 text-sm font-mono uppercase">{item.label}</span>
                        <span className="text-white text-sm font-bold text-right max-w-[200px]">{item.value || "—"}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-4 pt-4">
                {step > 0 ? (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                    className="border-gold/20 text-gold bg-transparent no-default-hover-elevate no-default-active-elevate"
                    data-testid="button-prev-step"
                  >
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                  </Button>
                ) : (
                  <div />
                )}

                {step < 3 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-gold text-dark-slate font-bold no-default-hover-elevate no-default-active-elevate"
                    data-testid="button-next-step"
                  >
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    size="lg"
                    disabled={mutation.isPending}
                    className="bg-gold text-dark-slate font-bold no-default-hover-elevate no-default-active-elevate"
                    data-testid="button-submit-audit"
                  >
                    {mutation.isPending ? "SUBMITTING..." : "SUBMIT MY AUDIT"} <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
