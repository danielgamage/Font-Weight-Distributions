import removeDuplicates from "../removeDuplicates.js"

test('remove items with the same property', () => {
  const originalArray = [{a: 1, b: 8}, {a: 2, b: 8}, {a: 3, b: 2}]
  const expectedArray = [{a: 1, b: 8}, {a: 3, b: 2}]
  expect( removeDuplicates(originalArray, 'b') ).toMatchObject(expectedArray)
})
