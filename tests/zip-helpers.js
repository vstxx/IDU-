const fs = require("fs");

const END_OF_CENTRAL_DIRECTORY = 0x06054b50;
const CENTRAL_DIRECTORY_ENTRY = 0x02014b50;
const MAX_ZIP_COMMENT_LENGTH = 0xffff;

const listZipEntries = (filePath) => {
  const bytes = fs.readFileSync(filePath);
  const searchStart = Math.max(0, bytes.length - MAX_ZIP_COMMENT_LENGTH - 22);
  let directoryEnd = -1;

  for (let offset = bytes.length - 22; offset >= searchStart; offset -= 1) {
    if (bytes.readUInt32LE(offset) === END_OF_CENTRAL_DIRECTORY) {
      directoryEnd = offset;
      break;
    }
  }

  if (directoryEnd < 0) {
    throw new Error(`Missing ZIP central directory: ${filePath}`);
  }

  const entryCount = bytes.readUInt16LE(directoryEnd + 10);
  let offset = bytes.readUInt32LE(directoryEnd + 16);
  const entries = [];

  for (let index = 0; index < entryCount; index += 1) {
    if (bytes.readUInt32LE(offset) !== CENTRAL_DIRECTORY_ENTRY) {
      throw new Error(`Invalid ZIP central directory entry: ${filePath}`);
    }

    const nameLength = bytes.readUInt16LE(offset + 28);
    const extraLength = bytes.readUInt16LE(offset + 30);
    const commentLength = bytes.readUInt16LE(offset + 32);
    entries.push(bytes.toString("utf8", offset + 46, offset + 46 + nameLength));
    offset += 46 + nameLength + extraLength + commentLength;
  }

  return entries;
};

module.exports = { listZipEntries };
