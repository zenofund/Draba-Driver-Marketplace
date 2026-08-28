export type Driver = {
  id: string;
  name: string;
  initials: string;
  trust: number;
  rating: number;
  trips: string;
  distance: string;
  eta: string;
  rate: string;
  premium: boolean;
  accent: string;
  bio: string;
};

export const drivers: Driver[] = [
  {
    id: 'james-okoro',
    name: 'James Okoro',
    initials: 'JO',
    trust: 96,
    rating: 4.9,
    trips: '1,284',
    distance: '1.2 km',
    eta: '4 min',
    rate: '₦1,200',
    premium: true,
    accent: '#2D6B71',
    bio: 'Former executive chauffeur with 8 years of calm, careful driving across Lagos.',
  },
  {
    id: 'amina-yusuf',
    name: 'Amina Yusuf',
    initials: 'AY',
    trust: 93,
    rating: 4.8,
    trips: '976',
    distance: '2.4 km',
    eta: '7 min',
    rate: '₦1,050',
    premium: true,
    accent: '#805B47',
    bio: 'Thoughtful professional driver who knows every quiet route through the city.',
  },
  {
    id: 'daniel-emeka',
    name: 'Daniel Emeka',
    initials: 'DE',
    trust: 89,
    rating: 4.7,
    trips: '741',
    distance: '3.1 km',
    eta: '9 min',
    rate: '₦950',
    premium: false,
    accent: '#465F82',
    bio: 'Reliable and punctual, with a background in fleet operations and road safety.',
  },
];

export const trips = [
  { id: 'TRP-1042', driver: 'James Okoro', route: 'Lekki Phase 1 → Victoria Island', date: 'Today, 10:42 AM', amount: '₦7,200', status: 'Completed' },
  { id: 'TRP-1035', driver: 'Amina Yusuf', route: 'Ikeja GRA → Yaba', date: 'Yesterday, 6:18 PM', amount: '₦5,850', status: 'Completed' },
  { id: 'TRP-1019', driver: 'Daniel Emeka', route: 'Ikoyi → Lagos Island', date: 'Aug 21, 2:06 PM', amount: '₦4,400', status: 'Completed' },
];

export const transactions = [
  { id: 'TX-9912', label: 'Trip with James Okoro', date: 'Today, 10:42 AM', amount: '-₦7,200', type: 'debit' },
  { id: 'TX-9901', label: 'Wallet top up', date: 'Aug 26, 8:15 AM', amount: '+₦25,000', type: 'credit' },
  { id: 'TX-9868', label: 'Trip with Amina Yusuf', date: 'Aug 24, 6:20 PM', amount: '-₦5,850', type: 'debit' },
];

export const suggestions = [
  { title: 'Jabi Lake Mall', subtitle: 'Plot 525, Abuja', icon: 'shopping-bag' },
  { title: 'Murtala Muhammed Airport', subtitle: 'Ikeja, Lagos', icon: 'send' },
  { title: 'Four Points by Sheraton', subtitle: 'Victoria Island, Lagos', icon: 'briefcase' },
  { title: 'The Palms Shopping Mall', subtitle: 'Lekki, Lagos', icon: 'shopping-bag' },
];

export const messages = [
  { id: '1', title: 'Draba Safety', body: 'Your trip with James is complete. How was your experience?', time: '10:49 AM', unread: true, icon: 'shield' },
  { id: '2', title: 'Payment receipt', body: 'Receipt for your trip to Victoria Island is ready.', time: '10:44 AM', unread: false, icon: 'file-text' },
  { id: '3', title: 'Welcome to Draba', body: 'Your verified driver marketplace is ready when you are.', time: 'Yesterday', unread: false, icon: 'heart' },
];