import ReactDOM from 'react-dom/client';
import '@/index.css';
import { AppShell } from '@/lib/AppShell';
import PartnerRoutes from './routes';

document.title = import.meta.env.VITE_APP_TITLE || 'ServisAku Partner';

ReactDOM.createRoot(document.getElementById('root')).render(
  <AppShell>
    <PartnerRoutes />
  </AppShell>
);
