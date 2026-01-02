import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './app.css'
import Routes from './routes'
import ScrollToTop from './components/ScrollToTop'
import { MetaProvider } from './components/MetaHead'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <MetaProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes />
      </BrowserRouter>
    </MetaProvider>
  </React.StrictMode>
)
