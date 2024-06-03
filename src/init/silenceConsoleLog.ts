/* Stop AWS SDK from foolishly printing 
warnings in my production application. */
export const silenceConsoleLog = () => {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
  console.debug = () => {};
  console.info = () => {};
};
