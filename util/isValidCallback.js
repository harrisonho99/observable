/* isValidCallback accept cb and message.
It check valid function and optionally throw custom Error message*/
function isValidCallback(callback, message = 'Callback is not a function') {
  if (typeof callback !== 'function') {
    throw new Error(message);
  }
}

export default isValidCallback;
