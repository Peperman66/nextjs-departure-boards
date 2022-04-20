import { IncomingMessage } from 'http'
import { NextApiRequest } from 'next'
import {Server} from 'socket.io'
import {v4} from 'uuid'
import { WebsocketEvents } from '../../types/websocket'
import { createStation, getStations } from '../../handlers/dbHandler'
import { Station } from '../../types/station'

const connections = []

const SocketHandler = (req: NextApiRequest, res: any) => {
	if (!res.socket.server.io) {
		const io = new Server(res.socket.server)
		res.socket.server.io = io
		console.log("New connection!")
		io.engine.generateId = (req: IncomingMessage) => {
			return v4()
		}
		io.on('connection', async socket => {
			const stations = await getStations();
			socket.emit(WebsocketEvents.StationsUpdate, stations);
		});

		io.on(WebsocketEvents.StationCreate, async (data: Station) => {
			createStation(data)
		})
	}
	res.end()
}

export default SocketHandler
