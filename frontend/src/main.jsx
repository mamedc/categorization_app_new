import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { Provider } from "@/components/ui/provider"
import { Theme } from "@chakra-ui/react";
import { ColorModeProvider } from "@/components/ui/color-mode"

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Provider>
            <ColorModeProvider forcedTheme="light">
                <Theme appearance="light">
                    <App />
                </Theme>
            </ColorModeProvider>
        </Provider>
    </StrictMode>,
)