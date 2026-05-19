import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PublicLayout from './views/layouts/PublicLayout';
import PrivateLayout from './views/layouts/PrivateLayout';
import LoginPage from './views/pages/auth/LoginPage';
import RecoverPage from './views/pages/auth/RecoverPage';
import DashboardPage from './views/pages/dashboard/DashboardPage';
import UserListPage from './views/pages/users/UserListPage';
import UserFormPage from './views/pages/users/UserFormPage';
import ProductListPage from './views/pages/products/ProductListPage';
import ProductFormPage from './views/pages/products/ProductFormPage';
import InventoryPage from './views/pages/products/InventoryPage';
import PosPage from './views/pages/sales/PosPage';
import SalesHistoryPage from './views/pages/sales/SalesHistoryPage';
import ConfigPage from './views/pages/config/ConfigPage';
import CategoryListPage from './views/pages/categories/CategoryListPage';
import SupplierListPage from './views/pages/suppliers/SupplierListPage';
import AttendancePage from './views/pages/attendance/AttendancePage';
import ProtectedRoute from './views/components/ProtectedRoute';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/recover" element={<RecoverPage />} />
          </Route>

          <Route
            element={
              <ProtectedRoute>
                <PrivateLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />

            <Route path="/users" element={<UserListPage />} />
            <Route path="/users/new" element={<UserFormPage />} />
            <Route path="/users/:id/edit" element={<UserFormPage />} />

            <Route path="/products" element={<ProductListPage />} />
            <Route path="/products/new" element={<ProductFormPage />} />
            <Route path="/products/:id/edit" element={<ProductFormPage />} />
            <Route path="/inventory" element={<InventoryPage />} />

            <Route path="/categories" element={<CategoryListPage />} />
            <Route path="/suppliers" element={<SupplierListPage />} />
            <Route path="/attendance" element={<AttendancePage />} />

            <Route path="/sales" element={<PosPage />} />
            <Route path="/sales/history" element={<SalesHistoryPage />} />

            <Route path="/config" element={<ConfigPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
