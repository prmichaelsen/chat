const print = async (...msgs: any[]) => {
  for (let i = 0; i < msgs.length; i++) {
    const msg = msgs[i];
    await new Promise<void>((resolve) =>
      process.stdin.write(msg, "utf-8", () => resolve())
    );
    if (i < msgs.length - 1) {
      await new Promise<void>((resolve) =>
        process.stdin.write(" ", "utf-8", () => resolve())
      );
    }
  }
  await new Promise<void>((resolve) =>
    process.stdin.write("\n", "utf-8", () => resolve())
  );
};

const printn = async (...msgs: any[]) => {
  print(...msgs, "\n");
};

export const stdin = {
  print,
  printn,
};
