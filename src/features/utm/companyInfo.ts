// Cleaned up for PNG-only usage
interface CompanyInfo {
  logoSrc: string;
  title: string;
  headline?: string;
  about?: string;
}

const companyInfo: Record<string, CompanyInfo> = {
  loanstreet: {
    logoSrc: '/logos/loanstreet.png',
    title: 'LoanStreet Inc.',
    headline: 'Welcome to the Renavest × LoanStreet Integration',
    about:
      'A holistic partnership: LoanStreet helps users manage and consolidate loans, while Renavest provides emotional support, financial therapy, and long-term planning. Together, we empower users to tackle debt from every angle.',
  },
  collectly: {
    logoSrc: '/logos/collectly.png',
    title: 'Collectly',
    headline: 'Welcome to the Renavest × Collectly Integration',
    about:
      'Bridging medical debt collection and financial wellness, this partnership offers patients access to financial therapy, education, and actionable support for managing medical bills and stress.',
  },
  givebacks: {
    logoSrc: '/logos/givebacks.png',
    title: 'Givebacks',
    headline: 'Welcome to the Renavest × Givebacks Integration',
    about:
      'Empowering communities through financial wellness and giving. Our collaboration connects charitable rewards, financial education, and emotional support for families and schools.',
  },
  alkymi: {
    logoSrc: '/logos/alkymi.png',
    title: 'Alkymi',
    headline: 'Welcome to the Renavest × Alkymi Integration',
    about:
      'Streamlining financial data and insights for smarter, more personalized financial therapy. Together, we automate document processing and deliver actionable analytics for users and enterprises.',
  },
  bitnomial: {
    logoSrc: '/logos/bitnomial.png',
    title: 'Bitnomial',
    headline: 'Welcome to the Renavest × Bitnomial Integration',
    about:
      "Supporting trader well-being in high-stress environments. Renavest brings financial therapy to Bitnomial's platform, helping traders manage risk, stress, and decision-making.",
  },
  bridge: {
    logoSrc: '/logos/bridge.png',
    title: 'Bridge Marketplace',
    headline: 'Welcome to the Renavest × Bridge Marketplace Integration',
    about:
      'Combining flexible employee benefits with financial therapy and education. This partnership delivers holistic wellness and proactive financial support to employees.',
  },
  comfortconnect: {
    logoSrc: '/logos/comfortconnect.png',
    title: 'Comfort Connect',
    headline: 'Welcome to the Renavest × Comfort Connect Integration',
    about:
      'Integrating financial wellness tools for homeowners and contractors. Together, we offer education, insights, and exclusive offers to enhance home comfort and financial confidence.',
  },
  azibo: {
    logoSrc: '/logos/azibo.png',
    title: 'Azibo',
    headline: 'Welcome to the Renavest × Azibo Integration',
    about:
      'Financial wellness for renters and landlords. Our collaboration embeds education, therapy, and planning tools into the rental experience for better financial outcomes.',
  },
  linkmoney: {
    logoSrc: '/logos/linkmoney.png',
    title: 'Link Money',
    headline: 'Welcome to the Renavest × Link Money Integration',
    about:
      'Synergizing financial wellness with secure, low-cost payment solutions. We offer seamless payments, automated savings, and joint educational initiatives for users.',
  },
  rainforest: {
    logoSrc: '/logos/rainforest.png',
    title: 'Rainforest',
    headline: 'Welcome to the Renavest × Rainforest Integration',
    about:
      'Integrating embedded payment solutions with financial therapy and education. This partnership streamlines payments and delivers tailored wellness programs for SMBs.',
  },
  edxmarkets: {
    logoSrc: '/logos/edxmarkets.png',
    title: 'EDX Markets',
    headline: 'Welcome to the Renavest × EDX Markets Integration',
    about:
      'Bridging institutional crypto trading and financial wellness. We offer tailored programs, integrated tools, and research for trader well-being and performance.',
  },
  charlie: {
    logoSrc: '/logos/charlie.png',
    title: 'Charlie',
    headline: 'Welcome to the Renavest × Charlie Integration',
    about:
      "Enhancing financial wellness for Americans 62+. Our partnership delivers co-branded programs, education, and planning tools for seniors' unique needs.",
  },
  functionalfi: {
    logoSrc: '/logos/functionalfi.png',
    title: 'Functional Finance',
    headline: 'Welcome to the Renavest × Functional Finance Integration',
    about:
      'Integrating financial wellness into insurance operations. We provide education, planning, and data-driven insights for employees, policyholders, and MGAs.',
  },
  climbcredit: {
    logoSrc: '/logos/climbcredit.png',
    title: 'Climb Credit',
    headline: 'Welcome to the Renavest × Climb Credit Integration',
    about:
      'Supporting students with financial wellness and flexible financing. Our collaboration delivers education, planning, and community engagement for career-focused learners.',
  },
  comun: {
    logoSrc: '/logos/comun.png',
    title: 'Comun',
    headline: 'Welcome to the Renavest × Comun Integration',
    about:
      'Empowering immigrants with accessible banking and financial therapy. We offer co-branded programs, education, and planning tools for upward mobility.',
  },
  lightspark: {
    logoSrc: '/logos/lightspark.png',
    title: 'Lightspark',
    headline: 'Welcome to the Renavest × Lightspark Integration',
    about:
      'Unlocking new opportunities in financial wellness and payments. (Customize this entry as needed.)',
  },
  frec: {
    logoSrc: '/logos/frec.png',
    title: 'Frec',
    headline: 'Welcome to the Renavest × Frec Integration',
    about:
      'Merging financial wellness education with advanced investment strategies. We provide therapy, education, and planning for self-directed investors.',
  },
  roadsync: {
    logoSrc: '/logos/roadsync.png',
    title: 'RoadSync',
    headline: 'Welcome to the Renavest × RoadSync Integration',
    about:
      'Enhancing financial wellness for logistics professionals. Our partnership delivers budgeting tools, education, and support for drivers, carriers, and brokers.',
  },
  stellarfi: {
    logoSrc: '/logos/stellarfi.png',
    title: 'StellarFi',
    headline: 'Welcome to the Renavest × StellarFi Integration',
    about:
      'Combining credit-building with financial therapy and education. We empower users to build credit, manage finances, and foster community support.',
  },
  spade: {
    logoSrc: '/logos/spade.png',
    title: 'Spade',
    headline: 'Welcome to the Renavest × Spade Integration',
    about:
      'Unlocking new opportunities in financial wellness and data. (Customize this entry as needed.)',
  },
  redcon: {
    logoSrc: '/logos/redcon.png',
    title: 'Redcon Security',
    headline: 'Welcome to the Renavest × Redcon Integration',
    about:
      'Redcon is a financial wellness platform that helps users manage their finances and improve their financial health.',
  },
  irythm: {
    logoSrc: '/logos/zio.png',
    title: 'iRhythm',
    headline: 'Welcome to the Renavest × iRhythm Integration',
    about:
      'iRhythm is a leading digital healthcare company that creates trusted solutions that detect, predict, and prevent disease. ',
  },
};

export default companyInfo;
