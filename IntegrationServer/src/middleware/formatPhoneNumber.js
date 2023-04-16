async function formatPhoneNumber (phone) {
  // Try to format mobile and work phones
  if (phone !== undefined) {
    console.log(phone)
    if (phone.length === 10) {
      phone = await '1 (' + phone.slice(0, 3) + ') ' + phone.substring(3, 6) + '-' + phone.substring(6, 10)
    }
  }
}

module.exports = formatPhoneNumber