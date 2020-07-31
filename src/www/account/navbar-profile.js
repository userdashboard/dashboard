module.exports = {
  setup: (doc, profile) => {
    const template = doc.getElementById('navbar')
    if (profile.default) {
      const deleteLink = template.getElementById('navbar-delete')
      deleteLink.parentNode.removeChild(deleteLink)
      const defaultLink = template.getElementById('navbar-default')
      defaultLink.parentNode.removeChild(defaultLink)
    }
  }
}
