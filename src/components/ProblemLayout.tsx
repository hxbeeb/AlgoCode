'use client';

import Split from "react-split";
import Description from "@/components/Description";
import Editor from "@/components/Editor";
import Testcases from "@/components/Testcases";
import { Problem } from "@/app/problems/problems";
import PreferenceNav from "./PreferenceNav";
import { useState } from "react";
import { IoIosArrowUp, IoIosArrowDown } from "react-icons/io";
import useWindowSize from "@/app/hooks/useWindowSize";
import Confetti from 'react-confetti';
export default function ProblemLayout({ problem }: { problem: Problem }) {
	const [userCode, setUserCode] = useState(problem.starterProblem);
	const [showTestCases, setShowTestCases] = useState(true);
	const { width, height } = useWindowSize();
	const[success,setSuccess]=useState(false);

	return (
		<div className="h-screen w-full text-white bg-black overflow-hidden">
			{success&&<Confetti 
			width={width}
			gravity={0.3}
			tweenDuration={4000}
			/>}
			
			{/* Desktop Split View */}
			<div className="hidden md:flex h-full">
				<Split
					direction="horizontal"
					className="flex h-full w-full"
					sizes={[40, 60]}
					minSize={[300, 400]}
					gutterSize={8}
				>
					{/* Left: Description */}
					<div className="p-4 overflow-auto bg-[#1a1a1a] border-r border-gray-700">
						<Description problem={problem} />
					</div>

					{/* Right: Editor + Testcases */}
					<Split
						direction="vertical"
						className="flex flex-col h-full"
						sizes={showTestCases ? [70, 30] : [100, 0]}
						minSize={showTestCases ? [200, 100] : [200, 0]}
						gutterSize={8}
					>
						<div className="p-4 overflow-auto bg-[#111]">
							<PreferenceNav />
							<Editor problem={problem} userCode={userCode} setUserCode={setUserCode} />
						</div>

						{/* Testcases Panel */}
						<div className="relative overflow-auto bg-[#111] border-t border-gray-700">
							{showTestCases ? (
								<>
									<Testcases
										// problem={problem}
										setSuccess={setSuccess}
										pid={problem.id}
										userCode={userCode}
										setUserCode={setUserCode}
									/>
									{/* Collapse Button */}
									{/* <button
										className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gray-600 text-white p-1 rounded-t-md hover:bg-gray-500"
										onClick={() => setShowTestCases(false)}
									>
										<IoIosArrowDown />
									</button> */}
								</>
							) : (
								<div className="flex justify-center items-center h-6">
									<button
										className="bg-gray-700 text-white p-1 rounded-md hover:bg-gray-600"
										onClick={() => setShowTestCases(true)}
									>
										{/* <IoIosArrowUp /> */}
									</button>
								</div>
							)}
						</div>
					</Split>
				</Split>
			</div>

			{/* Mobile / Small Tablet View */}
			<div className="flex flex-col md:hidden h-full overflow-auto">
				{/* Description */}
				<div className="p-3 bg-[#1a1a1a] border-b border-gray-700 max-h-[40%] overflow-auto">
					<Description problem={problem} />
				</div>

				{/* Editor */}
				<div className="p-3 bg-[#111] border-b border-gray-700">
					<PreferenceNav />
					<Editor problem={problem} userCode={userCode} setUserCode={setUserCode} />
				</div>

				{/* Testcases toggle */}
				<div className="flex justify-center items-center py-1 border-t border-gray-700">
					<button
						className="bg-gray-700 text-white p-1 rounded-md hover:bg-gray-600"
						onClick={() => setShowTestCases(prev => !prev)}
					>
						{showTestCases ? <IoIosArrowDown /> : <IoIosArrowUp />}
					</button>
				</div>

				{/* Testcases Panel */}
				{showTestCases && (
					<div className="p-3 bg-[#111] border-t border-gray-700 overflow-auto max-h-[35%]">
						<Testcases
						setSuccess={setSuccess}
							// problem={problem}
							pid={problem.id}
							userCode={userCode}
							setUserCode={setUserCode}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
