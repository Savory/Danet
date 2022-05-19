export interface OnAppBootstrap {
	onAppBootstrap(): void | Promise<void>;
}

export interface OnAppClose {
	onAppClose(): void | Promise<void>;
}
