import { retraction } from "@/schemas";
import { v4 as uuidv4 } from "uuid";

const createUnsignedRetractionVC = (idToRevoke) => {
  const retractionClaim = {
    type: "retraction",
    id: `urn:uuid:${uuidv4()}`,
    timestamp: Date.now(),
    claim_id: idToRevoke,
  };

  const vc_data = JSON.parse(JSON.stringify(retraction));
  vc_data.credentialSubject = retractionClaim;
  vc_data.credentialSchema.id =
    "https://github.com/nqminds/CAHN/blob/main/packages/schemas/src/retraction.v.1.0.0.schema.yaml";

  const vc = new window.VerifiableCredential(
    vc_data,
    JSON.stringify(retraction)
  );

  return vc;
};

export default createUnsignedRetractionVC;
