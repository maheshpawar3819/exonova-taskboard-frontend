import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { useEffect } from 'react';
import store from './store';
import { useDispatch, useSelector } from 'react-redux';
import { setUser, getCurrentUser } from './store/slices/authSlice';

// Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import Dashboard from './components/dashboard/Dashboard';
import Board from './components/board/Board';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Notification from './components/ui/Notification';
import CardDetailsModal from './components/board/CardDetailsModal';

function AppContent() {
  const dispatch = useDispatch();
  const { isAuthenticated, user, token } = useSelector((state) => state.auth);
  const { notification } = useSelector((state) => state.ui);

  useEffect(() => {
    // Check if user is logged in on app start
    if (token && !user) {
      dispatch(getCurrentUser());
    }
  }, [dispatch, token, user]);

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {notification && <Notification />}
        <CardDetailsModal />
        
        <Routes>
          <Route 
            path="/login" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />} 
          />
          <Route 
            path="/register" 
            element={isAuthenticated ? <Navigate to="/dashboard" /> : <Register />} 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/board/:boardId" 
            element={
              <ProtectedRoute>
                <Board />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/" 
            element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

export default App;
