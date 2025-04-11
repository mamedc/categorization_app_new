import { Grid, Flex, Spinner, Text } from "@chakra-ui/react";
import UserCard from "./UserCard";
import { useEffect, useState } from "react"; 
import { BASE_URL } from "../../App"

// When we run this component, we would like to send a request. We can do this with the help of 'useEffect'
// useEffect Hook for managing side effects (like data fetching) 
// useState Hook for managing local component state (like the loading state).

const UserGrid = ({ users, setUsers }) => {
// Defines a functional component named UserGrid. It receives two props:
// users: An array of user objects passed down from the parent component. This is what will be displayed in the grid.
// setUsers: A function used to update the users array.
    
    // Initializes a state variable isLoading to true. 
    // This is used to track whether the data is currently being fetched. 
    // It will likely be used to display a loading indicator to the user.
    const [isLoading, setIsLoading] = useState(true); 
    
    // useEffect(() => { ... }, [setUsers]);: This Hook performs the data fetching logic.
    // The effect function (the first argument () => { ... }) contains the code that will run as a side effect.
    // The dependency array (the second argument [setUsers]) tells React when to re-run the effect. 
    // In this case, the effect will re-run only if the setUsers function reference changes. 
    // However, setter functions from useState are guaranteed to have a stable identity across renders, 
    // so this dependency is likely not the intended behavior. 
    // A more appropriate dependency array would likely be [] if the data should only be fetched once when the 
    // component mounts, or some other variable that indicates a need to refetch data.
    useEffect(() => {
        // First argument is a function that will run after the component mounts
        const getUsers = async () => {
            try {
                // Sends a GET request to the specified API endpoint. 
                // await pauses execution until the promise resolves.
                const res = await fetch(BASE_URL + "/friends");
                const data = await res.json();
                if(!res.ok) { throw new Error(data.error); }
                
                // Updates the users state in the parent component with the fetched data. 
                // This will likely trigger a re-render of the parent and consequently the UserGrid 
                // with the new user data.
                setUsers(data);
            
            } catch (error) { // If any error occurs during the try it logs the error to the console.
                console.error(error);
            
            // Always executes after the try or catch block. It sets isLoading to false, indicating 
            // that the data fetching attempt (whether successful or not) has completed.
            } finally {
                setIsLoading(false);
            }
        };
        getUsers(); // Calls the getUsers function when the useEffect hook runs.
        }, 
        // Second argument is an array of dependencies. Tells React when to re-run the effect. 
        // The setUsers function from useState has a stable identity across renders and will never change. 
        // This means the effect will only run once when the component mounts
        [setUsers]); 
    
    console.log(users);
    return (
        <>
            <Grid templateColumns={{base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)"}} gap="6">
                
                {/* Maps over the users array (received as a prop). For each user object in the array, 
                it renders a UserCard component, passing the user object as the usuario prop to the UserCard. */}
                {users.map((user) => (
                    <UserCard usuario={user} key={user.id} setUsuarios={setUsers} />
                ))}
            </Grid>
        
            {/* If isLoading is true, it renders a loading spinner. */}
            {isLoading && (
                <Flex justifyContent={"center"}>
                    <Spinner size={"xl"}/>
                </Flex>
            )}
            
            {/* If no users are found, it renders a message. */}
            {!isLoading && users.length === 0 && (
                <Flex justifyContent={"center"}>
                    <Text textStyle="sm" fontWeight="light">No users found</Text>
                </Flex>
            )}
        
        </>
    );
};

export default UserGrid;