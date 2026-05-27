import type { CategoryPlaybook } from '../types';

export const technology: CategoryPlaybook = {
  key: 'technology',
  label: 'Technology',
  match: [
    'tech',
    'software',
    'saas',
    'app',
    'platform',
    'startup',
    'data',
    'cloud',
    'dev',
    'digital',
    'ai company',
    'api',
  ],
  paletteFamily: 'aurora',
  pages: [
    {
      slug: '',
      title: 'Home',
      blocks: [
        { type: 'nav' },
        { type: 'hero', variant: 'aurora', content: 'hero' },
        { type: 'services', content: 'services' },
        { type: 'feature' },
        { type: 'stats', tone: 'inverted' },
        { type: 'testimonials' },
        { type: 'cta', tone: 'inverted' },
        { type: 'footer' },
      ],
    },
    {
      slug: 'product',
      title: 'Product',
      blocks: [
        { type: 'nav' },
        { type: 'services', content: 'services' },
        { type: 'feature' },
        { type: 'faq', content: 'faqs' },
        { type: 'cta' },
        { type: 'footer' },
      ],
    },
    {
      slug: 'about',
      title: 'About',
      blocks: [
        { type: 'nav' },
        { type: 'about' },
        { type: 'team' },
        { type: 'testimonials' },
        { type: 'cta' },
        { type: 'footer' },
      ],
    },
    {
      slug: 'contact',
      title: 'Contact',
      blocks: [
        { type: 'nav' },
        { type: 'contact', variant: 'split' },
        { type: 'footer' },
      ],
    },
  ],
  images: {
    hero: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1600&q=80',
    about:
      'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1600&q=80',
    feature:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1600&q=80',
    gallery: [
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?auto=format&fit=crop&w=800&q=80',
    ],
    team: [
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    ],
  },
  services: [
    { name: 'Realtime sync', description: 'Changes land across every device the moment they happen, with no manual refresh.' },
    { name: 'Role-based access', description: 'Set who can view, edit, or admin down to the project level.' },
    { name: 'Audit logs', description: 'Every action is recorded and exportable, so you always know who did what.' },
    { name: 'Integrations', description: 'Connect Slack, GitHub, and your data warehouse without writing glue code.' },
    { name: 'Analytics', description: 'Track usage and adoption across teams from one dashboard.' },
  ],
  faqs: [
    {
      question: 'How does pricing work?',
      answer: 'You pay per active seat, billed monthly or annually. Annual plans save two months. There is no charge for read-only viewers.',
    },
    {
      question: 'How do you handle security?',
      answer: 'Data is encrypted in transit and at rest. We are SOC 2 Type II audited and support SSO and SCIM on business plans.',
    },
    {
      question: 'What does onboarding look like?',
      answer: 'Most teams are running the same day. Import your data, invite your team, and we walk admins through setup on a shared call.',
    },
    {
      question: 'Which tools do you integrate with?',
      answer: 'We ship native integrations for Slack, GitHub, Linear, and major data warehouses, plus a REST API and webhooks for the rest.',
    },
    {
      question: 'Can I export my data?',
      answer: 'Yes. Export everything to CSV or JSON at any time, or pull it through the API. Your data stays yours.',
    },
    {
      question: 'Do you offer a trial?',
      answer: 'Every plan starts with a 14-day trial. No card required, and you keep your workspace if you upgrade.',
    },
  ],
  tone: 'Direct and technical, written by an engineer who respects the reader. State what the product does in plain terms. No hype words, no "unlock/elevate/seamless/leverage," no three-part lists for their own sake. Short declarative sentences.',
  hero: {
    eyebrow: 'Built for teams that move fast',
    headline: 'One workspace your whole team trusts',
    subheadline: 'Track work, sync changes in realtime, and keep a full audit trail. Set up in an afternoon.',
  },
  statLabels: ['Uptime', 'Teams onboarded', 'Integrations', 'Avg setup time'],
};
