import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Easter Egg: A welcome message for developers in the console.
const consoleArt = `
███████╗████CAG╗██╗   ██╗███╗   ██╗███████╗██╗  ██╗
██╔════╝██╔══██╗██║   ██║████╗  ██║██╔════╝╚██╗██╔╝
█████╗  ███████║██║   ██║██╔██╗ ██║█████╗   ╚███╔╝ 
██╔══╝  ██╔══██║██║   ██║██║╚██╗██║██╔══╝   ██╔██╗ 
███████╗██║  ██║╚██████╔╝██║ ╚████║███████╗██╔╝ ██╗
╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═══╝╚══════╝╚═╝  ╚═╝
`;
console.log(consoleArt);
console.log('// EquiNex Universal Dashboard Initialized. Welcome, operative.');


const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);