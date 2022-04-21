import { FC, useState } from "react";

const CreateStation: FC<{createStation: (name: string) => void}> = (props) => {
	const [text, setText] = useState("")
	return (
		<div>
			<input type="text" placeholder="Název stanice" value={text} onChange={event => setText(event.target.value)}></input>
			<button onClick={() => props.createStation(text)}>Vytvořit stanici</button>
		</div>
	)
}

export default CreateStation
