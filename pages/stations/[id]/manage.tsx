import { GetServerSideProps } from "next"
import Head from "next/head"
import { useRouter } from "next/router"
import { FC, useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"
import Header from "../../../components/header"
import TrainManageTable from "../../../components/trainManageTable"
import { getStations, getStationWithAllTimetables, getTrains } from "../../../handlers/dbHandler"
import { Station } from "../../../types/station"
import { Timetable } from "../../../types/timetable"
import { Train } from "../../../types/train"
import { WebsocketEvents } from "../../../types/websocket"

export const getServerSideProps: GetServerSideProps = async (context) => {
	const {id} = context.query;
	let station: Station;
	if (typeof id === "string") {
		station = await getStationWithAllTimetables(id)
	}
	let trains = JSON.stringify(await getTrains())
	if (trains == '{}') trains = '[]'
	return {
		props: {
			trains: trains,
			//@ts-ignore
			station: station
		}
	}
}

const ManageStation: FC<{trains: string, station: Station}> = (props) => {
	const [trains, setTrains] = useState<Train[]>(JSON.parse(props.trains));
	const [socket, setSocket] = useState<Socket>()
	const router = useRouter()
	const station = props.station
	const {id} = router.query
	useEffect(() => {
		if (!station) {
			alert("Stanice nenalezena!")
		} else {
			socketInitializer()
		}
		return () => {
			socketDestroyer()
		}
	}, []);
	const socketInitializer = async () => {
		await fetch('/api/socket')
		let thisSocket = io()

		thisSocket.on(WebsocketEvents.TrainTimeUpdate, (trains: Train[]) => {
			setTrains(trains)
		});
		setSocket(thisSocket)
	}

	const socketDestroyer = () => {
		socket?.close();
	}
	return (
		<>
			<Head>
				<title>{station.name}</title>
			</Head>
			<Header header={station.name}/>
			<TrainManageTable station={station}/>	
		</>
	)
}

export default ManageStation
