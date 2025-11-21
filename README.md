# Finance Manager

A full-stack personal finance management application built with Next.js 14, TypeScript, Tailwind CSS, and Supabase. Track budgets, manage transactions, set savings goals, and monitor recurring bills with secure authentication.

## Features

- **Secure Authentication** - Sign up/login with email and password, 2FA support
- **Budget Management** - Create and track spending limits by category
- **Transaction Tracking** - Record income and expenses with search and filtering
- **Savings Goals (Pots)** - Set financial targets and monitor progress
- **Recurring Bills** - Track monthly bills with status monitoring
- **Profile Management** - Update personal information, change password, export data
- **Responsive Design** - Optimized for mobile, tablet, and desktop
- **Data Persistence** - All data securely stored in Supabase with Row Level Security

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Authentication, RLS)
- **Icons**: Lucide React
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/piyush06singhal/Finance_Manager_FSApp.git
cd Finance_Manager_FSApp
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
# Create .env.local file
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. Set up Supabase database:
   - Create a project at [supabase.com](https://supabase.com)
   - Run the SQL schema from `supabase/schema.sql` in the SQL Editor

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── auth/         # Authentication pages
│   │   ├── dashboard/    # Dashboard
│   │   ├── budgets/      # Budget management
│   │   ├── pots/         # Savings goals
│   │   ├── transactions/ # Transaction tracking
│   │   ├── recurring-bills/ # Bill management
│   │   └── profile/      # User profile
│   ├── components/       # Reusable components
│   ├── lib/              # Utilities and Supabase client
│   └── types/            # TypeScript type definitions
├── supabase/             # Database schema and migrations
└── public/               # Static assets
```

## Database Schema

- **profiles** - User information
- **budgets** - Budget categories and spending limits
- **pots** - Savings goals and targets
- **transactions** - Income and expense records
- **recurring_bills** - Monthly bill tracking

All tables are protected with Row Level Security (RLS) policies.

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### Configure Supabase

Add your Vercel deployment URL to Supabase:
- Go to Authentication → URL Configuration
- Add your Vercel URL to Site URL and Redirect URLs

## License

MIT

## Author

**Piyush Singhal**

- LinkedIn: [piyush--singhal](https://www.linkedin.com/in/piyush--singhal/)
- GitHub: [piyush06singhal](https://github.com/piyush06singhal)
- Twitter: [@PiyushS07508112](https://x.com/PiyushS07508112)
- Email: piyush.singhal.2004@gmail.com

---

Built with Next.js, TypeScript, and Supabase
