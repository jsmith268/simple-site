import type { CategoryPlaybook } from '../types';

export const retail: CategoryPlaybook = {
  key: 'retail',
  label: 'Retail & Boutique',
  match: ['shop', 'store', 'boutique', 'retail', 'goods', 'market', 'apparel', 'gift'],
  paletteFamily: 'warmth',
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
      slug: 'shop',
      title: 'Shop',
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
      title: 'Lookbook',
      blocks: [
        { type: 'nav' },
        { type: 'gallery', content: 'gallery' },
        { type: 'cta', tone: 'inverted' },
        { type: 'footer' },
      ],
    },
    {
      slug: 'contact',
      title: 'Visit',
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
    hero: 'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1600&q=80',
    about:
      'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=1600&q=80',
    feature:
      'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=800&q=80',
    ],
  },
  services: [
    { name: 'In-store shopping', description: 'A tight, well-edited selection you can actually touch.' },
    { name: 'New arrivals', description: 'Fresh drops every few weeks, first come first served.' },
    { name: 'Gift wrapping', description: 'Free wrapping at the counter, no occasion required.' },
    { name: 'Personal styling', description: 'Book a stylist and we will pull a fitting room for you.' },
    { name: 'Local pickup & delivery', description: 'Order by phone, pick up the same day, or we deliver nearby.' },
  ],
  faqs: [
    {
      question: 'What is your return policy?',
      answer: 'Returns within 30 days with the tag and receipt. Final-sale items are marked at the register.',
    },
    {
      question: 'Do you restock sold-out items?',
      answer: 'Some, not all. Leave your name and we will text you if a size or color comes back.',
    },
    {
      question: 'Can I shop online?',
      answer: 'Call or message us a photo of what you want and we will hold it or ship it.',
    },
    {
      question: 'Do you offer gift cards?',
      answer: 'Yes, in any amount, in-store or over the phone. They never expire.',
    },
    {
      question: 'Is there parking nearby?',
      answer: 'Street parking out front and a public lot half a block down.',
    },
  ],
  tone: 'Friendly and tastemaker-confident. Talk about the actual goods and the people who pick them; skip "curated lifestyle" buzz.',
  hero: {
    eyebrow: 'New arrivals weekly',
    headline: 'A shop worth the trip downtown',
    subheadline: 'A small, well-edited selection picked by people who care, with free wrapping and same-day pickup.',
  },
  statLabels: ['Years on Main Street', 'Brands carried', '5-star reviews', 'New arrivals monthly'],
};
