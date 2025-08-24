import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ApiTest: React.FC = () => {
  const [status, setStatus] = useState<string>('Testing...');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const testApi = async () => {
      try {
        const apiUrl = 'https://beatscrest.onrender.com/api/test';
        console.log('🔗 Testing API URL:', apiUrl);
        
        const response = await axios.get(apiUrl);
        console.log('✅ API Response:', response.data);
        setStatus('API is working! ✅');
      } catch (err: any) {
        console.error('❌ API Error:', err);
        setError(err.message);
        setStatus('API failed ❌');
      }
    };

    testApi();
  }, []);

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-2">API Connection Test</h3>
      <p className="text-sm text-gray-600 mb-2">Status: {status}</p>
      {error && (
        <p className="text-sm text-red-600">Error: {error}</p>
      )}
    </div>
  );
};

export default ApiTest; 