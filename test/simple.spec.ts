describe('Simple Test', () => {
  it('should pass a basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('should test string operations', () => {
    const message = 'Hello Jest';
    expect(message).toContain('Jest');
    expect(message.length).toBe(10);
  });

  it('should test array operations', () => {
    const fruits = ['apple', 'banana', 'orange'];
    expect(fruits).toHaveLength(3);
    expect(fruits).toContain('banana');
  });

  it('should test async operations', async () => {
    const promise = Promise.resolve('success');
    await expect(promise).resolves.toBe('success');
  });
});
