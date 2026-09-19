import { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Preloader from './components/layout/Preloader.jsx';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import Landing from './pages/Landing.jsx';
import Login from './pages/Login.jsx';

export default function App() {
  const [loaded, setLoaded] = useState(false);

  return (
    <>
      <Preloader onDone={() => setLoaded(true)} />
      {loaded && (
        <div className="min-h-screen bg-paper">
          <Routes>
            <Route
              path="/login"
              element={<Login />}
            />
            <Route
              path="*"
              element={
                <>
                  <Navbar />
                  <main>
                    <Routes>
                      <Route path="/" element={<Landing />} />
                      {/* Categories, Browse, Dashboard, Become-a-Lender, etc.
                          are the next slices to build on this scaffold. */}
                    </Routes>
                  </main>
                  <Footer />
                </>
              }
            />
          </Routes>
        </div>
      )}
    </>
  );
}
