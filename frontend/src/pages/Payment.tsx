import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import apiService from '../services/api';
import { Beat } from '../types';

const Payment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [beat, setBeat] = useState<Beat | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const load = async () => {
      try {
        if (!id) return;
        setLoading(true);
        const res = await apiService.getBeat(parseInt(id));
        setBeat(res.beat);
      } catch (e: any) {
        setError('Failed to load payment details');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handlePay = async () => {
    if (!beat) return;
    setProcessing(true);
    setError('');
    try {
      // Simulate payment processing
      await new Promise((r) => setTimeout(r, 1500));
      // On success, navigate to buyer dashboard
      navigate('/buyer');
    } catch (e: any) {
      setError('Payment failed, please try again');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!beat) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center text-gray-600">
        Payment information not available.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <img
                  src={beat.thumbnail_url || 'https://via.placeholder.com/96'}
                  alt={beat.title}
                  className="w-24 h-24 rounded-lg object-cover border"
                />
                <div>
                  <div className="text-lg font-semibold">{beat.title}</div>
                  <div className="text-sm text-gray-600">by {beat.producer_name || 'Producer'}</div>
                  <div className="mt-2 text-sm text-gray-500">
                    {beat.genre || '—'} • {beat.bpm || '—'} BPM • {beat.key || '—'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-gray-900">₦{beat.price.toLocaleString()}</div>
                <div className="text-xs text-gray-500">Platform fee included</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h2 className="text-lg font-semibold mb-4">Payment Method</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <div className="font-medium mb-1">Card</div>
                <div className="text-sm text-gray-500">Visa, MasterCard</div>
              </div>
              <div className="p-4 border rounded-lg">
                <div className="font-medium mb-1">Transfer</div>
                <div className="text-sm text-gray-500">Instant confirmation</div>
              </div>
            </div>

            {error && <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded">{error}</div>}

            <div className="mt-6 flex items-center justify-end gap-3">
              <Button variant="outline" onClick={() => window.history.back()} disabled={processing}>
                Back
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700" onClick={handlePay} disabled={processing}>
                {processing ? 'Processing…' : 'Pay Now'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Payment; 