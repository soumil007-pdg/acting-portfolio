import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import SideNav from './components/SideNav';
import Home from './pages/Home';
import Focus from './pages/Focus';
import Biography from './pages/Biography';
import Awards from './pages/Awards';
import DragonPage from './pages/DragonPage';
import DragonPlayground from './pages/DragonPlayground';
import Contact from './pages/Contact';

function ScrollToTop() {
  const { pathname } = useLocation();
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <SideNav />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/focus" element={<Focus />} />
        <Route path="/biography" element={<Biography />} />
        <Route path="/awards" element={<Awards />} />
        <Route path="/dragon" element={<DragonPage />} />
        <Route path="/dragon-playground" element={<DragonPlayground />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </BrowserRouter>
  );
}
