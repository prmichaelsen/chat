import { _console } from "./_console";

const print = (...msgs: any[]) => {
  _console.log(...msgs);
};
const printn = (...msgs: any[]) => {
  _console.log(...msgs, "\n");
};
const error = (...msgs: any[]) => {
  _console.error(...msgs);
};
const errorn = (...msgs: any[]) => {
  _console.error(...msgs, "\n");
};

export const log = {
  print,
  printn,
  error,
  errorn,
};
