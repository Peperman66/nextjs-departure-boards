import { GetServerSideProps } from "next"
import Head from "next/head"
import { useRouter } from "next/router"
import { FC, useEffect, useState } from "react"
import { io, Socket } from "socket.io-client"
import Header from "../../../components/header"
import TrainManageTable from "../../../components/trainManageTable"
import { getStations, getStationsWithAllTimetables, getTrains } from "../../../handlers/dbHandler"
import { Station } from "../../../types/station"
import { Timetable } from "../../../types/timetable"
import { Train } from "../../../types/train"
import { WebsocketEvents } from "../../../types/websocket"
/*
export const getServerSideProps: GetServerSideProps = async (context) => {
	const {id} = context.query;
	let station: Station;
	if (typeof id === "string") {
		station = await getStationsWithAllTimetables(id)
	}
	const stations = await getStations()
	let trains = JSON.stringify(await getTrains())
	if (trains == '{}') trains = '[]'
	return {
		props: {
			trains: trains,
			//@ts-ignore
			station: JSON.stringify(station),
			allStations: JSON.stringify(stations)
		}
	}
}
*/
const ManageStation: FC/*<{trains: string, station: string, allStations: string}>*/ = (props) => {
	const [trains, setTrains] = useState<Train[]>([]/*JSON.parse(props.trains)*/);
	const [socket, setSocket] = useState<Socket>()
	const [stations, setStations] = useState<Station[]>([]/*JSON.parse(props.allStations)*/)
	const router = useRouter()
	const {id} = router.query
	const station = stations.find(x => x.id == id)
	useEffect(() => {
		if (!station && false) {
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

		thisSocket.on(WebsocketEvents.StationTrainsUpdate, (trains: Train[]) => {
			setTrains(trains)
		});
		
		thisSocket.on(WebsocketEvents.StationsUpdate, (stations: Station[]) => {
			setStations(stations)
		})
		
		setSocket(thisSocket)
	}

	const socketDestroyer = () => {
		socket?.close();
	}

	const setDisplayOnBoard = (state: boolean, trainName: string) => {
		const timetable = station?.timetables?.find(x => x.trainName === trainName)
		if (timetable) {
			timetable.displayOnBoard = state
			socket?.emit(WebsocketEvents.TrainTimetableUpdate, timetable)
		}
	}

	const setRealDeparture = (time: Date, trainName: string) => {
		const timetable = station?.timetables?.find(x => x.trainName === trainName)
		if (timetable) {
			const customTimetable = timetable
			customTimetable.realDeparture = time
			socket?.emit(WebsocketEvents.TrainTimetableUpdate, customTimetable)
		} 
	}

	const createTrain = (train: Train) => {
		socket?.emit(WebsocketEvents.TrainCreate, train)
	}

	const deleteTrain = (train: Train) => {
		socket?.emit(WebsocketEvents.TrainDelete, train)
	}

	return (
		<div>
			<Head>
				<title>{station?.name}</title>
			</Head>
			<Header header={station?.name || ""}/>
			{station && (
				<TrainManageTable station={station} allStations={stations} setDisplayOnBoard={setDisplayOnBoard} setRealDeparture={setRealDeparture} createTrain={createTrain} deleteTrain={deleteTrain}/>	
			)}
		</div>
	)
}

export default ManageStation
