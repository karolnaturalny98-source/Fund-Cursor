import assert from "node:assert/strict";
import test from "node:test";

import { parseStatus, disputeStatusEnum } from "../../app/api/user/disputes/route";

test("parseStatus accepts valid dispute statuses", () => {
  for (const status of disputeStatusEnum.options) {
    assert.equal(parseStatus(status), status);
  }
});

test("parseStatus rejects invalid or lowercase values", () => {
  assert.equal(parseStatus(null), null);
  assert.equal(parseStatus(""), null);
  assert.equal(parseStatus("open"), null);
  assert.equal(parseStatus("unknown"), null);
});

test("parseStatus ignores leading and trailing whitespace", () => {
  assert.equal(parseStatus(" OPEN"), null);
  assert.equal(parseStatus("RESOLVED "), null);
});
