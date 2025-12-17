export function sample<T>(x: Array<T>) {
	return x[Math.floor(Math.random() * x.length)];
}
