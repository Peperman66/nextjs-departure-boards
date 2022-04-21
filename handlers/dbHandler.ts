import { PrismaClient } from "@prisma/client"
import { Station } from "../types/station"
import { Timetable } from "../types/timetable"
import { Train } from "../types/train"

const prisma = new PrismaClient()

export const getStations = async () => {
	const stations = await prisma.station.findMany() as Station[]
	return stations
}

export const getStationWithAllTimetables = async (id: string) => {
	const station = await prisma.station.findFirst({
		where: {
			id: id
		},
		include: {
			timetables: {
				include: {
					train: {
						include: {
							departures: true
						}
					}
				}
			}
		}
	});
	return station as Station;
}

export const createStation = async (station: Station) => {
	await prisma.station.create({
		data: {
			id: station.id,
			name: station.name
		}
	})
}

export const deleteStation = async (id: string) => {
	await prisma.station.delete({
		where: {
			id: id
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
