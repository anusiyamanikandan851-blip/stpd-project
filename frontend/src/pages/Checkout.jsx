import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CheckCircle2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import API_URL from '../config';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_TYooMQauvdEDq54NiTphI7jx');

function CheckoutForm({ cart, clientSecret, orderId, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    
    if (!clientSecret || !import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
      setTimeout(async () => {
         try {
           const token = localStorage.getItem('token');
           await axios.post(`${API_URL}/orders/`, {
             items: cart.map(i => ({ herb_id: i.herb_id || i.id, quantity: i.quantity }))
           }, { headers: { Authorization: `Bearer ${token}` }});
           onSuccess();
         } catch(e) { setError('Failed to create order on backend: ' + (e.response?.data?.msg || e.message)); console.error(e); }
         setProcessing(false);
      }, 1500);
      return;
    }

    const payload = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement),
      }
    });

    if (payload.error) {
      setError(`Payment failed: ${payload.error.message}`);
      setProcessing(false);
    } else {
      setError(null);
      try {
        await axios.post(`${API_URL}/payments/verify-payment`, {
          payment_intent_id: payload.paymentIntent.id
        });
        onSuccess();
      } catch (err) {
        setError("Payment succeeded but order verification failed.");
      }
      setProcessing(false);
    }
  };

  return (
    <form className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100" onSubmit={handleSubmit}>
      <h3 className="text-2xl font-extrabold text-gray-900 mb-6 border-b pb-4">Secure Payment</h3>
      <div className="mb-8 p-5 border border-gray-200 rounded-2xl bg-gray-50/50 shadow-inner">
        <CardElement options={{
          style: {
            base: {
              fontSize: '16px',
              color: '#1f2937',
              fontFamily: 'Inter, sans-serif',
              '::placeholder': { color: '#9ca3af' },
            },
            invalid: { color: '#ef4444' },
          },
        }} />
      </div>
      {error && <div className="text-red-600 text-sm mb-6 bg-red-50 p-4 rounded-xl border border-red-100 font-medium">{error}</div>}
      <button 
        disabled={processing || !stripe} 
        className="w-full bg-green-700 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-800 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_0_rgba(21,128,61,0.39)]"
      >
        {processing ? "Processing Securely..." : "Pay Now"}
      </button>
      {!import.meta.env.VITE_STRIPE_PUBLIC_KEY && (
        <p className="text-xs text-center text-gray-400 mt-6 font-medium bg-gray-50 py-2 rounded-lg">Running in demo mode. No real charge will be made.</p>
      )}
    </form>
  );
}

export default function Checkout() {
  const { t } = useTranslation();
  const [cart, setCart] = useState([]);
  const [clientSecret, setClientSecret] = useState('');
  const [orderId, setOrderId] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCart(storedCart);
    const token = localStorage.getItem('token');
    
    if (!token) {
      navigate('/login');
      return;
    }

    if (storedCart.length > 0 && import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
      const initCheckout = async () => {
        try {
          const { data: orderData } = await axios.post(`${API_URL}/orders/`, {
            items: storedCart.map(i => ({ herb_id: i.herb_id || i.id, quantity: i.quantity }))
          }, { headers: { Authorization: `Bearer ${token}` }});
          
          setOrderId(orderData.order_id);
          
          const { data: payData } = await axios.post(`${API_URL}/payments/create-payment`, {
            order_id: orderData.order_id
          });
          setClientSecret(payData.clientSecret);
        } catch (error) {
          console.error("Checkout init error", error);
        }
      };
      initCheckout();
    }
  }, [navigate]);

  const handleSuccess = () => {
    setSuccess(true);
    localStorage.removeItem('cart');
  };

  const total = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="bg-green-100 p-6 rounded-full text-green-600 mb-8 border-4 border-white shadow-xl">
          <CheckCircle2 size={80} strokeWidth={1.5} />
        </div>
        <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">Payment Successful!</h2>
        <p className="text-gray-500 mb-10 max-w-lg text-lg leading-relaxed">Your herbal remedies are being prepared with care and will be shipped to you soon.</p>
        <button onClick={() => navigate('/orders')} className="bg-green-700 text-white px-10 py-4 rounded-xl font-bold hover:bg-green-800 transition shadow-[0_4px_14px_0_rgba(21,128,61,0.39)] hover:-translate-y-1 transform">
          View My Orders
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto flex flex-col md:flex-row gap-12">
      <div className="md:w-1/2">
        <h2 className="text-3xl font-extrabold text-gray-900 mb-8">Checkout</h2>
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-100 mb-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-green-600"></div>
          <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4">Order Review</h3>
          <div className="space-y-4 mb-8">
            {cart.map(item => (
              <div key={item.herb_id} className="flex justify-between items-center text-sm font-medium text-gray-600 group">
                <div className="flex items-center gap-4">
                  <span className="bg-gray-50 border w-8 h-8 flex items-center justify-center rounded-lg text-xs font-bold text-gray-700">{item.quantity}</span>
                  <span className="text-gray-800 group-hover:text-green-700 transition">{t(item.name, item.name)}</span>
                </div>
                <span className="font-bold">₹{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="bg-gray-50 -mx-8 -mb-8 p-8 border-t border-gray-100 flex justify-between items-center text-gray-900">
            <span className="font-extrabold text-lg">Total Payable</span>
            <span className="text-3xl font-black text-green-700">₹{total.toFixed(2)}</span>
          </div>
        </div>
      </div>
      
      <div className="md:w-1/2">
        <Elements stripe={stripePromise} options={clientSecret ? { clientSecret } : {}}>
          <CheckoutForm cart={cart} clientSecret={clientSecret} orderId={orderId} onSuccess={handleSuccess} />
        </Elements>
      </div>
    </div>
  );
}
