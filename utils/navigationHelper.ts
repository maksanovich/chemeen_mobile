import { router } from 'expo-router';

// Define the logical navigation flow
export const NAVIGATION_FLOW: any = {
  // Main flows
  'document': ['productList'],
  'productList': ['productEdit', 'productCreate'],
  'productEdit': ['productList'],
  'productCreate': ['productList'],

  // Product sub-flows
  'product': ['productList'],
  'product/item/create': ['product'],
  '/product/item/edit': ['product'],
  'product/codeList/create': ['product'],
  '/product/codeList/edit': ['product'],
  'product/elisa/create': ['product'],
  '/product/elisa/edit': ['product'],

  // Master flows
  'master': ['document'],
  'master/bank/list': ['master'],
  'master/company/list': ['master'],
  'master/port/list': ['master'],
  'master/PRSG/list': ['master'],
  'master/PRS/list': ['master'],
  'master/PRSP/list': ['master'],
  'master/PRSPS/list': ['master'],
  'master/PRSPW/list': ['master'],
  'master/PRSPWS/list': ['master'],
  'master/PRST/list': ['master'],
  'master/PRSV/list': ['master'],
  'master/test/list': ['master'],
  'master/testParams/list': ['master'],
};

// Get the logical back route for a given current route
export const getLogicalBackRoute = (currentRoute: string): string | null => {
  // Remove query parameters and dynamic segments for matching
  const cleanRoute: any = currentRoute.split('?')[0].replace(/\/\[.*?\]/g, '');

  // Check if we have a defined flow for this route
  if (NAVIGATION_FLOW[cleanRoute]) {
    const backRoutes: any = NAVIGATION_FLOW[cleanRoute];
    return backRoutes[0]; // Return the first (primary) back route
  }

  // Fallback: try to match partial routes
  for (const [route, backRoutes] of Object.entries(NAVIGATION_FLOW)) {
    if (cleanRoute.startsWith(route)) {
      return (backRoutes as string[])[0];
    }
  }

  return null;
};

// Navigate with logical flow instead of history
export const navigateWithFlow = (route: string, replace: boolean = false) => {
  if (replace) {
    router.replace(route as any);
  } else {
    router.navigate(route as any);
  }
};

// Navigate back with logical flow
export const navigateBackWithFlow = (currentRoute: string) => {
  const backRoute = getLogicalBackRoute(currentRoute);

  if (backRoute) {
    router.replace(backRoute as any);
  } else {
    // Fallback to default back behavior
    router.back();
  }
};

// Check if a route should use replace instead of navigate
export const shouldUseReplace = (fromRoute: string, toRoute: string): boolean => {
  // Use replace for these patterns to avoid stack buildup
  const replacePatterns = [
    // After successful create/edit operations
    /create.*edit$/,
    /edit.*list$/,
    /add.*list$/,
    // Master list navigation
    /master\/.*\/list$/,
  ];

  return replacePatterns.some(pattern => pattern.test(toRoute));
};
