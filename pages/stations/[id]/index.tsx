import { GetServerSideProps } from "next";
import { FC, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getStationName, getTrains } from "../../../handlers/dbHandler";
import { Train } from "../../../types/train";
import { WebsocketEvents } from "../../../types/websocket";

const getServerSideProps: GetServerSideProps = async (context) => {
	const {id} = context.query;
	let station = "";
	if (typeof id === "string") {
		station = await getStationName(id) || ""
	}
	let trains = JSON.stringify(await getTrains())
	if (trains == '{}') trains = '[]'
	return {
		props: {
			trains: trains,
			station: station 
		}
	}
}

const StationPage: FC<{trains: Train[], station: string}> = (props) => {
	const [trains, setTrains] = useState<Train[]>(props.trains)

	let socket: Socket

	useEffect(() => {
		socketInitializer()
		return () => {socketDestroyer()}
	}, [])

	const socketInitializer = async () => {
		await fetch("/api/socket")
		socket = io()

		socket.on(WebsocketEvents.TrainTimeUpdate, (trains: Train[]) => {
			setTrains(trains)
		})
	}

	const socketDestroyer = () => {
		socket.close();
	}


	return (
		<>
		</>
	)
}

export default StationPage
