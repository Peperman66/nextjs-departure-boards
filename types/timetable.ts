import { Station } from "./station"
import { Train } from "./train"

export type Timetable = {
	train ?: Train
	trainName : string
	station ?: Station
	stationId : string
	arrival ?: Date
	departure ?: Date
	realDeparture ?: Date
	displayOnBoard: boolean
}
