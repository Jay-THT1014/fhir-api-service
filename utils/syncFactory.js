const { enqueueSyncJob } = require("../queue/producer");
const logger = require("./logger");

function createSyncRoute(resourceType) {
  return async (req, res, next) => {
    try {
      const { sourceSystem, sourceId, operation, ...rest } = req.body;

      const finalSourceId = sourceId || `${resourceType}_${Date.now()}`;
      const finalPayloadData = {
        id: finalSourceId,
        ...rest,
      };

      const jobId = await enqueueSyncJob({
        sourceSystem: sourceSystem || "unknown",
        tenantId: "default",
        resourceType: resourceType,
        sourceId: finalSourceId,
        operation: operation || "upsert",
        payloadData: finalPayloadData,
      });

      logger.info(`Job ${jobId} enqueued for ${resourceType} ${finalSourceId}`);
      res.status(202).json({ jobId, status: "QUEUED" });
    } catch (error) {
      logger.error(`Failed to ingest ${resourceType.toLowerCase()} sync request: ${error.message}`);
      next(error);
    }
  };
}

module.exports = {
  createSyncRoute,
};
