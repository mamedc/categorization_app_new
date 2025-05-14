// File path: C:\Users\mamed\Meu Drive\Code\categorization_app_new\frontend\src\App.jsx
// App.jsx

import { useState } from "react";
import { Container, Stack } from "@chakra-ui/react";
import Navbar from "./components/ui/Navbar";
import TransactionsManagement from "./components/ui/TransactionsManagement";
import TagsManagement from "./components/ui/TagsManagement";
import ImportTransactions from "./components/import/ImportTransactions";
// Settings component does not need to be rendered conditionally here
// as its trigger is part of the Navbar

export const BASE_URL = "http://127.0.0.1:5000/api";

export default function App() {
    const [activeView, setActiveView] = useState('transactions');  // 'transactions', 'tags', 'import'
    const [transactions, setTransactions] = useState([]);
    const [selectedTransactionId, setSelectedTransactionId] = useState(null);
    //const [count, setCount] = useAtom(counterAtom);

    return (
        <Stack 
            minH="100vh" 
            //bg="#f9f9f4" // grid background color
            bg="#f4f4ec"
            spacing={0}>

            {/* 'activeView' and 'setActiveView' props to control Navbar style and set current activeView*/}
            <Navbar
                activeView={activeView}
                setActiveView={setActiveView}
            />

            {/* Conditional Rendering based on activeView */}
            {activeView === 'transactions' && (
                <TransactionsManagement
                    transactions={transactions}
                    setTransactions={setTransactions}
                    selectedTransactionId={selectedTransactionId}
                    setSelectedTransactionId={setSelectedTransactionId}
                />
            )}
            {activeView === 'tags' && (
                 <Container maxW="container.lg" pt={6} pb={8}>
                    <TagsManagement />
                 </Container>
            )}
            {activeView === 'import' && (
                 <Container maxW="container.lg" pt={6} pb={8}>
                    <ImportTransactions />
                 </Container>
            )}
            {/* Settings view is handled by the Settings component via its modal */}
            {/* No conditional rendering needed here for Settings */}
        </Stack>
    );
};