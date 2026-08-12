import test from 'node:test';
import assert from 'node:assert/strict';
import {
  collectAdjacentBandContractViolations,
  describeAdjacentBandContractViolation,
} from '../services/validation/adjacent-band-contract';

test('adjacent-band contract — band 2/4 require evidence; 0/1/3/5 forbid it', () => {
  const adj = {
    lower_band_reference: 'L',
    lower_band_evidence: 'lower concrete',
    higher_band_reference: 'H',
    higher_band_evidence: 'higher concrete',
  };

  assert.equal(
    describeAdjacentBandContractViolation({
      criterion: 'content',
      mark: 2,
      adjacent_band_evidence: adj,
    }),
    null,
  );
  assert.equal(
    describeAdjacentBandContractViolation({
      criterion: 'content',
      mark: 4,
      adjacent_band_evidence: adj,
    }),
    null,
  );
  assert.equal(
    describeAdjacentBandContractViolation({
      criterion: 'content',
      mark: 3,
      adjacent_band_evidence: null,
    }),
    null,
  );

  const missing2 = describeAdjacentBandContractViolation({
    criterion: 'organisation',
    mark: 2,
    adjacent_band_evidence: null,
  });
  assert.ok(missing2?.includes('REQUIRED for marks 2 and 4'));
  assert.ok(missing2?.includes('do not change the mark'));

  const illegal3 = describeAdjacentBandContractViolation({
    criterion: 'language',
    mark: 3,
    adjacent_band_evidence: adj,
  });
  assert.ok(illegal3?.includes('has mark 3'));
  assert.ok(illegal3?.includes('only permitted for marks 2 and 4'));
  assert.ok(illegal3?.includes('set to null'));

  const violations = collectAdjacentBandContractViolations([
    { criterion: 'content', mark: 3, adjacent_band_evidence: adj },
    { criterion: 'organisation', mark: 2, adjacent_band_evidence: null },
  ]);
  assert.equal(violations.length, 2);
});
