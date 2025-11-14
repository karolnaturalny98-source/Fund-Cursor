import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const companiesData = [
  {
    slug: "apex-funding",
    name: "Apex Funding",
    headline: "Dwustopniowe wyzwania z szybkimi wypłatami",
    logoUrl: "https://dummyimage.com/160x160/1b3a6f/ffffff&text=Apex",
    shortDescription:
      "Prop firm nastawiona na szybkie wypłaty i elastyczne zasady zarządzania ryzykiem.",
    websiteUrl: "https://apexfunding.com",
    country: "United States",
    foundedYear: 2021,
    discountCode: "APEX5",
    cashbackRate: 5,
    payoutFrequency: "Wypłaty co 14 dni",
    rating: 4.6,
    highlights: [
      "Szybki onboarding - weryfikacja konta do 24h",
      "Rozbudowany panel z metrykami dla traderów",
      "Brak ograniczeń w weekend",
      "Wyplaty w 24h",
    ],
    socials: {
      website: "https://apexfunding.com",
      twitter: "https://twitter.com/apexfunding",
      discord: "https://discord.gg/apex",
      youtube: "https://youtube.com/@apexfunding",
      instagram: "https://instagram.com/apexfunding",
    },
    regulation: "USA LLC",
    kycRequired: true,
    paymentMethods: ["Karta", "Przelew", "Kryptowaluty"],
    instruments: ["Forex", "Indeksy", "Towary", "Akcje"],
    platforms: ["MT5", "cTrader"],
    educationLinks: [
      "https://apexfunding.com/academy",
      "https://apexfunding.com/webinars",
    ],
    supportContact: "support@apexfunding.com",
    instrumentGroups: {
      forex: ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD"],
      indices: ["SPX500", "NAS100", "UK100"],
      commodities: ["XAUUSD", "XAGUSD", "OIL"],
    },
    leverageTiers: {
      forex: 100,
      indices: 50,
      commodities: 20,
      stocks: 10,
    },
    tradingCommissions: {
      forex: "No commission",
      indices: "$0.50 per lot",
      stocks: "$0.01 per share",
    },
    firmRules: {
      maxDailyLoss: "5% of initial balance",
      maxDrawdown: "10% of initial balance",
      profitTarget: "8% for phase 1, 5% for phase 2",
      minTradingDays: 5,
    },
    ceo: "John Smith",
    legalName: "Apex Funding LLC",
    headquartersAddress: "123 Trading Street, New York, NY 10001, USA",
    foundersInfo: "Founded by experienced traders with 20+ years in financial markets",
    verificationStatus: "Verified",
    licenses: ["US LLC Registration"],
    registryLinks: ["https://example.com/apex/registry"],
    registryData: "Registered in Delaware, USA",
  },
  {
    slug: "nordic-traders",
    name: "Nordic Traders",
    headline: "Jednoetapowe wyzwania z mentoringiem",
    logoUrl: "https://dummyimage.com/160x160/0f4c81/ffffff&text=Nordic",
    shortDescription:
      "Europejska firma prop tradingowa nastawiona na stabilne strategie i wsparcie mentorów.",
    websiteUrl: "https://nordictraders.com",
    country: "Sweden",
    foundedYear: 2019,
    discountCode: "NORDIC10",
    cashbackRate: 7,
    payoutFrequency: "Wypłaty co 30 dni",
    rating: 4.3,
    highlights: [
      "Program mentoringowy dla każdego poziomu",
      "Dostęp do materiałów edukacyjnych i webinarów",
      "Weekend trading dozwolony",
      "Stabilne zasady bez zmian",
    ],
    socials: {
      website: "https://nordictraders.com",
      twitter: "https://twitter.com/nordictraders",
      discord: "https://discord.gg/nordic",
      linkedin: "https://linkedin.com/company/nordictraders",
    },
    regulation: "Szwecja AB",
    kycRequired: true,
    paymentMethods: ["Karta", "SEPA", "Bank Transfer"],
    instruments: ["Forex", "Indeksy", "Akcje"],
    platforms: ["MT4", "MT5"],
    educationLinks: [
      "https://nordictraders.com/academy",
      "https://nordictraders.com/mentoring",
    ],
    supportContact: "hello@nordictraders.com",
    instrumentGroups: {
      forex: ["EUR/USD", "GBP/USD", "USD/SEK"],
      indices: ["SWE30", "GER30", "US30"],
      stocks: ["Apple", "Microsoft", "Tesla"],
    },
    leverageTiers: {
      forex: 60,
      indices: 30,
      stocks: 5,
    },
    tradingCommissions: {
      forex: "No commission",
      indices: "$1.00 per lot",
      stocks: "$0.02 per share",
    },
    firmRules: {
      maxDailyLoss: "3% of initial balance",
      maxDrawdown: "6% of initial balance",
      profitTarget: "7% for one-step challenge",
      minTradingDays: 3,
    },
    ceo: "Erik Andersson",
    legalName: "Nordic Traders AB",
    headquartersAddress: "Stockholm Business District, 111 57 Stockholm, Sweden",
    foundersInfo: "Founded by Swedish financial professionals",
    verificationStatus: "Verified",
    licenses: ["Swedish Business Registration"],
    registryLinks: ["https://example.com/nordic/registry"],
    registryData: "Registered in Stockholm, Sweden",
  },
  {
    slug: "flash-funding",
    name: "Flash Funding",
    headline: "Instant funding bez limitu czasu",
    logoUrl: "https://dummyimage.com/160x160/312e81/ffffff&text=Flash",
    shortDescription:
      "Specjalizacja w kontach instant funding bez tradycyjnego wyzwania.",
    websiteUrl: "https://flashfunding.com",
    country: "United Arab Emirates",
    foundedYear: 2023,
    discountCode: "FLASH3",
    cashbackRate: 3,
    payoutFrequency: "Natychmiastowe wypłaty po 7 dniach",
    rating: 4.1,
    highlights: [
      "Instant funding po potwierdzeniu KYC",
      "Dynamiczne rabaty za kolejne zakupy",
      "Brak wymogu challenge",
      "Szybka wypłata po 7 dniach",
    ],
    socials: {
      website: "https://flashfunding.com",
      twitter: "https://twitter.com/flashfunding",
      telegram: "https://t.me/flashfunding",
    },
    regulation: "ZEA Freezone",
    kycRequired: true,
    paymentMethods: ["Karta", "Crypto", "Bank Transfer"],
    instruments: ["Forex", "Krypto", "Indeksy"],
    platforms: ["MT5"],
    educationLinks: [],
    supportContact: "support@flashfunding.com",
    instrumentGroups: {
      forex: ["EUR/USD", "GBP/USD", "USD/JPY"],
      crypto: ["BTC/USD", "ETH/USD", "BNB/USD"],
      indices: ["SPX500", "NAS100"],
    },
    leverageTiers: {
      forex: 30,
      crypto: 10,
      indices: 20,
    },
    tradingCommissions: {
      forex: "No commission",
      crypto: "$0.10 per lot",
      indices: "$0.75 per lot",
    },
    firmRules: {
      maxDailyLoss: "5% of account balance",
      maxDrawdown: "10% of account balance",
      profitTarget: "N/A - Instant funding",
      minTradingDays: 0,
    },
    ceo: "Ahmed Al-Mansoori",
    legalName: "Flash Funding FZ LLC",
    headquartersAddress: "Dubai International Financial Centre, UAE",
    foundersInfo: "Founded by fintech entrepreneurs",
    verificationStatus: "Verified",
    licenses: ["UAE Freezone License"],
    registryLinks: ["https://example.com/flash/registry"],
    registryData: "Registered in Dubai, UAE",
  },
  {
    slug: "elite-traders",
    name: "Elite Traders",
    headline: "Premium prop firm z najlepszymi warunkami",
    logoUrl: "https://dummyimage.com/160x160/8b4513/ffffff&text=Elite",
    shortDescription:
      "Elitarna prop firm oferująca najwyższe profit split i elastyczne warunki.",
    websiteUrl: "https://elitetraders.com",
    country: "United Kingdom",
    foundedYear: 2020,
    discountCode: "ELITE15",
    cashbackRate: 8,
    payoutFrequency: "Wypłaty co 7 dni",
    rating: 4.8,
    highlights: [
      "Profit split do 90/10",
      "Wypłaty co tydzień",
      "Scaling plan do 2M",
      "Dedykowany account manager",
    ],
    socials: {
      website: "https://elitetraders.com",
      twitter: "https://twitter.com/elitetraders",
      discord: "https://discord.gg/elite",
      youtube: "https://youtube.com/@elitetraders",
    },
    regulation: "UK Limited",
    kycRequired: true,
    paymentMethods: ["Karta", "Bank Transfer", "PayPal"],
    instruments: ["Forex", "Indeksy", "Towary", "Akcje", "Krypto"],
    platforms: ["MT5", "cTrader", "TradingView"],
    educationLinks: [
      "https://elitetraders.com/education",
      "https://elitetraders.com/trading-room",
    ],
    supportContact: "support@elitetraders.com",
    instrumentGroups: {
      forex: ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD"],
      indices: ["SPX500", "NAS100", "UK100", "GER30"],
      commodities: ["XAUUSD", "XAGUSD", "OIL", "GAS"],
      stocks: ["Apple", "Microsoft", "Google", "Amazon"],
      crypto: ["BTC/USD", "ETH/USD"],
    },
    leverageTiers: {
      forex: 100,
      indices: 50,
      commodities: 20,
      stocks: 10,
      crypto: 5,
    },
    tradingCommissions: {
      forex: "No commission",
      indices: "$0.50 per lot",
      commodities: "$0.30 per lot",
      stocks: "$0.01 per share",
      crypto: "$0.05 per lot",
    },
    firmRules: {
      maxDailyLoss: "5% of initial balance",
      maxDrawdown: "10% of initial balance",
      profitTarget: "8% for phase 1, 5% for phase 2",
      minTradingDays: 5,
    },
    ceo: "James Wilson",
    legalName: "Elite Traders Limited",
    headquartersAddress: "Canary Wharf, London, E14 5AB, UK",
    foundersInfo: "Founded by former hedge fund managers",
    verificationStatus: "Verified",
    licenses: ["UK FCA Registration"],
    registryLinks: ["https://example.com/elite/registry"],
    registryData: "Registered in London, UK",
  },
  {
    slug: "rapid-capital",
    name: "Rapid Capital",
    headline: "Szybkie wyzwania z niskimi wymaganiami",
    logoUrl: "https://dummyimage.com/160x160/006400/ffffff&text=Rapid",
    shortDescription:
      "Prop firm dla początkujących traderów z uproszczonymi zasadami.",
    websiteUrl: "https://rapidcapital.com",
    country: "Canada",
    foundedYear: 2022,
    discountCode: "RAPID10",
    cashbackRate: 6,
    payoutFrequency: "Wypłaty co 14 dni",
    rating: 4.2,
    highlights: [
      "Niskie wymagania profit target",
      "Refundacja opłaty po pierwszej wypłacie",
      "Weekend trading",
      "Brak trailing drawdown",
    ],
    socials: {
      website: "https://rapidcapital.com",
      twitter: "https://twitter.com/rapidcapital",
      facebook: "https://facebook.com/rapidcapital",
    },
    regulation: "Canada Corporation",
    kycRequired: true,
    paymentMethods: ["Karta", "Bank Transfer", "Interac"],
    instruments: ["Forex", "Indeksy"],
    platforms: ["MT5"],
    educationLinks: ["https://rapidcapital.com/learn"],
    supportContact: "help@rapidcapital.com",
    instrumentGroups: {
      forex: ["EUR/USD", "GBP/USD", "USD/CAD"],
      indices: ["SPX500", "NAS100", "CAN60"],
    },
    leverageTiers: {
      forex: 50,
      indices: 30,
    },
    tradingCommissions: {
      forex: "No commission",
      indices: "$0.60 per lot",
    },
    firmRules: {
      maxDailyLoss: "5% of initial balance",
      maxDrawdown: "10% of initial balance",
      profitTarget: "6% for phase 1, 4% for phase 2",
      minTradingDays: 4,
    },
    ceo: "Michael Chen",
    legalName: "Rapid Capital Inc.",
    headquartersAddress: "Toronto Financial District, ON M5J 2N8, Canada",
    foundersInfo: "Founded by Canadian trading professionals",
    verificationStatus: "Verified",
    licenses: ["Canadian Business Registration"],
    registryLinks: ["https://example.com/rapid/registry"],
    registryData: "Registered in Toronto, Canada",
  },
  {
    slug: "global-props",
    name: "Global Props",
    headline: "Międzynarodowa prop firm z wieloma opcjami",
    logoUrl: "https://dummyimage.com/160x160/ff6347/ffffff&text=Global",
    shortDescription:
      "Globalna prop firm oferująca różne modele wyzwań i instant funding.",
    websiteUrl: "https://globalprops.com",
    country: "Australia",
    foundedYear: 2021,
    discountCode: "GLOBAL5",
    cashbackRate: 5,
    payoutFrequency: "Wypłaty co 14 dni",
    rating: 4.4,
    highlights: [
      "Wielojęzyczne wsparcie",
      "24/7 customer service",
      "Różne waluty kont",
      "Program partnerski",
    ],
    socials: {
      website: "https://globalprops.com",
      twitter: "https://twitter.com/globalprops",
      instagram: "https://instagram.com/globalprops",
      youtube: "https://youtube.com/@globalprops",
    },
    regulation: "Australia PTY LTD",
    kycRequired: true,
    paymentMethods: ["Karta", "Bank Transfer", "Crypto", "PayPal"],
    instruments: ["Forex", "Indeksy", "Towary", "Akcje"],
    platforms: ["MT4", "MT5", "cTrader"],
    educationLinks: [
      "https://globalprops.com/academy",
      "https://globalprops.com/blog",
    ],
    supportContact: "support@globalprops.com",
    instrumentGroups: {
      forex: ["EUR/USD", "GBP/USD", "AUD/USD", "USD/JPY"],
      indices: ["SPX500", "NAS100", "AUS200"],
      commodities: ["XAUUSD", "OIL"],
      stocks: ["Apple", "Microsoft", "Tesla"],
    },
    leverageTiers: {
      forex: 100,
      indices: 50,
      commodities: 20,
      stocks: 10,
    },
    tradingCommissions: {
      forex: "No commission",
      indices: "$0.50 per lot",
      commodities: "$0.40 per lot",
      stocks: "$0.01 per share",
    },
    firmRules: {
      maxDailyLoss: "5% of initial balance",
      maxDrawdown: "10% of initial balance",
      profitTarget: "8% for phase 1, 5% for phase 2",
      minTradingDays: 5,
    },
    ceo: "Sarah Johnson",
    legalName: "Global Props PTY LTD",
    headquartersAddress: "Sydney CBD, NSW 2000, Australia",
    foundersInfo: "Founded by Australian financial experts",
    verificationStatus: "Verified",
    licenses: ["Australian Business Registration"],
    registryLinks: ["https://example.com/global/registry"],
    registryData: "Registered in Sydney, Australia",
  },
  {
    slug: "pro-traders-academy",
    name: "Pro Traders Academy",
    headline: "Prop firm z naciskiem na edukację",
    logoUrl: "https://dummyimage.com/160x160/4169e1/ffffff&text=Pro",
    shortDescription:
      "Prop firm łącząca trading z kompleksową edukacją i wsparciem mentorów.",
    websiteUrl: "https://protradersacademy.com",
    country: "Germany",
    foundedYear: 2020,
    discountCode: "PRO10",
    cashbackRate: 7,
    payoutFrequency: "Wypłaty co 30 dni",
    rating: 4.5,
    highlights: [
      "Darmowe kursy tradingowe",
      "Mentoring 1:1",
      "Trading room z analizami",
      "Community Discord",
    ],
    socials: {
      website: "https://protradersacademy.com",
      discord: "https://discord.gg/protraders",
      youtube: "https://youtube.com/@protradersacademy",
      linkedin: "https://linkedin.com/company/protraders",
    },
    regulation: "Germany GmbH",
    kycRequired: true,
    paymentMethods: ["Karta", "SEPA", "Bank Transfer"],
    instruments: ["Forex", "Indeksy", "Akcje"],
    platforms: ["MT5"],
    educationLinks: [
      "https://protradersacademy.com/courses",
      "https://protradersacademy.com/mentoring",
      "https://protradersacademy.com/trading-room",
    ],
    supportContact: "info@protradersacademy.com",
    instrumentGroups: {
      forex: ["EUR/USD", "GBP/USD", "USD/CHF"],
      indices: ["GER30", "US30", "UK100"],
      stocks: ["SAP", "Siemens", "BMW"],
    },
    leverageTiers: {
      forex: 50,
      indices: 30,
      stocks: 5,
    },
    tradingCommissions: {
      forex: "No commission",
      indices: "$0.80 per lot",
      stocks: "$0.02 per share",
    },
    firmRules: {
      maxDailyLoss: "3% of initial balance",
      maxDrawdown: "6% of initial balance",
      profitTarget: "7% for one-step challenge",
      minTradingDays: 5,
    },
    ceo: "Hans Mueller",
    legalName: "Pro Traders Academy GmbH",
    headquartersAddress: "Frankfurt am Main, 60311, Germany",
    foundersInfo: "Founded by professional traders and educators",
    verificationStatus: "Verified",
    licenses: ["German Business Registration"],
    registryLinks: ["https://example.com/pro/registry"],
    registryData: "Registered in Frankfurt, Germany",
  },
  {
    slug: "swift-funding",
    name: "Swift Funding",
    headline: "Najszybsze wypłaty w branży",
    logoUrl: "https://dummyimage.com/160x160/ff1493/ffffff&text=Swift",
    shortDescription:
      "Prop firm specjalizująca się w błyskawicznych wypłatach i prostych zasadach.",
    websiteUrl: "https://swiftfunding.com",
    country: "Singapore",
    foundedYear: 2023,
    discountCode: "SWIFT5",
    cashbackRate: 4,
    payoutFrequency: "Wypłaty w 24h",
    rating: 4.6,
    highlights: [
      "Wypłaty w ciągu 24h",
      "Proste zasady",
      "Brak ukrytych opłat",
      "Wsparcie 24/7",
    ],
    socials: {
      website: "https://swiftfunding.com",
      twitter: "https://twitter.com/swiftfunding",
      telegram: "https://t.me/swiftfunding",
    },
    regulation: "Singapore Private Limited",
    kycRequired: true,
    paymentMethods: ["Karta", "Bank Transfer", "Crypto"],
    instruments: ["Forex", "Indeksy", "Krypto"],
    platforms: ["MT5"],
    educationLinks: [],
    supportContact: "support@swiftfunding.com",
    instrumentGroups: {
      forex: ["EUR/USD", "GBP/USD", "USD/SGD"],
      indices: ["SPX500", "NAS100"],
      crypto: ["BTC/USD", "ETH/USD"],
    },
    leverageTiers: {
      forex: 100,
      indices: 50,
      crypto: 10,
    },
    tradingCommissions: {
      forex: "No commission",
      indices: "$0.50 per lot",
      crypto: "$0.10 per lot",
    },
    firmRules: {
      maxDailyLoss: "5% of initial balance",
      maxDrawdown: "10% of initial balance",
      profitTarget: "8% for phase 1, 5% for phase 2",
      minTradingDays: 5,
    },
    ceo: "David Tan",
    legalName: "Swift Funding PTE LTD",
    headquartersAddress: "Marina Bay, Singapore 018956",
    foundersInfo: "Founded by Singapore fintech entrepreneurs",
    verificationStatus: "Verified",
    licenses: ["Singapore Business Registration"],
    registryLinks: ["https://example.com/swift/registry"],
    registryData: "Registered in Singapore",
  },
  {
    slug: "titan-capital",
    name: "Titan Capital",
    headline: "Największe konta do 5M",
    logoUrl: "https://dummyimage.com/160x160/000080/ffffff&text=Titan",
    shortDescription:
      "Prop firm oferująca największe konta i najlepsze warunki scaling.",
    websiteUrl: "https://titancapital.com",
    country: "United States",
    foundedYear: 2020,
    discountCode: "TITAN10",
    cashbackRate: 6,
    payoutFrequency: "Wypłaty co 7 dni",
    rating: 4.7,
    highlights: [
      "Konta do 5M USD",
      "Scaling do 10M",
      "Profit split 90/10",
      "Dedykowany manager",
    ],
    socials: {
      website: "https://titancapital.com",
      twitter: "https://twitter.com/titancapital",
      linkedin: "https://linkedin.com/company/titancapital",
      youtube: "https://youtube.com/@titancapital",
    },
    regulation: "USA LLC",
    kycRequired: true,
    paymentMethods: ["Karta", "Bank Transfer", "Wire Transfer"],
    instruments: ["Forex", "Indeksy", "Towary", "Akcje", "Obligacje"],
    platforms: ["MT5", "cTrader", "TradingView"],
    educationLinks: [
      "https://titancapital.com/resources",
      "https://titancapital.com/webinars",
    ],
    supportContact: "support@titancapital.com",
    instrumentGroups: {
      forex: ["EUR/USD", "GBP/USD", "USD/JPY", "AUD/USD", "USD/CAD"],
      indices: ["SPX500", "NAS100", "UK100", "GER30", "JPN225"],
      commodities: ["XAUUSD", "XAGUSD", "OIL", "GAS"],
      stocks: ["Apple", "Microsoft", "Google", "Amazon", "Tesla"],
      bonds: ["US10Y", "US30Y"],
    },
    leverageTiers: {
      forex: 100,
      indices: 50,
      commodities: 20,
      stocks: 10,
      bonds: 5,
    },
    tradingCommissions: {
      forex: "No commission",
      indices: "$0.50 per lot",
      commodities: "$0.30 per lot",
      stocks: "$0.01 per share",
      bonds: "$0.05 per lot",
    },
    firmRules: {
      maxDailyLoss: "5% of initial balance",
      maxDrawdown: "10% of initial balance",
      profitTarget: "8% for phase 1, 5% for phase 2",
      minTradingDays: 5,
    },
    ceo: "Robert Martinez",
    legalName: "Titan Capital LLC",
    headquartersAddress: "Wall Street, New York, NY 10005, USA",
    foundersInfo: "Founded by former investment bankers",
    verificationStatus: "Verified",
    licenses: ["US LLC Registration", "SEC Registration"],
    registryLinks: ["https://example.com/titan/registry"],
    registryData: "Registered in New York, USA",
  },
  {
    slug: "zen-trading",
    name: "Zen Trading",
    headline: "Spokojny trading bez presji",
    logoUrl: "https://dummyimage.com/160x160/2f4f4f/ffffff&text=Zen",
    shortDescription:
      "Prop firm z filozofią spokojnego tradingu i długoterminowego podejścia.",
    websiteUrl: "https://zentrading.com",
    country: "Switzerland",
    foundedYear: 2021,
    discountCode: "ZEN8",
    cashbackRate: 8,
    payoutFrequency: "Wypłaty co 30 dni",
    rating: 4.3,
    highlights: [
      "Brak trailing drawdown",
      "Długi czas na challenge",
      "Wsparcie psychologiczne",
      "Community forum",
    ],
    socials: {
      website: "https://zentrading.com",
      twitter: "https://twitter.com/zentrading",
      facebook: "https://facebook.com/zentrading",
    },
    regulation: "Switzerland AG",
    kycRequired: true,
    paymentMethods: ["Karta", "Bank Transfer", "SEPA"],
    instruments: ["Forex", "Indeksy"],
    platforms: ["MT5"],
    educationLinks: [
      "https://zentrading.com/mindset",
      "https://zentrading.com/psychology",
    ],
    supportContact: "info@zentrading.com",
    instrumentGroups: {
      forex: ["EUR/USD", "GBP/USD", "USD/CHF"],
      indices: ["SPX500", "GER30", "SWI20"],
    },
    leverageTiers: {
      forex: 50,
      indices: 30,
    },
    tradingCommissions: {
      forex: "No commission",
      indices: "$0.70 per lot",
    },
    firmRules: {
      maxDailyLoss: "5% of initial balance",
      maxDrawdown: "10% of initial balance",
      profitTarget: "6% for phase 1, 4% for phase 2",
      minTradingDays: 3,
    },
    ceo: "Thomas Weber",
    legalName: "Zen Trading AG",
    headquartersAddress: "Zurich Financial District, 8001, Switzerland",
    foundersInfo: "Founded by Swiss trading professionals",
    verificationStatus: "Verified",
    licenses: ["Swiss Business Registration"],
    registryLinks: ["https://example.com/zen/registry"],
    registryData: "Registered in Zurich, Switzerland",
  },
];

// Test users data
const usersData = [
  {
    clerkId: "user_test_1",
    email: "trader1@example.com",
    displayName: "Jan Kowalski",
  },
  {
    clerkId: "user_test_2",
    email: "trader2@example.com",
    displayName: "Anna Nowak",
  },
  {
    clerkId: "user_test_3",
    email: "trader3@example.com",
    displayName: "Piotr Wiśniewski",
  },
  {
    clerkId: "user_test_4",
    email: "trader4@example.com",
    displayName: "Maria Dąbrowska",
  },
  {
    clerkId: "user_test_5",
    email: "trader5@example.com",
    displayName: "Tomasz Lewandowski",
  },
  {
    clerkId: "admin_test_1",
    email: "admin@example.com",
    displayName: "Admin User",
  },
];

// Blog categories
const blogCategoriesData = [
  {
    slug: "trading-strategie",
    name: "Trading Strategie",
    description: "Artykuły o strategiach tradingowych i analizie technicznej",
    order: 1,
  },
  {
    slug: "prop-trading",
    name: "Prop Trading",
    description: "Wszystko o prop tradingu i wyzwaniach",
    order: 2,
  },
  {
    slug: "edukacja",
    name: "Edukacja",
    description: "Materiały edukacyjne dla traderów",
    order: 3,
  },
  {
    slug: "analizy-firm",
    name: "Analizy Firm",
    description: "Szczegółowe analizy prop firm",
    order: 4,
  },
];

// Marketing spotlight sections
const marketingSectionsData = [
  {
    slug: "homepage-forex-offers", // Musi być zgodny z DEFAULT_SECTION_SLUG w lib/queries/marketing.ts
    title: "Oferty marketingowe",
    subtitle: "Zarządzaj promowanymi kampaniami na stronie głównej",
    emoji: "🔥",
    isActive: true,
  },
  {
    slug: "nowe-firmy",
    title: "Nowe Firmy",
    subtitle: "Odkryj najnowsze prop firmy",
    emoji: "✨",
    isActive: true,
  },
];

async function main() {
  console.log("Starting seed...");

  // Create test users
  console.log("Creating test users...");
  const users = [];
  for (const userData of usersData) {
    const user = await prisma.user.upsert({
      where: { clerkId: userData.clerkId },
      update: {
        email: userData.email,
        displayName: userData.displayName,
      },
      create: userData,
    });
    users.push(user);
    console.log(`Created/updated user: ${user.displayName || user.email}`);
  }

  // Create blog categories
  console.log("Creating blog categories...");
  const blogCategories = [];
  for (const categoryData of blogCategoriesData) {
    const category = await prisma.blogCategory.upsert({
      where: { slug: categoryData.slug },
      update: categoryData,
      create: categoryData,
    });
    blogCategories.push(category);
    console.log(`Created/updated blog category: ${category.name}`);
  }

  // Create marketing spotlight sections
  console.log("Creating marketing spotlight sections...");
  const marketingSections = [];
  for (const sectionData of marketingSectionsData) {
    const section = await prisma.marketingSpotlightSection.upsert({
      where: { slug: sectionData.slug },
      update: sectionData,
      create: sectionData,
    });
    marketingSections.push(section);
    console.log(`Created/updated marketing section: ${section.title}`);
  }

  // Create companies with plans
  const companies = [];
  for (const companyData of companiesData) {
    const company = await prisma.company.upsert({
      where: { slug: companyData.slug },
      update: {
        name: companyData.name,
        headline: companyData.headline ?? null,
        logoUrl: companyData.logoUrl ?? null,
        shortDescription: companyData.shortDescription ?? null,
        websiteUrl: companyData.websiteUrl ?? null,
        country: companyData.country ?? null,
        foundedYear: companyData.foundedYear ?? null,
        discountCode: companyData.discountCode ?? null,
        cashbackRate: companyData.cashbackRate ?? null,
        payoutFrequency: companyData.payoutFrequency ?? null,
        rating: companyData.rating ?? null,
        highlights: companyData.highlights ?? [],
        socials: companyData.socials ?? null,
        regulation: companyData.regulation ?? null,
        kycRequired: companyData.kycRequired ?? false,
        paymentMethods: companyData.paymentMethods ?? [],
        instruments: companyData.instruments ?? [],
        platforms: companyData.platforms ?? [],
        educationLinks: companyData.educationLinks ?? [],
        supportContact: companyData.supportContact ?? null,
        instrumentGroups: companyData.instrumentGroups ?? null,
        leverageTiers: companyData.leverageTiers ?? null,
        tradingCommissions: companyData.tradingCommissions ?? null,
        firmRules: companyData.firmRules ?? null,
        ceo: companyData.ceo ?? null,
        legalName: companyData.legalName ?? null,
        headquartersAddress: companyData.headquartersAddress ?? null,
        foundersInfo: companyData.foundersInfo ?? null,
        verificationStatus: companyData.verificationStatus ?? null,
        licenses: companyData.licenses ?? [],
        registryLinks: companyData.registryLinks ?? [],
        registryData: companyData.registryData ?? null,
      },
      create: {
        slug: companyData.slug,
        name: companyData.name,
        headline: companyData.headline ?? null,
        logoUrl: companyData.logoUrl ?? null,
        shortDescription: companyData.shortDescription ?? null,
        websiteUrl: companyData.websiteUrl ?? null,
        country: companyData.country ?? null,
        foundedYear: companyData.foundedYear ?? null,
        discountCode: companyData.discountCode ?? null,
        cashbackRate: companyData.cashbackRate ?? null,
        payoutFrequency: companyData.payoutFrequency ?? null,
        rating: companyData.rating ?? null,
        highlights: companyData.highlights ?? [],
        socials: companyData.socials ?? null,
        regulation: companyData.regulation ?? null,
        kycRequired: companyData.kycRequired ?? false,
        paymentMethods: companyData.paymentMethods ?? [],
        instruments: companyData.instruments ?? [],
        platforms: companyData.platforms ?? [],
        educationLinks: companyData.educationLinks ?? [],
        supportContact: companyData.supportContact ?? null,
        instrumentGroups: companyData.instrumentGroups ?? null,
        leverageTiers: companyData.leverageTiers ?? null,
        tradingCommissions: companyData.tradingCommissions ?? null,
        firmRules: companyData.firmRules ?? null,
        ceo: companyData.ceo ?? null,
        legalName: companyData.legalName ?? null,
        headquartersAddress: companyData.headquartersAddress ?? null,
        foundersInfo: companyData.foundersInfo ?? null,
        verificationStatus: companyData.verificationStatus ?? null,
        licenses: companyData.licenses ?? [],
        registryLinks: companyData.registryLinks ?? [],
        registryData: companyData.registryData ?? null,
        plans: {
          create: [
            // Challenge plan - 50K
            {
              name: `${companyData.name} Challenge 50K`,
              price: 249,
              currency: "USD",
              evaluationModel: "two-step",
              maxDrawdown: 5000,
              maxDailyLoss: 2500,
              profitTarget: 5000,
              profitSplit: "80/20",
              leverage: 100,
              minTradingDays: 5,
              payoutFirstAfterDays: 30,
              payoutCycleDays: 14,
              trailingDrawdown: false,
              refundableFee: true,
              scalingPlan: true,
              accountType: "challenge",
              description: `Dwustopniowe wyzwanie 50K z limitem dziennej straty 5% i profit target 8% w fazie 1, 5% w fazie 2.`,
              features: [
                "Max leverage 1:100",
                "Brak ograniczeń w weekend",
                "Wypłaty co 14 dni",
                "Refundacja opłaty po pierwszej wypłacie",
                "Scaling plan dostępny",
              ],
              affiliateUrl: `https://${companyData.slug}.com/checkout?plan=50k-challenge&utm_source=fundedrank`,
              affiliateCommission: 10.0,
            },
            // Challenge plan - 100K
            {
              name: `${companyData.name} Challenge 100K`,
              price: 499,
              currency: "USD",
              evaluationModel: "two-step",
              maxDrawdown: 10000,
              maxDailyLoss: 5000,
              profitTarget: 8000,
              profitSplit: "80/20",
              leverage: 100,
              minTradingDays: 5,
              payoutFirstAfterDays: 30,
              payoutCycleDays: 14,
              trailingDrawdown: false,
              refundableFee: true,
              scalingPlan: true,
              accountType: "challenge",
              description: `Najpopularniejszy plan challenge 100K z najlepszym stosunkiem ceny do kapitału.`,
              features: [
                "Wypłaty co 14 dni",
                "Obsługa MT5",
                "Możliwy scaling do 500K",
                "Refundacja opłaty",
              ],
              affiliateUrl: `https://${companyData.slug}.com/checkout?plan=100k-challenge&utm_source=fundedrank`,
              affiliateCommission: 12.0,
            },
            // Instant Funding plan - 10K
            {
              name: `${companyData.name} Instant 10K`,
              price: 199,
              currency: "USD",
              evaluationModel: "instant-funding",
              maxDrawdown: 1000,
              maxDailyLoss: 500,
              profitTarget: null,
              profitSplit: "70/30",
              leverage: 50,
              minTradingDays: null,
              payoutFirstAfterDays: 7,
              payoutCycleDays: 7,
              trailingDrawdown: true,
              refundableFee: false,
              scalingPlan: false,
              accountType: "instant",
              description: `Instant funding 10K - rozpocznij trading od razu bez wyzwania. Wypłata po 7 dniach.`,
              features: [
                "Natychmiastowy dostęp do konta",
                "Wypłata po 7 dniach",
                "Obsługa MT5",
                "Brak wymogu challenge",
              ],
              affiliateUrl: `https://${companyData.slug}.com/checkout?plan=10k-instant&utm_source=fundedrank`,
              affiliateCommission: 8.0,
            },
            // Instant Funding plan - 25K
            {
              name: `${companyData.name} Instant 25K`,
              price: 399,
              currency: "USD",
              evaluationModel: "instant-funding",
              maxDrawdown: 2500,
              maxDailyLoss: 1250,
              profitTarget: null,
              profitSplit: "75/25",
              leverage: 50,
              minTradingDays: null,
              payoutFirstAfterDays: 7,
              payoutCycleDays: 7,
              trailingDrawdown: true,
              refundableFee: false,
              scalingPlan: false,
              accountType: "instant",
              description: `Instant funding 25K z lepszym profit split. Idealne dla doświadczonych traderów.`,
              features: [
                "Profit split 75/25",
                "Wypłata po 7 dniach",
                "Trailing drawdown",
                "Natychmiastowy dostęp",
              ],
              affiliateUrl: `https://${companyData.slug}.com/checkout?plan=25k-instant&utm_source=fundedrank`,
              affiliateCommission: 10.0,
            },
          ],
        },
      },
    });

    companies.push(company);
    console.log(`Created/updated company: ${company.name}`);
  }

  // Get all plans for later use
  const allPlans = await prisma.companyPlan.findMany({
    include: { company: true },
  });

  // Create FAQ items for companies
  console.log("Creating FAQ items...");
  for (const company of companies) {
    // Delete existing FAQs for this company
    await prisma.faqItem.deleteMany({
      where: { companyId: company.id },
    });

    const faqs = [
      {
        question: `Jakie są wymagania dla wyzwania ${company.name}?`,
        answer: `Wyzwanie ${company.name} wymaga osiągnięcia określonego profit target przy zachowaniu limitów drawdown. Szczegóły znajdziesz w opisie planu.`,
        order: 1,
      },
      {
        question: `Czy ${company.name} oferuje refundację opłaty?`,
        answer: `Tak, większość planów ${company.name} oferuje refundację opłaty po osiągnięciu pierwszej wypłaty.`,
        order: 2,
      },
      {
        question: `Jakie platformy są dostępne w ${company.name}?`,
        answer: `${company.name} oferuje handel na platformach ${company.platforms?.join(", ") || "MT5"}.`,
        order: 3,
      },
      {
        question: `Jak często mogę otrzymać wypłatę z ${company.name}?`,
        answer: `${company.payoutFrequency || "Wypłaty są dostępne zgodnie z harmonogramem planu"}.`,
        order: 4,
      },
    ];

    await prisma.faqItem.createMany({
      data: faqs.map((faq) => ({
        companyId: company.id,
        ...faq,
      })),
    });
  }
  console.log("Created FAQ items");

  // Create team members
  console.log("Creating team members...");
  const teamRoles = [
    { role: "CEO", level: 3 },
    { role: "CTO", level: 2 },
    { role: "Head of Trading", level: 2 },
    { role: "Support Manager", level: 1 },
  ];

  for (const company of companies) {
    const selectedRoles = teamRoles.slice(0, Math.floor(Math.random() * 3) + 2);
    for (let i = 0; i < selectedRoles.length; i++) {
      const role = selectedRoles[i];
      await prisma.teamMember.create({
        data: {
          companyId: company.id,
          name: `${role.role} ${company.name}`,
          role: role.role,
          linkedInUrl: `https://linkedin.com/in/${company.slug}-${role.role.toLowerCase()}`,
          level: role.level,
          position: i % 2 === 0 ? "left" : "right",
          order: i,
        },
      });
    }
  }
  console.log("Created team members");

  // Create timeline items
  console.log("Creating timeline items...");
  const timelineTypes = ["milestone", "achievement", "update", "award"];
  const timelineIcons = ["Trophy", "Award", "TrendingUp", "Star", "CheckCircle"];

  for (const company of companies) {
    const timelineCount = Math.floor(Math.random() * 4) + 3;
    for (let i = 0; i < timelineCount; i++) {
      const date = new Date();
      date.setFullYear(company.foundedYear || 2020);
      date.setMonth(Math.floor(Math.random() * 12));
      date.setDate(Math.floor(Math.random() * 28) + 1);

      await prisma.companyTimeline.create({
        data: {
          companyId: company.id,
          title: `${company.name} ${timelineTypes[i % timelineTypes.length]}`,
          description: `Ważne wydarzenie w historii ${company.name}`,
          date: date,
          type: timelineTypes[i % timelineTypes.length],
          icon: timelineIcons[i % timelineIcons.length],
          order: i,
        },
      });
    }
  }
  console.log("Created timeline items");

  // Create certifications
  console.log("Creating certifications...");
  const certifications = [
    { name: "ISO 27001", issuer: "International Organization for Standardization" },
    { name: "SOC 2 Type II", issuer: "AICPA" },
    { name: "Financial Services License", issuer: "Local Regulatory Authority" },
  ];

  for (const company of companies) {
    const certCount = Math.floor(Math.random() * 2) + 1;
    for (let i = 0; i < certCount; i++) {
      const cert = certifications[i % certifications.length];
      const issuedDate = new Date();
      issuedDate.setFullYear((company.foundedYear || 2020) + Math.floor(Math.random() * 3));

      await prisma.companyCertification.create({
        data: {
          companyId: company.id,
          name: cert.name,
          issuer: cert.issuer,
          description: `Certyfikat ${cert.name} dla ${company.name}`,
          url: `https://example.com/cert/${company.slug}-${cert.name.toLowerCase().replace(/\s+/g, "-")}`,
          issuedDate: issuedDate,
          expiryDate: new Date(issuedDate.getTime() + 365 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }
  console.log("Created certifications");

  // Create media items
  console.log("Creating media items...");
  const mediaSources = ["Forbes", "TradingView", "Bloomberg", "Reuters", "Financial Times"];
  const mediaTypes = ["article", "interview", "press-release", "review"];

  for (const company of companies) {
    const mediaCount = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < mediaCount; i++) {
      const publishedDate = new Date();
      publishedDate.setDate(publishedDate.getDate() - Math.floor(Math.random() * 365));

      await prisma.companyMedia.create({
        data: {
          companyId: company.id,
          title: `${company.name} w ${mediaSources[i % mediaSources.length]}`,
          source: mediaSources[i % mediaSources.length],
          url: `https://example.com/media/${company.slug}-${i}`,
          publishedAt: publishedDate,
          description: `Artykuł o ${company.name} opublikowany w ${mediaSources[i % mediaSources.length]}`,
          type: mediaTypes[i % mediaTypes.length],
        },
      });
    }
  }
  console.log("Created media items");

  // Create ranking history
  console.log("Creating ranking history...");
  for (const company of companies) {
    const baseScore = parseFloat(company.rating?.toString() || "4.5") * 20;
    for (let i = 0; i < 12; i++) {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - i));
      const score = baseScore + (Math.random() - 0.5) * 5;

      await prisma.companyRankingHistory.create({
        data: {
          companyId: company.id,
          overallScore: Math.max(0, Math.min(100, score)),
          recordedAt: date,
        },
      });
    }
  }
  console.log("Created ranking history");

  // Create price history for plans
  console.log("Creating price history...");
  for (const plan of allPlans) {
    const priceChanges = Math.floor(Math.random() * 3) + 2;
    let currentPrice = parseFloat(plan.price.toString());

    for (let i = 0; i < priceChanges; i++) {
      const date = new Date();
      date.setDate(date.getDate() - (priceChanges - i) * 30);
      currentPrice = currentPrice * (0.95 + Math.random() * 0.1);

      await prisma.priceHistory.create({
        data: {
          planId: plan.id,
          price: currentPrice,
          currency: plan.currency,
          recordedAt: date,
        },
      });
    }
  }
  console.log("Created price history");

  // Create reviews
  console.log("Creating reviews...");
  const reviewStatuses = ["APPROVED", "PENDING", "REJECTED"] as const;
  const reviewPros = [
    ["Szybkie wypłaty", "Dobre wsparcie"],
    ["Elastyczne zasady", "Niskie opłaty"],
    ["Dobra platforma", "Szybka weryfikacja"],
    ["Profesjonalny zespół", "Transparentne zasady"],
  ];
  const reviewCons = [
    ["Wysokie wymagania", "Długi czas oczekiwania"],
    ["Ograniczone instrumenty", "Słabe wsparcie"],
    ["Wysokie opłaty", "Skomplikowane zasady"],
  ];

  for (const company of companies) {
    const reviewCount = Math.floor(Math.random() * 5) + 3;
    for (let i = 0; i < reviewCount; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const rating = Math.floor(Math.random() * 5) + 1;
      const status = reviewStatuses[Math.floor(Math.random() * reviewStatuses.length)];

      await prisma.review.create({
        data: {
          companyId: company.id,
          userId: user.id,
          rating: rating,
          pros: reviewPros[i % reviewPros.length],
          cons: reviewCons[i % reviewCons.length],
          body: `Moja opinia o ${company.name}. ${rating >= 4 ? "Polecam!" : "Mogło być lepiej."}`,
          status: status,
          publishedAt: status === "APPROVED" ? new Date() : null,
        },
      });
    }
  }
  console.log("Created reviews");

  // Create favorites
  console.log("Creating favorites...");
  for (let i = 0; i < users.length; i++) {
    const user = users[i];
    const favoriteCount = Math.floor(Math.random() * 4) + 2;
    const shuffledCompanies = [...companies].sort(() => Math.random() - 0.5);

    for (let j = 0; j < Math.min(favoriteCount, shuffledCompanies.length); j++) {
      await prisma.favorite.upsert({
        where: {
          userId_companyId: {
            userId: user.id,
            companyId: shuffledCompanies[j].id,
          },
        },
        update: {},
        create: {
          userId: user.id,
          companyId: shuffledCompanies[j].id,
        },
      });
    }
  }
  console.log("Created favorites");

  // Create click events
  console.log("Creating click events...");
  for (const company of companies) {
    const clickCount = Math.floor(Math.random() * 50) + 20;
    for (let i = 0; i < clickCount; i++) {
      const user = Math.random() > 0.5 ? users[Math.floor(Math.random() * users.length)] : null;
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 30));

      await prisma.clickEvent.create({
        data: {
          companyId: company.id,
          userId: user?.id,
          ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
          userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          source: ["homepage", "search", "direct", "referral"][Math.floor(Math.random() * 4)],
          clickedAt: date,
        },
      });
    }
  }
  console.log("Created click events");

  // Create cashback transactions
  console.log("Creating cashback transactions...");
  const cashbackStatuses = ["PENDING", "APPROVED", "REDEEMED", "REJECTED"] as const;

  for (let i = 0; i < 30; i++) {
    const company = companies[Math.floor(Math.random() * companies.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const status = cashbackStatuses[Math.floor(Math.random() * cashbackStatuses.length)];
    const points = Math.floor(Math.random() * 5000) + 100;
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 90));

    await prisma.cashbackTransaction.create({
      data: {
        companyId: company.id,
        userId: user.id,
        transactionRef: `TXN-${Date.now()}-${i}`,
        points: status === "REDEEMED" ? -points : points,
        status: status,
        purchasedAt: date,
        approvedAt: status === "APPROVED" || status === "REDEEMED" ? new Date(date.getTime() + 24 * 60 * 60 * 1000) : null,
        fulfilledAt: status === "REDEEMED" ? new Date(date.getTime() + 7 * 24 * 60 * 60 * 1000) : null,
      },
    });
  }
  console.log("Created cashback transactions");

  // Create affiliate transactions
  console.log("Creating affiliate transactions...");
  const affiliateStatuses = ["PENDING", "APPROVED", "REJECTED"] as const;

  for (let i = 0; i < 20; i++) {
    const company = companies[Math.floor(Math.random() * companies.length)];
    const user = users[Math.floor(Math.random() * users.length)];
    const status = affiliateStatuses[Math.floor(Math.random() * affiliateStatuses.length)];
    const amount = Math.floor(Math.random() * 1000) + 100;
    const points = Math.floor(amount * (company.cashbackRate || 5) / 100);
    const date = new Date();
    date.setDate(date.getDate() - Math.floor(Math.random() * 60));

    await prisma.affiliateTransaction.create({
      data: {
        companyId: company.id,
        userId: user.id,
        platform: "propfirmmatch",
        source: "direct",
        externalId: `AFF-${Date.now()}-${i}`,
        userEmail: user.email,
        amount: amount,
        currency: "USD",
        points: points,
        purchaseAt: date,
        status: status,
        userConfirmed: status === "APPROVED",
        verifiedAt: status === "APPROVED" ? new Date(date.getTime() + 2 * 24 * 60 * 60 * 1000) : null,
      },
    });
  }
  console.log("Created affiliate transactions");

  // Create blog posts
  console.log("Creating blog posts...");
  const blogPostsData = [
    {
      slug: "jak-zaczac-z-prop-trading",
      title: "Jak zacząć z prop trading? Kompletny przewodnik",
      excerpt: "Dowiedz się wszystkiego o prop tradingu i jak rozpocząć swoją przygodę z wyzwaniami.",
      content: "<p>Prop trading to świetny sposób na rozpoczęcie kariery w tradingu...</p>",
      tags: ["prop-trading", "edukacja", "początkujący"],
      categorySlugs: ["prop-trading", "edukacja"],
      readingTime: 8,
    },
    {
      slug: "najlepsze-strategie-tradingowe-2024",
      title: "Najlepsze strategie tradingowe 2024",
      excerpt: "Przegląd najskuteczniejszych strategii tradingowych w 2024 roku.",
      content: "<p>W tym artykule przedstawimy najlepsze strategie tradingowe...</p>",
      tags: ["strategie", "trading", "analiza"],
      categorySlugs: ["trading-strategie", "edukacja"],
      readingTime: 12,
    },
    {
      slug: "porownanie-prop-firm",
      title: "Porównanie najlepszych prop firm 2024",
      excerpt: "Szczegółowe porównanie warunków i ofert najpopularniejszych prop firm.",
      content: "<p>Przygotowaliśmy szczegółowe porównanie prop firm...</p>",
      tags: ["porównanie", "prop-firm", "analiza"],
      categorySlugs: ["analizy-firm", "prop-trading"],
      readingTime: 15,
    },
    {
      slug: "risk-management-w-tradingu",
      title: "Zarządzanie ryzykiem w tradingu",
      excerpt: "Jak skutecznie zarządzać ryzykiem i chronić swój kapitał.",
      content: "<p>Zarządzanie ryzykiem to kluczowy element sukcesu w tradingu...</p>",
      tags: ["risk-management", "edukacja"],
      categorySlugs: ["trading-strategie", "edukacja"],
      readingTime: 10,
    },
    {
      slug: "psychologia-tradingu",
      title: "Psychologia tradingu - jak kontrolować emocje",
      excerpt: "Dowiedz się, jak emocje wpływają na trading i jak je kontrolować.",
      content: "<p>Psychologia odgrywa kluczową rolę w tradingu...</p>",
      tags: ["psychologia", "edukacja"],
      categorySlugs: ["edukacja"],
      readingTime: 7,
    },
  ];

  for (const postData of blogPostsData) {
    const author = users[0];
    const publishedAt = new Date();
    publishedAt.setDate(publishedAt.getDate() - Math.floor(Math.random() * 30));

    const post = await prisma.blogPost.upsert({
      where: { slug: postData.slug },
      update: {
        title: postData.title,
        content: postData.content,
        excerpt: postData.excerpt,
        tags: postData.tags,
        readingTime: postData.readingTime,
        status: "PUBLISHED",
        publishedAt: publishedAt,
      },
      create: {
        slug: postData.slug,
        title: postData.title,
        content: postData.content,
        excerpt: postData.excerpt,
        tags: postData.tags,
        readingTime: postData.readingTime,
        status: "PUBLISHED",
        authorId: author.id,
        publishedAt: publishedAt,
        views: Math.floor(Math.random() * 1000) + 100,
        categories: {
          create: postData.categorySlugs.map((slug) => {
            const category = blogCategories.find((c) => c.slug === slug);
            return {
              categoryId: category!.id,
            };
          }),
        },
      },
    });
    console.log(`Created/updated blog post: ${post.title}`);
  }

  // Create marketing spotlights
  console.log("Creating marketing spotlights...");
  const spotlightSection = marketingSections[0];
  const selectedCompanies = companies.slice(0, 5);

  for (let i = 0; i < selectedCompanies.length; i++) {
    const company = selectedCompanies[i];
    await prisma.marketingSpotlight.create({
      data: {
        sectionId: spotlightSection.id,
        companyId: company.id,
        title: company.name,
        headline: company.headline || `Sprawdź ofertę ${company.name}`,
        badgeLabel: company.discountCode || "PROMOCJA",
        badgeTone: ["pink", "violet", "blue", "green", "orange"][i % 5],
        discountValue: company.cashbackRate || 5,
        rating: company.rating,
        ratingCount: Math.floor(Math.random() * 500) + 100,
        ctaLabel: "Sprawdź ofertę",
        ctaUrl: company.websiteUrl,
        isActive: true,
        order: i,
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log("Created marketing spotlights");

  // Create newsletter subscribers
  console.log("Creating newsletter subscribers...");
  const subscriberEmails = [
    "subscriber1@example.com",
    "subscriber2@example.com",
    "subscriber3@example.com",
    "subscriber4@example.com",
    "subscriber5@example.com",
    "subscriber6@example.com",
    "subscriber7@example.com",
    "subscriber8@example.com",
  ];
  const sources = ["footer", "popup", "homepage"];

  for (const email of subscriberEmails) {
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: {
        status: Math.random() > 0.2 ? "active" : "unsubscribed",
      },
      create: {
        email,
        status: Math.random() > 0.2 ? "active" : "unsubscribed",
        source: sources[Math.floor(Math.random() * sources.length)],
      },
    });
  }
  console.log("Created newsletter subscribers");

  // Create dispute cases
  console.log("Creating dispute cases...");
  const disputeStatuses = ["OPEN", "IN_REVIEW", "WAITING_USER", "RESOLVED", "REJECTED"] as const;
  const disputeCategories = ["Payout Issue", "Account Problem", "Technical Issue", "Billing", "Other"];

  for (let i = 0; i < 10; i++) {
    const company = companies[Math.floor(Math.random() * companies.length)];
    const plan = allPlans.find((p) => p.companyId === company.id);
    const user = users[Math.floor(Math.random() * users.length)];
    const status = disputeStatuses[Math.floor(Math.random() * disputeStatuses.length)];
    const admin = status === "IN_REVIEW" || status === "RESOLVED" ? users[users.length - 1] : null;

    await prisma.disputeCase.create({
      data: {
        userId: user.id,
        companyId: company.id,
        planId: plan?.id,
        assignedAdminId: admin?.id,
        status: status,
        title: `Problem z ${company.name}`,
        category: disputeCategories[Math.floor(Math.random() * disputeCategories.length)],
        description: `Opis problemu związanego z ${company.name}. Użytkownik zgłasza problem z wypłatą/kontem.`,
        requestedAmount: Math.floor(Math.random() * 1000) + 100,
        requestedCurrency: "USD",
        evidenceLinks: [`https://example.com/evidence/${i}`],
        resolutionNotes: status === "RESOLVED" ? "Problem został rozwiązany pomyślnie." : null,
      },
    });
  }
  console.log("Created dispute cases");

  // Create data issue reports
  console.log("Creating data issue reports...");
  const issueStatuses = ["PENDING", "RESOLVED", "DISMISSED"] as const;
  const issueCategories = ["Incorrect Price", "Wrong Information", "Missing Data", "Outdated Info"];

  for (let i = 0; i < 8; i++) {
    const company = companies[Math.floor(Math.random() * companies.length)];
    const plan = allPlans.find((p) => p.companyId === company.id);
    const user = Math.random() > 0.5 ? users[Math.floor(Math.random() * users.length)] : null;
    const status = issueStatuses[Math.floor(Math.random() * issueStatuses.length)];

    await prisma.dataIssueReport.create({
      data: {
        companyId: company.id,
        planId: plan?.id,
        userId: user?.id,
        email: user?.email || `reporter${i}@example.com`,
        category: issueCategories[Math.floor(Math.random() * issueCategories.length)],
        description: `Zgłoszenie problemu z danymi dla ${company.name}.`,
        status: status,
        source: "user-report",
      },
    });
  }
  console.log("Created data issue reports");

  // Create influencer profiles
  console.log("Creating influencer profiles...");
  const influencerStatuses = ["PENDING", "APPROVED", "REJECTED"] as const;
  const platforms = ["YouTube", "Instagram", "TikTok", "Twitter"];

  for (let i = 0; i < 3; i++) {
    const user = users[i];
    const status = influencerStatuses[Math.floor(Math.random() * influencerStatuses.length)];
    const platform = platforms[i % platforms.length];
    // Generate unique referral code using user ID and index
    const referralCode = `REF${user.id.slice(0, 6).toUpperCase()}${i + 1}`;

    await prisma.influencerProfile.upsert({
      where: { userId: user.id },
      update: {
        platform,
        handle: `@trader${i + 1}`,
        audienceSize: Math.floor(Math.random() * 50000) + 10000,
        referralCode: referralCode,
        status: status,
        preferredCompanies: companies.slice(0, 3).map((c) => c.id),
      },
      create: {
        userId: user.id,
        platform,
        handle: `@trader${i + 1}`,
        audienceSize: Math.floor(Math.random() * 50000) + 10000,
        referralCode: referralCode,
        socialLinks: [`https://${platform.toLowerCase()}.com/trader${i + 1}`],
        bio: `Profesjonalny trader i influencer specjalizujący się w prop tradingu.`,
        status: status,
        preferredCompanies: companies.slice(0, 3).map((c) => c.id),
      },
    });
  }
  console.log("Created influencer profiles");

  console.log("Seed completed successfully!");
  console.log(`Created:`);
  console.log(`- ${users.length} users`);
  console.log(`- ${companies.length} companies`);
  console.log(`- ${allPlans.length} plans`);
  console.log(`- ${blogCategories.length} blog categories`);
  console.log(`- ${blogPostsData.length} blog posts`);
  console.log(`- ${marketingSections.length} marketing sections`);
}

main()
  .catch((error) => {
    console.error("Error during seed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

