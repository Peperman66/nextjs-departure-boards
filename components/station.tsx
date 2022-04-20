import Link from "next/link";
import { FC } from "react";
import Station from "../types/station";

const Station: FC<Station> = (station) => {
	return (
		<div>
			<h2>{station.name}</h2>
			<Link href={`/stations/${station.id}/manage`}>
				<a>Správa</a>
			</Link>
			<br />
			<Link href={`/stations/${station.id}`}>
				<a>Odjezdy</a>
			</Link>
		</div>
	)
}

export default Station
