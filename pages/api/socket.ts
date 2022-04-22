import { NextApiRequest } from 'next'
import {Server as ServerIO} from 'socket.io'
import { WebsocketEvents } from '../../types/websocket'
import { createStation, createTrain, deleteStation, deleteTrain, getStations, getStationsWithAllTimetables, getTrains, updateTimetable } from '../../handlers/dbHandler'
import { Station } from '../../types/station'
import { Train } from '../../types/train'
import { Timetable } from '../../types/timetable'

const connections = []

const SocketHandler = (req: NextApiRequest, res: any) => {
	if (!res.socket.server.io) {
		console.log("First use, starting socket.io")

		const io = new ServerIO(res.socket.server)

		/*io.engine.generateId = (req: IncomingMessage) => {
			return v4()
		}*/
		io.on('connection', async socket => {
			console.log("Somebody connected!")
			const stations = await getStationsWithAllTimetables();
			console.log(stations)
			socket.emit(WebsocketEvents.StationsUpdate, stations);
			socket.emit(WebsocketEvents.StationTrainsUpdate, await getTrains())
			
			socket.on(WebsocketEvents.StationCreate, async (data: Station) => {
				console.log("New message")
				await createStation(data)
				const stations = await getStationsWithAllTimetables()
				console.log(stations)
				io.emit(WebsocketEvents.StationsUpdate, stations)
			});

			socket.on(WebsocketEvents.StationDelete, async (id: string) => {
				await deleteStation(id)
				io.emit(WebsocketEvents.StationsUpdate, await getStationsWithAllTimetables())
			});

			socket.on(WebsocketEvents.TrainTimetableUpdate, async (timetable: Timetable) => {
				await updateTimetable(timetable)
				io.emit(WebsocketEvents.StationTrainsUpdate, await getTrains())
				io.emit(WebsocketEvents.StationsUpdate, await getStationsWithAllTimetables())
			})

			socket.on(WebsocketEvents.TrainCreate, async (train: Train) => {
				await createTrain(train)
				io.emit(WebsocketEvents.StationTrainsUpdate, await getTrains())
				io.emit(WebsocketEvents.StationsUpdate, await getStationsWithAllTimetables())
			})

			socket.on(WebsocketEvents.TrainDelete, async (train: Train) => {
				await deleteTrain(train)
				io.emit(WebsocketEvents.StationTrainsUpdate, await getTrains())
				io.emit(WebsocketEvents.StationsUpdate, await getStationsWithAllTimetables())
			})
		});
		res.socket.server.io = io
	} else {
		console.log("Socket.io already running!")
	}
	res.end()
}

export default SocketHandler
