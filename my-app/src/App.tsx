import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './context/useAuth';
import TopProgressBar from './components/ui/TopProgressBar';
import LoadingState from './components/ui/LoadingState';
import LoginPage from './pages/LoginPage';
import DashboardLayout from './layouts/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import CatalogPage from './pages/CatalogPage';
import BookDetailPage from './pages/BookDetailPage';
import CategoriesPage from './pages/CategoriesPage';
import AuthorsPage from './pages/AuthorsPage';
import PublishersPage from './pages/PublishersPage';
import TagsPage from './pages/TagsPage';
import ReadersPage from './pages/ReadersPage';
import BorrowingPage from './pages/BorrowingPage';
import BorrowingCreatePage from './pages/borrowing/BorrowingCreatePage';
import BorrowingActivePage from './pages/borrowing/BorrowingActivePage';
import BorrowingReturnedPage from './pages/borrowing/BorrowingReturnedPage';
import BorrowingOverduePage from './pages/borrowing/BorrowingOverduePage';
import BorrowingRenewPage from './pages/borrowing/BorrowingRenewPage';
import BorrowingHistoryPage from './pages/borrowing/BorrowingHistoryPage';
import BorrowingStatsPage from './pages/borrowing/BorrowingStatsPage';
import ReservationsPage from './pages/ReservationsPage';
import ReportsPage from './pages/ReportsPage';
import UsersPage from './pages/UsersPage';
import RolesPage from './pages/RolesPage';
import SettingsPage from './pages/SettingsPage';
import FinesPage from './pages/FinesPage';
import SessionExpiredModal from './components/ui/SessionExpiredModal';

// Student Dashboard
import StudentLayout from './layouts/StudentLayout';
import StudentDashboardPage from './pages/userspage/StudentDashboardPage';
import StudentCatalogPage from './pages/userspage/StudentCatalogPage';
import StudentBookDetailPage from './pages/userspage/StudentBookDetailPage';
import StudentBorrowingsPage from './pages/userspage/StudentBorrowingsPage';
import StudentReservationsPage from './pages/userspage/StudentReservationsPage';
import StudentFinesPage from './pages/userspage/StudentFinesPage';
import StudentHistoryPage from './pages/userspage/StudentHistoryPage';
import StudentNotificationsPage from './pages/userspage/StudentNotificationsPage';
import StudentProfilePage from './pages/userspage/StudentProfilePage';
import StudentSettingsPage from './pages/userspage/StudentSettingsPage';

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) {
    // Redirect admin to /dashboard, user to /user
    return <Navigate to={user?.role === 'admin' ? '/dashboard' : '/user'} replace />;
  }
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  if (isLoading) return <LoadingState label="Đang khởi động..." minHeight="100vh" size="lg" />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role !== 'admin') return <Navigate to="/user" replace />;
  return <>{children}</>;
}

function UserRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, user, isLoading } = useAuth();
  if (isLoading) return <LoadingState label="Đang khởi động..." minHeight="100vh" size="lg" />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.role === 'admin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <TopProgressBar />
          <Routes>
            <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<SessionExpiredModal />} />

            {/* Admin Dashboard */}
            <Route path="/dashboard" element={<AdminRoute><DashboardLayout /></AdminRoute>}>
              <Route index element={<DashboardPage />} />
              <Route path="catalog" element={<CatalogPage />} />
              <Route path="book-details" element={<BookDetailPage />} />
              <Route path="categories" element={<CategoriesPage />} />
              <Route path="authors" element={<AuthorsPage />} />
              <Route path="publishers" element={<PublishersPage />} />
              <Route path="tags" element={<TagsPage />} />
              <Route path="readers" element={<ReadersPage />} />
              <Route path="borrowing" element={<BorrowingPage />} />
              <Route path="borrowing/create" element={<BorrowingCreatePage />} />
              <Route path="borrowing/active" element={<BorrowingActivePage />} />
              <Route path="borrowing/returned" element={<BorrowingReturnedPage />} />
              <Route path="borrowing/overdue" element={<BorrowingOverduePage />} />
              <Route path="borrowing/renew" element={<BorrowingRenewPage />} />
              <Route path="borrowing/history" element={<BorrowingHistoryPage />} />
              <Route path="borrowing/stats" element={<BorrowingStatsPage />} />
              <Route path="reservations" element={<ReservationsPage />} />
              <Route path="fines" element={<FinesPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="roles" element={<RolesPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>

            {/* User Dashboard */}
            <Route path="/user" element={<UserRoute><StudentLayout /></UserRoute>}>
              <Route index element={<StudentDashboardPage />} />
              <Route path="catalog" element={<StudentCatalogPage />} />
              <Route path="books/:id" element={<StudentBookDetailPage />} />
              <Route path="borrowings" element={<StudentBorrowingsPage />} />
              <Route path="reservations" element={<StudentReservationsPage />} />
              <Route path="fines" element={<StudentFinesPage />} />
              <Route path="history" element={<StudentHistoryPage />} />
              <Route path="notifications" element={<StudentNotificationsPage />} />
              <Route path="profile" element={<StudentProfilePage />} />
              <Route path="settings" element={<StudentSettingsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
