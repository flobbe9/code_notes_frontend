import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './components/App';
import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'


// useQuery config
const client = new QueryClient();

const persister = createSyncStoragePersister({
    storage: localStorage
})


// render root
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(
    <PersistQueryClientProvider
        client={client}
        persistOptions={{persister: persister}}
    >
        <App />
    </PersistQueryClientProvider>
);