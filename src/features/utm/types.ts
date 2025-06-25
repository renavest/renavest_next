// UTM Feature Types
// Isolated type definitions for UTM tracking and company experiences

export interface UtmParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

export interface CompanyInfo {
  logoSrc: string;
  title: string;
  headline?: string;
  about?: string;
}

export interface CustomDemoConfig {
  companyCode: string;
  demoFlow: string[];
  customContent?: Record<string, string>;
  features?: string[];
  pricing?: {
    discountPercentage?: number;
    customPlans?: string[];
  };
}

export interface PageUtmHandlerProps {
  companyName?: string;
  children: React.ReactNode;
}
