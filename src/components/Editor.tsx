import { Problem } from "@/app/problems/problems";
import PreferenceNav from "./PreferenceNav";
import ReactCodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { cpp } from "@codemirror/lang-cpp";
import { javascript } from "@codemirror/lang-javascript";
import { useEffect } from "react";


export default function Editor({problem,userCode,setUserCode}:{problem:Problem,userCode:string,setUserCode:any}){
    
useEffect(()=>{
    const code=localStorage.getItem(`code=${problem.id}`);
    setUserCode(code?JSON.stringify(code):problem.starterProblem);

},[problem]);


    return(

        <div className="w-full  overflow-auto">
            <ReactCodeMirror
            value={userCode}
            theme={vscodeDark}
            extensions={[javascript()]}
            style={{fontSize:16}}
            onChange={(e)=>{setUserCode(e);
                localStorage.setItem(`code-${problem.id}`,JSON.stringify(e));
            }}
            
            />
              




        </div>
    );
}