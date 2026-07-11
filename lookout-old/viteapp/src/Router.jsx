import { ScrollToTop } from '@/lib/scroll-to-top';
import { createBrowserRouter, Navigate, Outlet, RouterProvider } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import CommunityPage from '@/pages/Community';
import PastEventsPage from '@/pages/PastEvents';

const HomePage = lazy(() => import('@/pages/HomePage'));

import Login from '@/components/onboarding/Login';
import AuthSignup from '@/components/onboarding/AuthSignup';
import ResetPassword from '@/components/onboarding/ResetPassword';
import VerifyEmail from '@/components/onboarding/VerifyEmail';
import Questionnaire from '@/components/onboarding/Questionnaire';
import Chat from '@/pages/Chat';
import ProtectedRoute from '@/components/ProtectedRoute';

const Loading = () => <div className="flex items-center justify-center min-h-screen">Loading...</div>;

function LayoutWithHeader() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}

function LayoutNoHeader() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
    </>
  );
}

const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Suspense fallback={<Loading />}>
        <LayoutWithHeader />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: "*",
        element: <Navigate to="/" replace />,
      },
    ],
  },
  {
    path: "/community",
    element: (
      <Suspense fallback={<Loading />}>
        <LayoutNoHeader />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: <CommunityPage />,
      },
    ],
  },
  {
    path: "/past-events",
    element: (
      <Suspense fallback={<Loading />}>
        <LayoutNoHeader />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: <PastEventsPage />,
      },
    ],
  },
  {
    path: "/login",
    element: (
      <Suspense fallback={<Loading />}>
        <LayoutNoHeader />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: <Login />,
      },
    ],
  },
  {
    path: "/signup",
    element: (
      <Suspense fallback={<Loading />}>
        <LayoutNoHeader />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: <AuthSignup />,
      },
    ],
  },
  {
    path: "/reset-password/:token",
    element: (
      <Suspense fallback={<Loading />}>
        <LayoutNoHeader />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: <ResetPassword />,
      },
    ],
  },
  {
    path: "/verify",
    element: (
      <Suspense fallback={<Loading />}>
        <LayoutNoHeader />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: <VerifyEmail />,
      },
    ],
  },
  {
    path: "/onboarding",
    element: (
      <Suspense fallback={<Loading />}>
        <LayoutNoHeader />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: <Questionnaire />,
      },
    ],
  },
  {
    path: "/create",
    element: (
      <Suspense fallback={<Loading />}>
        <LayoutNoHeader />
      </Suspense>
    ),
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <Chat />
          </ProtectedRoute>
        ),
      },
    ],
  },
  {
    path: "/write-post",
    element: <Navigate to="/login" replace />,
  },
]);

export default function AppRouter() {
  return (
    <RouterProvider router={router} />
  );
}
