import UnAuthorizedPage from '@/modules/error/UnAuthorizedPage.tsx';
import { lazy, Suspense } from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import App from '../../App';
import Route from '../../components/Route';
import Spinner from '../../components/ui/Spinner';
const Signin = lazy(() => import('@/modules/auth/Signin.tsx'));
const Signup = lazy(() => import('@/modules/auth/Signup.tsx'));
const LandingPage = lazy(() => import('@/modules/LandingPage/LandingPage.tsx'));
const Dashboard = lazy(() => import('@/modules/Dashboard.tsx'));
const ApiKeysPage = lazy(() => import('@/modules/ApiKeysPage.tsx'));
const UsageAnalytics = lazy(() => import('@/modules/UsageAnalytics.tsx'));
const PdfTester = lazy(() => import('@/modules/PdfTester.tsx'));
const PlansPage = lazy(() => import('@/modules/PlansPage.tsx'));
const AdminDashboard = lazy(() => import('@/modules/AdminDashboard.tsx'));
const NotFoundPage = lazy(() => import('../../modules/error/NotFoundPage'));
const InternalServerError = lazy(() => import('../../modules/error/InternalServerError'));
const ForbiddenPage = lazy(() => import('../../modules/error/ForbiddenPage'))

const LoadingWrapper = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<div className="h-screen w-full flex items-center justify-center"><Spinner /></div>}>
    {children}
  </Suspense>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: (
      <LoadingWrapper>
        <InternalServerError />
      </LoadingWrapper>
    ),
    children: [
      {
        path: '/',
        element: (
          <LoadingWrapper>
            <Route isProtected={false}>
              <LandingPage />
            </Route>
          </LoadingWrapper>
        ),
      },
      {
        path: '/signin',
        element: (
          <LoadingWrapper>
            <Route isProtected={false}>
              <Signin />
            </Route>
          </LoadingWrapper>
        ),
      },
      {
        path: '/signup', 
        element: (
          <LoadingWrapper>
            <Route isProtected={false}>
              <Signup />
            </Route>
          </LoadingWrapper>
        ),
      },
      {
        path: '/dashboard',
        element: (
          <LoadingWrapper>
            <Route isProtected={true}>
              <Dashboard />
            </Route>
          </LoadingWrapper>
        ),
      },
      {
        path: '/api-keys',
        element: (
          <LoadingWrapper>
            <Route isProtected={true}>
              <ApiKeysPage />
            </Route>
          </LoadingWrapper>
        ),
      },
      {
        path: '/usage',
        element: (
          <LoadingWrapper>
            <Route isProtected={true}>
              <UsageAnalytics />
            </Route>
          </LoadingWrapper>
        ),
      },
      {
        path: '/pdf-tester',
        element: (
          <LoadingWrapper>
            <Route isProtected={true}>
              <PdfTester />
            </Route>
          </LoadingWrapper>
        ),
      },
      {
        path: '/plans',
        element: (
          <LoadingWrapper>
            <Route isProtected={true}>
              <PlansPage />
            </Route>
          </LoadingWrapper>
        ),
      },
      {
        path: '/admin',
        element: (
          <LoadingWrapper>
            <Route isProtected={true} requiredRole="ADMIN">
              <AdminDashboard />
            </Route>
          </LoadingWrapper>
        ),
      },
      {
        path: '/forbidden',
        element: (
          <LoadingWrapper>
            <Route isProtected={false}>
              <ForbiddenPage />
            </Route>
          </LoadingWrapper>
        ),
      },
      {
        path: '/unauthorized',
        element: (
          <LoadingWrapper>
            <Route isProtected={false}>
              <UnAuthorizedPage />
            </Route>
          </LoadingWrapper>
        ),
      },
      {
        path: '/spinner',
        element: (
          <LoadingWrapper>
            <Route isProtected={false}>
              <Spinner />
            </Route>
          </LoadingWrapper>
        ),
      },
      {
        path: '/not-found',
        element: (
          <LoadingWrapper>
            <Route isProtected={false}>
              <NotFoundPage />
            </Route>
          </LoadingWrapper>
        ),
      },
      {
        path: '*',
        element: (
          <LoadingWrapper>
            <Route isProtected={false}>
              <NotFoundPage />
            </Route>
          </LoadingWrapper>
        ),
      },
    ],
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;
