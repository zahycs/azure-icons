import iconIndex from './iconIndex.json';

test('includes Microsoft Foundry and Fabric icons', () => {
  expect(iconIndex).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: 'AI Foundry',
        category: 'ai + machine learning',
      }),
      expect.objectContaining({
        name: 'Microsoft Fabric',
        category: 'analytics',
      }),
      expect.objectContaining({
        name: 'Service Group Relationships',
        category: 'new icons',
      }),
    ])
  );
});
