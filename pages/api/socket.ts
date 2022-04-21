import { IncomingMessage, Server } from 'http'
import { NextApiRequest } from 'next'
import {Server as ServerIO} from 'socket.io'
import {v4} from 'uuid'
import { WebsocketEvents } from '../../types/websocket'
import { createStation, deleteStation, getStations } from '../../handlers/dbHandler'
import { Station } from '../../types/station'

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
			const stations = await getStations();
			console.log(stations)
			socket.emit(WebsocketEvents.StationsUpdate, stations);
			
			socket.on(WebsocketEvents.StationCreate, async (data: Station) => {
				console.log("New message")
				await createStation(data)
				const stations = await getStations()
				console.log(stations)
				io.emit(WebsocketEvents.StationsUpdate, stations)
			});

			socket.on(WebsocketEvents.StationDelete, async (id: string) => {
				await deleteStation(id)
				io.emit(WebsocketEvents.StationsUpdate, await getStations())
			})
		});
		res.socket.server.io = io
	} else {
		console.log("Socket.io already running!")
	}
	res.end()
}

export default SocketHandler
