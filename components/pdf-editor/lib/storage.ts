// storage.ts — IndexedDB persistence for the working document and session
// outputs, so they survive a page reload. Backed by idb-keyval.

import { get, set, del, keys } from "idb-keyval";
import type { Annotation } from "./engine";

export type StoredDoc = {
  id: string;
  name: string;
  kind: "document" | "export" | "split";
  bytes: Uint8Array; // full PDF bytes (already built/flattened)
  annotations?: Record<string, Annotation[]>;
  pageCount: number;
  when: number;
};

const PREFIX = "psdf:";
const key = (id: string) => PREFIX + id;

export async function saveDoc(d: StoredDoc): Promise<void> {
  await set(key(d.id), d);
}

export async function listDocs(): Promise<StoredDoc[]> {
  const ks = (await keys()) as string[];
  const docs: StoredDoc[] = [];
  for (const k of ks) {
    if (typeof k === "string" && k.startsWith(PREFIX)) {
      const d = await get<StoredDoc>(k);
      if (d) docs.push(d);
    }
  }
  return docs.sort((a, b) => b.when - a.when);
}

export async function loadDoc(id: string): Promise<StoredDoc | undefined> {
  return get<StoredDoc>(key(id));
}

export async function renameDoc(id: string, name: string): Promise<void> {
  const d = await get<StoredDoc>(key(id));
  if (d) await set(key(id), { ...d, name });
}

export async function deleteDoc(id: string): Promise<void> {
  await del(key(id));
}
