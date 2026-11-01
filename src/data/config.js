export const config = {
  observed: "2026-11-01",
  github: "https://github.com/Zackriya-Solutions/meetily",
  discord: "https://discord.gg/crRymMQBFH",
  docs: "https://docs.meetily.ai/",
  reviews: "https://www.g2.com/products/meetily/reviews",
  checkout: "https://meetily.ai/buy-now",
  download: "https://meetily.ai/downloads",
  formEndpoint: null,
  currentVersion: "1.11.2",
  pricing: {
    monthly: 10,
    regularMonthly: 25,
    annual: 120,
    regularAnnual: 300,
    discount: 60,
    trialDays: 14,
  },
  externalRoutes: {
    "/docs/integrations/custom-apis":
      "https://docs.meetily.ai/integrations/custom-apis-and-local-llms",
  },
};
export const stages = ["Recording", "Transcription", "People", "Summary"];
export const participants = [
  "Sarah Thompson",
  "Lauren Davis",
  "Michael Brown",
  "Daniel Kim",
];
export const transcript = [
  {
    speaker: "Sarah",
    time: "0:03",
    text: "Thanks everyone for joining. Let's walk through the Q3 numbers.",
  },
  {
    speaker: "Michael",
    time: "0:12",
    text: "Revenue is up 18% quarter over quarter, driven by new enterprise accounts.",
  },
  {
    speaker: "Lauren",
    time: "0:24",
    text: "Churn is down to 2.1%, and net retention looks healthy.",
  },
  {
    speaker: "Daniel",
    time: "0:38",
    text: "We’re targeting the beta launch for next week, pending QA sign-off.",
  },
  {
    speaker: "Sarah",
    time: "0:49",
    text: "Great. I’ll send the board deck on Friday.",
  },
  {
    speaker: "Lauren",
    time: "1:02",
    text: "I’ll prepare the release notes and customer announcement.",
  },
];
export const summary =
  "Q3 Review\n4 speakers · 6 min · generated locally\n\nKey points\n• Revenue up 18% QoQ, driven by new enterprise accounts\n• Churn down to 2.1%; net retention is healthy\n• Beta launch targeted for next week, pending QA sign-off\n\nAction items\n• Sarah: Send the board deck on Friday\n• Lauren: Prep release notes + customer announcement";
