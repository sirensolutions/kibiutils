function isMeta(meta) {
  return meta.delete || meta.index || meta.create || meta.update;
}

export function getBatchSize(bulkBody, batchOperationNumber) {
  let batchSize = 0;
  let metaIndex = 0;
  let row;
  while(batchOperationNumber > 0) {
    row = bulkBody[metaIndex];
    if (!row) {
      // there is less data than batchOperationNumber
      break;
    }
    if (!isMeta(row)) {
      throw new Error(`Incorrect bulk body expected meta row at index ${metaIndex} but got: ${JSON.stringify(row)}`)
    }
    if (row.delete) {
      // ONLY delete operation does NOT have the body row
      batchSize += 1;
      metaIndex += 1;
    } else {
      // The next line should not be meta, should be a payload
      const nextRow = bulkBody[metaIndex + 1];
      if (nextRow === undefined) {
        throw new Error(`Incorrect bulk body expected additional payload row at index ${metaIndex + 1} but got nothing`);
      }
      if (isMeta(nextRow)) {
        throw new Error(`Incorrect bulk body expected payload row at index ${metaIndex + 1} but got: ${JSON.stringify(nextRow)}`)
      }
      batchSize += 2;
      metaIndex += 2;
    }
    batchOperationNumber--;
  }
  return batchSize;
}

export async function waitUntilArrayIsEmpty(arr, stepTime = 50) {
  if (arr.length === 0) {
    return;
  }
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(waitUntilArrayIsEmpty(arr, stepTime))
    }, 50);
  })
}
