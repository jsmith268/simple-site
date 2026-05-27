import type { CategoryPlaybook } from '../types';

export const generic: CategoryPlaybook = {
  key: 'generic',
  label: 'Local Business',
  match: [],
  paletteFamily: 'slate',
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
    hero: 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80',
    about:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80',
    feature:
      'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600880292203-757bb62b4baf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80',
    ],
  },
  services: [
    { name: 'Consultation', description: 'Start with a conversation about what you actually need.' },
    { name: 'Core service', description: 'The main thing we do, done carefully and on schedule.' },
    { name: 'Ongoing support', description: 'We stay reachable after the work is done.' },
    { name: 'Custom projects', description: 'Bigger or unusual jobs scoped and quoted up front.' },
  ],
  faqs: [
    {
      question: 'How do I get started?',
      answer: 'Reach out through the contact page or call. We will set up a first conversation this week.',
    },
    {
      question: 'What areas do you serve?',
      answer: 'We work with clients across the metro and surrounding towns. Ask if you are not sure.',
    },
    {
      question: 'How much does it cost?',
      answer: 'It depends on the job. We give you a clear quote before any work begins.',
    },
    {
      question: 'How long does it take?',
      answer: 'Most projects wrap within a few weeks. We give you a timeline at the start and keep you posted.',
    },
  ],
  tone: 'Warm, plain, and specific. Say what the business does and how to reach them; avoid generic small-business filler.',
  hero: {
    eyebrow: 'Serving the local community',
    headline: 'Work done right by people who answer the phone',
    subheadline: 'Tell us what you need and we will give you a straight answer and a fair price.',
  },
  statLabels: ['Years in business', 'Clients served', '5-star reviews', 'Repeat customers'],
};
