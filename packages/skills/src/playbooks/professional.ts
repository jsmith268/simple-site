import type { CategoryPlaybook } from '../types';

export const professional: CategoryPlaybook = {
  key: 'professional',
  label: 'Professional Services',
  match: ['law', 'legal', 'attorney', 'lawyer', 'accounting', 'accountant', 'finance', 'consult', 'advisory', 'cpa', 'tax'],
  paletteFamily: 'navy',
  pages: [
    {
      slug: '',
      title: 'Home',
      blocks: [
        { type: 'nav' },
        { type: 'hero', variant: 'overlay', content: 'hero' },
        { type: 'services', content: 'services' },
        { type: 'feature', tone: 'muted' },
        { type: 'stats', tone: 'inverted' },
        { type: 'testimonials' },
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
      slug: 'services',
      title: 'Services',
      blocks: [
        { type: 'nav' },
        { type: 'services', content: 'services' },
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
    hero: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1600&q=80',
    about:
      'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1600&q=80',
    feature:
      'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1423592707957-3b212afa6733?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=800&q=80',
    ],
  },
  services: [
    { name: 'Tax preparation', description: 'Personal and business returns, filed right and on time.' },
    { name: 'Bookkeeping', description: 'Monthly books kept clean so you always know where you stand.' },
    { name: 'Business formation', description: 'LLCs, S-corps, and partnerships set up to fit your plan.' },
    { name: 'Estate & succession', description: 'Wills, trusts, and a plan for passing the business on.' },
    { name: 'Audit & advisory', description: 'A second set of eyes before the numbers go anywhere.' },
    { name: 'Contracts & review', description: 'Agreements drafted and reviewed before you sign.' },
  ],
  faqs: [
    {
      question: 'How do you bill?',
      answer: 'Flat fees for defined work, hourly for open-ended matters. You get the number before we start.',
    },
    {
      question: 'Is the first meeting free?',
      answer: 'The first 30-minute consult is on us, so we can both decide if it is a fit.',
    },
    {
      question: 'How quickly do you respond?',
      answer: 'Calls and emails get a reply within one business day. Active matters move faster.',
    },
    {
      question: 'Do you work with businesses or individuals?',
      answer: 'Both. A good share of our clients are owners who need help on the personal and the company side.',
    },
    {
      question: 'Can you take over from my current firm?',
      answer: 'Yes. We handle the handoff and request your files so nothing falls through the cracks.',
    },
  ],
  tone: 'Authoritative and plain-spoken. Lead with the client problem you solve; no jargon-stuffing, no "trusted partner" filler.',
  hero: {
    eyebrow: 'Free 30-minute consult',
    headline: 'Straight answers about your money and the law',
    subheadline: 'Tax, books, and counsel for owners who would rather call one person than juggle three.',
  },
  statLabels: ['Years in practice', 'Clients represented', '5-star reviews', 'Returns filed'],
};
