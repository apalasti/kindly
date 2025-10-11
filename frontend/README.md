# Kindly Frontend

A React + TypeScript + Vite application for the Kindly platform, connecting help seekers with volunteers.

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Chakra UI** - Component library
- **React Router** - Client-side routing
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Axios** - HTTP client
- **TanStack Query** - Data fetching and caching
- **React Icons** - Icon library

## Project Structure

```
frontend/
├── public/                 # Static assets
├── src/
│   ├── assets/            # Build-time assets (images, fonts)
│   ├── components/        # Reusable components (to be added)
│   ├── hooks/             # Custom React hooks (to be added)
│   ├── pages/             # Page components
│   │   └── RegisterPage.tsx
│   ├── services/          # API services
│   │   ├── api.ts         # Axios instance
│   │   └── auth.service.ts
│   ├── theme/             # Chakra UI theme
│   │   └── index.ts
│   ├── types/             # TypeScript types
│   │   ├── api.types.ts
│   │   ├── user.types.ts
│   │   └── index.ts
│   ├── utils/             # Utility functions
│   │   └── validators.ts
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── .env.example           # Environment variables template
├── .env.local             # Local environment variables
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── tsconfig.node.json
└── vite.config.ts
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Copy environment variables:
```bash
cp .env.example .env.local
```

3. Update `.env.local` with your API URL:
```
VITE_API_BASE_URL=http://localhost:3000/api/v1
```

### Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Features Implemented

### Registration Page

- **Animated Role Switcher**: Toggle between Help Seeker and Volunteer registration with smooth color transitions
- **Form Validation**: Client-side validation using Zod schema
- **Responsive Design**: Mobile-friendly layout
- **Custom Theme**: Brand colors from logo integrated throughout
- **Error Handling**: User-friendly error messages

### Color Palette

- **Primary (Dark Gray)**: #3D4248
- **Teal**: #66B2B0
- **Coral**: #EE9D83
- **Cream**: #F4FEC1
- **Yellow**: #F7F0AE
- **Error Red**: #9A031E
- **Success Green**: #B4E33D

### API Integration

- Axios instance with interceptors
- JWT token management
- Automatic token refresh handling
- Error handling and user feedback

## Path Aliases

The project uses path aliases for cleaner imports:

- `@/*` - src directory
- `@components/*` - components directory
- `@pages/*` - pages directory
- `@services/*` - services directory
- `@types/*` - types directory
- `@utils/*` - utils directory
- `@hooks/*` - hooks directory
- `@theme/*` - theme directory

Example:
```typescript
import { RegisterPage } from '@pages/RegisterPage';
import { authService } from '@services/auth.service';
```

## Next Steps

1. Create Login page
2. Implement Dashboard (role-based views)
3. Add protected routes
4. Create request management pages
5. Add profile management
6. Implement real-time notifications
7. Add map integration for location-based features

## API Endpoints

The frontend connects to the backend API at `/api/v1`. See `docs/api.md` for full API documentation.

## Contributing

1. Follow the existing code structure
2. Use TypeScript for type safety
3. Follow the component naming conventions
4. Write clean, modular code
5. Test your changes before committing
