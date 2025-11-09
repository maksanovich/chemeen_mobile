import { router, usePathname } from 'expo-router';
import { useEffect } from 'react';
import { useNavigation } from '@react-navigation/native';

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
  const cleanRoute: any = currentRoute.split('?')[0];

  // Generic Master rules
  // master/<entity>/add or master/<entity>/[id] -> master/<entity>/list
  const masterAddOrEdit = cleanRoute.match(/^master\/([^/]+)\/(add|\[.*?\])$/);
  if (masterAddOrEdit) {
    const entity = masterAddOrEdit[1];
    return `master/${entity}/list`;
  }

  // master/<entity>/list -> master
  const masterList = cleanRoute.match(/^master\/([^/]+)\/list$/);
  if (masterList) {
    return 'master';
  }

  // Product root should go back to List tab
  if (cleanRoute === 'product' || cleanRoute === '/product') {
    return '/';
  }

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

// React hook: intercept back and navigate to logical parent
export const useLogicalBackOnExit = () => {
  const navigation: any = useNavigation();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e: any) => {
      // Only intercept actual back actions to avoid loops with replace/navigation
      const actionType = e?.data?.action?.type;
      if (actionType === 'GO_BACK' || actionType === 'POP' || actionType === 'POP_TO_TOP') {
        e.preventDefault();
        navigateBackWithFlow(pathname);
      }
      // For REPLACE/NAVIGATE actions, don't block
    });
    return unsubscribe;
  }, [navigation, pathname]);
};
