import { signOut } from "firebase/auth";
import { auth } from "@/firebase/firebase";

export default function Navbar({
  login,
  setLogin,
  user,data}: {login: boolean;setLogin: any;user: any;data:any}) {





    
  return (
    <div className="w-full h-16  flex items-center justify-between px-4 bg-black">
      <div className="flex items-center gap-2 justify-between w-full">
        <img
          src={
            "https://imgs.search.brave.com/f_uWOeSKd0bTOfag2Ib5dAH6UrMWnF5NDNfzlICCYLE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4z/ZC5pY29uc2NvdXQu/Y29tLzNkL2ZyZWUv/dGh1bWIvZnJlZS1s/ZWV0Y29kZS0zZC1p/Y29uLWRvd25sb2Fk/LWluLXBuZy1ibGVu/ZC1mYngtZ2x0Zi1m/aWxlLWZvcm1hdHMt/LWxlZXQtY29kZS1w/cm9ncmFtbWluZy1s/b2dvcy1hbmQtYnJh/bmRzLXBhY2staWNv/bnMtOTMyNTMwNy5w/bmc_Zj13ZWJw"
          }
          alt={"logo"}
          width={50}
          height={50}
        />
        <h1 className="text-2xl font-bold">AlgoCode</h1>

        {user ? (
          <div className="flex gap-4 items-center">
            <p className="text-white">{data?"Hi, "+data.displayName:null}</p>
            <button
              onClick={() => signOut(auth)}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
            >
              Logout
            </button>
          </div>
        ) : (
          <button
            onClick={() => setLogin(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Login
          </button>
        )}
      </div>
    </div>
  );
}
