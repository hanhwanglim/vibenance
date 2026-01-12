import React from "react";

export function useSkipper() {
	const shouldSkipRef = React.useRef(true);
	const shouldSkip = shouldSkipRef.current;

	const skip = React.useCallback(() => {
		shouldSkipRef.current = false;
	}, []);

	React.useEffect(() => {
		shouldSkipRef.current = true;
	});

	return [shouldSkip, skip] as const;
}
