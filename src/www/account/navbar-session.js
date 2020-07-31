module.exports = {
  setup: (doc, session) => {
    const template = doc.getElementById('navbar')
    if (session.ended) {
      const endLink = template.getElementById('navbar-end')
      endLink.parentNode.removeChild(endLink)
    }
  }
}
