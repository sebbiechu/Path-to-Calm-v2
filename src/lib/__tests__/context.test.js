import { describe, it, expect } from 'vitest';
import { visitBucket } from '../context.js';

describe('visitBucket', () => {
  it('only ever sends a bracket, never a count', () => {
    expect([1, 2, 5, 6, 40].map(visitBucket)).toEqual(['first', '2-5', '2-5', '6+', '6+']);
  });
});
