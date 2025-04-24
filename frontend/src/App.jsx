// App.jsx

import { useAtom } from "jotai";
import { useState } from "react";
import { Container, Stack, Button } from "@chakra-ui/react";
import Navbar from "./components/ui/Navbar";
import TransactionsManagement from "./components/ui/TransactionsManagement";
import TagsManagement from "./components/ui/TagsManagement";
import Counter from "./components/ui/Counter";
import UserInfo from "./components/ui/UserInfo";
import DoubleCounter from "./components/ui/DoubleCounter";
import { counterAtom } from "./context/atoms";

export const BASE_URL = "http://127.0.0.1:5000/api";

export default function App() {
    const [activeView, setActiveView] = useState('transactions');  // 'transactions' or 'tags'
    const [transactions, setTransactions] = useState([]);
    const [selectedTransactionId, setSelectedTransactionId] = useState(null);
    const [tagGroups, setTagGroups] = useState([]);
    const [selectedTagGroupId, setSelectedTagGroupId] = useState(null);
    
    const [count, setCount] = useAtom(counterAtom);

    return (
        <Stack minH="100vh" bg="#f9f9f4" spacing={0}>
            
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
                    <TagsManagement 
                        //tagGroups={tagGroups}
                        setTagGroups={setTagGroups}
                        selectedTagGroupId={selectedTagGroupId}
                        //setSelectedTagGroupId={setSelectedTagGroupId}
                    />
                 </Container>
            )}

            <div>
                <h1>{ count }</h1>
                <h1><DoubleCounter /></h1>
                <Counter />
                <UserInfo />
            </div>
        </Stack>
    );
};