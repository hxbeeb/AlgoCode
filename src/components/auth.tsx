import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useState } from "react";
import { auth, firestore } from "@/firebase/firebase";
import { toast } from "react-toastify";
import { doc, setDoc } from "firebase/firestore";

export default function Auth({ login, setLogin }: { login: boolean; setLogin: any }) {
    const [isLogging, setIsLogging] = useState(true);
    const [username, setUsername] = useState("");
    const[displayName,setDisplayName]=useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleLogin = async () => {
        try {
            await signInWithEmailAndPassword(auth, username, password);
            toast.success("logged in",{position:"top-center",autoClose:3000,theme:"dark"})
            console.log("Logged in");
            setLogin(false);
        } catch (e: any) {
            setError(e.message);
            toast.error(e.message,{position:"top-center"})
            console.log(e);
        }
    };

    const handleSignup = async () => {
        try {
            if(displayName!="")
            {
            const newUser=await createUserWithEmailAndPassword(auth, username, password);
            console.log("Account created");
            toast.loading("Creating your account...",{position:"top-center",toastId:"loadingToast"},)
            const userData={
                uid:newUser.user.uid,
                email:newUser.user.email,
                displayName:displayName,
                createdAt:Date.now(),
                updatedAt:Date.now(),
                likedProblems:[],
                dislikedProblems:[],
                solved:[],
                starred:[],
                points:0,

            }
            await setDoc(doc(firestore,"users",newUser.user.uid),userData);

            setLogin(false);
        }
        else{
            toast.error("Enter all details",{position:"top-center"})

        }
        } catch (e: any) {
            setError(e.message);
            toast.error(e.message,{position:"top-center"})
            console.log(e);
        }
        finally{
            toast.dismiss("loadingToast")
        }
    };

    const toggleForm = () => {
        setIsLogging(!isLogging);
        setUsername("");
        setPassword("");
        setError("");
    };

    if (!login) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black-700 bg-opacity-50 z-50">
            <div className="relative bg-gray-300 p-6 rounded-xl shadow-lg w-full max-w-sm">
                {/* Close Button */}
                <button
                    className="absolute top-2 right-2 text-gray-500 hover:text-red-500 text-lg font-bold"
                    onClick={() => setLogin(false)}
                >
                    ✖
                </button>

                <h2 className="text-xl font-semibold text-center mb-4 text-black">
                    {isLogging ? "Login" : "Register"}
                </h2>

                <div className="flex flex-col gap-3 text-black">
                    <input
                        type="text"
                        placeholder="Email"
                        className="border rounded px-3 py-2"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    {!isLogging?<input
                        type="text"
                        placeholder="Display Name"
                        className="border rounded px-3 py-2"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                    />:null}
                    <input
                        type="password"
                        placeholder="Password"
                        className="border rounded px-3 py-2"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button
                        onClick={isLogging ? handleLogin : handleSignup}
                        className="bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
                    >
                        {isLogging ? "Login" : "Register"}
                    </button>
                </div>

                {/* Error Message */}
                {error && <p className="text-red-600 text-sm mt-2 text-center">{error}</p>}

                <div className="text-sm mt-4 text-center text-black">
                    {isLogging ? (
                        <>
                            Don’t have an account?{" "}
                            <button onClick={toggleForm} className="text-blue-600 hover:underline">
                                Register
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{" "}
                            <button onClick={toggleForm} className="text-blue-600 hover:underline">
                                Login
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
