import type { CategoryPlaybook } from '../types';

export const realestate: CategoryPlaybook = {
  key: 'realestate',
  label: 'Real Estate',
  match: [
    'real estate',
    'realty',
    'realtor',
    'property',
    'properties',
    'homes',
    'broker',
    'brokerage',
  ],
  paletteFamily: 'stone',
  pages: [
    {
      slug: '',
      title: 'Home',
      blocks: [
        { type: 'nav' },
        { type: 'hero', variant: 'overlay', content: 'hero' },
        { type: 'services', content: 'services' },
        { type: 'feature', tone: 'muted' },
        { type: 'testimonials' },
        { type: 'gallery', tone: 'muted', content: 'gallery' },
        { type: 'cta', tone: 'inverted' },
        { type: 'footer' },
      ],
    },
    {
      slug: 'about',
      title: 'About',
      blocks: [
        { type: 'nav' },
        { type: 'about' },
        { type: 'team', tone: 'muted' },
        { type: 'testimonials' },
        { type: 'cta', tone: 'inverted' },
        { type: 'footer' },
      ],
    },
    {
      slug: 'listings',
      title: 'Listings',
      blocks: [
        { type: 'nav' },
        { type: 'gallery', content: 'gallery' },
        { type: 'feature', tone: 'muted' },
        { type: 'faq', content: 'faqs' },
        { type: 'cta', tone: 'inverted' },
        { type: 'footer' },
      ],
    },
    {
      slug: 'contact',
      title: 'Contact',
      blocks: [
        { type: 'nav' },
        { type: 'contact', variant: 'split' },
        { type: 'hours', tone: 'muted' },
        { type: 'map' },
        { type: 'footer' },
      ],
    },
  ],
  images: {
    hero: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1600&q=80',
    about:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1600&q=80',
    feature:
      'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    ],
  },
  services: [
    {
      name: 'Buying',
      description:
        'We map the neighborhoods, line up the showings, and tell you when a listing is overpriced.',
    },
    {
      name: 'Selling',
      description:
        'Staging advice, pro photography, and a pricing strategy built on what is actually closing nearby.',
    },
    {
      name: 'Investment',
      description:
        'Rentals, multi-family, and fixer-uppers run through real cash-flow math before you commit.',
    },
    {
      name: 'Valuation',
      description:
        'A grounded estimate of what your home is worth today, based on recent comparable sales.',
    },
    {
      name: 'Property management',
      description:
        'Tenant placement, maintenance, and rent collection handled so you are not on call at 11pm.',
    },
  ],
  faqs: [
    {
      question: 'How do your fees work?',
      answer:
        'Commission is paid at closing and we walk you through the exact split before you sign anything. No upfront charges to list.',
    },
    {
      question: 'How long does it take to sell a home here?',
      answer:
        'Well-priced homes in this market typically go under contract within a few weeks. We give you a realistic timeline up front, not a sales pitch.',
    },
    {
      question: 'What does the buying process look like?',
      answer:
        'Pre-approval first, then showings, then an offer with the contingencies that protect you. We handle inspection and closing coordination start to finish.',
    },
    {
      question: 'Do I need to make repairs before listing?',
      answer:
        'Sometimes a small fix pays for itself; often it does not. We walk the house with you and tell you which dollars are worth spending.',
    },
    {
      question: 'How do you decide on a list price?',
      answer:
        'We pull recent comparable sales, factor in condition and timing, and price to draw real offers rather than chasing a number that sits.',
    },
    {
      question: 'Do you work with first-time buyers?',
      answer:
        'Often. We explain each step in plain language and connect you with lenders and inspectors we trust.',
    },
  ],
  tone:
    'Confident local expert who knows the streets and the comps. Plain-spoken, never pushy. Talk about neighborhoods and numbers, not "dream homes" or "luxury lifestyles."',
  hero: {
    eyebrow: 'Local, since day one',
    headline: 'Know the market before you make a move',
    subheadline:
      'We have walked these neighborhoods for years and price homes on what is actually selling. Buying or selling, you get a straight answer.',
  },
  statLabels: ['Homes sold', 'Avg days on market', 'Years local', '5-star reviews'],
};
