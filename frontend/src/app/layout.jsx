import '../styles/globals.css';
import { AuthProvider } from '../contexts/AuthContext';
import { ThemeProvider } from '../contexts/ThemeContext';
import { ToastProvider } from '../contexts/ToastContext';

export const metadata = { title: "PulseAI Dashboard" };

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <ThemeProvider>
          <ToastProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
