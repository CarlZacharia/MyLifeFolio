// Quiz data for "Do I Need a Trust?" questionnaire
// Based on key decision factors for Revocable Living Trust planning

export interface QuizOption {
  label: string;
  points: number;
  isAdditional?: boolean; // If true, this is a checkbox that can be selected alongside radio options
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
  whyThisMatters: string;
  hasAdditionalOptions?: boolean; // If true, some options are checkboxes (marked with isAdditional)
}

export interface QuizResult {
  key: 'will' | 'consider' | 'trust';
  scoreRange: { min: number; max: number };
  headline: string;
  message: string;
  benefits?: string[];
  ctaText: string;
  secondaryText: string;
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'real-estate',
    question: 'Do you own real estate?',
    options: [
      { label: "No, I rent or don't own property", points: 0 },
      { label: 'Yes, one property in one state', points: 1 },
      { label: 'Yes, multiple properties OR property in more than one state', points: 3 },
    ],
    whyThisMatters:
      'Owning property in multiple states means your family could face multiple probate proceedings in different courts — called "ancillary probate." A trust can help you avoid this costly and time-consuming process.',
  },
  {
    id: 'privacy',
    question: 'How important is it that your financial affairs remain private after you pass away?',
    options: [
      { label: "Not important — I don't mind if it's public record", points: 0 },
      { label: 'Somewhat important', points: 1 },
      { label: 'Very important — I want to keep my affairs private', points: 2 },
    ],
    whyThisMatters:
      'When a Will goes through probate, it becomes a public record. Anyone can see what you owned and who inherited it. A trust, on the other hand, remains private and is never filed with the court.',
  },
  {
    id: 'family-complexity',
    question: 'Which best describes your family situation?',
    hasAdditionalOptions: true,
    options: [
      { label: 'Single, no children', points: 0 },
      { label: 'Married, first marriage, children are from this marriage', points: 1 },
      { label: 'Blended family (children from prior relationships)', points: 3 },
      { label: 'I have a family member with special needs or disabilities', points: 3, isAdditional: true },
      { label: 'I want to disinherit someone or anticipate a family dispute', points: 3, isAdditional: true },
    ],
    whyThisMatters:
      'Blended families, special needs situations, and potential disputes all benefit from the flexibility and control a trust provides. A trust can ensure your wishes are followed precisely and reduce the chance of conflict.',
  },
  {
    id: 'minor-beneficiaries',
    question:
      'Do you have children or beneficiaries under age 25, or beneficiaries who may not handle money responsibly?',
    options: [
      { label: 'No', points: 0 },
      { label: "Yes, but I'm comfortable with them receiving everything outright at 18", points: 0 },
      { label: "Yes, and I'd like to control when and how they receive their inheritance", points: 2 },
    ],
    whyThisMatters:
      'Without a trust, assets typically pass outright to beneficiaries at age 18. A trust allows you to set conditions — for example, distributing funds at ages 25, 30, and 35, or for specific purposes like education or buying a home.',
  },
  {
    id: 'incapacity',
    question:
      'Are you concerned about who would manage your finances if you became incapacitated (due to illness, accident, or dementia)?',
    options: [
      { label: 'Not really — I trust the courts to handle it if needed', points: 0 },
      { label: 'Somewhat concerned', points: 1 },
      { label: 'Very concerned — I want a seamless plan that avoids court involvement', points: 2 },
    ],
    whyThisMatters:
      'If you become incapacitated without a plan, your family may need to go to court for a guardianship — a costly and public process. A funded revocable trust allows your successor trustee to step in immediately and manage your affairs without court involvement.',
  },
  {
    id: 'asset-level',
    question:
      'What is the approximate total value of your assets? (Include home equity, investments, retirement accounts, and life insurance death benefits.)',
    options: [
      { label: 'Under $100,000', points: 0 },
      { label: '$100,000 – $500,000', points: 1 },
      { label: '$500,000 – $1,000,000', points: 2 },
      { label: 'Over $1,000,000', points: 3 },
    ],
    whyThisMatters:
      "Higher asset levels generally mean higher probate costs and more complexity in settling your estate. The cost of establishing a trust is often offset by the savings in probate fees, court costs, and attorney fees your family would otherwise pay.",
  },
  {
    id: 'probate-avoidance',
    question:
      'How important is it to you that your family avoids the time, cost, and hassle of probate court?',
    options: [
      { label: "Not important — I don't mind if they go through probate", points: 0 },
      { label: 'Somewhat important', points: 1 },
      { label: 'Very important — I want to make things as easy as possible for my family', points: 2 },
    ],
    whyThisMatters:
      'Probate can take 6 months to over a year, cost thousands of dollars in fees, and require multiple court appearances. A properly funded trust allows your family to settle your affairs privately and efficiently, often in a matter of weeks.',
  },
];

export const quizResults: QuizResult[] = [
  {
    key: 'will',
    scoreRange: { min: 0, max: 4 },
    headline: 'A Will May Be Sufficient for Your Needs',
    message:
      'Based on your answers, a properly drafted Will — along with Powers of Attorney and a Healthcare Directive — may meet your estate planning needs. These documents can ensure your wishes are followed and your loved ones are protected.\n\nHowever, everyone\'s situation is unique, and there may be factors we haven\'t covered here. We recommend discussing your specific circumstances with an attorney to make sure you have the right plan in place.',
    ctaText: 'Schedule a Free Consultation',
    secondaryText: 'Not sure? A brief conversation can help clarify the best approach for your situation.',
  },
  {
    key: 'consider',
    scoreRange: { min: 5, max: 9 },
    headline: 'You Should Consider a Revocable Living Trust',
    message:
      'Your answers suggest that a Revocable Living Trust could provide meaningful benefits for you and your family. While a Will-based plan might work, a trust-based plan may better serve your goals and protect your family.',
    benefits: [
      'Avoid the probate process',
      'Maintain privacy for your financial affairs',
      'Provide flexibility in how and when beneficiaries receive their inheritance',
      'Ensure seamless management if you become incapacitated',
    ],
    ctaText: 'Schedule a Consultation',
    secondaryText: "Let's discuss whether a trust makes sense for your specific situation.",
  },
  {
    key: 'trust',
    scoreRange: { min: 10, max: 20 },
    headline: 'A Revocable Living Trust Is Strongly Recommended',
    message:
      'Based on your answers, a Revocable Living Trust is likely the best foundation for your estate plan. You have multiple factors — such as property in more than one state, a complex family situation, significant assets, or strong concerns about probate and privacy — that make trust planning especially valuable.\n\nA trust-based plan will give you greater control, flexibility, and peace of mind, while making things significantly easier for your loved ones.',
    ctaText: 'Schedule a Consultation',
    secondaryText: "We'll create a customized plan that addresses your specific needs and goals.",
  },
];

export const getResultByScore = (score: number): QuizResult => {
  const result = quizResults.find(
    (r) => score >= r.scoreRange.min && score <= r.scoreRange.max
  );
  return result || quizResults[0];
};

export const TOTAL_QUESTIONS = quizQuestions.length;
