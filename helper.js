const delay = duration => new Promise(resolve => setTimeout(resolve, duration));
exports.delay = delay;
exports.timeout = async () => {
  await delay(100);
  throw new Error('Timeout !');
}
