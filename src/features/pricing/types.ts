// Pricing Feature Types

export interface ExampleScenario {
  id: string;
  title: string;
  description: string;
  employees: number;
  sessionsPerEmployee: number;
  expectedUtilization: number;
}

export interface PooledSessionInputsProps {
  onCalculate: (data: any) => void;
}

export interface PooledPricingSummaryProps {
  calculationData: any;
}

export interface PricingSummaryCardsProps {
  totalCost: number;
  costPerEmployee: number;
  potentialSavings: number;
}

export interface PricingCalculatorProps {
  onCalculationChange: (result: any) => void;
}

export interface PooledExampleScenariosProps {
  onScenarioSelect: (scenario: ExampleScenario) => void;
}
