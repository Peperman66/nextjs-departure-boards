import { GetServerSideProps } from "next";
import { FC, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { getStationsWithAllTimetables, getTrains } from "../../../handlers/dbHandler";
import { Station } from "../../../types/station";
import { Train } from "../../../types/train";
import { WebsocketEvents } from "../../../types/websocket";

const getServerSideProps: GetServerSideProps = async (context) => {
	const {id} = context.query;
	let stations: Station[] = [];
	if (typeof id === "string") {
		stations = await getStationsWithAllTimetables() || []
	}
	let trains = JSON.stringify(await getTrains())
	if (trains == '{}') trains = '[]'
	return {
		props: {
			stations: stations 
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
