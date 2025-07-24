import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { EditorPage } from './components/pages/EditorPage'
import { SharedPage } from './components/pages/SharedPage'
import { ThemeProvider } from './components/ThemeProvider'

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/shared/:token" element={<SharedPage />} />
          <Route path="/" element={
            <div className="min-h-screen flex flex-col bg-background">
              <Header />
              <div className="flex-1 flex">
                <Sidebar />
                <EditorPage />
              </div>
            </div>
          } />
        </Routes>
      </Router>
    </ThemeProvider>
  )
}

export default App