'use client';

import React, { useState } from 'react';
import { ArrowUpRight, Check, Copy, MessageSquare, Send, Sparkles } from 'lucide-react';
import { siteConfig, getWhatsAppUrl, getMailtoUrl } from '@/lib/site-config';

export default function InquiryForm() {
  const [projectType, setProjectType] = useState<string>('Short-Form Reels (Instagram / Shorts)');
  const [scope, setScope] = useState<string>('Single Project / Cut');
  const [footageStatus, setFootageStatus] = useState<string>('Raw footage is ready to send');
  const [details, setDetails] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);

  // Generate formatted message text
  const formattedMessage = `Hi Shefeer, I would like to discuss a video editing project:

• Service Required: ${projectType}
• Volume / Scope: ${scope}
• Footage Status: ${footageStatus}
${details ? `• Project Details / Concept: ${details}` : ''}

Looking forward to your thoughts and custom quote!`;

  const handleWhatsAppSend = () => {
    const url = getWhatsAppUrl(formattedMessage);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleEmailSend = () => {
    const subject = `Project Inquiry: ${projectType} — Shefeer Portfolio`;
    const url = getMailtoUrl(subject, formattedMessage);
    window.location.href = url;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedMessage).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="p-6 sm:p-8 bg-card border border-white/10 rounded-sm space-y-6">
      <div className="space-y-1">
        <p className="text-xs font-mono tracking-widest text-accent uppercase flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Project Inquiry Builder
        </p>
        <h3 className="text-xl font-bold text-white tracking-tight">
          Configure Your Edit
        </h3>
        <p className="text-xs text-muted">
          Select your requirements below to instantly generate a pre-formatted brief.
        </p>
      </div>

      <div className="space-y-5 text-xs font-mono">
        {/* Project Type */}
        <div className="space-y-2">
          <label className="text-white/60 uppercase tracking-wider block text-[10px]">
            1. What service do you need?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              'Short-Form Reels (Instagram / Shorts)',
              'YouTube Video Editing',
              'Podcast Editing & Clips',
              'Wedding / Event Highlights',
              'Commercial & Promo Videos',
              'Color Correction & Subtitles',
              'Long-Form Video Editing'
            ].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setProjectType(type)}
                className={`p-2.5 text-left rounded border transition-colors ${
                  projectType === type
                    ? 'bg-accent/15 border-accent text-accent font-semibold'
                    : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Volume / Scope */}
        <div className="space-y-2">
          <label className="text-white/60 uppercase tracking-wider block text-[10px]">
            2. Estimated Scope
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              'Single Project / Cut',
              'Monthly Batch (4–8 Edits)',
              'Ongoing Creator Retainer'
            ].map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setScope(item)}
                className={`p-2.5 text-left rounded border transition-colors ${
                  scope === item
                    ? 'bg-accent/15 border-accent text-accent font-semibold'
                    : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20 hover:text-white'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Footage Status */}
        <div className="space-y-2">
          <label className="text-white/60 uppercase tracking-wider block text-[10px]">
            3. Current Footage Status
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              'Raw footage is ready to send',
              'Filming this week',
              'Need creative concept first'
            ].map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFootageStatus(status)}
                className={`p-2.5 text-left rounded border transition-colors ${
                  footageStatus === status
                    ? 'bg-accent/15 border-accent text-accent font-semibold'
                    : 'bg-white/5 border-white/10 text-white/70 hover:border-white/20 hover:text-white'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {/* Optional Notes */}
        <div className="space-y-2">
          <label htmlFor="inquiry-details" className="text-white/60 uppercase tracking-wider block text-[10px]">
            4. Project notes or links (Optional)
          </label>
          <textarea
            id="inquiry-details"
            rows={2}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="e.g. Reference video, link to drive footage, or target turnaround..."
            className="w-full p-3 bg-white/5 border border-white/10 rounded text-white text-xs placeholder:text-muted/60 focus:border-accent focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Generated Message Preview */}
      <div className="p-3 bg-black/50 border border-white/10 rounded space-y-2 font-mono text-[11px]">
        <div className="flex items-center justify-between text-muted text-[10px]">
          <span>GENERATED BRIEF PREVIEW:</span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 hover:text-white transition"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy Brief</span>
              </>
            )}
          </button>
        </div>
        <p className="text-white/80 whitespace-pre-line leading-relaxed font-light">
          {formattedMessage}
        </p>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <button
          type="button"
          onClick={handleWhatsAppSend}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded bg-accent hover:bg-accent-hover text-black font-semibold text-xs tracking-wider uppercase font-mono transition shadow-lg shadow-accent/20"
        >
          <MessageSquare className="w-4 h-4 fill-current" />
          <span>Send via WhatsApp</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>

        <button
          type="button"
          onClick={handleEmailSend}
          className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded bg-white/10 hover:bg-white/15 text-white font-semibold text-xs tracking-wider uppercase font-mono border border-white/10 transition"
        >
          <Send className="w-4 h-4" />
          <span>Send via Email</span>
          <ArrowUpRight className="w-4 h-4" />
        </button>
      </div>

      <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-1 text-[10px] text-muted font-mono text-center sm:text-left">
        <span>Custom quotes in INR · 2 revision rounds included</span>
        <span>Direct WhatsApp & Email connection</span>
      </div>
    </div>
  );
}
