import { Helmet, HelmetProvider } from 'react-helmet-async';
import { RouterProvider } from 'react-router-dom';

import { ThemeProvider } from './components/theme-provider';
import { AuthProvider } from './context/AuthContext';
import { router } from './router';

export default function App() {
  return (
    <ThemeProvider defaultTheme="light" storageKey="maestro">
      <HelmetProvider>
        <Helmet>
          <title>HelpLine</title>
          <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
          <link rel="icon" type="image/png" sizes="32x32" href="/images/logo.png" />
          <link rel="apple-touch-icon" href="/images/logo.png" />
          <link rel="manifest" href="/site.webmanifest" />
        </Helmet>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </HelmetProvider>
    </ThemeProvider>
  );
}
