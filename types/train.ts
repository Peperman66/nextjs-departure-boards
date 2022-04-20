import { Timetable } from "./timetable"

export type Train = {
	name: string
	departures ?: Timetable[]
}
