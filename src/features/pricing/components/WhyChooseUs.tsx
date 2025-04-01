import { BenefitItem } from './BenefitItem';

export function WhyChooseUs() {
  return (
    <div className='bg-gray-50 p-8 rounded-xl max-w-3xl w-full'>
      <h2 className='text-2xl font-semibold text-center mb-6'>Why Companies Choose Renavest</h2>
      <div className='grid md:grid-cols-2 gap-6'>
        <BenefitItem
          icon='check'
          color='green'
          title='Increased Productivity'
          description='Employees with financial wellness are 32% more productive'
        />
        <BenefitItem
          icon='turnover'
          color='blue'
          title='Lower Turnover'
          description='Reduce employee turnover by up to 28%'
        />
        <BenefitItem
          icon='roi'
          color='purple'
          title='ROI Positive'
          description='Average 3.4x return on investment'
        />
        <BenefitItem
          icon='quick'
          color='yellow'
          title='Quick Implementation'
          description='Get started in less than 2 weeks'
        />
      </div>
    </div>
  );
}
