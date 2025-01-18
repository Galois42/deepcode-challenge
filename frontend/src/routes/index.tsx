import { RouterProvider, createRoutes, createReactRouter } from '@tanstack/react-router';
import { lazy } from 'react';

const Home = lazy(() => import('./Home'));
const About = lazy(() => import('./About'));

const routes = createRoutes([
  { path: '/', element: Home },
  { path: '/about', element: About },
]);

const router = createReactRouter({ routes });

function App() {
  return <RouterProvider router={router} />;
}

export default App;
