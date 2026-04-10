import React, { useState, useRef } from "react";
import { Link } from "wouter";
import { 
  Shield, CheckCircle2, Upload, FileText, Loader2, 
  AlertCircle, ArrowRight, Info, ChevronDown, ChevronUp,
  Search, Calendar, Map, ExternalLink
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePageMeta } from "@/hooks/usePageMeta";

export default function FreeCreditAudit() {
  usePageMeta({
    title: "Free Credit Audit | 700 Credit Club Experts",
    description: "Upload your credit report for a professional AI-powered analysis.",
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = (selectedFile: File) => {
    setFile(selectedFile);
    setIsAnalyzing(true);
    setError(null);

    setTimeout(() => {
      setIsAnalyzing(false);
      alert("In a production environment, this would now send the file to JECI AI for processing.");
    }, 3000);
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#070F1E] text-white font-sans">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 text-center overflow-hidden">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#C9A84C] blur-[120px] rounded-full" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-[#C9A84C]/10 border border-[#C9A84C]/30 px-4 py-1.5 rounded-full text-[#E8C97A] text-xs font-bold tracking-widest uppercase mb-8">
            <Shield className="w-3 h-3" /> JECI AI · Free Credit Audit Tool
          </div>

          <h1 className="font-serif text-5xl md:text-7xl font-bold leading-tight mb-6">
            Your Free <span className="text-[#C9A84C]">Credit Audit</span><br />Starts Here
          </h1>
          
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12">
            Upload your credit report and get a full, professional credit analysis in seconds. 
            No cost. No obligation. No hard pull.
          </p>

          {!isAnalyzing ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="max-w-xl mx-auto bg-white/5 border-2 border-dashed border-[#C9A84C]/40 rounded-2xl p-12 cursor-pointer hover:bg-[#C9A84C]/5 transition-all group"
            >
              <div className="w-16 h-16 bg-[#C9A84C]/10 border border-[#C9A84C]/25 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                <Upload className="text-[#C9A84C] w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Upload Your Credit Report</h3>
              <p className="text-slate-500 text-sm mb-6">Drag & drop your PDF or image here or click to browse</p>
              <Button className="bg-[#C9A84C] hover:bg-[#E8C97A] text-[#070F1E] font-bold px-8">
                Choose File
              </Button>
              <p className="text-slate-600 text-[10px] mt-6 tracking-wide uppercase">
                Supports: PDF · JPG · PNG · Max 10MB
              </p>
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef}
                onChange={(e) => e.target.files?.[0] && handleFileProcess(e.target.files[0])}
              />
            </div>
          ) : (
            <div className="max-w-md mx-auto bg-white/5 border border-[#C9A84C]/20 rounded-2xl p-12 text-center">
              <Loader2 className="w-12 h-12 text-[#C9A84C] animate-spin mx-auto mb-6" />
              <h3 className="text-[#E8C97A] text-lg font-medium mb-2">JECI AI is analyzing your report...</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Identifying negative items · Scanning all three bureaus<br />
                Calculating utilization · Building your roadmap
              </p>
              {file && <div className="mt-8 pt-4 border-t border-white/5 text-xs text-slate-600 italic">📁 {file.name}</div>}
            </div>
          )}

          <div className="flex flex-wrap justify-center gap-8 mt-12">
            {["100% Free", "No Hard Pull", "Privacy Protected", "All 3 Bureaus"].map((trust) => (
              <span key={trust} className="flex items-center gap-2 text-slate-400 text-sm font-medium">
                <CheckCircle2 className="w-4 h-4 text-[#C9A84C]" /> {trust}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Section 1: What We Cover */}
      <section className="bg-[#F5F3EE] text-[#1A1A2E] py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#A88830] text-xs font-bold tracking-[0.2em] uppercase">What We Cover</span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mt-4">Everything Your Credit Score<br />Depends On</h2>
            <p className="text-slate-500 text-lg mt-4 max-w-2xl mx-auto font-light">
              JECI AI doesn't just give you a number — it breaks down every factor affecting your score.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: "📊", title: "Score Analysis", desc: "Bureau-level score breakdown across Experian, Equifax, and TransUnion." },
              { icon: "⚠️", title: "Negative Item Audit", desc: "Every derogatory mark identified and explained — collections, charge-offs, and more." },
              { icon: "💳", title: "Utilization Review", desc: "Exact paydown recommendations to maximize your score immediately." },
              { icon: "🔍", title: "Inquiry Scan", desc: "All hard inquiries listed with fall-off dates and dispute eligibility assessment." },
              { icon: "📅", title: "Account Age Report", desc: "Credit history length and mix analysis — the 15% of your score most people overlook." },
              { icon: "🗺️", title: "Repair Roadmap", desc: "A three-phase action plan tailored to your exact credit profile and goals." }
            ].map((feat, i) => (
              <div key={i} className="bg-white p-8 rounded-xl shadow-sm border border-black/5 hover:shadow-md transition-shadow">
                <div className="text-3xl mb-4">{feat.icon}</div>
                <h4 className="font-bold text-lg mb-2 text-[#0C1F3F]">{feat.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: How It Works */}
      <section className="bg-[#0C1F3F] py-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <span className="text-[#C9A84C] text-xs font-bold tracking-[0.2em] uppercase">How It Works</span>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mt-4 mb-16">Three Steps to Your<br />Professional Credit Audit</h2>
          
          <div className="grid md:grid-cols-3 gap-12">
            {[
              { num: "1", title: "Pull Your Report", desc: "Grab your free credit report from AnnualCreditReport.com or Credit Hero Score." },
              { num: "2", title: "Upload & Analyze", desc: "JECI AI reads every account, balance, and derogatory mark across all three bureaus." },
              { num: "3", title: "Get Your Roadmap", desc: "Receive a branded, professional audit report with a specific three-phase improvement plan." }
            ].map((step, i) => (
              <div key={i} className="relative group">
                <div className="w-16 h-16 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/30 flex items-center justify-center mx-auto mb-6 text-[#C9A84C] font-serif text-2xl font-bold">
                  {step.num}
                </div>
                <h3 className="text-xl font-bold mb-4">{step.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 flex flex-wrap justify-center gap-4">
            <a href="https://www.annualcreditreport.com" target="_blank" className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-3 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
              AnnualCreditReport.com <ExternalLink className="w-4 h-4" />
            </a>
            <a href="https://www.credithero.com" target="_blank" className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-6 py-3 rounded-lg text-sm font-medium hover:bg-white/10 transition-colors">
              Credit Hero Score <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Section 3: FICO Factors */}
      <section className="bg-white text-[#1A1A2E] py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#A88830] text-xs font-bold tracking-[0.2em] uppercase">Credit Education</span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mt-4">Know What Moves Your Score</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { pct: "35%", label: "Payment History", desc: "The biggest factor. One missed payment can drop scores by 80+ points." },
              { pct: "30%", label: "Utilization", desc: "Keep balances under 10% for maximum positive impact." },
              { pct: "15%", label: "Credit Age", desc: "Longer history = higher scores. Don't close old accounts." },
              { pct: "10%", label: "Credit Mix", desc: "A mix of installment and revolving credit signals responsibility." },
              { pct: "10%", label: "New Credit", desc: "Multiple hard inquiries signal risk. Space out applications." }
            ].map((fact, i) => (
              <div key={i} className="bg-[#F5F3EE] p-6 rounded-xl border-t-4 border-[#C9A84C]">
                <div className="font-serif text-4xl font-bold text-[#0C1F3F] mb-2">{fact.pct}</div>
                <h4 className="font-bold text-sm mb-2">{fact.label}</h4>
                <p className="text-slate-500 text-xs leading-relaxed">{fact.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: FAQ */}
      <section className="bg-[#F5F3EE] text-[#1A1A2E] py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#A88830] text-xs font-bold tracking-[0.2em] uppercase">Common Questions</span>
            <h2 className="font-serif text-4xl font-bold mt-4">Frequently Asked Questions</h2>
          </div>
          
          <div className="space-y-4">
            {[
              { q: "Is this credit audit really free?", a: "Yes. Your Free Credit Audit from 700 Credit Club Experts is 100% free with no obligation and no hidden fees." },
              { q: "What type of credit report can I upload?", a: "You can upload any PDF or image report from AnnualCreditReport.com, Credit Hero Score, or any bureau-generated report." },
              { q: "Is my information secure?", a: "Yes. All sensitive identifiers like SSNs are automatically masked. We do not store your uploaded report after analysis." },
              { q: "Will this hurt my credit score?", a: "No. Uploading your report is a 'soft look' and does not trigger a hard inquiry or affect your score." }
            ].map((faq, i) => (
              <div key={i} className="bg-white rounded-lg border border-black/5 overflow-hidden">
                <button 
                  onClick={() => toggleFaq(i)}
                  className="w-full px-6 py-5 text-left flex justify-between items-center hover:bg-slate-50 transition-colors"
                >
                  <span className="font-bold text-[#0C1F3F]">{faq.q}</span>
                  {openFaq === i ? <ChevronUp className="text-[#C9A84C]" /> : <ChevronDown className="text-[#C9A84C]" />}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-slate-500 text-sm leading-relaxed border-t border-slate-50 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-[#070F1E] py-24 px-6 text-center border-t border-white/5">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-8">Ready to Transform Your Credit?</h2>
          <p className="text-slate-400 text-lg mb-12">
            Our certified specialists manage disputes and credit building so you can focus on your financial future.
          </p>
          <a href="https://www.700creditclubexperts.com" target="_blank">
            <Button size="lg" className="bg-[#C9A84C] hover:bg-[#E8C97A] text-[#070F1E] font-bold px-12 h-14 text-lg">
              Start My Credit Repair →
            </Button>
          </a>
          <p className="mt-6 text-slate-600 text-xs font-mono uppercase tracking-widest">
            Licensed · FCRA Certified · 100% Legal
          </p>
        </div>
      </section>
    </div>
  );
}