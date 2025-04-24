import { useAtom } from "jotai";
import { loadableUserAtom } from "../../context/atoms";
// import { Button } from "@chakra-ui/react";

export default function UserInfo ({}) {

    const [user] = useAtom(loadableUserAtom);

    if (user.state === "hasError") return <h1>Error ocurred.</h1>;
    if (user.state === "loading") return <h1>Loading...</h1>;

    return (
        <div>
            <h1>User Info</h1>
            <p>Name: {user.data.name}</p>
            <p>Email: {user.data.email}</p>
        </div>
    );
};