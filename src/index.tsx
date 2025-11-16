import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister';
import { QueryClient } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';


// useQuery config
export const useQueryClientObj = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnReconnect: false,
            refetchOnWindowFocus: false,
            gcTime: 86400000 // 1 day
        }
    }
});

const persister = createSyncStoragePersister({
    storage: localStorage
})

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