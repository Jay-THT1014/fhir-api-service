const { Queue } = require("bullmq");
const logger = require("../utils/logger");
const db = require("../config/db");
const crypto = require("crypto");

const QUEUE_NAME = "fhir-sync-queue";
const REDIS_HOST = process.env.REDIS_HOST || "localhost";
const REDIS_PORT = process.env.REDIS_PORT || 6380;
const REDIS_PASSWORD = process.env.REDIS_PASSWORD || "medplum";

const connection = {
  host: REDIS_HOST,
  port: REDIS_PORT,
  password: REDIS_PASSWORD,
};

const fhirQueue = new Queue(QUEUE_NAME, { connection });

async function enqueueSyncJob({ sourceSystem, tenantId, resourceType, sourceId, operation, payloadData }) {
  try {
    const jobUuid = crypto.randomUUID();

    const safeSourceSystem = sourceSystem || "your-ehr";
    const safeTenantId = tenantId || "default";
    const safeOperation = operation || "upsert";

    await db.query(
      `INSERT INTO fhir_sync_job
       (tenant_id, source_system, source_id, resource_type, operation, status, job_uuid)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [safeTenantId, safeSourceSystem, sourceId, resourceType, safeOperation, "QUEUED", jobUuid],
    );

    const payload = {
      jobId: jobUuid,
      sourceSystem: safeSourceSystem,
      tenantId: safeTenantId,
      resourceType,
      sourceId,
      operation: safeOperation,
      payloadData: payloadData,
      createdAt: new Date().toISOString(),
    };

    const job = await fhirQueue.add("sync-resource", payload, {
      jobId: payload.jobId,
      removeOnComplete: 86400,
      removeOnFail: 86400,
      attempts: 4,
      backoff: {
        type: "exponential",
        delay: 2000,
      },
    });

    logger.info(`Successfully enqueued ${resourceType} sync job for sourceId ${sourceId} [BullMQ ID: ${job.id}]`);
    return jobUuid;
  } catch (error) {
    logger.error(`Error queuing sync job: ${error.message}`);
    throw error;
  }
}

async function getJobStatus(jobId) {
  try {
    const result = await db.query(
      `SELECT
         j.status,
         j.last_error,
         m.fhir_resource_id
       FROM fhir_sync_job j
       LEFT JOIN fhir_resource_mapping m
         ON j.tenant_id = m.tenant_id
         AND j.source_system = m.source_system
         AND j.resource_type = m.resource_type
         AND j.source_id = m.source_id
       WHERE j.job_uuid = $1`,
      [jobId],
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    const response = { status: row.status };

    if (row.status === "COMPLETED" && row.fhir_resource_id) {
      response.fhirResourceId = row.fhir_resource_id;
    } else if (row.status === "FAILED" && row.last_error) {
      response.error = row.last_error;
    }

    return response;
  } catch (error) {
    logger.error(`Error checking job status: ${error.message}`);
    throw error;
  }
}

module.exports = {
  enqueueSyncJob,
  getJobStatus,
  fhirQueue,
};
