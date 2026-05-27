import type { CategoryPlaybook } from '../types';

export const fitness: CategoryPlaybook = {
  key: 'fitness',
  label: 'Fitness & Studio',
  match: ['gym', 'fitness', 'yoga', 'pilates', 'trainer', 'crossfit', 'cycle', 'studio', 'workout'],
  paletteFamily: 'ink',
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
      slug: 'classes',
      title: 'Classes & Pricing',
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
    hero: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=80',
    about:
      'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&w=1600&q=80',
    feature:
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1576678927484-cc907957088c?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1554344728-77cf90d9ed26?auto=format&fit=crop&w=800&q=80',
    ],
  },
  services: [
    { name: 'Group classes', description: 'Strength, conditioning, and mobility on a daily schedule.' },
    { name: 'Personal training', description: 'One-on-one coaching built around your goal and your schedule.' },
    { name: 'Open gym', description: 'Full rack of platforms, dumbbells, and cardio for members.' },
    { name: 'Yoga & mobility', description: 'Slow flow and recovery classes to keep you moving.' },
    { name: 'Beginner onboarding', description: 'Three sessions to learn the lifts before you go solo.' },
    { name: 'Nutrition coaching', description: 'A plan you can actually stick to, reviewed every two weeks.' },
  ],
  faqs: [
    {
      question: 'I have never worked out. Where do I start?',
      answer: 'The beginner onboarding. Three coached sessions teach the basics before you join a class.',
    },
    {
      question: 'Do you offer a free trial?',
      answer: 'First class is free. Drop in, see if you like the room, then decide.',
    },
    {
      question: 'What are the membership options?',
      answer: 'Month-to-month or annual, with class packs if you only come a few times a week. No long contracts.',
    },
    {
      question: 'Can I freeze my membership?',
      answer: 'Freeze it for up to three months for travel, injury, or a busy stretch. Just give us a heads-up.',
    },
    {
      question: 'Is there parking and a locker room?',
      answer: 'Free lot out front, showers and lockers inside. Bring a lock or buy one at the desk.',
    },
  ],
  tone: 'Direct and motivating without the bro-yelling. Speak to real progress and a welcoming room, not "crush your goals" hype.',
  hero: {
    eyebrow: 'First class free',
    headline: 'Show up, get stronger, keep showing up',
    subheadline: 'Coached classes and one-on-one training in a room that does not care how fit you are on day one.',
  },
  statLabels: ['Years coaching', 'Active members', '5-star reviews', 'Classes each week'],
};
