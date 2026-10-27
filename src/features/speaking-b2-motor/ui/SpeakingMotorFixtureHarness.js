'use client';

import { useEffect, useState } from 'react';
import SpeakingMotorV1 from './SpeakingMotorV1';
import { useSpeakingFixtureInput } from './useSpeakingFixtureInput';
import { SPEAKING_B2_FIXTURE_PACKS } from '../fixtures/catalog';
import styles from './speaking-motor-v1.module.css';

export default function SpeakingMotorFixtureHarness() {
  const [catalog, setCatalog] = useState({ enabled: false, packs: [], warning: '' });
  const [packId, setPackId] = useState('full-mixed');

  useEffect(() => {
    let cancelled = false;
    fetch('/api/speaking-b2/fixtures/')
      .then((res) => res.json())
      .then((data) => {
        if (!cancelled) setCatalog(data);
      })
      .catch(() => {
        if (!cancelled) setCatalog({ enabled: false, packs: [] });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const fixtureIds = catalog.enabled ? SPEAKING_B2_FIXTURE_PACKS[packId] || [] : [];
  const audioInput = useSpeakingFixtureInput({ enabled: catalog.enabled, fixtureIds });

  return (
    <>
      {catalog.enabled ? (
        <section className={styles.page}>
          <p className={styles.eyebrow}>Development only</p>
          <h2 className={styles.title}>Speaking fixture harness</h2>
          <p className={styles.note}>
            {catalog.warning || 'Synthetic technical audio. Not authentic student recordings.'}
          </p>
          <label className={styles.note} htmlFor="speaking-fixture-pack">
            Reference pack
            <select
              id="speaking-fixture-pack"
              value={packId}
              onChange={(event) => setPackId(event.target.value)}
              style={{ display: 'block', marginTop: '0.4rem' }}
            >
              {(catalog.packs || Object.keys(SPEAKING_B2_FIXTURE_PACKS)).map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </select>
          </label>
        </section>
      ) : null}
      <SpeakingMotorV1 audioInput={audioInput} />
    </>
  );
}
