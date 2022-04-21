import { FC } from "react";

const Header: FC<{header: string}> = (props) => {
	return (
		<div className="text-center">
			<h1 className="font-bold text-6xl py-4">{props.header}</h1>
			<hr className="border-2 border-black"/>
		</div>
	)
} 

export default Header
