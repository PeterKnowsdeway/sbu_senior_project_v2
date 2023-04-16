
/// /FUNCTIONS////
// Rudimentary splitter for names using spaces - missing case for more than 3 spaces.

async function nameSplit (name) {
  const nameArr = await name.split(' ')

  // If there is no middle, the last name needs to be assigned to nameArr[2] for the api call
  switch (nameArr.length === 2) {
    case 1 :
      nameArr[1] = ''
      nameArr[2] = ''
      break
    case 2 :
      nameArr[2] = nameArr[1]
      nameArr[1] = ''
      break
    case 3 :
      break
  }
  return nameArr
}

module.exports = nameSplit