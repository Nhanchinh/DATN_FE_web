import { AuthProvider } from '@/context';
import { AppRouter } from '@/routes';
import '@/assets/styles/global.css';

/**
 * App Component - Component gốc của ứng dụng
 * 
 * Cấu trúc:
 * - AuthProvider: Cung cấp context authentication cho toàn app
 * - AppRouter: Xử lý routing
 */
function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
