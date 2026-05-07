'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!name || !email || !message) {
      const errorMessage = 'Please complete all fields before sending.';
      setStatus(errorMessage);
      toast.error(errorMessage);
      return;
    }

    const subject = encodeURIComponent(`EcoTrace contact from ${name}`);
    const body = encodeURIComponent(`Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`);
    window.location.href = `mailto:hello@ecotrace.app?subject=${subject}&body=${body}`;
    const successMessage = 'Email draft created. Send when ready.';
    setStatus(successMessage);
    toast.success(successMessage);
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="space-y-8 rounded-3xl border border-white/10 bg-white/5 p-10 shadow-2xl shadow-black/20">
        <div className="space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-mist/60">Get in touch</p>
          <h1 className="text-4xl font-semibold text-mist">Contact EcoTrace</h1>
          <p className="text-sm leading-7 text-mist/75">
            Have a question about the calculator, data privacy, or your account? Send us a message and we will respond as soon as possible.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-mist/80">Name</label>
              <Input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" />
            </div>
            <div>
              <label className="mb-2 block text-sm text-mist/80">Email</label>
              <Input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-mist/80">Message</label>
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              rows={6}
              className="w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-mist outline-none transition focus:border-glow focus:ring-2 focus:ring-glow/20"
              placeholder="How can we help?"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-mist/70">We respond to all requests within 2 business days.</p>
            <Button type="submit" className="bg-glow text-[#06130f] hover:bg-glow/90">
              Send message
            </Button>
          </div>

          {status ? <p className="text-sm text-mist/70">{status}</p> : null}
        </form>
      </div>
    </main>
  );
}
