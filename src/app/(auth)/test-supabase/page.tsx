"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function TestSupabasePage() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState("");
  const [supabaseUrl, setSupabaseUrl] = useState("");

  useEffect(() => {
    const testConnection = async () => {
      try {
        const supabase = createClient();

        // Get the Supabase URL from the client
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'not set';
        setSupabaseUrl(url);

        // Try a simple query to test connection
        const { data, error } = await supabase.auth.getSession();

        if (error) {
          setStatus('error');
          setMessage(`Connection error: ${error.message}`);
        } else {
          setStatus('success');
          setMessage('Successfully connected to Supabase!');
        }
      } catch (err) {
        setStatus('error');
        setMessage(`Unexpected error: ${err instanceof Error ? err.message : 'Unknown error'}`);
      }
    };

    testConnection();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full p-8 rounded-lg bg-white shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>

        <div className="space-y-4">
          <div>
            <strong>Supabase URL:</strong>
            <code className="block mt-1 p-2 bg-gray-100 rounded text-sm break-all">
              {supabaseUrl}
            </code>
          </div>

          <div>
            <strong>Status:</strong>
            <div className={`mt-1 p-2 rounded ${status === 'loading' ? 'bg-blue-100' :
                status === 'success' ? 'bg-green-100' :
                  'bg-red-100'
              }`}>
              {status === 'loading' && '⏳ Testing connection...'}
              {status === 'success' && '✅ ' + message}
              {status === 'error' && '❌ ' + message}
            </div>
          </div>

          {status === 'error' && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
              <strong className="block mb-2">Common Solutions:</strong>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>Restart your dev server (npm run dev)</li>
                <li>Check that NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local</li>
                <li>Verify your Supabase project is active in the Supabase dashboard</li>
                <li>Check browser console for CORS or network errors</li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
