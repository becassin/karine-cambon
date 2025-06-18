'use client';

import { useEffect, useState } from 'react';

type Entry = {
  _id: string;
  name: string;
  message: string;
  createdAt: string;
};

export default function GuestBookPage() {
  const [form, setForm] = useState({ name: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [entries, setEntries] = useState<Entry[]>([]);

  const fetchEntries = async () => {
    const res = await fetch('/api/guestbook');
    const data = await res.json();
    setEntries(data);
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('submitting');
    setError(null);

    const formEl = e.currentTarget;
    const emailConfirmValue = (formEl.elements.namedItem('email_confirm') as HTMLInputElement)?.value;

    const payload = {
      ...form,
      email_confirm: emailConfirmValue || '',
    };

    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Unknown error');
      }

      setStatus('success');
      setForm({ name: '', message: '' });
      fetchEntries(); // ✅ Refresh list
    } catch (err: any) {
      setStatus('error');
      setError(err.message);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-6">Guest Book</h1>

      <form onSubmit={handleSubmit} className="space-y-4 mb-8">
        <input
          name="name"
          placeholder="Your name"
          value={form.name}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2"
          required
        />
        <textarea
          name="message"
          placeholder="Your message"
          value={form.message}
          onChange={handleChange}
          className="w-full border border-gray-300 p-2"
          required
        />
        <input
          type="text"
          name="email_confirm"
          style={{ display: 'none' }}
          tabIndex={-1}
          autoComplete="off"
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded"
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? 'Submitting...' : 'Submit'}
        </button>
        {status === 'error' && <p className="text-red-600">{error}</p>}
        {status === 'success' && <p className="text-green-600">Entry submitted!</p>}
      </form>

      <h2 className="text-2xl font-semibold mb-4">Entries</h2>
      <ul className="space-y-4">
        {entries.map(entry => (
          <li key={entry._id} className="border border-gray-200 p-4 rounded">
            <p className="font-semibold">{entry.name}</p>
            <p className="text-gray-700">{entry.message}</p>
            <p className="text-xs text-gray-400 mt-1">{new Date(entry.createdAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
