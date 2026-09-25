import { Outlet } from 'react-router-dom';
import { Header } from '@/components/shared/Header';
import { Footer } from '@/components/shared/Footer';

export function CitizenLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <Header />
      <main id="main-content" className="mx-auto w-full max-w-2xl flex-1 px-6 py-10" tabIndex={-1}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
