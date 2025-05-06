
# Business Management System

A comprehensive business management system with customer relationship management, inventory management, service tracking, and sales capabilities.

## Project Overview

This business management system is built to streamline operations for businesses dealing with equipment sales, service, and management. The application provides a unified interface for managing customers, inventory, service calls, quotations, finance, reporting, and more.

## Features

### Dashboard
- Overview of key business metrics
- Recent service calls
- Revenue charts
- Top customers
- Upcoming tasks

### Customer Management
- Customer database with detailed profiles
- Customer follow-up scheduling
- Customer history tracking
- Machine ownership tracking
- Lead management pipeline

### Service Management
- Service call scheduling and tracking
- Engineer assignment and performance monitoring
- Service billing
- Service inventory management
- Rental machine tracking

### Inventory Management
- Complete inventory tracking system
- Multi-warehouse support
- Purchase management
- Sales recording
- Returns processing
- Stock transfer between locations
- Vendor management

### Sales & Quotations
- Quotation generation
- Purchase order management
- Contract upload and management
- Quotation products catalog
- Order history tracking

### Finance
- Revenue and expense tracking
- Department-based financial reporting
- Customer payments
- Outstanding receivables management

### Task Management
- Task assignment
- Task calendar
- Task prioritization
- Task filtering and organization

### User Management
- Role-based access control
- User permissions management
- Activity tracking

### Reports
- Customizable business reports
- Performance analytics
- Financial reporting
- Service metrics

### Communication
- Smart AI assistant integration
- Telegram bot integration
- Automated notifications

## Technical Stack

This project is built with:

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn-ui (based on Radix UI)
- **Styling**: Tailwind CSS
- **Routing**: React Router Dom
- **Database**: Supabase
- **Authentication**: Supabase Auth
- **Charts**: Recharts
- **Form Handling**: React Hook Form with Zod validation
- **State Management**: React Query (TanStack Query)
- **Icons**: Lucide React

## Project Structure

```
src/
├── App.tsx                     # Main application component
├── AppRoutes.tsx               # All application routes configuration
├── components/                 # Reusable UI components
│   ├── auth/                   # Authentication related components
│   ├── chat/                   # Smart assistant chat components
│   ├── customers/              # Customer management components
│   ├── dashboard/              # Dashboard components and widgets
│   ├── engineer/               # Engineer performance components
│   ├── finance/                # Finance management components
│   ├── inventory/              # Inventory management components
│   ├── layout/                 # Layout components (sidebar, header, etc.)
│   ├── providers/              # Context providers
│   ├── sales/                  # Sales components
│   ├── service/                # Service management components
│   ├── tasks/                  # Task management components
│   ├── telegram/               # Telegram bot integration components
│   └── ui/                     # Base UI components (shadcn)
├── contexts/                   # React contexts
│   ├── AuthContext.tsx         # Authentication context
│   ├── TaskContext.tsx         # Task management context
│   ├── TelegramContext.tsx     # Telegram integration context
│   └── VendorContext.tsx       # Vendor management context
├── data/                       # Mock data and data types
├── hooks/                      # Custom React hooks
├── integrations/               # External service integrations
│   └── supabase/               # Supabase client and types
├── lib/                        # Utility libraries
├── pages/                      # Page components
│   ├── customers/              # Customer-related pages
│   ├── finance/                # Finance-related pages
│   ├── inventory/              # Inventory-related pages
│   ├── locations/              # Location-specific pages
│   ├── reports/                # Report pages
│   ├── sales/                  # Sales-related pages
│   ├── service/                # Service-related pages
│   ├── tasks/                  # Task management pages
│   └── user-management/        # User management pages
├── services/                   # Service functions for API calls
├── types/                      # TypeScript type definitions
└── utils/                      # Utility functions
    ├── chatCommands/           # Chat command processors
    ├── finance/                # Finance utilities
    ├── langchain/              # Language AI utilities
    ├── pdf/                    # PDF generation utilities
    ├── rbac/                   # Role-based access control
    ├── serviceDataUtils.ts     # Service data utilities
    └── sidebar/                # Sidebar configuration utilities
```

## Routes Structure

The application includes the following main routes:

- `/` - Home/Index
- `/login` - User login
- `/register` - User registration
- `/dashboard` - Main dashboard
- `/customers` - Customer list
- `/customer/:id?` - Customer form (new/edit)
- `/customers/follow-ups` - Customer follow-up reminders
- `/tasks` - Task dashboard
- `/service` - Service management
- `/engineer-performance` - Engineer performance dashboard
- `/service-billing` - Service billing management
- `/service-inventory` - Service inventory management
- `/rental-machines` - Rental machines management
- `/inventory/*` - Inventory management (various sub-routes)
- `/quotations` - Quotation management
- `/quotation-form` - Quotation form
- `/purchase-orders` - Purchase order management
- `/sent-orders` - Sent orders
- `/sent-quotations` - Sent quotations
- `/order-history` - Order history
- `/quotation-products` - Quotation products catalog
- `/contract-upload` - Contract upload
- `/finance/*` - Finance management (various sub-routes)
- `/reports/*` - Reports (various sub-routes)
- `/user-management` - User management
- `/smart-assistant` - AI assistant
- `/telegram-admin` - Telegram bot administration
- `/settings` - System settings

## Access Control

The system uses role-based access control with the following permissions:

- CRM (Customer Relationship Management)
- Service Calls
- Inventory Management
- Quotation Management
- Task System
- Reports Access
- Finance Access
- Administrative Functions

## Getting Started

### Prerequisites
- Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

### Installation

```sh
# Step 1: Clone the repository
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies
npm i

# Step 4: Start the development server
npm run dev
```

### Deployment

To deploy this project:

1. Open [Lovable](https://lovable.dev/projects/5bc22dee-b513-4bb0-8c85-f6d387c3a3bc) 
2. Click on Share -> Publish

### Custom Domain Setup

You can connect a custom domain to your Lovable project:

1. Navigate to Project > Settings > Domains in Lovable
2. Click Connect Domain and follow the instructions

## Contributing

1. Make your changes
2. Commit to the repository
3. Or use Lovable's interface to modify the code

## License

This project is licensed under proprietary terms - see the LICENSE file for details.
