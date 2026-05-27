import type { CategoryPlaybook } from '../types';

export const restaurant: CategoryPlaybook = {
  key: 'restaurant',
  label: 'Restaurant & Cafe',
  match: ['cafe', 'coffee', 'restaurant', 'food', 'bistro', 'eatery', 'diner', 'kitchen'],
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
      slug: 'menu',
      title: 'Menu',
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
    hero: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80',
    about:
      'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1600&q=80',
    feature:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=800&q=80',
    ],
  },
  services: [
    { name: 'Dinner service', description: 'A seasonal menu that changes with what the farms send us.' },
    { name: 'Weekend brunch', description: 'Saturdays and Sundays until 2pm, no reservations.' },
    { name: 'Espresso & house roasts', description: 'Beans roasted in small batches, pulled to order.' },
    { name: 'Private events', description: 'The back room seats 30 for rehearsal dinners and parties.' },
    { name: 'Takeout & catering', description: 'Trays and family meals built for pickup the same day.' },
  ],
  faqs: [
    {
      question: 'Do you take reservations?',
      answer: 'Dinner, yes — book online or call. Brunch is walk-in only.',
    },
    {
      question: 'Is there a kids menu?',
      answer: 'There is, and high chairs are at the host stand whenever you need one.',
    },
    {
      question: 'Can you handle dietary restrictions?',
      answer: 'Tell your server. Most dishes can go gluten-free or vegan, and the kitchen flags allergens by hand.',
    },
    {
      question: 'Do you cater off-site?',
      answer: 'We cater within 20 miles with a week of notice. Email for a quote.',
    },
    {
      question: 'Is parking available?',
      answer: 'Street parking out front plus a free lot behind the building after 6pm.',
    },
  ],
  tone: 'Sound like the owner who is in the dining room every night. Specific dishes, real hours, no "culinary journey" talk.',
  hero: {
    eyebrow: 'Open for dinner Tue–Sun',
    headline: 'Cooking from the farms down the road',
    subheadline: 'A short menu that changes with the season, a long wine list, and a back room for your next party.',
  },
  statLabels: ['Years serving the neighborhood', 'Seats in the dining room', '5-star reviews', 'Dishes on the menu'],
};
