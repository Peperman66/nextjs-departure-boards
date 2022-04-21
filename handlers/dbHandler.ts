import { PrismaClient } from "@prisma/client"
import { Station } from "../types/station"
import { Timetable } from "../types/timetable"
import { Train } from "../types/train"

const prisma = new PrismaClient()

export const getStations = async () => {
	const stations = await prisma.station.findMany() as Station[]
	return stations
}

export const getStationName = async (id: string) => {
	const station = await prisma.station.findFirst({
		where: {
			id: id
		}
	});
	return station?.name;
}

export const createStation = (station: Station) => {
	return prisma.station.create({
		data: {
			id: station.id,
			name: station.name
		}
	})
}

export const getTrains = async () => {
	const trains = await prisma.train.findMany({
		include: {
			departures: {
				orderBy: [
					{
						departure: 'asc'
					},
					{
						arrival: 'asc'
					}
				]
			}
		}
	}) as Train[];
	return trains;
}
