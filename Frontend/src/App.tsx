import { Navigate, Route, Routes } from 'react-router';
import Home from './Pages/Home.tsx';
import Registration from './Pages/Registration.tsx';
import Login from './Pages/Login.tsx';
import Call from './Pages/Call.tsx';
import Notification from './Pages/Notification.tsx';
import Onboarding from './Pages/Onboarding.tsx';
import ChatPage from './Pages/ChatPage.tsx';
import Friends from './Pages/Friends.tsx';
import { Toaster } from 'react-hot-toast';
import PageLoader from './Components/Loader.tsx';
import useGetAuthUser from './hooks/useGetAuthUser.ts';
import { AuthLayout } from './Layouts/AuthLayout.tsx';
import { useThemeStore } from './store/useThemeStore.ts';

const App = () => {
  const { isLoading, authUser } = useGetAuthUser();
  const { theme } = useThemeStore();
  const isAuthenticated = Boolean(authUser);
  const isOnboarded = authUser?.isOnboarded;

  if (isLoading)
    return (<PageLoader />)

  return (
    <div className="h-screen" data-theme={theme}>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated && isOnboarded
              ? <AuthLayout showSideBar={true} >
                <Home />
              </AuthLayout>
              : <Navigate to={!isAuthenticated ? "/login" : '/onboarding'} />
          }
        />
        <Route
          path="/friends"
          element={
            isAuthenticated && isOnboarded
              ? <AuthLayout showSideBar={true} >
                <Friends />
              </AuthLayout>
              : <Navigate to={!isAuthenticated ? "/login" : '/onboarding'} />
          }
        />
        <Route
          path="/register"
          element={!isAuthenticated ? <Registration /> : <Navigate to="/" />}
        />
        <Route
          path="/login"
          element={!isAuthenticated ? <Login /> : <Navigate to="/" />}
        />
        <Route
          path="/notifications"
          element={isAuthenticated && isOnboarded ? <Notification /> : <Navigate to="/login" />}
        />
        <Route
          path="/call/:id"
          element={
            isAuthenticated && isOnboarded
              ? <AuthLayout showSideBar={false} >
                <Call />
              </AuthLayout>
              : <Navigate to={!isAuthenticated ? "/login" : '/onboarding'} />
          }
        />
        <Route
          path="/onboarding"
          element={
            isAuthenticated && !isOnboarded ? (
              <Onboarding />
            ) : (
              <Navigate to="/login" />
            )
          }
        />
        <Route
          path="/chats/:id"
          element={
            isAuthenticated && isOnboarded
              ? <AuthLayout showSideBar={false} >
                <ChatPage />
              </AuthLayout>
              : <Navigate to={!isAuthenticated ? "/login" : '/onboarding'} />
          }
        />
      </Routes>

      <Toaster />
    </div>
  );
}

export default App