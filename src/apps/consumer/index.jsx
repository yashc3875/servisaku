import ReactDOM from 'react-dom/client';
import '@/index.css';
import { AppShell } from '@/lib/AppShell';
import ConsumerRoutes from './routes';

document.title = import.meta.env.VITE_APP_TITLE || 'ServisAku';

ReactDOM.createRoot(document.getElementById('root')).render(
  <AppShell>
    <ConsumerRoutes />
  </AppShell>
);
