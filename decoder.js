function decodeInstructionData(data) {
  const buffer = data;
  const discriminator = buffer.readUInt8(0);

  if (discriminator === 2) {
    const units = buffer.readUInt32LE(1);
    return { discriminator, units };
  } else if (discriminator === 3) {
    const microLamports = buffer.readBigUInt64LE(1);
    return { discriminator, microLamports: microLamports.toString() };
  } else {
    return { discriminator, unknownData: buffer.slice(1).toString("hex") };
  }
}

module.exports = { decodeInstructionData };
