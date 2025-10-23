
// Route configuration with protection status
export interface RouteConfig {
  path: string;
  isProtected: boolean;
  title?: string;
}

export const ROUTES: RouteConfig[] = [
  // Public routes (no sidebar)
  {
    path: '/',
    isProtected: false,
    title: 'Landing',
  },
  {
    path: '/signup',
    isProtected: false,
    title: 'Sign Up',
  },
  {
    path: '/signin',
    isProtected: false,
    title: 'Sign In',
  },
  {
    path: '/forbidden',
    isProtected: false,
    title: 'Forbidden',
  },
  {
    path: '/unauthorized',
    isProtected: false,
    title: 'Unauthorized',
  },
  {
    path: '/not-found',
    isProtected: false,
    title: 'Not Found',
  },
  {
    path: '/spinner',
    isProtected: false,
    title: 'Loading',
  },
  // Protected routes (with sidebar)
  {
    path: '/dashboard',
    isProtected: true,
    title: 'Dashboard',
  },
  {
    path: '/api-keys',
    isProtected: true,
    title: 'API Keys',
  },
  {
    path: '/usage',
    isProtected: true,
    title: 'Usage Analytics',
  },
  {
    path: '/pdf-tester',
    isProtected: true,
    title: 'PDF Tester',
  },
  {
    path: '/api-docs',
    isProtected: true,
    title: 'API Documentation',
  },
  {
    path: '/api-docs/javascript',
    isProtected: true,
    title: 'JavaScript Examples',
  },
  {
    path: '/api-docs/python',
    isProtected: true,
    title: 'Python Examples',
  },
  {
    path: '/api-docs/go',
    isProtected: true,
    title: 'Go Examples',
  },
  {
    path: '/api-docs/java',
    isProtected: true,
    title: 'Java Examples',
  },
  {
    path: '/plans',
    isProtected: true,
    title: 'Plans',
  },
  {
    path: '/admin',
    isProtected: true,
    title: 'Admin Dashboard',
  },
];

// Helper funct
export const getRouteConfig = (path: string): RouteConfig | undefined => {
  // First, check for an exact match.
  const exactMatch = ROUTES.find(route => route.path === path);
  if (exactMatch) {
    return exactMatch;
  }
 
  // If no exact match, check for dynamic routes.
  // A dynamic route path would be like '/demo/:id'
  // The provided 'path' would be like '/demo/1'
  const pathSegments = path.split('/'); 
  return ROUTES.find(route => {
    const routeSegments = route.path.split('/');
    if (routeSegments.length !== pathSegments.length) {
      return false; 
    }
 
    // Check if the route is a dynamic one
    return routeSegments.every((segment, index) => {
      // If the segment is a parameter (starts with ':') or an exact match, it's a valid part of the route.
      return segment.startsWith(':') || segment === pathSegments[index];
    });
  });
};
export const isProtectedRoute = (path: string): boolean => {
  const route = getRouteConfig(path);
  return route?.isProtected ?? false;
};

export const shouldShowSidebar = (path: string): boolean => {
  const route = getRouteConfig(path);
  return route?.isProtected ?? false;
}; 