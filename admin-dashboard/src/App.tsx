import { Navigate, Route, Routes } from 'react-router-dom';
import { RequireAuth } from './auth/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Overview from './pages/Overview';
import Users from './pages/Users';
import Orders from './pages/Orders';
import Stories from './pages/Stories';
import Destinations from './pages/Destinations';
import Events from './pages/Events';
import Products from './pages/Products';
import Artisans from './pages/Artisans';
import Businesses from './pages/Businesses';
import Learning from './pages/Learning';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route path="/" element={<Overview />} />
        <Route path="/users" element={<Users />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/stories" element={<Stories />} />
        <Route path="/destinations" element={<Destinations />} />
        <Route path="/events" element={<Events />} />
        <Route path="/products" element={<Products />} />
        <Route path="/artisans" element={<Artisans />} />
        <Route path="/businesses" element={<Businesses />} />
        <Route path="/learning" element={<Learning />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
