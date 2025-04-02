'use client';

import { useAuth } from '@clerk/clerk-react';
import { useState, useEffect } from 'react';

export default function JWTDebugger() {
  const { getToken } = useAuth();
  const [tokenData, setTokenData] = useState<{
    header: any;
    payload: any;
    raw: string;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchToken() {
      try {
        setLoading(true);
        // Get the token with your template - make sure to use your template name here
        const token = await getToken({ template: 'convex' });

        if (!token) {
          setError('No token returned');
          setLoading(false);
          return;
        }

        // Parse the JWT
        const parts = token.split('.');
        const header = JSON.parse(atob(parts[0]));
        const payload = JSON.parse(atob(parts[1]));

        setTokenData({
          header,
          payload,
          raw: token
        });
      } catch (err) {
        setError(
          `Error fetching token: ${err instanceof Error ? err.message : String(err)}`
        );
      } finally {
        setLoading(false);
      }
    }

    fetchToken();
  }, [getToken]);

  if (loading) return <div>Loading token data...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!tokenData) return <div>No token data available</div>;

  return (
    <div className='rounded border p-4'>
      <h2 className='mb-4 text-xl font-bold'>JWT Debugger</h2>

      <div className='mb-4'>
        <h3 className='font-semibold'>JWT Header:</h3>
        <pre className='overflow-x-auto rounded bg-gray-100 p-2'>
          {JSON.stringify(tokenData.header, null, 2)}
        </pre>
      </div>

      <div className='mb-4'>
        <h3 className='font-semibold'>JWT Payload (Claims):</h3>
        <pre className='overflow-x-auto rounded bg-gray-100 p-2'>
          {JSON.stringify(tokenData.payload, null, 2)}
        </pre>
      </div>

      <div>
        <h3 className='font-semibold'>isVerified value:</h3>
        <div className='rounded bg-gray-100 p-2'>
          {tokenData.payload.isVerified === undefined
            ? 'Not present in token'
            : String(tokenData.payload.isVerified)}
        </div>
      </div>
    </div>
  );
}
