const swaggerUi = require("swagger-ui-express");

const swaggerDocument = {
  openapi: "3.0.0",
  info: {
    title: "FHIR Integration API",
    version: "1.0.0",
    description: "Versioned API for triggering asynchronous FHIR synchronization jobs from external EHRs and systems.",
  },
  servers: [
    {
      url: "http://localhost:5000",
      description: "Local Development Server",
    },
  ],
  components: {
    securitySchemes: {
      ApiKeyAuth: {
        type: "apiKey",
        in: "header",
        name: "X-API-Key",
      },
    },
  },
  security: [
    {
      ApiKeyAuth: [],
    },
  ],
  paths: {
    "/api/v1/fhir/sync/patient": {
      post: {
        summary: "Trigger a Patient synchronization job",
        description:
          "Enqueues a job for the background worker to fetch, map, validate, and push a Patient resource to Medplum.",
        tags: ["FHIR Sync"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  sourceId: {
                    type: "string",
                    description: "The unique ID of the Patient in the source EHR system. Maps to Identifier.",
                    example: "123456",
                  },
                  sourceSystem: { type: "string", example: "localhost:8103" },
                  orgId: { type: "string", example: "452" },
                  tenantId: { type: "string", example: "tia" },
                  first_name: { type: "string", example: "John" },
                  last_name: { type: "string", example: "Doe" },
                  middle_name: { type: "string", example: "William" },
                  suffix: { type: "string", example: "Jr." },
                  previous_name: { type: "string", example: "Smith" },
                  email: { type: "string", example: "john.doe@example.com" },
                  phone: { type: "string", example: "555-123-4567" },
                  phone_use: { type: "string", example: "home" },
                  gender: { type: "string", example: "male" },
                  dob: { type: "string", format: "date", example: "1980-01-01" },
                  address_line1: { type: "string", example: "123 Main St" },
                  address_line2: { type: "string", example: "Apt 4B" },
                  city: { type: "string", example: "Springfield" },
                  state: { type: "string", example: "IL" },
                  postalCode: { type: "string", example: "62701" },
                  country: { type: "string", example: "US" },
                  address_use: { type: "string", example: "home" },
                  race: { type: "string", description: "OMB Category code (e.g., 2106-3 for White)", example: "2106-3" },
                  ethnicity: { type: "string", description: "OMB Category code (e.g., 2186-5 for Not Hispanic or Latino)", example: "2186-5" },
                  birthsex: { type: "string", example: "M" },
                  genderIdentity: { type: "string", description: "SNOMED CT code for Gender Identity", example: "446151000124109" },
                  tribalAffiliation: { type: "string", example: "100" },
                  sex: { type: "string", description: "Clinical sex SNOMED code", example: "248152002" },
                  active: { type: "boolean", example: true },
                  deceasedBoolean: { type: "boolean", example: false },
                  deceasedDateTime: { type: "string", format: "date-time" },
                  multipleBirthBoolean: { type: "boolean", example: false },
                  multipleBirthInteger: { type: "integer", example: 1 },
                  language: { type: "string", example: "en" },
                  preferred: { type: "boolean", example: true },
                  related: {
                    type: "object",
                    properties: {
                      patientId: { type: "string" },
                      type: { type: "string" },
                    },
                  },
                  operation: {
                    type: "string",
                    description: "The type of operation (upsert, delete, etc.)",
                    example: "upsert",
                  },
                },
                required: ["sourceId", "first_name", "last_name", "gender"],
              },
            },
          },
        },
        responses: {
          202: {
            description: "Job successfully enqueued",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    jobId: { type: "string" },
                    status: { type: "string", example: "QUEUED" },
                  },
                },
              },
            },
          },
          400: {
            description: "Invalid request payload",
          },
        },
      },
    },
    "/api/v1/fhir/sync/encounter": {
      post: {
        summary: "Trigger an Encounter synchronization job",
        description:
          "Enqueues a job for the background worker to fetch, map, validate, and push an Encounter resource to Medplum.",
        tags: ["FHIR Sync"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  sourceId: {
                    type: "string",
                    description: "The unique ID of the Encounter in the source EHR system (optional)",
                    example: "123",
                  },
                  sourceSystem: { type: "string", example: "localhost:8103" },
                  operation: {
                    type: "string",
                    description: "The type of operation (upsert, delete, etc.)",
                    example: "upsert",
                  },
                  status: { type: "string", example: "finished" },
                  encounterStart: { type: "string", format: "date-time", example: "2026-09-04T10:30:00+05:30" },
                  encounterEnd: { type: "string", format: "date-time", example: "2026-09-04T11:30:00+05:30" },
                  locationRef: { type: "string", example: "Location/123" },
                  locationName: { type: "string", example: "Main Clinic" },
                  start: { type: "string", format: "date-time" },
                  end: { type: "string", format: "date-time" },
                  patient_id: { type: "string", example: "123" },
                  doctor_id: { type: "string", example: "456" },
                  organization_id: { type: "string", example: "789" },
                },
              },
            },
          },
        },
        responses: {
          202: {
            description: "Job successfully enqueued",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { jobId: { type: "string" }, status: { type: "string", example: "QUEUED" } },
                },
              },
            },
          },
          400: { description: "Invalid request payload" },
        },
      },
    },
    "/api/v1/fhir/sync/practitioner": {
      post: {
        summary: "Trigger a Practitioner synchronization job",
        description:
          "Enqueues a job for the background worker to fetch, map, validate, and push a Practitioner resource to Medplum.",
        tags: ["FHIR Sync"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  sourceId: {
                    type: "string",
                    description: "The unique ID of the Practitioner in the source EHR system",
                    example: "123",
                  },
                  sourceSystem: { type: "string", example: "localhost:8103" },
                  operation: {
                    type: "string",
                    description: "The type of operation (upsert, delete, etc.)",
                    example: "upsert",
                  },
                  npi: { type: "string", example: "1234567890" },
                  first_name: { type: "string", example: "Alice" },
                  last_name: { type: "string", example: "Smith" },
                  middle_name: { type: "string", example: "Marie" },
                  suffix: { type: "string", example: "MD" },
                  phone: { type: "string", example: "555-123-4567" },
                  phone_use: { type: "string", example: "work" },
                  email: { type: "string", example: "alice.smith@hospital.com" },
                  email_use: { type: "string", example: "work" },
                  address_line1: { type: "string", description: "Street address line", example: "123 Medical Dr" },
                  address_line2: { type: "string", example: "Suite 300" },
                  city: { type: "string", example: "Metropolis" },
                  state: { type: "string", example: "NY" },
                  postalCode: { type: "string", example: "10001" },
                  country: { type: "string", example: "US" },
                  address_use: { type: "string", example: "work" },
                },
                required: ["sourceId", "first_name", "last_name", "npi"],
              },
            },
          },
        },
        responses: {
          202: {
            description: "Job successfully enqueued",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { jobId: { type: "string" }, status: { type: "string", example: "QUEUED" } },
                },
              },
            },
          },
          400: { description: "Invalid request payload" },
        },
      },
    },
    "/api/v1/fhir/sync/organization": {
      post: {
        summary: "Trigger an Organization synchronization job",
        description:
          "Enqueues a job for the background worker to fetch, map, validate, and push an Organization resource to Medplum.",
        tags: ["FHIR Sync"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  sourceId: {
                    type: "string",
                    description: "The unique ID of the Organization in the source EHR system",
                    example: "123",
                  },
                  sourceSystem: { type: "string", example: "localhost:8103" },
                  operation: {
                    type: "string",
                    description: "The type of operation (upsert, delete, etc.)",
                    example: "upsert",
                  },
                  active: { type: "boolean", example: true },
                  npi: { type: "string", example: "1234567890" },
                  clia: { type: "string", example: "12D3456789" },
                  name: { type: "string", example: "City Hospital" },
                  phone: { type: "string", example: "555-123-4567" },
                  phone_use: { type: "string", example: "work" },
                  email: { type: "string", example: "info@cityhospital.com" },
                  email_use: { type: "string", example: "work" },
                  address_line1: { type: "string", example: "456 Health Ave" },
                  address_line2: { type: "string", example: "Suite 100" },
                  city: { type: "string", example: "Springfield" },
                  state: { type: "string", example: "IL" },
                  postalCode: { type: "string", example: "62701" },
                  country: { type: "string", example: "US" },
                  address_use: { type: "string", example: "work" },
                  endpoint: { type: "string", description: "Reference to the source ID of an Endpoint resource", example: "end-1" },
                },
                required: ["sourceId", "active", "name"],
              },
            },
          },
        },
        responses: {
          202: {
            description: "Job successfully enqueued",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { jobId: { type: "string" }, status: { type: "string", example: "QUEUED" } },
                },
              },
            },
          },
          400: { description: "Invalid request payload" },
        },
      },
    },
    "/api/v1/fhir/sync/condition": {
      post: {
        summary: "Trigger a Condition synchronization job",
        description:
          "Enqueues a job for the background worker to fetch, map, validate, and push a Condition resource to Medplum.",
        tags: ["FHIR Sync"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  sourceId: {
                    type: "string",
                    description: "The unique ID of the Condition in the source EHR system (optional)",
                    example: "123",
                  },
                  sourceSystem: { type: "string", example: "localhost:8103" },
                  operation: {
                    type: "string",
                    description: "The type of operation (upsert, delete, etc.)",
                    example: "upsert",
                  },
                  patient_id: { type: "string", example: "123" },
                  encounter_id: { type: "string", example: "456" },
                  icd10_code: { type: "string", example: "J01.90" },
                  icd_title: { type: "string", example: "Acute sinusitis, unspecified" },
                  clinicalStatus: { type: "string", example: "active" },
                  verificationStatus: { type: "string", example: "confirmed" },
                  category: { type: "string", example: "encounter-diagnosis" },
                  severity_code: { type: "string", example: "24484000" },
                  severity_name: { type: "string", example: "Severe" },
                  onsetDateTime: { type: "string", format: "date-time" },
                  onsetAge: { type: "integer", example: 45 },
                  onsetPeriod: {
                    type: "object",
                    properties: {
                      start: { type: "string", format: "date-time" },
                      end: { type: "string", format: "date-time" },
                    },
                  },
                  recordedDate: { type: "string", format: "date-time" },
                  recorder_id: { type: "string", example: "PR-50" },
                  asserter_id: { type: "string", example: "PR-50" },
                  note: { type: "string", example: "Patient condition worsened over the last week." },
                },
              },
            },
          },
        },
        responses: {
          202: {
            description: "Job successfully enqueued",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { jobId: { type: "string" }, status: { type: "string", example: "QUEUED" } },
                },
              },
            },
          },
          400: { description: "Invalid request payload" },
        },
      },
    },
    "/api/v1/fhir/sync/location": {
      post: {
        summary: "Trigger a Location synchronization job",
        description:
          "Enqueues a job for the background worker to fetch, map, validate, and push a Location resource to Medplum.",
        tags: ["FHIR Sync"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  sourceId: {
                    type: "string",
                    description: "The unique ID of the Location in the source EHR system",
                    example: "123",
                  },
                  sourceSystem: { type: "string", example: "localhost:8103" },
                  operation: {
                    type: "string",
                    description: "The type of operation (upsert, delete, etc.)",
                    example: "upsert",
                  },
                  status: { type: "string", example: "active" },
                  name: { type: "string", example: "Urgent Care Center" },
                  phone: { type: "string", example: "555-123-4567" },
                  phone_use: { type: "string", example: "work" },
                  email: { type: "string", example: "contact@urgentcare.com" },
                  email_use: { type: "string", example: "work" },
                  address_line1: { type: "string", description: "Street address line", example: "789 Care Blvd" },
                  address_line2: { type: "string", example: "Suite 200" },
                  city: { type: "string", example: "Metropolis" },
                  state: { type: "string", example: "NY" },
                  postalCode: { type: "string", example: "10002" },
                  country: { type: "string", example: "US" },
                  address_use: { type: "string", example: "work" },
                  organization_id: { type: "string", example: "1" },
                },
                required: ["sourceId", "name", "status"],
              },
            },
          },
        },
        responses: {
          202: {
            description: "Job successfully enqueued",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { jobId: { type: "string" }, status: { type: "string", example: "QUEUED" } },
                },
              },
            },
          },
          400: { description: "Invalid request payload" },
        },
      },
    },
    "/api/v1/fhir/sync/observation": {
      post: {
        summary: "Trigger an Observation synchronization job",
        description:
          "Enqueues a job for the background worker to fetch, map, validate, and push an Observation resource to Medplum.",
        tags: ["FHIR Sync"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  sourceId: {
                    type: "string",
                    description: "The unique ID of the Observation in the source EHR system (optional)",
                    example: "123",
                  },
                  sourceSystem: { type: "string", example: "localhost:8103" },
                  operation: {
                    type: "string",
                    description: "The type of operation (upsert, delete, etc.)",
                    example: "upsert",
                  },
                  status: { type: "string", example: "final" },
                  category_code: { type: "string", example: "vital-signs" },
                  category_display: { type: "string", example: "Vital Signs" },
                  system: { type: "string", example: "http://loinc.org" },
                  loinc_code: { type: "string", description: "LOINC code of the observation", example: "85354-9" },
                  description: {
                    type: "string",
                    description: "Display name of the observation",
                    example: "Blood pressure panel",
                  },
                  code: { type: "string", example: "1234-5" },
                  display: { type: "string" },
                  text: { type: "string" },
                  patient_id: { type: "string", description: "Reference ID to the patient", example: "12345" },
                  effective_date: { type: "string", format: "date-time", example: "2026-09-04T10:30:00+05:30" },
                  systolic: { type: "number", description: "Systolic blood pressure (if applicable)", example: 120 },
                  diastolic: { type: "number", description: "Diastolic blood pressure (if applicable)", example: 80 },
                  value: { type: "number", description: "Single measurement value (if applicable)", example: 75.5 },
                  unit: { type: "string", description: "Unit of the measurement (if applicable)", example: "kg" },
                  unit_system: { type: "string" },
                  unit_code: { type: "string" },
                },
              },
            },
          },
        },
        responses: {
          202: {
            description: "Job successfully enqueued",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: { jobId: { type: "string" }, status: { type: "string", example: "QUEUED" } },
                },
              },
            },
          },
          400: { description: "Invalid request payload" },
        },
      },
    },
    "/api/v1/fhir/sync/allergy-intolerance": {
      post: {
        summary: "Trigger an AllergyIntolerance synchronization job",
        description:
          "Enqueues a job for the background worker to fetch, map, validate, and push an AllergyIntolerance resource to Medplum.",
        tags: ["FHIR Sync"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  sourceId: { type: "string", example: "134" },
                  sourceSystem: { type: "string", example: "localhost:8103" },
                  operation: { type: "string", example: "upsert" },
                  clinicalStatus: { type: "string", example: "Active" },
                  verificationStatus: { type: "string", example: "Confirmed" },
                  type: { type: "string", example: "allergy" },
                  category: { type: "string", example: "medication" },
                  criticality: { type: "string", example: "high" },
                  code: { type: "string", example: "387349007" },
                  display: { type: "string", example: "ampicillin 500 mg" },
                  patient_id: { type: "string", example: "19529" },
                  encounter_id: { type: "string", example: "14858" },
                  onsetDateTime: { type: "string", format: "date-time", example: "2026-09-04T10:30:00+05:30" },
                  recorder_id: { type: "string", example: "2695" },
                  reaction_substance: { type: "string", example: "247472004" },
                  reaction_substance_display: { type: "string", example: "Hives" },
                  reaction_manifestation: { type: "string", example: "string" },
                  reaction_manifestation_display: { type: "string", example: "string" },
                  reaction_severity: { type: "string", example: "string" },
                },
              },
            },
          },
        },
        responses: { 202: { description: "Job successfully enqueued" } },
      },
    },
    "/api/v1/fhir/sync/immunization": {
      post: {
        summary: "Trigger an Immunization synchronization job",
        description:
          "Enqueues a job for the background worker to fetch, map, validate, and push an Immunization resource to Medplum.",
        tags: ["FHIR Sync"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  sourceId: { type: "string", example: "res-12345" },
                  sourceSystem: { type: "string", example: "localhost:8103" },
                  operation: { type: "string", example: "upsert" },
                  status: { type: "string", example: "active" },
                  vaccineCode: { type: "string" },
                  display: { type: "string" },
                  patient_id: { type: "string", example: "pat-987" },
                  encounter_id: { type: "string", example: "enc-456" },
                  occurrenceDateTime: { type: "string" },
                  primarySource: { type: "boolean" },
                  location_id: { type: "string", example: "loc-333" },
                  lotNumber: { type: "string" },
                  expirationDate: { type: "string" },
                  site: { type: "string" },
                  route: { type: "string" },
                  doseQuantity: { type: "number" },
                  performer_id: { type: "string" },
                  manufacturer_id: { type: "string" },
                  manufacturer_name: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 202: { description: "Job successfully enqueued" } },
      },
    },
    "/api/v1/fhir/sync/medication": {
      post: {
        summary: "Trigger a Medication synchronization job",
        description:
          "Enqueues a job for the background worker to fetch, map, validate, and push a Medication resource to Medplum.",
        tags: ["FHIR Sync"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  sourceId: { type: "string", example: "res-12345" },
                  sourceSystem: { type: "string", example: "localhost:8103" },
                  operation: { type: "string", example: "upsert" },
                  code: { type: "string", example: "1234-5" },
                  display: { type: "string" },
                  status: { type: "string", example: "active" },
                  form_code: { type: "string" },
                  manufacturer_id: { type: "string" },
                  manufacturer_name: { type: "string" },
                  lotNumber: { type: "string" },
                  expirationDate: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 202: { description: "Job successfully enqueued" } },
      },
    },
    "/api/v1/fhir/sync/family-member-history": {
      post: {
        summary: "Trigger a FamilyMemberHistory synchronization job",
        description:
          "Enqueues a job for the background worker to fetch, map, validate, and push a FamilyMemberHistory resource to Medplum.",
        tags: ["FHIR Sync"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  sourceId: { type: "string", example: "res-12345" },
                  sourceSystem: { type: "string", example: "localhost:8103" },
                  operation: { type: "string", example: "upsert" },
                  status: { type: "string", example: "active" },
                  patient_id: { type: "string", example: "pat-987" },
                  date: { type: "string", example: "2026-09-06T09:15:00Z" },
                  name: { type: "string", example: "General Checkup Team" },
                  relationship: { type: "string" },
                  relationship_display: { type: "string" },
                  sex: { type: "string" },
                  condition_code: { type: "string" },
                  condition_outcome: { type: "string" },
                },
              },
            },
          },
        },
        responses: { 202: { description: "Job successfully enqueued" } },
      },
    },
    "/api/v1/fhir/sync/procedure": {
      post: {
        summary: "Trigger a Procedure synchronization job",
        description:
          "Enqueues a job for the background worker to fetch, map, validate, and push a Procedure resource to Medplum.",
        tags: ["FHIR Sync"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  sourceId: { type: "string", example: "456" },
                  sourceSystem: { type: "string", example: "localhost:8103" },
                  operation: { type: "string", example: "upsert" },
                  status: { type: "string", example: "completed" },
                  category_code: { type: "string", example: "387713003" },
                  code: { type: "string", example: "80146002" },
                  display: { type: "string", example: "Appendectomy" },
                  subject_id: { type: "string", example: "19529" },
                  patient_id: { type: "string", example: "19529" },
                  encounter_id: { type: "string", example: "14858" },
                  performedDateTime: { type: "string", format: "date-time", example: "2026-09-04T10:30:00+05:30" },
                  performer_id: { type: "string", example: "2695" },
                  recorder_id: { type: "string", example: "2695" }
                },
              },
            },
          },
        },
        responses: { 202: { description: "Job successfully enqueued" } },
      },
    },
    "/api/v1/fhir/sync/practitioner-role": {
      post: {
        summary: "Trigger a PractitionerRole synchronization job",
        description:
          "Enqueues a job for the background worker to fetch, map, validate, and push a PractitionerRole resource to Medplum.",
        tags: ["FHIR Sync"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  sourceId: { type: "string", example: "role-789" },
                  sourceSystem: { type: "string", example: "localhost:8103" },
                  operation: { type: "string", example: "upsert" },
                  status: { type: "string", example: "active" },
                  practitioner_id: { type: "string", example: "prac-123" },
                  organization_id: { type: "string", example: "org-456" },
                  location_id: { type: "string", example: "loc-1" },
                  code: { type: "string", example: "doctor" },
                  speciality_code: { type: "string", example: "394579002" },
                  speciality_display: { type: "string", example: "Cardiology" }
                },
              },
            },
          },
        },
        responses: { 202: { description: "Job successfully enqueued" } },
      },
    },
    "/api/v1/fhir/sync/care-plan": {
      post: {
        summary: "Trigger a CarePlan synchronization job",
        description: "Enqueues a job for the background worker to fetch, map, validate, and push a CarePlan resource to Medplum.",
        tags: ["FHIR Sync"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  sourceId: { type: "string", example: "res-12345" },
                  sourceSystem: { type: "string", example: "localhost:8103" },
                  operation: { type: "string", example: "upsert" },
                  status: { type: "string", example: "active" },
                  intent: { type: "string", example: "order" },
                  subject_id: { type: "string", example: "pat-987" },
                  encounter_id: { type: "string", example: "enc-456" },
                  period_start: { type: "string", example: "2026-09-01T10:00:00Z" },
                  period_end: { type: "string", example: "2026-09-10T10:00:00Z" },
                },
              },
            },
          },
        },
        responses: { 202: { description: "Job successfully enqueued" } },
      },
    },
    "/api/v1/fhir/sync/care-team": {
      post: {
        summary: "Trigger a CareTeam synchronization job",
        description: "Enqueues a job for the background worker to fetch, map, validate, and push a CareTeam resource to Medplum.",
        tags: ["FHIR Sync"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  sourceId: { type: "string", example: "res-12345" },
                  sourceSystem: { type: "string", example: "localhost:8103" },
                  operation: { type: "string", example: "upsert" },
                  status: { type: "string", example: "active" },
                  name: { type: "string", example: "General Checkup Team" },
                  subject_id: { type: "string", example: "pat-987" },
                  encounter_id: { type: "string", example: "enc-456" },
                  period_start: { type: "string", example: "2026-09-01T10:00:00Z" },
                  period_end: { type: "string", example: "2026-09-10T10:00:00Z" },
                },
              },
            },
          },
        },
        responses: { 202: { description: "Job successfully enqueued" } },
      },
    },
    "/api/v1/fhir/sync/coverage": {
      post: {
        summary: "Trigger a Coverage synchronization job",
        description: "Enqueues a job for the background worker to fetch, map, validate, and push a Coverage resource to Medplum.",
        tags: ["FHIR Sync"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  sourceId: { type: "string", example: "res-12345" },
                  sourceSystem: { type: "string", example: "localhost:8103" },
                  operation: { type: "string", example: "upsert" },
                  status: { type: "string", example: "active" },
                  type_code: { type: "string", example: "HIP" },
                  subscriber_id: { type: "string", example: "sub-111" },
                  beneficiary_id: { type: "string", example: "ben-222" },
                  period_start: { type: "string", example: "2026-09-01T10:00:00Z" },
                  period_end: { type: "string", example: "2026-09-10T10:00:00Z" },
                },
              },
            },
          },
        },
        responses: { 202: { description: "Job successfully enqueued" } },
      },
    },
    "/api/v1/fhir/sync/device": {
      post: {
        summary: "Trigger a Device synchronization job",
        description: "Enqueues a job for the background worker to fetch, map, validate, and push a Device resource to Medplum.",
        tags: ["FHIR Sync"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  sourceId: { type: "string", example: "res-12345" },
                  sourceSystem: { type: "string", example: "localhost:8103" },
                  operation: { type: "string", example: "upsert" },
                  status: { type: "string", example: "active" },
                  manufacturer: { type: "string", example: "Medtronic" },
                  serialNumber: { type: "string", example: "SN-998877" },
                  patient_id: { type: "string", example: "pat-987" },
                  location_id: { type: "string", example: "loc-333" },
                },
              },
            },
          },
        },
        responses: { 202: { description: "Job successfully enqueued" } },
      },
    },
    "/api/v1/fhir/sync/diagnostic-report": {
      post: {
        summary: "Trigger a DiagnosticReport synchronization job",
        description: "Enqueues a job for the background worker to fetch, map, validate, and push a DiagnosticReport resource to Medplum.",
        tags: ["FHIR Sync"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  sourceId: { type: "string", example: "res-12345" },
                  sourceSystem: { type: "string", example: "localhost:8103" },
                  operation: { type: "string", example: "upsert" },
                  status: { type: "string", example: "active" },
                  code: { type: "string", example: "1234-5" },
                  subject_id: { type: "string", example: "pat-987" },
                  encounter_id: { type: "string", example: "enc-456" },
                  effectiveDateTime: { type: "string", example: "2026-09-05T08:30:00Z" },
                },
              },
            },
          },
        },
        responses: { 202: { description: "Job successfully enqueued" } },
      },
    },
    "/api/v1/fhir/sync/document-reference": {
      post: {
        summary: "Trigger a DocumentReference synchronization job",
        description: "Enqueues a job for the background worker to fetch, map, validate, and push a DocumentReference resource to Medplum.",
        tags: ["FHIR Sync"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  sourceId: { type: "string", example: "res-12345" },
                  sourceSystem: { type: "string", example: "localhost:8103" },
                  operation: { type: "string", example: "upsert" },
                  status: { type: "string", example: "active" },
                  type_code: { type: "string", example: "HIP" },
                  subject_id: { type: "string", example: "pat-987" },
                  date: { type: "string", example: "2026-09-06T09:15:00Z" },
                },
              },
            },
          },
        },
        responses: { 202: { description: "Job successfully enqueued" } },
      },
    },
    "/api/v1/fhir/sync/goal": {
      post: {
        summary: "Trigger a Goal synchronization job",
        description: "Enqueues a job for the background worker to fetch, map, validate, and push a Goal resource to Medplum.",
        tags: ["FHIR Sync"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  sourceId: { type: "string", example: "res-12345" },
                  sourceSystem: { type: "string", example: "localhost:8103" },
                  operation: { type: "string", example: "upsert" },
                  lifecycleStatus: { type: "string", example: "active" },
                  description: { type: "string", example: "Reduce blood pressure" },
                  subject_id: { type: "string", example: "pat-987" },
                  startDate: { type: "string", example: "2026-09-01" },
                },
              },
            },
          },
        },
        responses: { 202: { description: "Job successfully enqueued" } },
      },
    },
    "/api/v1/fhir/sync/medication-dispense": {
      post: {
        summary: "Trigger a MedicationDispense synchronization job",
        description: "Enqueues a job for the background worker to fetch, map, validate, and push a MedicationDispense resource to Medplum.",
        tags: ["FHIR Sync"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  sourceId: { type: "string", example: "res-12345" },
                  sourceSystem: { type: "string", example: "localhost:8103" },
                  operation: { type: "string", example: "upsert" },
                  status: { type: "string", example: "active" },
                  medication_code: { type: "string", example: "197361" },
                  subject_id: { type: "string", example: "pat-987" },
                  whenHandedOver: { type: "string", example: "2026-09-07T14:20:00Z" },
                },
              },
            },
          },
        },
        responses: { 202: { description: "Job successfully enqueued" } },
      },
    },
    "/api/v1/fhir/sync/medication-request": {
      post: {
        summary: "Trigger a MedicationRequest synchronization job",
        description: "Enqueues a job for the background worker to fetch, map, validate, and push a MedicationRequest resource to Medplum.",
        tags: ["FHIR Sync"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  sourceId: { type: "string", example: "res-12345" },
                  sourceSystem: { type: "string", example: "localhost:8103" },
                  operation: { type: "string", example: "upsert" },
                  status: { type: "string", example: "active" },
                  intent: { type: "string", example: "order" },
                  medication_code: { type: "string", example: "197361" },
                  subject_id: { type: "string", example: "pat-987" },
                  encounter_id: { type: "string", example: "enc-456" },
                  authoredOn: { type: "string", example: "2026-09-07T10:00:00Z" },
                },
              },
            },
          },
        },
        responses: { 202: { description: "Job successfully enqueued" } },
      },
    },
    "/api/v1/fhir/sync/provenance": {
      post: {
        summary: "Trigger a Provenance synchronization job",
        description: "Enqueues a job for the background worker to fetch, map, validate, and push a Provenance resource to Medplum.",
        tags: ["FHIR Sync"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  sourceId: { type: "string", example: "res-12345" },
                  sourceSystem: { type: "string", example: "localhost:8103" },
                  operation: { type: "string", example: "upsert" },
                  target_id: { type: "string", example: "pat-987" },
                  recorded: { type: "string", example: "2026-09-09T12:00:00Z" },
                  agent_role_code: { type: "string", example: "author" },
                  agent_who_id: { type: "string", example: "prac-444" },
                },
              },
            },
          },
        },
        responses: { 202: { description: "Job successfully enqueued" } },
      },
    },
    "/api/v1/fhir/sync/questionnaire-response": {
      post: {
        summary: "Trigger a QuestionnaireResponse synchronization job",
        description: "Enqueues a job for the background worker to fetch, map, validate, and push a QuestionnaireResponse resource to Medplum.",
        tags: ["FHIR Sync"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  sourceId: { type: "string", example: "res-12345" },
                  sourceSystem: { type: "string", example: "localhost:8103" },
                  operation: { type: "string", example: "upsert" },
                  status: { type: "string", example: "active" },
                  subject_id: { type: "string", example: "pat-987" },
                  encounter_id: { type: "string", example: "enc-456" },
                  authored: { type: "string", example: "2026-09-08T11:00:00Z" },
                },
              },
            },
          },
        },
        responses: { 202: { description: "Job successfully enqueued" } },
      },
    },
    "/api/v1/fhir/sync/related-person": {
      post: {
        summary: "Trigger a RelatedPerson synchronization job",
        description: "Enqueues a job for the background worker to fetch, map, validate, and push a RelatedPerson resource to Medplum.",
        tags: ["FHIR Sync"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  sourceId: { type: "string", example: "res-12345" },
                  sourceSystem: { type: "string", example: "localhost:8103" },
                  operation: { type: "string", example: "upsert" },
                  patient_id: { type: "string", example: "pat-987" },
                  relationship_code: { type: "string", example: "MTH" },
                  name: { type: "string", example: "General Checkup Team" },
                },
              },
            },
          },
        },
        responses: { 202: { description: "Job successfully enqueued" } },
      },
    },
    "/api/v1/fhir/sync/service-request": {
      post: {
        summary: "Trigger a ServiceRequest synchronization job",
        description: "Enqueues a job for the background worker to fetch, map, validate, and push a ServiceRequest resource to Medplum.",
        tags: ["FHIR Sync"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  sourceId: { type: "string", example: "res-12345" },
                  sourceSystem: { type: "string", example: "localhost:8103" },
                  operation: { type: "string", example: "upsert" },
                  status: { type: "string", example: "active" },
                  intent: { type: "string", example: "order" },
                  code: { type: "string", example: "1234-5" },
                  subject_id: { type: "string", example: "pat-987" },
                  encounter_id: { type: "string", example: "enc-456" },
                  authoredOn: { type: "string", example: "2026-09-07T10:00:00Z" },
                },
              },
            },
          },
        },
        responses: { 202: { description: "Job successfully enqueued" } },
      },
    },
    "/api/v1/fhir/sync/specimen": {
      post: {
        summary: "Trigger a Specimen synchronization job",
        description: "Enqueues a job for the background worker to fetch, map, validate, and push a Specimen resource to Medplum.",
        tags: ["FHIR Sync"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  sourceId: { type: "string", example: "res-12345" },
                  sourceSystem: { type: "string", example: "localhost:8103" },
                  operation: { type: "string", example: "upsert" },
                  status: { type: "string", example: "active" },
                  type_code: { type: "string", example: "HIP" },
                  subject_id: { type: "string", example: "pat-987" },
                  collection_datetime: { type: "string", example: "2026-09-05T07:45:00Z" },
                },
              },
            },
          },
        },
        responses: { 202: { description: "Job successfully enqueued" } },
      },
    },
    "/api/v1/fhir/sync/{jobId}": {
      get: {
        summary: "Get synchronization job status",
        description:
          "Retrieves the real-time status of a BullMQ synchronization job, including any errors or final FHIR resource IDs.",
        tags: ["FHIR Sync"],
        parameters: [
          {
            name: "jobId",
            in: "path",
            required: true,
            schema: {
              type: "string",
            },
          },
        ],
        responses: {
          200: {
            description: "Job status retrieved",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    jobId: { type: "string" },
                    status: { type: "string", example: "COMPLETED" },
                    resourceType: { type: "string" },
                    sourceId: { type: "string", example: "res-12345" },
                    fhirResourceId: { type: "string", nullable: true },
                    error: { type: "string", nullable: true },
                  },
                },
              },
            },
          },
          404: {
            description: "Job not found",
          },
        },
      },
    },
    "/api/v1/fhir/launch": {
      post: {
        summary: "Generate a SMART on FHIR launch context",
        description: "Creates a SmartAppLaunch resource in Medplum using the provided internal EHR identifiers.",
        tags: ["SMART on FHIR"],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  tenantId: { type: "string", example: "tia" },
                  sourceSystem: { type: "string", example: "localhost:8103" },
                  patientId: { type: "string", description: "Internal EHR Patient ID", example: "9942" },
                  encounterId: { type: "string", description: "Internal EHR Encounter ID", example: "E-100" },
                  practitionerId: { type: "string", description: "Internal EHR Practitioner ID", example: "PR-50" },
                },
                required: ["patientId"],
              },
            },
          },
        },
        responses: {
          200: {
            description: "Launch context successfully generated",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    launch: { type: "string", description: "The SMART on FHIR launch token (SmartAppLaunch UUID)" },
                    patient: { type: "string", description: "The translated Medplum Patient UUID" },
                    encounter: { type: "string", description: "The translated Medplum Encounter UUID" },
                  },
                },
              },
            },
          },
          400: { description: "Missing patientId" },
          404: { description: "FHIR mapping not found for the provided source IDs" },
          500: { description: "Internal server error during context generation" },
        },
      },
    },
  },
};

module.exports = swaggerDocument;
