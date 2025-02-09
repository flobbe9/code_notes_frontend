import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { logErrorFiltered, logWarnFiltered } from './helpers/utils';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';


// useQuery config
export const useQueryClientObj = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnReconnect: false,
            refetchOnWindowFocus: false
        }
    }
});

const persister = createSyncStoragePersister({
    storage: localStorage
})

// hide some error messages
console.error = logErrorFiltered;
console.warn = logWarnFiltered;

// render root
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <PersistQueryClientProvider
        client={useQueryClientObj}
        persistOptions={{persister: persister}}
    >
        <App />
        
        <ReactQueryDevtools />
    </PersistQueryClientProvider>
);