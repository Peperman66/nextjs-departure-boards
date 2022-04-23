import { time } from "console"
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

export const getServerSideProps: GetServerSideProps = async (context) => {
	const stations = await getStationsWithAllTimetables()
	return {
		props: {
			stations: JSON.stringify(stations)
		}
	}
}

const getTimetableWithDatesConverted = (timetable: Timetable) => {
	timetable.arrival = timetable.arrival ? new Date(timetable.arrival) : undefined
	timetable.departure = timetable.departure ? new Date(timetable.departure) : undefined
	timetable.realDeparture = timetable.realDeparture ? new Date(timetable.realDeparture) : undefined
	return timetable
}

const getStationsWithDatesConverted = (stations: Station[]): Station[] => {
	return (stations.map(station => {
		station.timetables = station.timetables?.map(timetable => {
			timetable = getTimetableWithDatesConverted(timetable)
			if (timetable.train?.departures) {
				timetable.train.departures = timetable.train?.departures?.map(timetable => {
					return getTimetableWithDatesConverted(timetable)
				})
			}
			return timetable
		})
		return station
	}))
}

const ManageStation: FC<{stations: string}> = (props) => {
	const parsedStations: Station[] = JSON.parse(props.stations) 
	const [socket, setSocket] = useState<Socket>()
	const [stations, setStations] = useState<Station[]>(getStationsWithDatesConverted(parsedStations))
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

		thisSocket.on(WebsocketEvents.StationsUpdate, (stations: Station[]) => {
			setStations(getStationsWithDatesConverted(stations))
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
