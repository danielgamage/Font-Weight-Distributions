import fontData from '../fonts.js'

test('no font family names missing', () => {
  fontData.map(font => {
    expect(font.name).not.toBeNull()
    expect(font.name).not.toBe('')
  })
})
test('no null weights', () => {
  fontData.map(font => {
    expect(font.interpolations).not.toBeNull()
  })
})
