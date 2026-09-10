jest.mock("bullmq");
jest.mock("../config/db", () => ({
  query: jest.fn(),
}));

const db = require("../config/db");
const { enqueueSyncJob, getJobStatus, fhirQueue } = require("../queue/producer");

describe("Queue Producer", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("enqueueSyncJob successfully queues and inserts to DB", async () => {
    db.query.mockResolvedValueOnce();
    const mockAdd = jest.fn().mockResolvedValue({ id: "bullmq-123" });
    fhirQueue.add = mockAdd;

    const uuid = await enqueueSyncJob({
      sourceSystem: "ehr",
      tenantId: "default",
      resourceType: "Patient",
      sourceId: "999",
    });

    expect(db.query).toHaveBeenCalledTimes(1);
    expect(uuid).toBeDefined();
  });

  test("getJobStatus returns formatted status", async () => {
    db.query.mockResolvedValueOnce({
      rows: [{ status: "COMPLETED", fhir_resource_id: "medplum-xyz" }],
    });

    const status = await getJobStatus("uuid-123");
    expect(status).toEqual({ status: "COMPLETED", fhirResourceId: "medplum-xyz" });
  });
});
