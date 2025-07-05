import React from "react";
import { BsChevronUp } from "react-icons/bs";

type EditorFooterProps = {
	handleSubmit: () => void;
	handleRun:()=>void;
};

const EditorFooter: React.FC<EditorFooterProps> = ({ handleSubmit,handleRun }) => {
	return (
		<div className='fixed bottom-0 left-0 right-0 bg-dark-layer-2 z-10 w-full  border-dark-divider-border-2'>
			<div className='mx-auto px-6 py-3 flex justify-between items-center max-w-7xl'>
				{/* Left: Console  */}
				<div className='flex items-center space-x-4'>
					<button className='px-4 py-2 text-sm font-medium inline-flex items-center bg-dark-fill-2 hover:bg-dark-fill-3 text-white rounded-lg'>
						
						{/* <BsChevronUp className='ml-1 text-dark-gray-7' /> */}
					</button>
				</div>

				{/* Right: Run + Submit */}
				<div className='flex items-center space-x-4 gap-7'>
					<button
						className='flex px-5 py-2 text-sm font-semibold bg-red-700 hover:bg-red-500 text-white rounded-lg '
						onClick={handleRun}
					>
						Run
					</button>
					<button
						className='flex px-5 py-2 text-sm font-semibold bg-green-700 hover:bg-green-500 text-white rounded-lg'
						onClick={handleSubmit}
					>
						Submit
					</button>
				</div>
			</div>
		</div>
	);
};

export default EditorFooter;
