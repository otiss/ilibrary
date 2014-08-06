// this function is actually required by our build tool "grunt" for replacing template url
// will not be exposed to product environment
function __TPL__(url) {
	return url;
}
function __IL__(text) {
	return text;
}