import { Routes, Route } from "react-router";
import ProfilePage from "./components/pages/ProfilePage";
import LoginPage from "./components/pages/LoginPage";
import RequireAuth from "./components/RequiredAuth";
import SignupPage from "./components/pages/SignupPage";
import AuthLayout from "./components/AuthLayout";

function App() {
  return (
    <Routes>
      <Route element={<AuthLayout />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
      </Route>
      <Route element={<RequireAuth />}>
        <Route path="/" element={<ProfilePage />} />
      </Route>
    </Routes>
  );
}

export default App;
