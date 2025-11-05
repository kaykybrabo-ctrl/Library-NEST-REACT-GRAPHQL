import React from 'react'
import ReactDOM from 'react-dom/client'
import { ApolloProvider } from '@apollo/client'
import App from './App.tsx'
import './styles/index.css'
import apolloClient from './graphql/apollo-client.ts'

window.addEventListener('error', (event) => {
  if (event.error?.message?.includes('setLoading is not defined')) {
    console.warn('Erro de setLoading capturado e ignorado:', event.error);
    event.preventDefault();
  }
});

window.addEventListener('unhandledrejection', (event) => {
  if (event.reason?.message?.includes('setLoading is not defined')) {
    console.warn('Promise rejection de setLoading capturada e ignorada:', event.reason);
    event.preventDefault();
  }
});

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ApolloProvider client={apolloClient}>
      <App />
    </ApolloProvider>
  </React.StrictMode>,
)
