import { PrismaClient } from "@prisma/client"
import { Station } from "../types/station"
import { Timetable } from "../types/timetable"
import { Train } from "../types/train"

const prisma = new PrismaClient()

export const getStations = async () => {
	const stations = await prisma.station.findMany() as Station[]
	return stations
}

export const getStationsWithAllTimetables = async () => {
	const station = await prisma.station.findMany({
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
	return station as Station[];
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

export const createTrain = async (train: Train) => {
	await prisma.train.create({
		data: {
			name: train.name,
			departures: {
				create: train.departures?.map((departure) => {
					return {
						stationId: departure.stationId,
						arrival: departure.arrival,
						departure: departure.departure,
						realDeparture: departure.realDeparture,
						displayOnBoard: departure.displayOnBoard
					}
				})
			}
		}
	})
}

export const deleteTrain = async (train: Train) => {
	const deleteTimetables = prisma.trainTimetable.deleteMany({
		where: {
			trainName: train.name
		}
	})

	const deleteTrain = prisma.train.delete({
		where: {
			name: train.name
		}
	})

	return prisma.$transaction([deleteTimetables, deleteTrain])
}

export const updateTimetable = async (timetable: Timetable) => {
	await prisma.trainTimetable.update({
		where: {
			trainName_stationId: {
				trainName: timetable.trainName,
				stationId: timetable.stationId
			}
		},
		data: {
			realDeparture: timetable.realDeparture,
			displayOnBoard: timetable.displayOnBoard
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
