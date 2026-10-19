import { estimateWaitMinutes } from './estimate-wait';
describe('Operational queue ETA', () => {
  it('does not promise immediate admission for an idle queue', () => expect(estimateWaitMinutes(0, 0)).toBeNull());
  it('requires at least five observations', () => expect(estimateWaitMinutes(50, 4)).toBeNull());
  it('uses observed admission throughput', () => expect(estimateWaitMinutes(99, 20)).toBe(5));
  it('includes the first participant in the wait estimate', () => expect(estimateWaitMinutes(0, 10)).toBe(.1));
});
