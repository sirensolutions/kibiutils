const BULK_REQUEST_TYPES = ['index', 'delete', 'create', 'update'];

/**
 *
 * @param {{
 *   ['index'|'delete'|'create'|'update']: {
 *     error?: Object,
 *     _id?: string
 *   }
 * }} bulkResponseItem
 * @returns {{
 *   error?: Object,
 *   _id?: string
 * }} documentOperationResponse
 */
function getDocumentOperationResponse(bulkResponseItem) {
  for (let actionType of BULK_REQUEST_TYPES) {
    const documentOpResponse = bulkResponseItem[actionType];
    if (documentOpResponse) {
      documentOpResponse._actionType = actionType;
      return documentOpResponse;
    }
  }
}

function getErrorIdentifier(error) {
  let errorType = '';
  for (let i = 0; i < 3; i++) { //Limiting the nesting to 3 for performance
    errorType += error.type;
    if (error.caused_by) {
      error = error.caused_by;
    } else {
      break;
    }
  }
  return errorType;
}

export default class PatchedEsClient {
  /**
   * Parses the {@link bulkResponse} for errors, logs (unique errors) and throws if found.
   * @param {Object} bulkResponse
   * @param {Logger} logger
   */
  static checkBulkResponse(bulkResponse, logger) {
    if (bulkResponse.errors) {
      const errorsDuringIndexing = bulkResponse.items.map(item => getDocumentOperationResponse(item)).filter((docResp) => docResp.error);
      errorsDuringIndexing.reduce(function (uniqueErrors, docResp) {
        const errorIdentifier = getErrorIdentifier(docResp.error);
        const existingError = uniqueErrors.find((ele) => ele.error._identifier === errorIdentifier);
        if (!existingError) {
          docResp.error._identifier = errorIdentifier;
          docResp.error.errorCount = 1;
          docResp.docIds = [docResp._id];
          uniqueErrors.push(docResp);
        } else {
          existingError.error.errorCount++;
          if (docResp._id && existingError.docIds.length < 5) {
            existingError.docIds.push(docResp._id);
          }
        }
        return uniqueErrors;
      }, []);

      let totalErrors = 0;
      errorsDuringIndexing.forEach(docResp => {
        const error = docResp.error;
        const causedBy = error.caused_by || error;
        // Should we also log (upto first 5) docIds?
        logger.error(`(${error.errorCount}) ${error.type}: ${causedBy.reason}`);
        totalErrors += error.errorCount;
      });
      throw new Error(`${totalErrors} error(s) occurred in bulk request`);

    } else if (bulkResponse.error !== undefined) {
      logger.error(bulkResponse.error);
      throw new Error(bulkResponse.error);
    }
  }

  constructor(esClient, logger) {
    this._client = esClient;
    this.logger = logger;

    // Wrapping bulk method to auto-parse (and throw) any errors
    this.originalBulk = this._client.bulk.bind(this._client);
    this._client.bulk = async (...args) => {
      const resp = await this.originalBulk(...args);
      PatchedEsClient.checkBulkResponse(resp, this._logger);
      return resp;
    };
  }

  getEsClient() {
    return this._client;
  }

  cleanup() {
    this._client.bulk = this.originalBulk;
  }
}
