export interface SSEMessage {
	data: string | object;
	event?: string;
	id?: string;
	retry?: number;
}
