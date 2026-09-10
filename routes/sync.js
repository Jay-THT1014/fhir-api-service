const express = require("express");
const router = express.Router();
const { getJobStatus } = require("../queue/producer");
const apiKeyAuth = require("../middleware/auth");
const logger = require("../utils/logger");
const { createSyncRoute } = require("../utils/syncFactory");

router.use(apiKeyAuth);

const routes = {
  "/patient": "Patient",
  "/encounter": "Encounter",
  "/practitioner": "Practitioner",
  "/condition": "Condition",
  "/location": "Location",
  "/observation": "Observation",
  "/organization": "Organization",
  "/allergy-intolerance": "AllergyIntolerance",
  "/immunization": "Immunization",
  "/medication": "Medication",
  "/family-member-history": "FamilyMemberHistory",
  "/procedure": "Procedure",
  "/practitioner-role": "PractitionerRole",
  "/care-plan": "CarePlan",
  "/care-team": "CareTeam",
  "/coverage": "Coverage",
  "/device": "Device",
  "/diagnostic-report": "DiagnosticReport",
  "/document-reference": "DocumentReference",
  "/goal": "Goal",
  "/medication-dispense": "MedicationDispense",
  "/medication-request": "MedicationRequest",
  "/provenance": "Provenance",
  "/questionnaire-response": "QuestionnaireResponse",
  "/related-person": "RelatedPerson",
  "/service-request": "ServiceRequest",
  "/specimen": "Specimen"
};

for (const [path, resourceType] of Object.entries(routes)) {
  router.post(path, createSyncRoute(resourceType));
}

router.get("/:jobId", async (req, res, next) => {
  try {
    const { jobId } = req.params;
    const jobStatus = await getJobStatus(jobId);

    if (!jobStatus) {
      return res.status(404).json({ error: `Job ${jobId} not found` });
    }

    res.status(200).json(jobStatus);
  } catch (error) {
    logger.error(`Failed to retrieve job status for ${req.params.jobId}: ${error.message}`);
    next(error);
  }
});

module.exports = router;
