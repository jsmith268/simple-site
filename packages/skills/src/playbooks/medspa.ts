import type { CategoryPlaybook } from '../types';

export const medspa: CategoryPlaybook = {
  key: 'medspa',
  label: 'Med Spa',
  match: [
    'med spa',
    'medspa',
    'med-spa',
    'aesthetic',
    'skincare',
    'dermatolog',
    'botox',
    'laser',
    'wellness spa',
    'facial',
  ],
  paletteFamily: 'mist',
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
        { type: 'gallery', content: 'gallery' },
        { type: 'cta' },
        { type: 'footer' },
      ],
    },
    {
      slug: 'treatments',
      title: 'Treatments',
      blocks: [
        { type: 'nav' },
        { type: 'services', content: 'services' },
        { type: 'pricing' },
        { type: 'faq', content: 'faqs' },
        { type: 'cta' },
        { type: 'footer' },
      ],
    },
    {
      slug: 'about',
      title: 'About',
      blocks: [
        { type: 'nav' },
        { type: 'about' },
        { type: 'team' },
        { type: 'cta' },
        { type: 'footer' },
      ],
    },
    {
      slug: 'contact',
      title: 'Contact',
      blocks: [
        { type: 'nav' },
        { type: 'contact', variant: 'split' },
        { type: 'hours' },
        { type: 'map' },
        { type: 'footer' },
      ],
    },
  ],
  images: {
    hero: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1600&q=80',
    about:
      'https://images.unsplash.com/photo-1600334129128-685c5582fd35?auto=format&fit=crop&w=1600&q=80',
    feature:
      'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512290923902-8a9f81dc236c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519823551278-64ac92734fb1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1596178065887-1198b6148b2b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=800&q=80',
    ],
    team: [
      'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1594824476967-48c8b964273f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1582750433449-648ed127bb54?auto=format&fit=crop&w=800&q=80',
    ],
  },
  services: [
    { name: 'Injectables', description: 'Botox and dermal fillers placed by licensed providers for a refreshed, natural look.' },
    { name: 'Laser resurfacing', description: 'Targeted treatments that smooth texture and even out tone over a few sessions.' },
    { name: 'Hydrafacial', description: 'A gentle cleanse, exfoliate, and hydrate in one visit, with no downtime.' },
    { name: 'Microneedling', description: 'Collagen-stimulating treatments that soften fine lines and scarring.' },
    { name: 'Body contouring', description: 'Non-surgical sessions that tone and shape stubborn areas at your pace.' },
  ],
  faqs: [
    {
      question: 'Do I need a consultation first?',
      answer: 'Yes, and it is complimentary. We meet you, listen to your goals, and build a plan before any treatment begins.',
    },
    {
      question: 'Are the treatments safe?',
      answer: 'Every treatment is performed by licensed medical providers using FDA-cleared devices, with your health history reviewed first.',
    },
    {
      question: 'How much downtime should I expect?',
      answer: 'Most treatments let you return to your day right away. Resurfacing and microneedling may bring a day or two of redness, which we walk you through ahead of time.',
    },
    {
      question: 'Do you offer financing?',
      answer: 'We accept several monthly payment plans so you can space out the cost. Ask at your consultation and we will find an option that fits.',
    },
    {
      question: 'How soon will I see results?',
      answer: 'Hydrafacials glow the same day. Injectables settle within a week, and resurfacing or microneedling builds over a few weeks.',
    },
    {
      question: 'Can I combine treatments?',
      answer: 'Often, yes. Your provider will sequence treatments so they complement each other and your skin has time to recover.',
    },
  ],
  tone: 'Calm, premium, and reassuring. Speak the way a trusted provider does in person, warm but never clinical-cold and never hypey. Lead with care and results you can expect, not pressure.',
  hero: {
    eyebrow: 'Aesthetic care, thoughtfully done',
    headline: 'Skin that looks like your best, rested self',
    subheadline: 'Personalized treatments from licensed providers in a calm, unhurried space. Start with a complimentary consultation.',
  },
  statLabels: ['Years open', '5-star reviews', 'Treatments offered'],
};
