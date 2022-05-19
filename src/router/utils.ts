export function trimSlash(path: string) {
	if (path[path.length - 1] === '/') {
		path = path.substring(0, path.length - 1);
	}
	if (path[0] === '/') {
		path = path.substring(1, path.length);
	}
	return path;
}
