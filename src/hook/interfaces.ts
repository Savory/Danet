export interface OnAppBootstrap {
	onAppBootstrap(): void | Promise<void>;
}

export interface OnAppClose {
	onAppClose(): void | Promise<void>;
}

export type hookName = 'onAppClose' | 'onAppBootstrap';
