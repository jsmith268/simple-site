import type { CategoryPlaybook } from '../types';

export const bakery: CategoryPlaybook = {
  key: 'bakery',
  label: 'Bakery',
  match: ['bakery', 'baker', 'patisserie', 'pastry', 'bread', 'cake'],
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
    hero: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1600&q=80',
    about:
      'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=1600&q=80',
    feature:
      'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1568254183919-78a4f43a2877?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1464195244916-405fa0a82545?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1517433670267-08bbd4be890f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1612203985729-70726954388c?auto=format&fit=crop&w=800&q=80',
    ],
  },
  services: [
    { name: 'Sourdough & artisan loaves', description: 'Slow-proofed daily on a 24-hour ferment.' },
    { name: 'Morning pastries', description: 'Croissants, pain au chocolat, and danishes pulled from the oven by 7am.' },
    { name: 'Custom celebration cakes', description: 'Birthdays, weddings, and milestones, decorated to order.' },
    { name: 'Cookies & bars', description: 'Trays for the office, the bake sale, or the afternoon slump.' },
    { name: 'Wholesale & cafe accounts', description: 'Standing bread orders for local restaurants and coffee shops.' },
  ],
  faqs: [
    {
      question: 'Do you take custom cake orders?',
      answer: 'Yes. Give us 72 hours for standard cakes and two weeks for wedding tiers.',
    },
    {
      question: 'What time does the fresh bread come out?',
      answer: 'Loaves hit the shelf by 7am and sell out most Saturdays by noon.',
    },
    {
      question: 'Do you have gluten-free or vegan options?',
      answer: 'We bake a rotating gluten-free loaf and several vegan pastries daily. Call ahead for larger quantities.',
    },
    {
      question: 'Can I place a standing weekly order?',
      answer: 'Cafes and offices can set up a recurring order with us. Email and we will build a sheet.',
    },
    {
      question: 'Do you ship?',
      answer: 'Shelf-stable cookies and biscotti ship within the state. Fresh bread is pickup only.',
    },
  ],
  tone: 'Warm and unfussy, like the person who hands you the bag. Talk about the actual baking, not "artisanal experiences."',
  hero: {
    eyebrow: 'Baked fresh daily',
    headline: 'Bread worth getting up early for',
    subheadline: 'We mill, mix, and proof on-site every morning. Get here before the sourdough sells out.',
  },
  statLabels: ['Years on the corner', 'Loaves baked weekly', '5-star reviews', 'Wholesale accounts'],
};
