// eslint-disable-next-line @typescript-eslint/no-require-imports
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const companiesData = [
  {
    slug: "apex-funding",
    name: "Apex Funding",
    headline: "Dwustopniowe wyzwania z szybkimi wypłatami",
    logoUrl: "https://dummyimage.com/160x160/1b3a6f/ffffff&text=Apex",
    shortDescription:
      "Prop firm nastawiona na szybkie wyplaty i elastyczne zasady zarzadzania ryzykiem.",
    country: "United States",
    foundedYear: 2021,
    websiteUrl: "https://example.com/apex",
    discountCode: "APEX5",
    cashbackRate: 5,
    payoutFrequency: "Wyplaty co 14 dni",
    rating: 4.6,
    highlights: [
      "Szybki onboarding - weryfikacja konta do 24h",
      "Rozbudowany panel z metrykami dla traderow",
    ],
    socials: {
      website: "https://example.com/apex",
      twitter: "https://twitter.com/apex",
      discord: "https://discord.gg/apex",
      youtube: "https://youtube.com/apex",
    },
    regulation: "USA LLC",
    kycRequired: true,
    paymentMethods: ["Karta", "Przelew", "Kryptowaluty"],
    instruments: ["Forex", "Indeksy", "Towary"],
    platforms: ["MT5", "cTrader"],
    educationLinks: ["https://example.com/apex/academy"],
    supportContact: "support@example.com",
    faqs: [
      {
        question: "Czy Apex oferuje refundacje opłat?",
        answer: "Tak, po osiągnięciu pierwszej wypłaty opłata za wyzwanie jest zwracana.",
        order: 1,
      },
      {
        question: "Jakie są dostępne platformy?",
        answer: "Aktualnie MT5 oraz cTrader.",
        order: 2,
      },
    ],
    reviews: [
      {
        rating: 5,
        pros: ["Świetne wsparcie", "Szybkie wypłaty"],
        cons: ["Wysoki koszt za plan 100K"],
        body: "Testowałem wiele firm, ale Apex ma najlepsze warunki dla scalpingu.",
        status: "APPROVED",
      },
    ],
    plans: [
      {
        name: "Account 50K",
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
        refundableFee: true,
        scalingPlan: true,
        accountType: "evaluation",
        affiliateUrl: "https://example.com/apex/checkout?plan=50k&utm_source=fundedrank",
        description:
          "Dwustopniowe wyzwanie z limitem dziennej straty ustawionym na 5 procent.",
        features: [
          "Max leverage 1:100",
          "Brak ograniczen w weekend",
          "Wyplaty w 24h",
        ],
        priceHistory: [
          { price: 229, currency: "USD", recordedAt: new Date(Date.now() - 60 * 24 * 3600 * 1000) },
          { price: 249, currency: "USD", recordedAt: new Date(Date.now() - 15 * 24 * 3600 * 1000) },
        ],
      },
      {
        name: "Account 100K",
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
        refundableFee: true,
        scalingPlan: true,
        accountType: "evaluation",
        affiliateUrl: "https://example.com/apex/checkout?plan=100k&utm_source=fundedrank",
        description: "Najpopularniejszy plan Apex z najlepszym stosunkiem ceny do kapitau.",
        features: ["Wyplaty w 24h", "Obsługa MT5", "Możliwy scaling do 500k"],
        priceHistory: [
          { price: 479, currency: "USD", recordedAt: new Date(Date.now() - 45 * 24 * 3600 * 1000) },
          { price: 499, currency: "USD", recordedAt: new Date(Date.now() - 10 * 24 * 3600 * 1000) },
        ],
      },
    ],
  },
  {
    slug: "nordic-traders",
    name: "Nordic Traders",
    headline: "Jednoetapowe wyzwania z mentoringiem",
    logoUrl: "https://dummyimage.com/160x160/0f4c81/ffffff&text=Nordic",
    shortDescription:
      "Europejska firma prop tradingowa nastawiona na stabilne strategie i wsparcie mentorow.",
    country: "Sweden",
    foundedYear: 2019,
    websiteUrl: "https://example.com/nordic",
    discountCode: "NORDIC10",
    cashbackRate: 7,
    payoutFrequency: "Wyplaty co 30 dni",
    rating: 4.3,
    highlights: [
      "Program mentoringowy dla kazdego poziomu",
      "Dostep do materialow edukacyjnych i webinarow",
    ],
    socials: {
      website: "https://example.com/nordic",
      twitter: "https://twitter.com/nordictraders",
      discord: "https://discord.gg/nordic",
    },
    regulation: "Szwecja AB",
    kycRequired: true,
    paymentMethods: ["Karta", "SEPA"],
    instruments: ["Forex", "Indeksy"],
    platforms: ["MT4", "MT5"],
    educationLinks: ["https://example.com/nordic/academy"],
    supportContact: "hello@nordictraders.com",
    faqs: [
      {
        question: "Czy można handlować w weekend?",
        answer: "Tak, weekend trading jest dozwolony w planach Nordic Traders.",
        order: 1,
      },
    ],
    reviews: [
      {
        rating: 4,
        pros: ["Mentoring", "Stabilne zasady"],
        cons: ["Długi cykl wypłat"],
        body: "Jednoetapowe wyzwanie jest wygodne, ale trzeba liczyć się z 30 dniami na wypłatę.",
        status: "APPROVED",
      },
    ],
    plans: [
      {
        name: "Starter 25K",
        price: 179,
        currency: "EUR",
        evaluationModel: "one-step",
        maxDrawdown: 2500,
        maxDailyLoss: 1500,
        profitTarget: 1750,
        profitSplit: "75/25",
        leverage: 60,
        minTradingDays: 3,
        payoutFirstAfterDays: 30,
        payoutCycleDays: 30,
        refundableFee: true,
        trailingDrawdown: false,
        accountType: "evaluation",
        features: ["Mentoring 1:1", "Weekend trading"],
        priceHistory: [
          { price: 159, currency: "EUR", recordedAt: new Date(Date.now() - 90 * 24 * 3600 * 1000) },
          { price: 179, currency: "EUR", recordedAt: new Date(Date.now() - 21 * 24 * 3600 * 1000) },
        ],
      },
      {
        name: "Elite 200K",
        price: 949,
        currency: "EUR",
        evaluationModel: "two-step",
        maxDrawdown: 20000,
        maxDailyLoss: 10000,
        profitTarget: 16000,
        profitSplit: "85/15",
        leverage: 80,
        minTradingDays: 5,
        payoutFirstAfterDays: 30,
        payoutCycleDays: 30,
        refundableFee: true,
        scalingPlan: true,
        accountType: "evaluation",
        features: ["Możliwy scaling do 1M", "Obsługa MT5"],
      },
    ],
  },
  {
    slug: "flash-funding",
    name: "Flash Funding",
    headline: "Instant funding bez limitu czasu",
    logoUrl: "https://dummyimage.com/160x160/312e81/ffffff&text=Flash",
    shortDescription:
      "Specjalizacja w kontach instant funding bez tradycyjnego wyzwania.",
    country: "United Arab Emirates",
    foundedYear: 2023,
    websiteUrl: "https://example.com/flash",
    discountCode: "FLASH3",
    cashbackRate: 3,
    payoutFrequency: "Natychmiastowe wyplaty po 7 dniach",
    rating: 4.1,
    highlights: [
      "Instant funding po potwierdzeniu KYC",
      "Dynamiczne rabaty za kolejne zakupy",
    ],
    socials: {
      website: "https://example.com/flash",
      twitter: "https://twitter.com/flashfunding",
    },
    regulation: "ZEA Freezone",
    kycRequired: true,
    paymentMethods: ["Karta", "Crypto"],
    instruments: ["Forex", "Krypto"],
    platforms: ["MT5"],
    educationLinks: [],
    supportContact: "support@flashfunding.com",
    faqs: [
      {
        question: "Czy wymagane są minimalne dni handlowe?",
        answer: "Nie, instant funding pozwala na wypłatę po 7 dniach niezależnie od liczby transakcji.",
        order: 1,
      },
    ],
    reviews: [
      {
        rating: 4,
        pros: ["Brak czasu na challenge", "Szybka wypłata"],
        cons: ["Niższy profit split"],
        body: "Dobre dla osób, które chcą zacząć handlować od razu.",
        status: "APPROVED",
      },
    ],
    plans: [
      {
        name: "Instant 5K",
        price: 299,
        currency: "USD",
        evaluationModel: "instant-funding",
        accountType: "instant",
        maxDrawdown: 500,
        maxDailyLoss: 250,
        profitTarget: null,
        profitSplit: "70/30",
        leverage: 30,
        payoutFirstAfterDays: 7,
        payoutCycleDays: 7,
        refundableFee: false,
        trailingDrawdown: true,
        features: ["Wypłata po 7 dniach", "Obsługa MT5"],
      },
      {
        name: "Instant 20K",
        price: 799,
        currency: "USD",
        evaluationModel: "instant-funding",
        accountType: "instant",
        maxDrawdown: 2000,
        maxDailyLoss: 800,
        profitSplit: "75/25",
        leverage: 40,
        payoutFirstAfterDays: 7,
        payoutCycleDays: 7,
        refundableFee: false,
        trailingDrawdown: true,
        features: ["Dynamiczne rabaty", "Konto natychmiastowe"],
      },
    ],
  },
];

function shouldSeedSampleData() {
  const flags = [
    process.env.SEED_SAMPLE_DATA,
    process.env.SEED_SAMPLE_COMPANIES,
    process.env.PRISMA_SEED_SAMPLE_DATA,
  ].filter(Boolean);

  if (flags.length === 0) {
    return false;
  }

  return flags.some((value) => {
    const normalized = value.toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
  });
}

async function seedCompanies() {
  for (const company of companiesData) {
    await prisma.company.upsert({
      where: { slug: company.slug },
      update: {
        name: company.name,
        headline: company.headline ?? null,
        shortDescription: company.shortDescription,
        country: company.country,
        foundedYear: company.foundedYear,
        websiteUrl: company.websiteUrl,
        discountCode: company.discountCode,
        cashbackRate: company.cashbackRate,
        payoutFrequency: company.payoutFrequency,
        rating: company.rating,
        highlights: company.highlights,
        socials: company.socials,
        regulation: company.regulation,
        kycRequired: company.kycRequired ?? false,
        paymentMethods: company.paymentMethods ?? [],
        instruments: company.instruments ?? [],
        platforms: company.platforms ?? [],
        educationLinks: company.educationLinks ?? [],
        supportContact: company.supportContact ?? null,
        ceo: company.ceo ?? null,
        foundersInfo: company.foundersInfo ?? null,
        headquartersAddress: company.headquartersAddress ?? null,
        legalName: company.legalName ?? null,
        licenses: company.licenses ?? [],
        registryData: company.registryData ?? null,
        registryLinks: company.registryLinks ?? [],
        verificationStatus: company.verificationStatus ?? null,
        plans: {
          deleteMany: {},
          create: company.plans.map((plan) => ({
            name: plan.name,
            price: plan.price,
            currency: plan.currency,
            maxDrawdown: plan.maxDrawdown,
            maxDailyLoss: plan.maxDailyLoss ?? null,
            profitTarget: plan.profitTarget ?? null,
            profitSplit: plan.profitSplit,
            evaluationModel: plan.evaluationModel,
            description: plan.description,
            features: plan.features ?? [],
            minTradingDays: plan.minTradingDays ?? null,
            payoutFirstAfterDays: plan.payoutFirstAfterDays ?? null,
            payoutCycleDays: plan.payoutCycleDays ?? null,
            leverage: plan.leverage ?? null,
            trailingDrawdown: plan.trailingDrawdown ?? null,
            refundableFee: plan.refundableFee ?? null,
            scalingPlan: plan.scalingPlan ?? null,
            accountType: plan.accountType ?? null,
            affiliateUrl: plan.affiliateUrl ?? null,
            notes: plan.notes ?? null,
            priceHistory: {
              create: (plan.priceHistory ?? []).map((history) => ({
                price: history.price,
                currency: history.currency ?? plan.currency,
                recordedAt: history.recordedAt ?? new Date(),
              })),
            },
          })),
        },
        faqs: {
          deleteMany: {},
          create: (company.faqs ?? []).map((faq) => ({
            question: faq.question,
            answer: faq.answer,
            order: faq.order ?? 0,
          })),
        },
        reviews: {
          deleteMany: {},
          create: (company.reviews ?? []).map((review) => ({
            rating: review.rating,
            pros: review.pros ?? [],
            cons: review.cons ?? [],
            body: review.body ?? null,
            status: review.status ?? "APPROVED",
            publishedAt: new Date(),
          })),
        },
      },
      create: {
        slug: company.slug,
        name: company.name,
        headline: company.headline ?? null,
        logoUrl: company.logoUrl ?? null,
        shortDescription: company.shortDescription,
        country: company.country,
        foundedYear: company.foundedYear,
        websiteUrl: company.websiteUrl,
        discountCode: company.discountCode,
        cashbackRate: company.cashbackRate,
        payoutFrequency: company.payoutFrequency,
        rating: company.rating,
        highlights: company.highlights,
        socials: company.socials ?? null,
        regulation: company.regulation ?? null,
        kycRequired: company.kycRequired ?? false,
        paymentMethods: company.paymentMethods ?? [],
        instruments: company.instruments ?? [],
        platforms: company.platforms ?? [],
        educationLinks: company.educationLinks ?? [],
        supportContact: company.supportContact ?? null,
        ceo: company.ceo ?? null,
        foundersInfo: company.foundersInfo ?? null,
        headquartersAddress: company.headquartersAddress ?? null,
        legalName: company.legalName ?? null,
        licenses: company.licenses ?? [],
        registryData: company.registryData ?? null,
        registryLinks: company.registryLinks ?? [],
        verificationStatus: company.verificationStatus ?? null,
        plans: {
          create: company.plans.map((plan) => ({
            name: plan.name,
            price: plan.price,
            currency: plan.currency,
            maxDrawdown: plan.maxDrawdown,
            maxDailyLoss: plan.maxDailyLoss ?? null,
            profitTarget: plan.profitTarget ?? null,
            profitSplit: plan.profitSplit,
            evaluationModel: plan.evaluationModel,
            description: plan.description,
            features: plan.features ?? [],
            minTradingDays: plan.minTradingDays ?? null,
            payoutFirstAfterDays: plan.payoutFirstAfterDays ?? null,
            payoutCycleDays: plan.payoutCycleDays ?? null,
            leverage: plan.leverage ?? null,
            trailingDrawdown: plan.trailingDrawdown ?? null,
            refundableFee: plan.refundableFee ?? null,
            scalingPlan: plan.scalingPlan ?? null,
            accountType: plan.accountType ?? null,
            affiliateUrl: plan.affiliateUrl ?? null,
            notes: plan.notes ?? null,
            priceHistory: {
              create: (plan.priceHistory ?? []).map((history) => ({
                price: history.price,
                currency: history.currency ?? plan.currency,
                recordedAt: history.recordedAt ?? new Date(),
              })),
            },
          })),
        },
        faqs: {
          create: (company.faqs ?? []).map((faq) => ({
            question: faq.question,
            answer: faq.answer,
            order: faq.order ?? 0,
          })),
        },
        reviews: {
          create: (company.reviews ?? []).map((review) => ({
            rating: review.rating,
            pros: review.pros ?? [],
            cons: review.cons ?? [],
            body: review.body ?? null,
            status: review.status ?? "APPROVED",
            publishedAt: new Date(),
          })),
        },
      },
    });
  }
}

async function main() {
  if (!shouldSeedSampleData()) {
    console.info(
      "Skipping Prisma seed - set SEED_SAMPLE_DATA=true to populate sample companies.",
    );
    return;
  }

  await seedCompanies();
  console.info("Seed completed successfully.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
