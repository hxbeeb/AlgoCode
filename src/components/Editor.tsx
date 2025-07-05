import { Problem } from "@/app/problems/problems";
import PreferenceNav from "./PreferenceNav";
import ReactCodeMirror from "@uiw/react-codemirror";
import { vscodeDark } from "@uiw/codemirror-theme-vscode";
import { cpp } from "@codemirror/lang-cpp";
import { javascript } from "@codemirror/lang-javascript";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { useEffect } from "react";

export default function Editor({ problem, userCode, setUserCode, language }: { problem: Problem, userCode: string, setUserCode: any, language?: { name: string; id: number } }) {
  useEffect(() => {
    const code = localStorage.getItem(`code=${problem.id}`);
    setUserCode(code ? JSON.stringify(code) : problem.starterProblem);
  }, [problem]);

  let extension = javascript();
  if (language) {
    if (language.name.toLowerCase().includes("python")) extension = python();
    else if (language.name.toLowerCase().includes("java") && !language.name.toLowerCase().includes("javascript")) extension = java();
    else if (language.name.toLowerCase().includes("c++")) extension = cpp();
  }

  return (
    <div className="w-full  overflow-auto">
      <ReactCodeMirror
        value={userCode}
        theme={vscodeDark}
        extensions={[extension]}
        style={{ fontSize: 16 }}
        onChange={(e) => {
          setUserCode(e);
          localStorage.setItem(`code-${problem.id}`, JSON.stringify(e));
        }}
      />
    </div>
  );
}