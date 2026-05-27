import type { CategoryPlaybook } from '../types';

export const medical: CategoryPlaybook = {
  key: 'medical',
  label: 'Medical Clinic',
  match: ['clinic', 'medical', 'doctor', 'health', 'physician', 'pediatric', 'urgent care'],
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
    hero: 'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=1600&q=80',
    about:
      'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1600&q=80',
    feature:
      'https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1631217868264-e5b90bb7e133?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1666214280557-f1b5022eb634?auto=format&fit=crop&w=800&q=80',
    ],
  },
  services: [
    { name: 'Annual physicals', description: 'A full workup, bloodwork, and a plan you understand.' },
    { name: 'Sick visits', description: 'Same-day appointments for colds, infections, and flare-ups.' },
    { name: 'Chronic care', description: 'Ongoing management for diabetes, blood pressure, and thyroid.' },
    { name: 'Vaccinations', description: 'Flu shots, travel vaccines, and the full childhood schedule.' },
    { name: 'Lab & screening', description: 'On-site draws with results back in days, not weeks.' },
    { name: 'Telehealth', description: 'Video visits for follow-ups and prescription refills.' },
  ],
  faqs: [
    {
      question: 'Are you accepting new patients?',
      answer: 'Yes. Call or book online and the front desk will get you a first visit within the week.',
    },
    {
      question: 'What insurance do you accept?',
      answer: 'We are in-network with most major carriers. Bring your card and we will confirm coverage at check-in.',
    },
    {
      question: 'Can I get a same-day appointment?',
      answer: 'We hold daily slots for acute issues. Call before 10am for the best odds.',
    },
    {
      question: 'Do you offer telehealth?',
      answer: 'Established patients can do follow-ups and refills by video. New patients we see in person first.',
    },
    {
      question: 'How do I get my test results?',
      answer: 'Results post to the patient portal, and a nurse calls you for anything that needs a conversation.',
    },
  ],
  tone: 'Steady and trustworthy. Clear about what you treat and how to be seen; never give medical advice or quote outcomes.',
  hero: {
    eyebrow: 'Accepting new patients',
    headline: 'A doctor who knows your name',
    subheadline: 'Primary care for the whole family, with same-day sick visits and results you can actually reach.',
  },
  statLabels: ['Years in the community', 'Patients under care', '5-star reviews', 'Providers on staff'],
};
