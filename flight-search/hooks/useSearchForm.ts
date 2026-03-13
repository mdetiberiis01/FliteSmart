'use client';

import { useState } from 'react';
import { SearchParams } from '@/types/search';
import { useRouter } from 'next/navigation';

export function useSearchForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<SearchParams>({
    origin: '',
    originName: '',
    destination: '',
    flexibility: 'anytime',
    tripDays: 7,
  });

  function updateField<K extends keyof SearchParams>(key: K, value: SearchParams[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.origin || !form.destination) {
      setError('Please enter both origin and destination');
      return;
    }

    setError(null);
    setIsLoading(true);

    // Navigate to results page with search params
    const params = new URLSearchParams({
      origin: form.origin,
      originName: form.originName || form.origin,
      destination: form.destination,
      flexibility: form.flexibility,
      tripDays: String(form.tripDays ?? 7),
      ...(form.customDateStart && { customDateStart: form.customDateStart }),
      ...(form.customDateEnd && { customDateEnd: form.customDateEnd }),
    });

    router.push(`/results?${params.toString()}`);
    setIsLoading(false);
  }

  return { form, updateField, handleSubmit, isLoading, error };
}
