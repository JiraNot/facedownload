import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { deflateRawSync } from "node:zlib";

const extensionRoot = path.resolve("browser-extension");
const outputPath = path.resolve("public/downloads/facebook-video-loader-extension.zip");
const manifest = JSON.parse(await readFile(path.join(extensionRoot, "manifest.json"), "utf8"));

async function listFiles(directory, prefix = "") {
  const children = await readdir(directory, { withFileTypes: true });
  children.sort((a, b) => a.name.localeCompare(b.name));
  const files = [];

  for (const child of children) {
    const absolutePath = path.join(directory, child.name);
    const relativePath = prefix ? `${prefix}/${child.name}` : child.name;
    if (child.isDirectory()) files.push(...await listFiles(absolutePath, relativePath));
    else if (child.isFile()) files.push({ absolutePath, relativePath });
  }

  return files;
}

const crcTable = new Uint32Array(256);
for (let n = 0; n < crcTable.length; n += 1) {
  let value = n;
  for (let bit = 0; bit < 8; bit += 1) value = value & 1 ? 0xedb88320 ^ (value >>> 1) : value >>> 1;
  crcTable[n] = value >>> 0;
}

function crc32(bytes) {
  let value = 0xffffffff;
  for (const byte of bytes) value = crcTable[(value ^ byte) & 0xff] ^ (value >>> 8);
  return (value ^ 0xffffffff) >>> 0;
}

function zipDateTime() {
  return { time: 0, date: 0x21 };
}

function makeLocalHeader(name, content, compressed) {
  const filename = Buffer.from(name, "utf8");
  const header = Buffer.alloc(30);
  const { time, date } = zipDateTime();
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0x0800, 6);
  header.writeUInt16LE(8, 8);
  header.writeUInt16LE(time, 10);
  header.writeUInt16LE(date, 12);
  header.writeUInt32LE(crc32(content), 14);
  header.writeUInt32LE(compressed.length, 18);
  header.writeUInt32LE(content.length, 22);
  header.writeUInt16LE(filename.length, 26);
  header.writeUInt16LE(0, 28);
  return Buffer.concat([header, filename, compressed]);
}

function makeCentralHeader(name, content, compressed, offset) {
  const filename = Buffer.from(name, "utf8");
  const header = Buffer.alloc(46);
  const { time, date } = zipDateTime();
  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(20, 6);
  header.writeUInt16LE(0x0800, 8);
  header.writeUInt16LE(8, 10);
  header.writeUInt16LE(time, 12);
  header.writeUInt16LE(date, 14);
  header.writeUInt32LE(crc32(content), 16);
  header.writeUInt32LE(compressed.length, 20);
  header.writeUInt32LE(content.length, 24);
  header.writeUInt16LE(filename.length, 28);
  header.writeUInt16LE(0, 30);
  header.writeUInt16LE(0, 32);
  header.writeUInt16LE(0, 34);
  header.writeUInt16LE(0, 36);
  header.writeUInt32LE(0, 38);
  header.writeUInt32LE(offset, 42);
  return Buffer.concat([header, filename]);
}

const files = await listFiles(extensionRoot);
if (!files.some(({ relativePath }) => relativePath === "manifest.json")) {
  throw new Error("The extension package is missing manifest.json");
}

const localParts = [];
const centralParts = [];
let localOffset = 0;
for (const file of files) {
  const content = await readFile(file.absolutePath);
  const compressed = deflateRawSync(content, { level: 9 });
  const local = makeLocalHeader(file.relativePath, content, compressed);
  localParts.push(local);
  centralParts.push(makeCentralHeader(file.relativePath, content, compressed, localOffset));
  localOffset += local.length;
}

const centralDirectory = Buffer.concat(centralParts);
const end = Buffer.alloc(22);
end.writeUInt32LE(0x06054b50, 0);
end.writeUInt16LE(0, 4);
end.writeUInt16LE(0, 6);
end.writeUInt16LE(files.length, 8);
end.writeUInt16LE(files.length, 10);
end.writeUInt32LE(centralDirectory.length, 12);
end.writeUInt32LE(localOffset, 16);
end.writeUInt16LE(0, 20);

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, Buffer.concat([...localParts, centralDirectory, end]));
console.log(`Packaged Facebook Video Loader extension v${manifest.version} (${files.length} files)`);
