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
    <div className='bg-gray-50 border border-gray-100 rounded-lg p-6 flex items-center justify-between hover:shadow-md hover:bg-white transition-all duration-300 group'>
      <div className='flex items-center space-x-4'>
        <div className='flex-shrink-0'>
          <div className='bg-white rounded-lg p-3 shadow-sm border border-gray-100 group-hover:border-purple-200 transition-colors'>
            <CreditCard className='w-6 h-6 text-purple-600' />
          </div>
        </div>
        <div>
          <div className='flex items-center space-x-2 mb-1'>
            <h3 className='text-lg font-semibold text-gray-800'>
              {paymentMethod.card ? formatCardBrand(paymentMethod.card.brand) : 'Card'}
            </h3>
            {paymentMethod.card && (
              <span className='text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded-full'>
                {formatCardType(paymentMethod.card.funding)}
              </span>
            )}
          </div>
          <div className='flex items-center space-x-4 text-sm text-gray-600'>
            {paymentMethod.card && (
              <>
                <span className='font-medium'>•••• •••• •••• {paymentMethod.card.last4}</span>
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
        className='inline-flex items-center px-4 py-2 border border-red-200 text-sm font-medium rounded-lg text-red-600 bg-white hover:bg-red-50 hover:border-red-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white'
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
