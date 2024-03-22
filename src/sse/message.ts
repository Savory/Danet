export interface SSEMessage {
    data: string
    event?: string
    id?: string
    retry?: number
}