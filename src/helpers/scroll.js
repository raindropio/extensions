export default {
	scrollTo(elem, scrollTo) {
		var scrollDuration = 200;

		var cosParameter = (elem.scrollTop - scrollTo) / 2,
			scrollCount = 0,
			oldTimestamp = window.performance.now();

		function step(newTimestamp) {

			var tsDiff = newTimestamp - oldTimestamp;

			// Performance.now() polyfill loads late so passed-in timestamp is a larger offset
			// on the first go-through than we want so I'm adjusting the difference down here.
			// Regardless, we would rather have a slightly slower animation than a big jump so a good
			// safeguard, even if we're not using the polyfill.

			if (tsDiff > 100) {
				tsDiff = 30;
			}

			scrollCount += Math.PI / (scrollDuration / tsDiff);

			// As soon as we cross over Pi, we're about where we need to be

			if (scrollCount >= Math.PI) {
				return;
			}

			var moveStep = Math.round(scrollTo + cosParameter + cosParameter * Math.cos(scrollCount));

			elem.scrollTop = moveStep;
			oldTimestamp = newTimestamp;
			window.requestAnimationFrame(step);
		}

		window.requestAnimationFrame(step);
	}
}