const slugify = require('slugify');

const slug = function (str, more) {
  return slugify(str, {
    replacement: '-',
    lower: true,
    locale: 'vi',
    trim: true
  })
}

module.exports = {
  slug
}