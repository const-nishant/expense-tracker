# Expense Tracker

A modern, minimal expense tracking application built with React, Vite, and Firebase.

## Features

- 🔐 User authentication with Firebase
- 💰 Expense tracking and categorization
- 📊 Budget management with visual progress bars
- 🔄 Recurring expenses management
- 📈 Reports and analytics with interactive charts
- 🎨 Dark/Light theme support
- 💱 Multi-currency support with real-time conversion
- 📱 Responsive design with minimal UI/UX
- 📤 Data export (CSV/JSON)

## Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Create a `.env` file in the root directory with your Firebase configuration:

   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## Firebase Setup

1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Enable Authentication (Email/Password)
3. Create a Firestore Database
4. Copy your configuration to the `.env` file

## Tech Stack

- **Frontend:** React 18, Vite
- **Backend:** Firebase (Auth + Firestore)
- **Styling:** Tailwind CSS + shadcn/ui
- **Charts:** Recharts
- **Icons:** Lucide React
- **State Management:** React Context API

## Project Structure

```
src/
├── components/          # Reusable UI components
├── context/            # React Context providers
├── firebase/           # Firebase configuration
├── hooks/              # Custom React hooks
├── pages/              # Application pages
├── services/           # External service integrations
├── utils/              # Utility functions
└── styles/             # Global styles
```

## Key Features

### Minimal UI/UX Design

- Clean, uncluttered interface
- Consistent spacing and typography
- Subtle animations and hover effects
- Mobile-first responsive design

### Smart Data Management

- Real-time data synchronization
- Offline support with local storage fallback
- Data validation and error handling
- Export functionality for data portability

### Advanced Analytics

- Interactive pie charts for category breakdown
- Monthly spending trends with bar charts
- Budget utilization tracking
- Custom date range filtering

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details
