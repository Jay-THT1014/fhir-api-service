const express = require("express");
const router = express.Router();
const apiKeyAuth = require("../middleware/auth");
const logger = require("../utils/logger");
const db = require("../config/db");
const { MedplumClient } = require("@medplum/core");

router.use(apiKeyAuth);

router.post("/", async (req, res, next) => {
  try {
    const { sourceSystem, tenantId, patientId, encounterId, practitionerId } = req.body;

    if (!patientId) {
      return res.status(400).json({ error: "patientId is required" });
    }

    const safeSourceSystem = sourceSystem || "your-ehr";
    const safeTenantId = tenantId || "default";

    const sourceIdsToLookup = [patientId];
    if (encounterId) sourceIdsToLookup.push(encounterId);
    if (practitionerId) sourceIdsToLookup.push(practitionerId);

    const query = `
      SELECT source_id, resource_type, fhir_resource_id
      FROM fhir_resource_mapping
      WHERE tenant_id = $1
        AND source_system = $2
        AND source_id = ANY($3)
    `;

    const result = await db.query(query, [safeTenantId, safeSourceSystem, sourceIdsToLookup]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "No FHIR mappings found for the provided source IDs." });
    }

    const mapping = {};
    for (const row of result.rows) {
      mapping[row.source_id] = {
        resourceType: row.resource_type,
        fhirId: row.fhir_resource_id,
      };
    }

    if (!mapping[patientId]) {
      return res.status(404).json({ error: `Patient mapping not found for sourceId: ${patientId}` });
    }

    const medplum = new MedplumClient({
      baseUrl: process.env.MEDPLUM_BASE_URL || "http://localhost:8103",
    });

    await medplum.startClientLogin(process.env.MEDPLUM_CLIENT_ID, process.env.MEDPLUM_CLIENT_SECRET);

    const launchData = {
      resourceType: "SmartAppLaunch",
      patient: {
        reference: `Patient/${mapping[patientId].fhirId}`,
      },
    };

    if (encounterId && mapping[encounterId]) {
      launchData.encounter = {
        reference: `Encounter/${mapping[encounterId].fhirId}`,
      };
    }

    const smartLaunch = await medplum.createResource(launchData);

    logger.info(`Successfully created SmartAppLaunch context.Launch ID: ${smartLaunch.id} `);

    res.status(200).json({
      launch: smartLaunch.id,
      patient: mapping[patientId].fhirId,
      encounter: encounterId && mapping[encounterId] ? mapping[encounterId].fhirId : undefined,
    });
  } catch (error) {
    logger.error(`Failed to generate SMART launch context: ${error.message} `);
    next(error);
  }
});

module.exports = router;
