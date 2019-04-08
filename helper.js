const delay = duration => new Promise(resolve => setTimeout(resolve, duration));
exports.delay = delay;
exports.timeout = async (duration) => {
  await delay(duration);
  throw new Error('Timeout !');
}
