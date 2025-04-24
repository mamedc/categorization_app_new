import { useAtom } from "jotai";
import { doubledCounterAtom } from "../../context/atoms";
import { Button } from "@chakra-ui/react";

export default function DoubleCounter ({}) {

    const [doubledCounter] = useAtom(doubledCounterAtom);

    return (
        <>
            {doubledCounter}
        </>
    );
};