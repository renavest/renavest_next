import { CreditCard, Trash2, Calendar, Loader2 } from 'lucide-react';

import { type PaymentMethod } from '../services/payment-methods';

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod;
  onRemove: (paymentMethodId: string) => void;
  isRemoving: boolean;
}

export default function PaymentMethodCard({
  paymentMethod,
  onRemove,
  isRemoving,
}: PaymentMethodCardProps) {
  const formatCardBrand = (brand: string) => {
    switch (brand) {
      case 'visa':
        return 'Visa';
      case 'mastercard':
        return 'Mastercard';
      case 'amex':
        return 'American Express';
      case 'discover':
        return 'Discover';
      default:
        return brand.charAt(0).toUpperCase() + brand.slice(1);
    }
  };

  const formatCardType = (funding: string) => {
    return funding === 'credit' ? 'Credit' : funding === 'debit' ? 'Debit' : 'Unknown';
  };

  return (
    <div className='border border-gray-200 rounded-lg p-6 flex items-center justify-between hover:border-gray-300 transition-colors'>
      <div className='flex items-center space-x-4'>
        <div className='flex-shrink-0'>
          <CreditCard className='w-8 h-8 text-gray-600' />
        </div>
        <div>
          <div className='flex items-center space-x-2'>
            <h3 className='text-lg font-medium text-gray-900'>
              {paymentMethod.card ? formatCardBrand(paymentMethod.card.brand) : 'Card'}
            </h3>
            {paymentMethod.card && (
              <span className='text-sm text-gray-500'>
                ({formatCardType(paymentMethod.card.funding)})
              </span>
            )}
          </div>
          <div className='flex items-center space-x-4 text-sm text-gray-600'>
            {paymentMethod.card && (
              <>
                <span>•••• •••• •••• {paymentMethod.card.last4}</span>
                <div className='flex items-center'>
                  <Calendar className='w-4 h-4 mr-1' />
                  <span>
                    {paymentMethod.card.exp_month.toString().padStart(2, '0')}/
                    {paymentMethod.card.exp_year}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={() => onRemove(paymentMethod.id)}
        disabled={isRemoving}
        className='inline-flex items-center px-3 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
      >
        {isRemoving ? (
          <>
            <Loader2 className='w-4 h-4 mr-2 animate-spin' />
            Removing...
          </>
        ) : (
          <>
            <Trash2 className='w-4 h-4 mr-2' />
            Remove
          </>
        )}
      </button>
    </div>
  );
}
