import React, { useState, useEffect } from 'react';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  beatData: {
    id: number;
    title: string;
    price: number;
    producer: string;
    cover: string;
  };
  userData: {
    id: string;
    username: string;
    email: string;
    fullName: string;
    phone: string;
  };
}

export default function PaymentModal({ isOpen, onClose, beatData, userData }: PaymentModalProps) {
  const [loading, setLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'processing' | 'success' | 'error'>('pending');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handlePayment = async () => {
    setLoading(true);
    setPaymentStatus('processing');
    setError('');

    try {
      // Simulate API call to create payment intent
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // For demo purposes, we'll simulate a successful payment
      setPaymentStatus('success');
      
      // In a real implementation, you would:
      // 1. Call your backend to create a payment intent
      // 2. Redirect to Stripe Checkout or use Stripe Elements
      // 3. Handle the payment confirmation
      
      // Simulate redirect to Stripe (in real app, this would be Stripe Checkout)
      console.log('Redirecting to Stripe for payment...');
      
    } catch (err: any) {
      setPaymentStatus('error');
      setError(err.message || 'Payment failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (paymentStatus === 'success') {
      // Redirect to success page or dashboard
      window.location.href = '/dashboard';
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-xl font-bold">Complete Your Purchase</h3>
          <button 
            onClick={handleClose}
            className="rounded-xl px-3 py-1 text-sm text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        {paymentStatus === 'pending' && (
          <>
            {/* Beat Details */}
            <div className="mb-6 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-4">
                <img
                  src={beatData.cover}
                  alt={beatData.title}
                  className="w-16 h-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <h4 className="font-semibold text-lg">{beatData.title}</h4>
                  <p className="text-gray-600">by {beatData.producer}</p>
                  <p className="text-2xl font-bold text-purple-600">₦{beatData.price.toLocaleString()}</p>
                </div>
              </div>
            </div>

            {/* User Details */}
            <div className="mb-6 p-4 bg-blue-50 rounded-xl">
              <h4 className="font-semibold mb-2">Purchasing as:</h4>
              <p className="text-gray-700">{userData.fullName}</p>
              <p className="text-gray-600">{userData.email}</p>
              <p className="text-gray-600">{userData.phone}</p>
            </div>

            {/* Payment Summary */}
            <div className="mb-6 p-4 border rounded-xl">
              <h4 className="font-semibold mb-3">Order Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Beat Price:</span>
                  <span>₦{beatData.price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Platform Fee (5%):</span>
                  <span>₦{(beatData.price * 0.05).toLocaleString()}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-semibold">
                  <span>Total:</span>
                  <span>₦{(beatData.price * 1.05).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Payment Button */}
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full inline-flex items-center justify-center rounded-2xl bg-purple-600 px-5 py-3 text-white shadow-lg hover:bg-purple-700 transition disabled:opacity-50"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Payment...
                </span>
              ) : (
                <span className="font-medium">Proceed to Payment (₦{(beatData.price * 1.05).toLocaleString()})</span>
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              You will be redirected to Stripe to complete your payment securely
            </p>
          </>
        )}

        {paymentStatus === 'processing' && (
          <div className="text-center py-8">
            <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <h4 className="text-lg font-semibold mb-2">Processing Payment...</h4>
            <p className="text-gray-600">Please wait while we redirect you to Stripe</p>
          </div>
        )}

        {paymentStatus === 'success' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold mb-2 text-green-600">Payment Successful!</h4>
            <p className="text-gray-600 mb-4">Your beat has been purchased successfully</p>
            <button
              onClick={handleClose}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
            >
              Go to Dashboard
            </button>
          </div>
        )}

        {paymentStatus === 'error' && (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold mb-2 text-red-600">Payment Failed</h4>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => setPaymentStatus('pending')}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 