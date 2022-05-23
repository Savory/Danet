export interface Renderer {
	setRootDir(directory: string): void;
	render(filename: string, data: unknown): Promise<string>;
}
