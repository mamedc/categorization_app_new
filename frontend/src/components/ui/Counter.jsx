import { useAtom } from "jotai";
import { counterAtom } from "../../context/atoms";
import { Button } from "@chakra-ui/react";

export default function Counter ({}) {

    const [_, setCount] = useAtom(counterAtom);

    return (
        <>
            <Button onClick={() => setCount((prev) => prev + 1)}>Increment</Button>
            <Button onClick={() => setCount((prev) => prev - 1)}>Decrement</Button>
        </>
    );
};