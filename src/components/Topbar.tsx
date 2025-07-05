import Link from "next/link";
import { useRouter } from "next/navigation";
import { BiUpload } from "react-icons/bi";
import { GoUpload } from "react-icons/go";


export default  function Topbar({user}:{user:any}){
	const router=useRouter();





    return (
        <div>
        <nav className='bg-black relative flex h-[50px] w-full shrink-0 items-center px-5 bg-dark-layer-1 text-dark-gray-7'>
			<div className={`flex w-full items-center justify-between max-w-[1200px] mx-auto`}>
			
					<img onClick={()=>router.replace("/")} src='https://imgs.search.brave.com/f_uWOeSKd0bTOfag2Ib5dAH6UrMWnF5NDNfzlICCYLE/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9jZG4z/ZC5pY29uc2NvdXQu/Y29tLzNkL2ZyZWUv/dGh1bWIvZnJlZS1s/ZWV0Y29kZS0zZC1p/Y29uLWRvd25sb2Fk/LWluLXBuZy1ibGVu/ZC1mYngtZ2x0Zi1m/aWxlLWZvcm1hdHMt/LWxlZXQtY29kZS1w/cm9ncmFtbWluZy1s/b2dvcy1hbmQtYnJh/bmRzLXBhY2staWNv/bnMtOTMyNTMwNy5w/bmc_Zj13ZWJw' 
                    alt='Logo' className='w-10 bg-black cursor-pointer' />
					
				

				<div className='flex items-center space-x-4 flex-1 justify-end'>
				<div onClick={()=>router.push("/upload")} className="flex justify-center  rounded border-gray-400 cursor-pointer ">
						<GoUpload  size={20}/>
					</div>
					<div>
						<a
							href='https://buymeacoffee.com/hxbeeb'
							target='_blank'
							rel='noreferrer'
							className='bg-white py-1.5 px-3 cursor-pointer rounded text-brand-orange hover:bg-dark-fill-2 text-black'
						>
							Premium
						</a>
					</div>
					{/* <Link href='/auth'>
						<button className='bg-dark-fill-3 py-1 px-2 cursor-pointer rounded '>Sign In</button>
					</Link> */}
				</div>
			</div>
</nav>


{/* <!--  User Email Wrapper--> */}
	<div
		className='absolute top-10 left-2/4 -translate-x-2/4  mx-auto bg-dark-layer-1 text-brand-orange p-2 rounded shadow-lg z-40 group-hover:scale-100 scale-0 
		transition-all duration-300 ease-in-out'
	>
		<p className='text-sm'>{user.email}</p>
	</div>
    </div>
    )
}