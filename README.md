# Task Board Frontend

A React-based frontend for the Task Board application built with modern technologies.

## Features

- **Authentication**: User registration and login
- **Dashboard**: View and create boards
- **Kanban Board**: Visual task management with columns and cards
- **Card Management**: Create, edit, and delete cards
- **Responsive Design**: Mobile-friendly interface
- **Real-time Updates**: Ready for Socket.io integration

## Technologies Used

- **React 18**: Latest React version with hooks
- **Vite**: Fast build tool and development server
- **Redux Toolkit**: State management with async thunks
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: Client-side routing
- **Axios**: HTTP client for API calls
- **Heroicons**: Beautiful SVG icons

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn
- Backend server running on `http://localhost:5000`

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` folder.

## Project Structure

```
src/
├── components/
│   ├── auth/          # Authentication components
│   ├── board/         # Board and card components
│   ├── dashboard/     # Dashboard component
│   └── ui/           # Reusable UI components
├── store/
│   ├── slices/        # Redux slices
│   └── index.js       # Store configuration
├── App.jsx            # Main application component
└── main.jsx          # Application entry point
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Backend Integration

The frontend expects a backend API running on `http://localhost:5000` with the following endpoints:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/boards` - Fetch user's boards
- `POST /api/boards` - Create new board
- `GET /api/boards/:id` - Fetch board by ID
- `POST /api/cards` - Create new card
- `PUT /api/cards/:id` - Update card
- `DELETE /api/cards/:id` - Delete card

## Future Enhancements

- **Drag and Drop**: Card reordering between columns
- **Real-time Collaboration**: Live updates using Socket.io
- **File Attachments**: Support for file uploads
- **Advanced Filtering**: Search and filter cards
- **Mobile App**: React Native version

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request


