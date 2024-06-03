import * as fs from "node:fs";
import * as mkdirp from "mkdirp";
import * as path from "path";
import { Writable } from "node:stream";
import { log } from "./log";
import { stdin } from "./stdin";

export const Fd = {
  stdin: 0,
  stdout: 1,
  stderr: 2,
};
const defaults = {
  0: {
    print: stdin.print,
    printn: stdin.printn,
  },
  1: {
    print: log.print,
    printn: log.printn,
  },
  2: {
    print: log.error,
    printn: log.errorn,
  },
};
defaults[Fd.stdin] = defaults[0];
defaults[Fd.stdout] = defaults[1];
defaults[Fd.stderr] = defaults[2];

const cache = { ...defaults };

const writer = async (stream: Writable, ...msgs: any[]) => {
  for (let i = 0; i < msgs.length; i++) {
    const msg = msgs[i];
    await new Promise<void>((resolve) =>
      stream.write(msg, "utf-8", () => resolve())
    );
    if (i < msgs.length - 1) {
      await new Promise<void>((resolve) =>
        stream.write(msg, "utf-8", () => resolve())
      );
    }
  }
  await new Promise<void>((resolve) =>
    stream.write("\n", "utf-8", () => resolve())
  );
};

const parseFpish = (fpish: string) => {
  const pattern = /^mode:([rwa]+)([+]{0,1})\/(.+)/;
  const match = fpish.match(pattern);
  let fp = fpish;
  let flags = "a+";
  if (match) {
    const [, mode, plus, filePath] = match;
    if (mode === "w") {
      flags = `w${plus}`;
    } else if (mode === "a") {
      flags = `a${plus}`;
    } else if (mode === "rs") {
      flags = "rs";
    }
    fp = filePath;
  }
  return {
    flags,
    fp,
  };
};

const createWriteStream = (fpish: string) => {
  const { fp, flags } = parseFpish(fpish);
  mkdirp.sync(path.dirname(fp));
  return fs.createWriteStream(fp, { flags });
};

const createReadStream = (fpish: string) => {
  const { fp } = parseFpish(fpish);
  mkdirp.sync(path.dirname(fp));
  if (!fs.existsSync(fp)) {
    fs.writeFileSync(fp, "");
  }
  return fs.createReadStream(fp);
};

/** @param fpish mode:a/filepath or filepath */
const createWriter = (fpish: string) => {
  const { fp } = parseFpish(fpish);
  const writeStream = createWriteStream(fpish);
  const readStream = createReadStream(fpish);
  const close = () => {
    if (!writeStream.closed) {
      writeStream.close();
    }
    if (readStream.closed) {
      readStream.close();
    }
  };

  return {
    print: (...msgs) => writer(writeStream, ...msgs),
    printn: (...msgs) => writer(writeStream, ...msgs, "\n"),
    writeStream,
    readStream,
    close,
    clear: () => {
      close();
      fs.truncateSync(fp);
    },
    unlink: () => {
      close();
      fs.unlinkSync(fp);
    },
  };
};

// prettier-ignore
const mapString = (arr: any[]) => arr
    .filter((o: any): o is number | string => !!o)
    .map((o) => o.toString());

const print = async (
  /**
   * Array of `fd`s or `fpish`s
   */
  fdorfpishs: Array<number | string | undefined>,
  ...msgs: any[]
) => {
  const promises: Array<Promise<void>> = [];
  for (const fdorfpish of mapString(fdorfpishs)) {
    const printer = cache[fdorfpish];
    if (!printer) {
      try {
        cache[fdorfpish] = defaults[fdorfpish] || createWriter(fdorfpish);
      } catch (e) {
        log.error("[chat]", e);
      }
    }
    promises.push(cache[fdorfpish].print(...msgs));
  }
  await Promise.all(promises);
};
const printn = (
  fdorfps: Array<number | string | undefined>,
  ...msgs: any[]
) => {
  print(fdorfps, ...msgs);
};

const close = (fdorfpishs: Array<number | string | undefined>) => {
  for (const fdorfpish of mapString(fdorfpishs)) {
    const printer = cache[fdorfpish];
    if (printer && printer.close) {
      printer.close();
    }
    delete cache[printer];
  }
};

const clear = (fdorfpishs: Array<number | string | undefined>) => {
  for (const fdorfpish of mapString(fdorfpishs)) {
    const printer = cache[fdorfpish];
    if (printer && printer.clear) {
      printer.clear();
    }
    delete cache[printer];
  }
};

const unlink = (fdorfpishs: Array<number | string | undefined>) => {
  for (const fdorfpish of mapString(fdorfpishs)) {
    const printer = cache[fdorfpish];
    if (printer && printer.unlink) {
      printer.unlink();
    }
    delete cache[printer];
  }
};

const pipe = (
  rfdorfpishs: Array<number | string | undefined>,
  wfdorfpishs: Array<number | string | undefined>,
  options: { onEnd?: (fpish: string) => void } = {}
) => {
  for (const rfdorfpish of mapString(rfdorfpishs)) {
    for (const wfdorfpish of mapString(wfdorfpishs)) {
      const readStream = createReadStream(rfdorfpish);
      const writeStream = createWriteStream(wfdorfpish);
      readStream.on("end", () => {
        if (options.onEnd) {
          options.onEnd(rfdorfpish);
        }
      });
      readStream.pipe(writeStream);
    }
  }
};

export const stdio = {
  print,
  printn,
  close,
  clear,
  pipe,
  unlink,
};
