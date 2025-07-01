# RestaurantSupply Frontend

A modern React/Next.js frontend application for restaurant supply management system.

## Features

### Authentication

- User login and registration
- Role-based access control (Admin/Worker)
- JWT token-based authentication
- Automatic token refresh and logout

### Admin Dashboard

- System overview with statistics
- User management
- Product management
- Order management
- PDF report generation

### Worker Dashboard

- Personal order history
- Create new orders
- Track order status
- Branch-specific functionality

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn UI
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: Sonner

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── admin/             # Admin-only pages
│   ├── worker/            # Worker-only pages
│   ├── login/             # Authentication pages
│   ├── register/
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── auth/             # Authentication components
│   ├── admin/            # Admin-specific components
│   ├── worker/           # Worker-specific components
│   ├── shared/           # Shared components
│   └── ui/               # Shadcn UI components
├── contexts/             # React contexts
│   └── AuthContext.tsx   # Authentication context
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
│   └── api.ts           # API client
└── types/                # TypeScript type definitions
    └── index.ts
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running on http://localhost:5000

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.example .env.local
```

Update `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

3. Run the development server:

```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## User Roles

### Admin

- Full system access
- User management (create, edit, delete users)
- Product management (add, edit, delete products)
- Order management (view, approve, reject orders)
- Generate PDF reports
- System statistics dashboard

### Worker

- Create and submit orders
- View own order history
- Track order status
- Branch-specific access

## Features Overview

### Authentication System

- Secure login/registration with form validation
- Role-based redirects after authentication
- Protected routes with automatic redirects
- Token management with automatic logout on expiry

### Dashboard Components

- Real-time statistics and metrics
- Quick action cards for common tasks
- Recent activity feeds
- Responsive design for mobile and desktop

### Order Management

- Multi-step order creation process
- Product search and selection
- Quantity and notes specification
- Order status tracking
- PDF export functionality

### Product Management (Admin)

- Product catalog with categories
- Inventory management
- Supplier information
- Product status management

### User Management (Admin)

- User creation and editing
- Role assignment
- Branch assignment
- User status management

## API Integration

The frontend communicates with the backend API through:

- RESTful API endpoints
- JWT token authentication
- Axios interceptors for token management
- Error handling and user feedback
- Loading states and optimistic updates

## UI/UX Features

- Modern, clean design with Tailwind CSS
- Responsive layout for all screen sizes
- Consistent component library with Shadcn UI
- Loading states and error handling
- Toast notifications for user feedback
- Form validation and error messages
- Accessible components with proper ARIA labels

## Development Guidelines

### Component Structure

- Functional components with TypeScript
- Props interfaces for type safety
- Consistent naming conventions
- Separation of concerns

### State Management

- React Context for global state (auth)
- Local state for component-specific data
- Custom hooks for reusable logic

### Styling

- Tailwind CSS utility classes
- Consistent spacing and colors
- Responsive design patterns
- Component-based styling

### Error Handling

- Try-catch blocks for async operations
- User-friendly error messages
- Graceful fallbacks for failed requests
- Loading states for better UX

## Environment Variables

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Follow the existing code style and patterns
2. Add TypeScript types for all new code
3. Test components thoroughly
4. Update documentation as needed
5. Follow the component structure guidelines

## Deployment

### Build for Production

```bash
npm run build
npm run start
```

### Environment Setup

- Set production API URL in environment variables
- Configure proper CORS settings on backend
- Set up SSL certificates for HTTPS
- Configure proper domain settings

## Security Considerations

- JWT tokens stored in localStorage (consider httpOnly cookies for production)
- API endpoints protected with authentication
- Role-based access control enforced
- Input validation on all forms
- XSS protection with proper escaping
- CSRF protection considerations

## Performance Optimizations

- Next.js automatic code splitting
- Image optimization with next/image
- Lazy loading of components
- Memoization where appropriate
- Efficient re-renders with proper dependencies

## Future Enhancements

- Real-time notifications with WebSockets
- Advanced filtering and search
- Bulk operations for admin
- Mobile app with React Native
- Advanced analytics and reporting
- Integration with external systems
