import React, { useState, useRef } from "react";
import { Link } from "wouter";
import { 
  Shield, CheckCircle2, Upload, FileText, Loader2, 
  AlertCircle, ArrowRight, Info, ChevronDown, ChevronUp 
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock function to simulate the analysis process
  const handleFileProcess = (selectedFile: File) => {
    setFile(selectedFile);
    setIsAnalyzing(true);
    setError(null);

    // Simulate a 3-second analysis
    setTimeout(() => {
      setIsAnalyzing(false);
      // In a real app, you would call your API here
      alert("In a production environment, this would now send the file to JECI AI for processing.");
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-[#070F1E] text-white font-sans">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 text-center overflow-hidden">
        {/* Decorative Background */}
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

          <div className="flex flex-wrap justify-center gap-8 mt-16 text-slate-500 text-sm font-medium">
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#C9A84C]" /> 100% Free</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#C9A84C]" /> No Hard Pull</span>
            <span className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#C9A84C]" /> Results in Seconds</span>
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="bg-[#F5F3EE] text-[#1A1A2E] py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-[#A88830] text-xs font-bold tracking-[0.2em] uppercase">What We Cover</span>
            <h2 className="font-serif text-4xl md:text-5xl font-bold mt-4">Everything Your Credit Score<br />Depends On</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: "📊", title: "Score Analysis", desc: "Bureau-level score breakdown across Experian, Equifax, and TransUnion." },
              { icon: "⚠️", title: "Negative Item Audit", desc: "Every derogatory mark identified and explained — collections, charge-offs, and more." },
              { icon: "💳", title: "Utilization Review", desc: "Exact paydown recommendations to maximize your score immediately." }
            ].map((feat, i) => (
              <div key={i} className="bg-white p-8 rounded-xl shadow-sm border border-black/5">
                <div className="text-3xl mb-4">{feat.icon}</div>
                <h4 className="font-bold text-lg mb-2">{feat.title}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}