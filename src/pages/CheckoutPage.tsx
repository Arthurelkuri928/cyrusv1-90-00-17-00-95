import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
// import { Elements } from '@stripe/react-stripe-js'; // Comentado
// import PaymentForm from '@/components/checkout/PaymentForm'; // Comentado
// import { stripePromise, isStripeConfigured } from '@/lib/stripe'; // Comentado
// TODO: Remover ou substituir a lógica de checkout do Stripe
import { supabase } from '@/integrations/supabase/client';

const CheckoutPage: React.FC = () => {
  const { priceId } = useParams<{ priceId: string }>();
  
  // Estados para gerir a subscrição
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const createSubscription = async () => {
      if (!priceId) {
        setError('Price ID não encontrado na URL');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Passo 1: Criar ou obter o customer do Stripe
        const { data: customerData, error: customerError } = await supabase.functions.invoke('create-stripe-customer');
        
        if (customerError) {
          throw new Error(`Erro ao criar customer: ${customerError.message}`);
        }

        // if (!customerData?.stripe_customer_id) {
        //   throw new Error("Customer ID não foi retornado");
        // }

        // console.log("Customer criado/obtido:", customerData.stripe_customer_id);

        // Passo 2: Criar a subscrição
        const { data: subscriptionData, error: subscriptionError } = await supabase.functions.invoke('create-subscription', {
          body: {
            customerId: customerData.stripe_customer_id,
            priceId: priceId
          }
        });

        if (subscriptionError) {
          throw new Error(`Erro ao criar subscrição: ${subscriptionError.message}`);
        }

        if (!subscriptionData?.clientSecret) {
          throw new Error('Client Secret não foi retornado');
        }

        console.log('Subscrição criada com sucesso');
        setClientSecret(subscriptionData.clientSecret);

      } catch (err) {
        console.error('Erro no processo de checkout:', err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setIsLoading(false);
      }
    };

    createSubscription();
  }, [priceId]);

  // Renderizar loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              A preparar o seu checkout...
            </h1>
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Renderizar erro
  if (error) {
    return (
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Erro no Checkout
            </h1>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
              <p className="text-destructive">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header da página */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Finalizar Compra
          </h1>
          <p className="text-muted-foreground">
            Complete o seu pagamento de forma segura
          </p>
          
          {/* Mostrar o priceId capturado para confirmação */}
          {priceId && (
            <div className="mt-4 p-3 bg-muted rounded-md text-sm text-muted-foreground">
              <strong>Plano selecionado:</strong> {priceId}
            </div>
          )}
        </div>

        {/* Stripe Elements Provider com o formulário de pagamento (desativado) */}
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
          <h3 className="text-destructive font-semibold mb-2">
            Funcionalidade de Pagamento Desativada
          </h3>
          <p className="text-destructive/80 text-sm mb-4">
            A funcionalidade de pagamento foi desativada para fins de teste.
          </p>
        </div>
        
      </div>
    </div>
  );
};

export default CheckoutPage;
