import type { CategoryPlaybook } from '../types';

export const salon: CategoryPlaybook = {
  key: 'salon',
  label: 'Salon & Spa',
  match: ['salon', 'spa', 'hair', 'beauty', 'nails', 'barber', 'lash', 'wax', 'esthetic'],
  paletteFamily: 'clay',
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
        { type: 'pricing', content: 'services' },
        { type: 'feature', tone: 'muted' },
        { type: 'faq', content: 'faqs' },
        { type: 'cta', tone: 'inverted' },
        { type: 'footer' },
      ],
    },
    {
      slug: 'gallery',
      title: 'Gallery',
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
    hero: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80',
    about:
      'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=1600&q=80',
    feature:
      'https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1595476108010-b4d1f102b1b1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1519699047748-de8e457a634e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1605497788044-5a32c7078486?auto=format&fit=crop&w=800&q=80',
    ],
  },
  services: [
    { name: 'Cut & style', description: 'A consult first, then a cut that grows out well.' },
    { name: 'Color & highlights', description: 'Balayage, full color, and gray coverage with a glaze finish.' },
    { name: 'Blowouts', description: 'Wash, smooth, and set for the event or just because.' },
    { name: 'Manicure & pedicure', description: 'Gel, dip, or classic polish in a quiet treatment room.' },
    { name: 'Facials & skincare', description: 'Deep-clean and hydrating facials tuned to your skin.' },
    { name: 'Waxing & lashes', description: 'Brow shaping, full-body waxing, and lash lifts.' },
  ],
  faqs: [
    {
      question: 'How do I book?',
      answer: 'Book online any time, or call during open hours. New color clients start with a quick consult.',
    },
    {
      question: 'What is your cancellation policy?',
      answer: 'Give us 24 hours. Later than that and we charge half the service to hold the chair.',
    },
    {
      question: 'Can I request a specific stylist?',
      answer: 'Always. Pick your stylist when you book, and we will keep you with them.',
    },
    {
      question: 'Do you do consultations before color?',
      answer: 'Yes, and they are free. We talk through the look, the upkeep, and the price before anyone touches your hair.',
    },
    {
      question: 'Do you sell the products you use?',
      answer: 'The shelf carries the lines we actually use in the chair, so you can keep the result at home.',
    },
  ],
  tone: 'Stylish but down-to-earth. Speak to the look the client wants and the upkeep it takes; skip the "pamper yourself" cliches.',
  hero: {
    eyebrow: 'Book online in seconds',
    headline: 'Leave looking like the best version of you',
    subheadline: 'Color, cuts, and skincare from stylists who consult first and cut to fit your life.',
  },
  statLabels: ['Years behind the chair', 'Stylists on the team', '5-star reviews', 'Services offered'],
};
