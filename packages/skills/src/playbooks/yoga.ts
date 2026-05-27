import type { CategoryPlaybook } from '../types';

export const yoga: CategoryPlaybook = {
  key: 'yoga',
  label: 'Yoga Studio',
  match: ['yoga', 'pilates', 'meditation', 'vinyasa', 'studio'],
  paletteFamily: 'sage',
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
      title: 'Teachers',
      blocks: [
        { type: 'nav' },
        { type: 'about' },
        { type: 'team', tone: 'muted' },
        { type: 'cta', tone: 'inverted' },
        { type: 'footer' },
      ],
    },
    {
      slug: 'classes',
      title: 'Classes & Pricing',
      blocks: [
        { type: 'nav' },
        { type: 'services', content: 'services' },
        { type: 'pricing', tone: 'muted' },
        { type: 'faq', content: 'faqs' },
        { type: 'cta', tone: 'inverted' },
        { type: 'footer' },
      ],
    },
    {
      slug: 'contact',
      title: 'Schedule',
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
    hero: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?auto=format&fit=crop&w=1600&q=80',
    about:
      'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?auto=format&fit=crop&w=1600&q=80',
    feature:
      'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1588286840104-8957b019727f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1552286450-4a669f880062?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1593810450967-f9c42742e326?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1603988363607-e1e4a66962c6?auto=format&fit=crop&w=800&q=80',
    ],
  },
  services: [
    {
      name: 'Vinyasa',
      description:
        'A flowing, breath-led class that builds heat and keeps you moving. Good once you know the basics.',
    },
    {
      name: 'Hatha',
      description:
        'Slower-paced, holding poses longer to find alignment. A friendly place to start.',
    },
    {
      name: 'Restorative',
      description:
        'Supported, gentle poses held with props so your body can fully let go. Bring nothing but yourself.',
    },
    {
      name: 'Prenatal',
      description:
        'Safe, supportive movement for every trimester, taught by instructors trained in prenatal practice.',
    },
    {
      name: 'Meditation',
      description:
        'Guided sitting and breathwork to quiet a busy mind. No experience and no flexibility required.',
    },
  ],
  faqs: [
    {
      question: 'I have never done yoga. Where do I start?',
      answer:
        'Come to a Hatha or beginner class and tell the teacher it is your first time. They will offer easier options for every pose. You will be fine.',
    },
    {
      question: 'What should I bring to my first class?',
      answer:
        'Comfortable clothes you can move in and a water bottle. We have mats and props to borrow, so just show up a few minutes early.',
    },
    {
      question: 'How do memberships work?',
      answer:
        'You can drop in for a single class, buy a class pack, or go unlimited monthly. There is no long contract; pause or cancel anytime.',
    },
    {
      question: 'Do I need to be flexible already?',
      answer:
        'No. Flexibility is something practice builds, not something you need walking in. Everyone modifies, including longtime students.',
    },
    {
      question: 'How early should I arrive?',
      answer:
        'Give yourself about ten minutes to check in, grab a mat, and settle. We hold the door open before class but lock in once we begin.',
    },
    {
      question: 'Can I try a class before committing?',
      answer:
        'Yes. New students get a discounted intro week so you can sample a few styles before deciding what fits.',
    },
  ],
  tone:
    'Warm, welcoming, and genuinely beginner-friendly. Reassure people who feel intimidated. Keep it grounded and human; skip the incense-cloud language about "journeys" and "energy."',
  hero: {
    eyebrow: 'Everyone is welcome here',
    headline: 'A calm place to come back to your breath',
    subheadline:
      'Whether it is your first class or your thousandth, you will find a spot on the floor and a teacher who meets you where you are.',
  },
  statLabels: ['Classes a week', 'Years open', 'Member rating'],
};
