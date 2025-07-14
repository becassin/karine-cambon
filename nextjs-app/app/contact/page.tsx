// app/contact/page.tsx or app/contact/page.jsx

'use client';

import { useState } from 'react';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    setError(null);

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to send');
      }

      setStatus('sent');
      setForm({ name: '', email: '', message: '' });
    } catch (err: any) {
      setStatus('error');
      setError(err.message);
    }
  };

  return (
    <div className="max-w-md mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Envoyer un message</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="Nom"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 p-2"
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 p-2"
        />
        <textarea
          name="message"
          placeholder="Message"
          value={form.message}
          onChange={handleChange}
          required
          className="w-full border border-gray-300 p-2"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={status === 'sending'}
        >
          {status === 'sending' ? 'Envoi...' : 'Envoyer'}
        </button>
        {status === 'sent' && <p className="text-green-600">Message sent!</p>}
        {status === 'error' && <p className="text-red-600">{error}</p>}
      </form>
    </div>
  );
}
