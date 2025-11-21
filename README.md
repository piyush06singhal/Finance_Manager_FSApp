# Personal Finance App

A full-stack personal finance application built with Next.js 14, TypeScript, Tailwind CSS, and Supabase.

## Features

- **User Authentication**: Secure signup and login with Supabase Auth
- **Overview Dashboard**: View all financial data at a glance
- **Transactions Management**: Browse, search, sort, and filter transactions with pagination
- **Budget Tracking**: Create and manage budgets with visual progress indicators
- **Savings Pots**: Track savings goals with deposit/withdraw functionality
- **Recurring Bills**: Monitor monthly bills with status tracking
- **Responsive Design**: Fully responsive UI that works on all devices
- **Keyboard Navigation**: Complete keyboard accessibility
- **Advanced UI/UX**: Modern, clean interface with hover and focus states

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL database, Authentication, Row Level Security)
- **Icons**: Lucide React
- **Charts**: Recharts

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Supabase account and project

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd finance-app
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `supabase/schema.sql` in the Supabase SQL Editor
   - Copy your project URL and anon key

4. Create `.env.local` file:
```bash
cp .env.local.example .env.local
```

5. Add your Supabase credentials to `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

6. Run the development server:
```bash
npm run dev
```

7. Open [http://localhost:3000](http://localhost:3000) in your browser

## Database Setup

The application uses the following tables:
- `profiles` - User profiles
- `transactions` - Financial transactions
- `budgets` - Budget categories and limits
- `pots` - Savings pots/goals
- `recurring_bills` - Monthly recurring bills

All tables have Row Level Security (RLS) enabled to ensure users can only access their own data.

## Project Structure

```
finance-app/
├── src/
│   ├── app/              # Next.js app router pages
│   │   ├── auth/         # Authentication pages
│   │   ├── dashboard/    # Main dashboard
│   │   ├── transactions/ # Transactions page
│   │   ├── budgets/      # Budgets page
│   │   ├── pots/         # Savings pots page
│   │   └── recurring-bills/ # Bills page
│   ├── components/       # Reusable React components
│   ├── lib/             # Utilities and Supabase client
│   └── types/           # TypeScript type definitions
├── supabase/            # Database schema
└── public/              # Static assets
```

## Features in Detail

### Transactions
- Paginated view (10 per page)
- Search by name or category
- Sort by date, amount, or name
- Filter by category
- View transaction details

### Budgets
- Create budgets for different categories
- Visual progress bars
- View latest 3 transactions per category
- Track spending vs. budget limits
- Color-coded themes

### Pots (Savings)
- Set savings goals
- Add or withdraw money
- Track progress with visual indicators
- Multiple pots for different goals

### Recurring Bills
- Track monthly bills
- Automatic status updates (paid/due/upcoming)
- Search and sort functionality
- Summary of total bills by status

## Accessibility

- Full keyboard navigation support
- Focus states on all interactive elements
- ARIA labels for screen readers
- Semantic HTML structure
- Form validation with clear error messages

## License

MIT
