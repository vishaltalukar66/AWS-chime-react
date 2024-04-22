import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import { darkTheme, GlobalStyles, lightTheme, MeetingProvider } from 'amazon-chime-sdk-component-library-react'
import { ThemeProvider } from 'styled-components';
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ThemeProvider theme={darkTheme}>
      <GlobalStyles />
      <MeetingProvider>

        <App />

      </MeetingProvider>
    </ThemeProvider>
  </React.StrictMode>,
)
