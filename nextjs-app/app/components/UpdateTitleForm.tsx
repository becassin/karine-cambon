'use client'; // if you're using Next.js App Router

import { useState, FormEvent } from 'react';

export default function UpdateTitleForm() {
  const [newTitle, setNewTitle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');

  const sculptureId = '97c0a879-443e-4464-ae45-f0bed8cbd0e4';


  const updateTitle = async () => {
    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/updateSculpture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: sculptureId,
          newTitle: newTitle, // ← use the variable from form input
        }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message || 'Update failed');

      setMessage('Title updated successfully!');
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    }

    setLoading(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    updateTitle();
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto p-4">
      <label htmlFor="title" className="block mb-2 font-medium">
        New Sculpture Title:
      </label>
      <input
        id="title"
        type="text"
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
        className="w-full border border-gray-300 rounded p-2 mb-4"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        {loading ? 'Updating...' : 'Update Title'}
      </button>
      {message && <p className="mt-4 text-sm text-gray-700">{message}</p>}
    </form>
  );
}
