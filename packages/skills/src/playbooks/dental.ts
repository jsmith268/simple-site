import type { CategoryPlaybook } from '../types';

export const dental: CategoryPlaybook = {
  key: 'dental',
  label: 'Dental Practice',
  match: ['dental', 'dentist', 'orthodont', 'endodont', 'teeth', 'smile'],
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
    hero: 'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1600&q=80',
    about:
      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1600&q=80',
    feature:
      'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1629909613654-28e377c37b09?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1612277795421-9bc7706a4a34?auto=format&fit=crop&w=800&q=80',
    ],
  },
  services: [
    { name: 'Cleanings & checkups', description: 'Routine recalls every six months, X-rays included.' },
    { name: 'Fillings & crowns', description: 'Same-day crowns milled in the office when we can.' },
    { name: 'Teeth whitening', description: 'In-chair and take-home trays fitted to you.' },
    { name: 'Clear aligners', description: 'Straightening without metal, mapped from a digital scan.' },
    { name: 'Emergency care', description: 'Cracked tooth or sudden pain — call and we will fit you in today.' },
    { name: 'Implants & bridges', description: 'Replacing missing teeth with a fixed, permanent result.' },
  ],
  faqs: [
    {
      question: 'Do you take my insurance?',
      answer: 'We are in-network with most major plans. Send us your card and we will verify before your visit.',
    },
    {
      question: 'How often should I come in?',
      answer: 'Every six months for most patients. We will tell you if your gums need a tighter schedule.',
    },
    {
      question: 'Do you see kids?',
      answer: 'Yes, from their first tooth on. The hygienists are good with nervous little ones.',
    },
    {
      question: 'What if I have a dental emergency?',
      answer: 'Call the main line. We hold same-day slots for pain, swelling, and broken teeth.',
    },
    {
      question: 'Are payment plans available?',
      answer: 'We offer in-house financing and accept CareCredit so you can spread larger treatment over months.',
    },
  ],
  tone: 'Calm and reassuring, not clinical or salesy. Plain language about real procedures; ease the anxiety without overpromising.',
  hero: {
    eyebrow: 'Accepting new patients',
    headline: 'Dental care without the dread',
    subheadline: 'Gentle cleanings, honest treatment plans, and same-day help when something hurts.',
  },
  statLabels: ['Years in practice', 'Patients seen', '5-star reviews', 'Insurance plans accepted'],
};
