import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import App from './App.tsx'
import './index.css'

// Log that the application is starting to help with debugging
console.log('Application is initializing...');

const rootElement = document.getElementById("root");

if (!rootElement) {
  console.error("Failed to find the root element. The page will not render.");
} else {
  try {
    const root = createRoot(rootElement);
    root.render(
      <StrictMode>
        <App />
      </StrictMode>
    );
    console.log('Application rendered successfully');
  } catch (error) {
    console.error('Failed to render the application:', error);
  }
}
