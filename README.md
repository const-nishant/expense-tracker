# Expense Tracker

A modern expense tracking application built with React, Vite, and Appwrite.

## Features

- User authentication with Appwrite
- Expense tracking and categorization
- Budget management
- Recurring expenses
- Reports and analytics
- Dark/Light theme support
- Multi-currency support

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Environment Configuration:**
   Create a `.env` file in the root directory with your Appwrite configuration:

   ```env
   VITE_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
   VITE_APPWRITE_PROJECT_ID=your-project-id-here
   VITE_APPWRITE_DATABASE_ID=your-database-id-here
   VITE_APPWRITE_TABLE_ID=your-table-id-here
   ```

   **Note:** If you don't have Appwrite set up yet, the app will automatically fall back to localStorage for development.

3. **Start the development server:**
   ```bash
   npm run dev
   ```

## Appwrite Setup

1. Create an account at [Appwrite Cloud](https://cloud.appwrite.io)
2. Create a new project
3. Copy your project ID and endpoint URL
4. Add them to your `.env` file

## Tech Stack

- **Frontend:** React 19, Vite
- **Backend:** Appwrite
- **Styling:** Tailwind CSS
- **Charts:** Recharts
- **Icons:** Lucide React

## React Compiler

The React Compiler is enabled on this template. See [this documentation](https://react.dev/learn/react-compiler) for more information.

Note: This will impact Vite dev & build performances.
