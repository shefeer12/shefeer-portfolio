'use client';

import React, { useState } from 'react';
import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  Copy,
  Loader2,
  Mail,
  MessageSquare,
  Send,
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { getWhatsAppUrl, getMailtoUrl, siteConfig } from '@/lib/site-config';

export default function InquiryForm() {
  const [name, setName] = useState<string>('');
  const [contactInfo, setContactInfo] = useState<string>('');
  const [projectType, setProjectType] = useState<string>('Short-Form Reels (Instagram / Shorts)');
  const [scope, setScope] = useState<string>('Single Project / Cut');
  const [footageStatus, setFootageStatus] = useState<string>('Raw footage is ready to send');
  const [details, setDetails] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState<string>('');

  const web3FormsKey =
    process.env.NEXT_PUBLIC_WEB3FORMS_ACCESS_KEY ||
    '68c457ec-66fe-4824-b804-486006e72539';

  // Generate formatted message text
  const formattedMessage = `Hi Shefeer, I would like to discuss a video editing project:

${name ? `• Client Name / Brand: ${name}` : ''}
${contactInfo ? `• Contact Info: ${contactInfo}` : ''}
• Service Required: ${projectType}
• Volume / Scope: ${scope}
• Footage Status: ${footageStatus}
${details ? `• Project Details / Concept: ${details}` : ''}

Looking forward to your thoughts and custom quote!`;

  const handleDirectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setSubmitStatus('error');
      setStatusMessage('Please enter your name or brand.');
      return;
    }

    if (!contactInfo.trim()) {
      setSubmitStatus('error');
      setStatusMessage('Please enter your email or WhatsApp number so Shefeer can reply.');
      return;
    }

    // If Web3Forms access key is not yet configured, automatically fall back to email or WhatsApp
    if (!web3FormsKey) {
      const subject = `Project Inquiry: ${projectType} — from ${name}`;
      const url = getMailtoUrl(subject, formattedMessage);
      window.location.href = url;
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setStatusMessage('');

    try {
      const formData = new FormData();
      formData.append('access_key', web3FormsKey);
      formData.append('subject', `New Video Editing Inquiry: ${projectType} from ${name}`);
      formData.append('from_name', name);
      formData.append('name', name);
      formData.append('email', contactInfo.includes('@') ? contactInfo : siteConfig.contact.email);
      if (contactInfo.includes('@')) {
        formData.append('replyto', contactInfo);
      }
      if (!contactInfo.includes('@')) {
        formData.append('phone', contactInfo);
      }
      formData.append('service', projectType);
      formData.append('scope', scope);
      formData.append('footage_status', footageStatus);
      formData.append('notes', details);
      formData.append('message', formattedMessage);
      formData.append('botcheck', '');

      const response = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setSubmitStatus('success');
        setStatusMessage('Your inquiry has been sent directly to Shefeer! He will review your details and reach out shortly.');
        setName('');
        setContactInfo('');
        setDetails('');
      } else {
        setSubmitStatus('error');
        setStatusMessage(data.message || 'Submission failed. Please use WhatsApp or email below.');
      }
    } catch {
      setSubmitStatus('error');
      setStatusMessage('Network error submitting form. Please use the WhatsApp or direct email button below.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleWhatsAppSend = () => {
    const url = getWhatsAppUrl(formattedMessage);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleEmailSend = () => {
    const subject = `Project Inquiry: ${projectType} — ${name || 'Shefeer Portfolio'}`;
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
    <form onSubmit={handleDirectSubmit} className="p-6 sm:p-8 bg-card border border-white/10 rounded-sm space-y-6">
      <div className="space-y-1">
        <p className="text-xs font-mono tracking-widest text-accent uppercase flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" /> Project Inquiry Builder
        </p>
        <h3 className="text-xl font-bold text-white tracking-tight">
          Configure Your Edit
        </h3>
        <p className="text-xs text-muted">
          Select your requirements and submit directly or connect via WhatsApp/Email.
        </p>
      </div>

      <div className="space-y-5 text-xs font-mono">
        {/* Contact info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="space-y-1.5">
            <label htmlFor="inquiry-name" className="text-white/70 uppercase tracking-wider block text-[10px]">
              1. Your Name / Brand *
            </label>
            <input
              id="inquiry-name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Rahul / Brand Name"
              className="w-full p-2.5 bg-white/5 border border-white/10 rounded text-white text-xs placeholder:text-muted/60 focus:border-accent focus:outline-none transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="inquiry-contact" className="text-white/70 uppercase tracking-wider block text-[10px]">
              2. Your Email or WhatsApp *
            </label>
            <input
              id="inquiry-contact"
              type="text"
              required
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              placeholder="e.g. name@brand.com or +91..."
              className="w-full p-2.5 bg-white/5 border border-white/10 rounded text-white text-xs placeholder:text-muted/60 focus:border-accent focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Project Type */}
        <div className="space-y-2">
          <label className="text-white/60 uppercase tracking-wider block text-[10px]">
            3. What service do you need?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              'Short-Form Reels (Instagram / Shorts)',
              'YouTube Video Editing',
              'Podcast Editing & Clips',
              'Wedding / Event Highlights',
              'Commercial & Promo Videos',
              'Color Correction & Subtitles',
              'Long-Form Video Editing',
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
            4. Estimated Scope
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              'Single Project / Cut',
              'Monthly Batch (4–8 Edits)',
              'Ongoing Creator Retainer',
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
            5. Current Footage Status
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {[
              'Raw footage is ready to send',
              'Filming this week',
              'Need creative concept first',
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
            6. Project notes or links (Optional)
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

      {/* Submission Feedback Message */}
      {submitStatus === 'success' && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded flex items-start gap-2.5 text-emerald-400 text-xs font-mono">
          <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{statusMessage}</span>
        </div>
      )}

      {submitStatus === 'error' && (
        <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded flex items-start gap-2.5 text-rose-400 text-xs font-mono">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* Generated Message Preview */}
      <div className="p-3 bg-black/50 border border-white/10 rounded space-y-2 font-mono text-[11px]">
        <div className="flex items-center justify-between text-muted text-[10px]">
          <span>GENERATED BRIEF PREVIEW:</span>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1 hover:text-white transition"
            aria-label="Copy formatted brief to clipboard"
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

      {/* Primary Direct Submit via Web3Forms */}
      <div className="space-y-3 pt-1">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-5 rounded-sm bg-accent hover:bg-accent-hover text-black font-semibold text-xs tracking-wider uppercase font-mono transition shadow-lg shadow-accent/20 disabled:opacity-50"
          aria-label="Submit project inquiry directly to Shefeer"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending Inquiry...</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Submit Inquiry Direct to Shefeer</span>
              <ArrowUpRight className="w-4 h-4" />
            </>
          )}
        </button>

        {/* Secondary Instant Channels: WhatsApp & Mailto */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={handleWhatsAppSend}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-sm bg-white/5 hover:bg-white/10 text-white font-mono text-xs uppercase tracking-wider border border-white/10 transition"
            aria-label="Send inquiry via WhatsApp"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Open in WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={handleEmailSend}
            className="flex items-center justify-center gap-2 py-2.5 px-3 rounded-sm bg-white/5 hover:bg-white/10 text-white font-mono text-xs uppercase tracking-wider border border-white/10 transition"
            aria-label="Send inquiry via Email App"
          >
            <Mail className="w-3.5 h-3.5 text-accent" />
            <span>Open in Mail App</span>
          </button>
        </div>
      </div>

      <div className="pt-2 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-1 text-[10px] text-muted font-mono text-center sm:text-left">
        <span>Custom quotes in INR · 2 revision rounds included</span>
        <span>Spam-protected direct delivery</span>
      </div>
    </form>
  );
}
