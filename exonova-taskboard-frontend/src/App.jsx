import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "./App.css";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import SignUp from "./pages/SignUp";
import BoardView from "./pages/BoardView";

function App() {
  //get user from store
  const user = useSelector((state) => state.auth.user);
  return (
    <>
      <Routes>
        <Route
          path="/"
          element={user ? <Dashboard /> : <Navigate to="/login" />}
        />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/board/:id" element={<BoardView />} />
      </Routes>
    </>
  );
}

export default App;
