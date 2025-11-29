import { describe, it, expect } from 'vitest';

describe('Setup Test', () => {
  it('should verify vitest is working', () => {
    expect(true).toBe(true);
  });

  it('should verify TypeScript is working', () => {
    const message: string = 'Hello, TypeScript!';
    expect(message).toBe('Hello, TypeScript!');
  });
});
