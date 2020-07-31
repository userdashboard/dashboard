module.exports = {
  setup: (doc, account) => {
    const removeElements = []
    if (account.owner) {
      removeElements.push('navbar-assign-administrator-link', 'navbar-revoke-administrator-link', 'navbar-transfer-ownership-link', 'navbar-delete-account-link')
    } else if (account.administrator) {
      removeElements.push('navbar-assign-administrator-link', 'navbar-delete-account-link')
    } else {
      removeElements.push('navbar-revoke-administrator-link')
    }
    const template = doc.getElementById('navbar')
    for (const id of removeElements) {
      const element = template.getElementById(id)
      element.parentNode.removeChild(element)
    }
  }
}
