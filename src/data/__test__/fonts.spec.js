import fontData from '../fonts.js'

test('no font family names missing', () => {
  fontData.map(font => {
    expect(font.name).not.toBe(null)
    expect(font.name).not.toBe('')
  })
})
