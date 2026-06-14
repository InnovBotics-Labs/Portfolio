// crypto.ts — real PDF encryption/decryption via qpdf compiled to WASM.
// The wasm + glue are lazy-loaded the first time a user protects or opens an
// encrypted document, so they never weigh down the initial editor load.

export type Perms = { print: boolean; copy: boolean; edit: boolean };

type QpdfFS = {
  writeFile(path: string, data: Uint8Array): void;
  readFile(path: string): Uint8Array;
  unlink(path: string): void;
};
type QpdfModule = { FS: QpdfFS; callMain(args: string[]): number };
type QpdfFactory = (opts: Record<string, unknown>) => Promise<QpdfModule>;

let factoryPromise: Promise<QpdfFactory> | null = null;
function loadFactory(): Promise<QpdfFactory> {
  if (!factoryPromise) {
    // Load the qpdf ESM glue from /public at runtime so the bundler never tries
    // to resolve its node-only `import("path")`/`import("module")` branches
    // (they're guarded by `globalThis.process`, which is absent in the browser).
    const url = "/pdf-editor/qpdf" + ".mjs";
    factoryPromise = import(/* webpackIgnore: true */ /* turbopackIgnore: true */ url).then(
      (m) => (m as unknown as { default: QpdfFactory }).default,
    );
  }
  return factoryPromise;
}

async function runQpdf(args: string[], input: Uint8Array): Promise<Uint8Array> {
  const create = await loadFactory();
  let stderr = "";
  const mod = await create({
    locateFile: () => "/pdf-editor/qpdf.wasm",
    noInitialRun: true,
    print: () => {},
    printErr: (s: string) => { stderr += s + "\n"; },
  });
  mod.FS.writeFile("in.pdf", input);
  let code = 0;
  try {
    code = mod.callMain([...args, "in.pdf", "out.pdf"]);
  } catch (e) {
    const status = (e as { status?: number })?.status;
    if (typeof status === "number") code = status;
    else throw e;
  }
  // qpdf exit codes: 0 = ok, 3 = warnings (still produces output).
  if (code !== 0 && code !== 3) throw new Error("qpdf failed (" + code + "): " + stderr.trim());
  return mod.FS.readFile("out.pdf");
}

export async function encryptPdf(bytes: Uint8Array, password: string, perms?: Perms): Promise<Uint8Array> {
  const args = ["--encrypt", password, password, "256"];
  if (perms) {
    args.push("--print=" + (perms.print ? "full" : "none"));
    args.push("--modify=" + (perms.edit ? "all" : "none"));
    args.push("--extract=" + (perms.copy ? "y" : "n"));
  }
  args.push("--");
  return runQpdf(args, bytes);
}

export async function decryptPdf(bytes: Uint8Array, password: string): Promise<Uint8Array> {
  return runQpdf(["--password=" + password, "--decrypt", "--"], bytes);
}
