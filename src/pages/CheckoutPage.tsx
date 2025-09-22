import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { supabase } from '@/integrations/supabase/client';

// Load Stripe outside of the component to avoid recreating it on every render
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const PaymentForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      return;
    }

    setIsLoading(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: `${window.location.origin}/pagamento-sucesso`,
      },
    });

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
      setErrorMessage(error.message || 'Ocorreu um erro inesperado.');
    } else {
      setErrorMessage("Ocorreu um erro inesperado.");
    }

    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Complete seu Pagamento</h2>
        <PaymentElement id="payment-element" />
        <button
            disabled={isLoading || !stripe || !elements}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition duration-300 mt-6"
        >
            {isLoading ? "Processando..." : "Pagar e Assinar"}
        </button>
        {errorMessage && <div className="mt-4 text-red-600 text-sm">{errorMessage}</div>}
    </form>
  );
};

const CheckoutPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const priceId = searchParams.get('priceId');

  useEffect(() => {
    if (!priceId) {
      // Redirect to plans page if no priceId is provided
      navigate('/planos');
      return;
    }

    const createSubscription = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('create-subscription', {
          body: { priceId },
        });

        if (error) {
          throw error;
        }

        if (data && data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
            // Handle case where clientSecret is not returned
            navigate('/pagamento-falha');
        }
      } catch (error) {
        console.error('Error creating subscription:', error);
        navigate('/pagamento-falha');
      }
    };

    createSubscription();
  }, [priceId, navigate]);

  const options = {
    clientSecret,
  };

  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      {clientSecret ? (
        <Elements options={options} stripe={stripePromise}>
          <PaymentForm />
        </Elements>
      ) : (
        // You can replace this with a more sophisticated loading spinner
        <p className="text-gray-600">Carregando formulário de pagamento...</p>
      )}
    </div>
  );
};

export default CheckoutPage;
