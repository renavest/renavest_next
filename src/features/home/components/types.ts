export type JourneyStep = {
  icon: React.ElementType;
  title: string;
  description: string;
  bg: string;
  hrInsight?: string;
  image?: string;
};

export type JourneySectionProps = {
  step: JourneyStep;
  idx: number;
};
