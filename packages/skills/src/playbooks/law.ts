import type { CategoryPlaybook } from '../types';

export const law: CategoryPlaybook = {
  key: 'law',
  label: 'Law Firm',
  match: [
    'law firm',
    'law office',
    'attorney',
    'lawyer',
    'legal',
    'litigation',
    'counsel',
  ],
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
        { type: 'testimonials' },
        { type: 'cta', tone: 'inverted' },
        { type: 'footer' },
      ],
    },
    {
      slug: 'about',
      title: 'Attorneys',
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
      slug: 'practice-areas',
      title: 'Practice Areas',
      blocks: [
        { type: 'nav' },
        { type: 'services', content: 'services' },
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
    hero: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=80',
    about:
      'https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=1600&q=80',
    feature:
      'https://images.unsplash.com/photo-1453928582365-b6ad33cbcf64?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=800&q=80',
    ],
  },
  services: [
    {
      name: 'Family law',
      description:
        'Divorce, custody, and support handled with discretion and a clear sense of what comes next.',
    },
    {
      name: 'Estate planning',
      description:
        'Wills, trusts, and powers of attorney that keep your wishes from being decided by a court.',
    },
    {
      name: 'Business law',
      description:
        'Formation, contracts, and disputes for owners who would rather build than litigate.',
    },
    {
      name: 'Real estate law',
      description:
        'Closings, title issues, and landlord-tenant matters reviewed before you sign.',
    },
    {
      name: 'Personal injury',
      description:
        'Claims after an accident, with a candid read on what your case is actually worth.',
    },
  ],
  faqs: [
    {
      question: 'What happens in a first consultation?',
      answer:
        'We listen to the facts, tell you where you stand, and lay out your realistic options. You leave knowing whether you even need a lawyer.',
    },
    {
      question: 'How do you charge?',
      answer:
        'Depending on the matter we work on a flat fee, hourly, or contingency. We agree on the structure in writing before any work begins.',
    },
    {
      question: 'Is the consultation free?',
      answer:
        'Initial consultations for most matters are complimentary. We will tell you up front if a case requires a paid review.',
    },
    {
      question: 'How long will my case take?',
      answer:
        'It depends on the matter and the other side. We give you an honest range early and update you whenever the picture changes.',
    },
    {
      question: 'Will I work with an attorney or a paralegal?',
      answer:
        'You have a named attorney on your matter. Support staff handle paperwork, but the legal judgment is ours and we are reachable.',
    },
    {
      question: 'Is everything I tell you confidential?',
      answer:
        'Yes. Attorney-client privilege applies from the first conversation, whether or not you decide to hire us.',
    },
  ],
  tone:
    'Trustworthy, authoritative, and plain-spoken. Explain the law without jargon and without theatrics. Avoid clichés like "fighting for justice" or "aggressive representation." Sound like a counselor, not a billboard.',
  hero: {
    eyebrow: 'Counsel you can talk to',
    headline: 'Clear advice when the stakes are high',
    subheadline:
      'We explain your options in plain language, tell you the likely outcomes, and handle the matter with care. No surprises on the bill or in the courtroom.',
  },
  statLabels: ['Years practicing', 'Cases handled', 'Client rating'],
};
