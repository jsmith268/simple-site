import type { CategoryPlaybook } from '../types';

export const homeservices: CategoryPlaybook = {
  key: 'homeservices',
  label: 'Home Services',
  match: ['plumb', 'electric', 'hvac', 'landscap', 'clean', 'contractor', 'roof', 'paint', 'remodel', 'handyman', 'lawn'],
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
      slug: 'gallery',
      title: 'Our Work',
      blocks: [
        { type: 'nav' },
        { type: 'gallery', content: 'gallery' },
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
    hero: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=80',
    about:
      'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=1600&q=80',
    feature:
      'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1572981779307-38b8cabb2407?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?auto=format&fit=crop&w=800&q=80',
    ],
  },
  services: [
    { name: 'Repairs & service calls', description: 'Same-day fixes for leaks, outages, and breakdowns.' },
    { name: 'Installations', description: 'New fixtures, units, and systems put in clean and to code.' },
    { name: 'Maintenance plans', description: 'Seasonal tune-ups so small problems never become big ones.' },
    { name: 'Inspections & estimates', description: 'An honest look and a written quote before any work starts.' },
    { name: 'Emergency service', description: '24/7 on call for the things that cannot wait until morning.' },
    { name: 'Upgrades & remodels', description: 'Bigger projects, planned and run by the same crew start to finish.' },
  ],
  faqs: [
    {
      question: 'Are your estimates free?',
      answer: 'Yes. We come out, look at the job, and give you a written number with no obligation.',
    },
    {
      question: 'Are you licensed and insured?',
      answer: 'Fully licensed, bonded, and insured. We will hand you the numbers before we touch anything.',
    },
    {
      question: 'How fast can you get here?',
      answer: 'Most service calls get a same-day or next-day slot. True emergencies we get to right away.',
    },
    {
      question: 'Do you charge a trip fee?',
      answer: 'There is a flat diagnostic fee that we credit toward the repair if you go ahead with the work.',
    },
    {
      question: 'Do you warranty your work?',
      answer: 'Labor is warrantied for a year, and we pass through the manufacturer warranty on parts.',
    },
  ],
  tone: 'Reliable and no-nonsense, like the person who actually shows up. Talk about response time, fair quotes, and clean work.',
  hero: {
    eyebrow: 'Licensed, insured, on time',
    headline: 'The crew that shows up when they say they will',
    subheadline: 'Repairs, installs, and emergencies handled by techs who quote it straight and clean up after.',
  },
  statLabels: ['Years in business', 'Jobs completed', '5-star reviews', 'Emergency response time'],
};
