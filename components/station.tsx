import Link from "next/link";
import { FC } from "react";
import { Station } from "../types/station";

const Station: FC<{station: Station, delete: (id: string) => void}> = (props) => {
	return (
		<div className="py-3">
			<h2 className="text-4xl">{props.station.name}</h2>
			<Link href={`/stations/${props.station.id}/manage`}>
				<a>Správa</a>
			</Link>
			<br />
			<Link href={`/stations/${props.station.id}`}>
				<a>Odjezdy</a>
			</Link>
			<br />
			<button onClick={() => props.delete(props.station.id)}>Smazat stanici</button>
		</div>
	)
}

export default Station
