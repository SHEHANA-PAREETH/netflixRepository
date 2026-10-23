import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import Footer from './components/Footer'
import Navbar from './components/Navbar'
import TitleModal from './components/TitleModal'
import { LibraryProvider } from './context/Library'
import { TitleModalProvider } from './context/TitleModal'
import { ToastProvider } from './context/Toast'
import Browse from './pages/Browse'
import Home from './pages/Home'
import MyList from './pages/MyList'
import NewPopular from './pages/NewPopular'
import NotFound from './pages/NotFound'
import Search from './pages/Search'

// a new page starts at the top (opening a title only changes the query string, so the position is kept)
function ScrollTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <LibraryProvider>
          <TitleModalProvider>
            <ScrollTop />
            <a className="skip" href="#main">Skip to content</a>
            <Navbar />
            <main id="main">
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/movies" element={<Browse type="movie" />} />
                  <Route path="/tv" element={<Browse type="tv" />} />
                  <Route path="/new" element={<NewPopular />} />
                  <Route path="/my-list" element={<MyList />} />
                  <Route path="/search" element={<Search />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </ErrorBoundary>
            </main>
            <Footer />
            <TitleModal />
          </TitleModalProvider>
        </LibraryProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
