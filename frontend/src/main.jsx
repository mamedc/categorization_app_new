import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { Provider } from "@/components/ui/provider"
import { Theme } from "@chakra-ui/react";

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Provider>
            <Theme appearance="light">
                <App />
            </Theme>
        </Provider>
    </StrictMode>,
)