module.exports = {
  setup: (doc) => {
    if (!global.enableLanguagePreference) {
      const template = doc.getElementById('navbar')
      const languageLink = template.getElementById('navbar-language-link')
      languageLink.parentNode.removeChild(languageLink)
    }
  }
}
