// "use client";

// import { useEffect, useState } from "react";
// import { firestore } from "@/firebase/firebase";
// import { collection, getDocs, setDoc, doc } from "firebase/firestore";
// import { Problem } from "@/app/problems/problems";
// import { toast } from "react-toastify";

// interface Example {
//   id: number;
//   input: Record<string, any>[];
//   output: string;
//   explanation?: string;
// }

// export default function ProblemForm() {
//   const initialProblemState=(): Problem =>( {
//     id: "",
//     title: "",
//     likes: 0,
//     dislikes: 0,
//     difficulty: "",
//     description: "",
//     constraints: [""],
//     category: "",
//     order: 0,
//     videoId: "",
//     starterProblem: "",
//     starterFunctionName: "",
//     examples: [{ id: 0, input: [{ "": "" }], output: "", explanation: "" }],
//   });
  
//   const [problem, setProblem] = useState<Problem>(initialProblemState());
 

//   useEffect(() => {
//     const fetchProblemCount = async () => {
//       const snapshot = await getDocs(collection(firestore, "problems"));
//       setProblem((prev) => ({ ...prev, order: snapshot.size + 1 }));
//     };
//     fetchProblemCount();
//   }, []);

//   const handleChange = (
//     e: React.ChangeEvent<
//       HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
//     >
//   ) => {
//     const { name, value } = e.target;
//     setProblem((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleConstraintChange = (index: number, value: string) => {
//     const updated = [...problem.constraints];
//     updated[index] = value;
//     setProblem((prev) => ({ ...prev, constraints: updated }));
//   };

//   const addConstraint = () => {
//     setProblem((prev) => ({ ...prev, constraints: [...prev.constraints, ""] }));
//   };

//   const removeConstraint = (index: number) => {
//     const updated = problem.constraints.filter((_, i) => i !== index);
//     setProblem((prev) => ({ ...prev, constraints: updated }));
//   };

//   const addExample = () => {
//     const newId = Date.now();
//     setProblem((prev) => ({
//       ...prev,
//       examples: [
//         ...prev.examples,
//         { id: newId, input: [{ "": "" }], output: "", explanation: "" },
//       ],
//     }));
//   };

//   const removeExample = (id: number) => {
//     setProblem((prev) => ({
//       ...prev,
//       examples: prev.examples.filter((ex) => ex.id !== id),
//     }));
//   };

//   const handleExampleFieldChange = (
//     exampleId: number,
//     field: "output" | "explanation",
//     value: string
//   ) => {
//     const updated = problem.examples.map((ex) =>
//       ex.id === exampleId ? { ...ex, [field]: value } : ex
//     );
//     setProblem((prev) => ({ ...prev, examples: updated }));
//   };

//   const updateInputKey = (exampleId: number, idx: number, newKey: string) => {
//     const updatedExamples = problem.examples.map((ex) => {
//       if (ex.id === exampleId) {
//         const currentPair = ex.input[idx];
//         const val = Object.values(currentPair)[0];
//         const newInput = [...ex.input];
//         newInput[idx] = { [newKey]: val };
//         return { ...ex, input: newInput };
//       }
//       return ex;
//     });
//     setProblem((prev) => ({ ...prev, examples: updatedExamples }));
//   };

//   const updateInputValue = (exampleId: number, idx: number, newVal: string) => {
//     const updatedExamples = problem.examples.map((ex) => {
//       if (ex.id === exampleId) {
//         const currentPair = ex.input[idx];
//         const key = Object.keys(currentPair)[0];
//         const parsed = parseValue(newVal);
//         const newInput = [...ex.input];
//         newInput[idx] = { [key]: parsed };
//         return { ...ex, input: newInput };
//       }
//       return ex;
//     });
//     setProblem((prev) => ({ ...prev, examples: updatedExamples }));
//   };

//   const parseValue = (val: string): any => {
//     try {
//       return JSON.parse(val);
//     } catch {
//       return val;
//     }
//   };

//   const addInputPair = (exampleId: number) => {
//     const updatedExamples = problem.examples.map((ex) =>
//       ex.id === exampleId ? { ...ex, input: [...ex.input, { "": "" }] } : ex
//     );
//     setProblem((prev) => ({ ...prev, examples: updatedExamples }));
//   };

//   const removeInputPair = (exampleId: number, idx: number) => {
//     const updatedExamples = problem.examples.map((ex) =>
//       ex.id === exampleId
//         ? { ...ex, input: ex.input.filter((_, i) => i !== idx) }
//         : ex
//     );
//     setProblem((prev) => ({ ...prev, examples: updatedExamples }));
//   };

//   // const handleSubmit = async () => {

//   //   if (!problem.id) return alert("Please provide a valid ID for the problem.");
//   //   await setDoc(doc(firestore, "problems", problem.id), problem);
//   //   alert("✅ Problem uploaded successfully!");
//   // };
//   const handleSubmit = async () => {
//     const {
//       id,
//       title,
//       difficulty,
//       category,
//       description,
//       starterProblem,
//       starterFunctionName,
//       constraints,
//       examples,
//     } = problem;
  
//     if (
//       !id.trim() ||
//       !title.trim() ||
//       !difficulty.trim() ||
//       !category.trim() ||
//       !description.trim() ||
//       !starterProblem.trim() ||
//       !starterFunctionName.trim()
//     ) {
//       toast.error("❌ Please fill in all required fields.");
//       return;
//     }
  
//     const hasConstraint = constraints.some((c) => c.trim() !== "");
//     if (!hasConstraint) {
//       toast.error("❌ Add at least one constraint.");
//       return;
//     }
  
//     if (
//       examples.length === 0 ||
//       !examples.some(
//         (ex) =>
//           Array.isArray(ex.input) &&
//           ex.input.length > 0 &&
//           ex.output.trim() !== ""
//       )
//     ) {
//       toast.error("❌ Add at least one valid example (input + output).");
//       return;
//     }
  
//     try {
//       await setDoc(doc(firestore, "problems", problem.id), problem);
//       toast.success("✅ Problem uploaded successfully!");
//       setProblem({ ...initialProblemState()}); 
//     } catch (error) {
//       console.error("Upload failed:", error);
//       toast.error("❌ Upload failed. Check console for details.");
//     }
//   };
  

//   return (
//     <div className="p-6 text-white bg-black min-h-screen">
//       <h2 className="text-2xl font-bold mb-6">🚀 Create New Problem</h2>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
//         <input
//           name="id"
//           placeholder="Unique Problem ID (document name)"
//           onChange={handleChange}
//           className="p-2 rounded bg-gray-800"
//         />
//         <input
//           name="title"
//           placeholder="Problem Title"
//           onChange={handleChange}
//           className="p-2 rounded bg-gray-800"
//         />
//         <select
//           name="difficulty"
//           onChange={handleChange}
//           className="p-2 rounded bg-gray-800"
//         >
//           <option value="">Select Difficulty</option>
//           <option value="Easy">Easy</option>
//           <option value="Medium">Medium</option>
//           <option value="Hard">Hard</option>
//         </select>
//         <input
//           name="category"
//           placeholder="Category"
//           onChange={handleChange}
//           className="p-2 rounded bg-gray-800"
//         />
//         <input
//           name="videoId"
//           placeholder="YouTube Video ID"
//           onChange={handleChange}
//           className="p-2 rounded bg-gray-800"
//         />
//         <input
//           name="starterProblem"
//           placeholder="Starter Code"
//           onChange={handleChange}
//           className="p-2 rounded bg-gray-800 col-span-2"
//         />
//         <input
//           name="starterFunctionName"
//           placeholder="Function Signature"
//           onChange={handleChange}
//           className="p-2 rounded bg-gray-800 col-span-2"
//         />
//         <textarea
//           name="description"
//           placeholder="Problem Description"
//           onChange={handleChange}
//           className="p-2 rounded bg-gray-800 col-span-2 min-h-[120px]"
//         />
//       </div>

//       <h3 className="text-lg mt-8 mb-2 font-semibold">📌 Constraints</h3>
//       <div className="max-w-3xl">
//         {problem.constraints.map((c, i) => (
//           <div key={i} className="flex gap-2 mb-2">
//             <input
//               type="text"
//               value={c}
//               onChange={(e) => handleConstraintChange(i, e.target.value)}
//               className="p-1 bg-gray-700 rounded w-full"
//             />
//             <button
//               className="text-red-400"
//               onClick={() => removeConstraint(i)}
//             >
//               ❌
//             </button>
//           </div>
//         ))}
//         <button className="text-green-400 mt-1" onClick={addConstraint}>
//           ➕ Add Constraint
//         </button>
//       </div>

//       <h3 className="text-lg mt-8 mb-2 font-semibold">🧪 Examples</h3>
//       {problem.examples.map((ex, idx) => (
//         <div
//           key={ex.id}
//           className="border border-gray-600 p-4 mb-4 rounded-md bg-[#1E1E1E]"
//         >
//           <div className="flex justify-between items-center mb-2">
//             <span className="font-semibold">Example {idx + 1}</span>
//             <button
//               onClick={() => removeExample(ex.id)}
//               className="text-red-400 hover:underline"
//             >
//               Remove
//             </button>
//           </div>

//           {ex.input.map((pair, i) => {
//             const key = Object.keys(pair)[0];
//             const val = pair[key];
//             return (
//               <div key={i} className="flex gap-2 mb-2">
//                 <input
//                   type="text"
//                   placeholder="Key"
//                   value={key}
//                   onChange={(e) => updateInputKey(ex.id, i, e.target.value)}
//                   className="p-1 bg-gray-700 rounded w-1/3"
//                 />
//                 <input
//                   type="text"
//                   placeholder="Value (supports matrix, array, string, etc)"
//                   value={typeof val === "string" ? val : JSON.stringify(val)}
//                   onChange={(e) => updateInputValue(ex.id, i, e.target.value)}
//                   className="p-1 bg-gray-700 rounded w-2/3"
//                 />
//                 <button
//                   onClick={() => removeInputPair(ex.id, i)}
//                   className="text-red-400"
//                 >
//                   ❌
//                 </button>
//               </div>
//             );
//           })}
//           <button
//             onClick={() => addInputPair(ex.id)}
//             className="text-blue-400 text-sm"
//           >
//             ➕ Add Input Pair
//           </button>

//           <textarea
//             value={ex.output}
//             onChange={(e) =>
//               handleExampleFieldChange(ex.id, "output", e.target.value)
//             }
//             placeholder="Expected Output"
//             className="w-full mt-2 p-2 rounded bg-gray-700"
//           />
//           <textarea
//             value={ex.explanation}
//             onChange={(e) =>
//               handleExampleFieldChange(ex.id, "explanation", e.target.value)
//             }
//             placeholder="Explanation (Optional)"
//             className="w-full mt-2 p-2 rounded bg-gray-700"
//           />
//         </div>
//       ))}

//       <button onClick={addExample} className="text-green-400 mb-8">
//         ➕ Add Example
//       </button>

//       <div className="mt-4">
//         <button
//           onClick={handleSubmit}
//           className="bg-green-600 px-6 py-2 rounded text-white hover:bg-green-700"
//         >
//           ✅ Upload Problem
//         </button>
//       </div>
//     </div>
//   );
// }





































































"use client";

import { useEffect, useState } from "react";
import { firestore } from "@/firebase/firebase";
import { collection, getDocs, setDoc, doc } from "firebase/firestore";
import { Problem } from "@/app/problems/problems";
import { toast } from "react-toastify";

export default function ProblemForm() {
  const initialProblemState = (): Problem => ({
    id: "",
    title: "",
    likes: 0,
    dislikes: 0,
    difficulty: "",
    description: "",
    constraints: [""],
    category: "",
    order: 0,
    videoId: "",
    starterProblem: "",
    starterFunctionName: "",
    examples: [{ id: Date.now(), input: [{ "": "" }], output: "", explanation: "" }],
  });

  const [problem, setProblem] = useState<Problem>(initialProblemState());

  useEffect(() => {
    const fetchProblemCount = async () => {
      const snapshot = await getDocs(collection(firestore, "problems"));
      setProblem((prev) => ({ ...prev, order: snapshot.size + 1 }));
    };
    fetchProblemCount();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProblem((prev) => ({ ...prev, [name]: value }));
  };

  const handleConstraintChange = (index: number, value: string) => {
    const updated = [...problem.constraints];
    updated[index] = value;
    setProblem((prev) => ({ ...prev, constraints: updated }));
  };

  const addConstraint = () => {
    setProblem((prev) => ({ ...prev, constraints: [...prev.constraints, ""] }));
  };

  const removeConstraint = (index: number) => {
    const updated = problem.constraints.filter((_, i) => i !== index);
    setProblem((prev) => ({ ...prev, constraints: updated }));
  };

  const addExample = () => {
    const newId = Date.now();
    setProblem((prev) => ({
      ...prev,
      examples: [
        ...prev.examples,
        { id: newId, input: [{ "": "" }], output: "", explanation: "" },
      ],
    }));
  };

  const removeExample = (id: number) => {
    setProblem((prev) => ({
      ...prev,
      examples: prev.examples.filter((ex) => ex.id !== id),
    }));
  };

  const updateInputKey = (exampleId: number, idx: number, newKey: string) => {
    const updatedExamples = problem.examples.map((ex: any) => {
      if (ex.id === exampleId) {
        const currentPair = ex.input[idx];
        const val = Object.values(currentPair)[0];
        const newInput = ex.input.slice();
        newInput[idx] = { [newKey]: val };
        return { ...ex, input: newInput };
      }
      return ex;
    });
    setProblem((prev) => ({ ...prev, examples: updatedExamples }));
  };

  const updateInputValue = (exampleId: number, idx: number, newVal: string) => {
    const updatedExamples = problem.examples.map((ex: any) => {
      if (ex.id === exampleId) {
        const currentPair = ex.input[idx];
        const key = Object.keys(currentPair)[0];
        const parsed = parseValue(newVal);
        const newInput = ex.input.slice();
        newInput[idx] = { [key]: parsed };
        return { ...ex, input: newInput };
      }
      return ex;
    });
    setProblem((prev) => ({ ...prev, examples: updatedExamples }));
  };

  const parseValue = (val: string): any => {
    try {
      const parsed = JSON.parse(val);
  
      // If it's a matrix (array of arrays), convert to nested object
      if (
        Array.isArray(parsed) &&
        parsed.every((row) => Array.isArray(row))
      ) {
        return arrayToNestedObject(parsed);
      }
  
      return parsed;
    } catch {
      // Try to parse matrix string manually
      if (val.includes("\n")) {
        const rows = val.trim().split("\n");
        const matrix = rows.map((row) =>
          row.trim().split(/[\s,]+/).map(Number)
        );
  
        const isValidMatrix = matrix.every(
          (row) => row.length === matrix[0].length && row.every((n) => !isNaN(n))
        );
  
        if (isValidMatrix) return arrayToNestedObject(matrix);
      }
  
      return val;
    }
  };
  
  // Converts a matrix (2D array) to nested object
  const arrayToNestedObject = (matrix: number[][]): Record<string, any> => {
    const obj: Record<string, any> = {};
    matrix.forEach((row, rowIndex) => {
      obj[rowIndex] = {};
      row.forEach((val, colIndex) => {
        obj[rowIndex][colIndex] = val;
      });
    });
    return obj;
  };
  
  

  const addInputPair = (exampleId: number) => {
    const updatedExamples = problem.examples.map((ex: any) =>
      ex.id === exampleId ? { ...ex, input: [...ex.input, { "": "" }] } : ex
    );
    setProblem((prev) => ({ ...prev, examples: updatedExamples }));
  };

  const removeInputPair = (exampleId: number, idx: number) => {
    const updatedExamples = problem.examples.map((ex: any) =>
      ex.id === exampleId
        ? { ...ex, input: ex.input.filter((_: any, i: number) => i !== idx) }
        : ex
    );
    setProblem((prev) => ({ ...prev, examples: updatedExamples }));
  };

  const handleExampleFieldChange = (
    exampleId: number,
    field: "output" | "explanation",
    value: string
  ) => {
    const updatedExamples = problem.examples.map((ex) =>
      ex.id === exampleId ? { ...ex, [field]: value } : ex
    );
    setProblem((prev) => ({ ...prev, examples: updatedExamples }));
  };

  const handleSubmit = async () => {
    const {
      id,
      title,
      difficulty,
      category,
      description,
      starterProblem,
      starterFunctionName,
      constraints,
      examples,
    } = problem;

    if (
      !id.trim() ||
      !title.trim() ||
      !difficulty.trim() ||
      !category.trim() ||
      !description.trim() ||
      !starterProblem.trim() ||
      !starterFunctionName.trim()
    ) {
      toast.error("❌ Please fill in all required fields.");
      return;
    }

    const hasConstraint = constraints.some((c) => c.trim() !== "");
    if (!hasConstraint) {
      toast.error("❌ Add at least one constraint.");
      return;
    }

    if (
      examples.length === 0 ||
      !examples.some(
        (ex) =>
          Array.isArray(ex.input) &&
          ex.input.length > 0 &&
          ex.output.trim() !== ""
      )
    ) {
      toast.error("❌ Add at least one valid example.");
      return;
    }

    try {
      await setDoc(doc(firestore, "problems", problem.id), problem);
      toast.success("✅ Problem uploaded successfully!");
      setProblem(initialProblemState()); // ✅ Full reset
    } catch (error) {
      console.error("Upload failed:", error);
      toast.error("❌ Upload failed. Check console.");
    }
  };

  return (
    <div className="p-6 text-white bg-black min-h-screen">
      <h2 className="text-2xl font-bold mb-6">🚀 Create New Problem</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl">
         <input
          name="id"
          placeholder="Unique Problem ID (document name)"
          onChange={handleChange}
          className="p-2 rounded bg-gray-800"
        />
        <input
          name="title"
          placeholder="Problem Title"
          onChange={handleChange}
          className="p-2 rounded bg-gray-800"
        />
        <select
          name="difficulty"
          onChange={handleChange}
          className="p-2 rounded bg-gray-800"
        >
          <option value="">Select Difficulty</option>
          <option value="Easy">Easy</option>
          <option value="Medium">Medium</option>
          <option value="Hard">Hard</option>
        </select>
        <input
          name="category"
          placeholder="Category"
          onChange={handleChange}
          className="p-2 rounded bg-gray-800"
        />
        <input
          name="videoId"
          placeholder="YouTube Video ID"
          onChange={handleChange}
          className="p-2 rounded bg-gray-800"
        />
        <input
          name="starterProblem"
          placeholder="Starter Code"
          onChange={handleChange}
          className="p-2 rounded bg-gray-800 col-span-2"
        />
        <input
          name="starterFunctionName"
          placeholder="Function Signature"
          onChange={handleChange}
          className="p-2 rounded bg-gray-800 col-span-2"
        />
        <textarea
          name="description"
          placeholder="Problem Description"
          onChange={handleChange}
          className="p-2 rounded bg-gray-800 col-span-2 min-h-[120px]"
        />
      </div>

      <h3 className="text-lg mt-8 mb-2 font-semibold">📌 Constraints</h3>
      <div className="max-w-3xl">
        {problem.constraints.map((c, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              type="text"
              value={c}
              onChange={(e) => handleConstraintChange(i, e.target.value)}
              className="p-1 bg-gray-700 rounded w-full"
            />
            <button
              className="text-red-400"
              onClick={() => removeConstraint(i)}
            >
              ❌
            </button>
          </div>
        ))}
        <button className="text-green-400 mt-1" onClick={addConstraint}>
          ➕ Add Constraint
        </button>
      </div>

      <h3 className="text-lg mt-8 mb-2 font-semibold">🧪 Examples</h3>
      {problem.examples.map((ex, idx) => (
        <div
          key={ex.id}
          className="border border-gray-600 p-4 mb-4 rounded-md bg-[#1E1E1E]"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="font-semibold">Example {idx + 1}</span>
            <button
              onClick={() => removeExample(ex.id)}
              className="text-red-400 hover:underline"
            >
              Remove
            </button>
          </div>

          {ex.input.map((pair: Record<string, any>, i: number) => {
            const key = Object.keys(pair)[0];
            const val = pair[key];
            return (
              <div key={i} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="Key"
                  value={key}
                  onChange={(e) => updateInputKey(ex.id, i, e.target.value)}
                  className="p-1 bg-gray-700 rounded w-1/3"
                />
                <input
                  type="text"
                  placeholder="Value (supports matrix, array, string, etc)"
                  value={typeof val === "string" ? val : JSON.stringify(val)}
                  onChange={(e) => updateInputValue(ex.id, i, e.target.value)}
                  className="p-1 bg-gray-700 rounded w-2/3"
                />
                <button
                  onClick={() => removeInputPair(ex.id, i)}
                  className="text-red-400"
                >
                  ❌
                </button>
              </div>
            );
          })}
          <button
            onClick={() => addInputPair(ex.id)}
            className="text-blue-400 text-sm"
          >
            ➕ Add Input Pair
          </button>

          <textarea
            value={ex.output}
            onChange={(e) =>
              handleExampleFieldChange(ex.id, "output", e.target.value)
            }
            placeholder="Expected Output"
            className="w-full mt-2 p-2 rounded bg-gray-700"
          />
          <textarea
            value={ex.explanation}
            onChange={(e) =>
              handleExampleFieldChange(ex.id, "explanation", e.target.value)
            }
            placeholder="Explanation (Optional)"
            className="w-full mt-2 p-2 rounded bg-gray-700"
          />
        </div>
      ))}

      <button onClick={addExample} className="text-green-400 mb-8">
        ➕ Add Example
      </button>

      <div className="mt-4">
        <button
          onClick={handleSubmit}
          className="bg-green-600 px-6 py-2 rounded text-white hover:bg-green-700"
        >
          ✅ Upload Problem
        </button>
      </div>
    </div>
  );
}
