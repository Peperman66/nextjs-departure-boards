import { Timetable } from "./timetable";

export type Station = {
	name: string;
	id: string;
	timetables?: Timetable[];
}
