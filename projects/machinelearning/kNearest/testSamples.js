/*
 * Predict housing prices using k-nearest algorithm
 * Test Data
 * Henrik Eideberg 2018
 *
*/

const t001 = {
  id: 't001',
  rooms: 4,
  size: 100,
  age: 25
}

const t002 = {
  id: 't002',
  rooms: 1,
  size: 60,
  age: 20
}

function getTestDataArray() {
  return [
          t001,
          t002
         ];
}

function getTestDataArrayRoom() {
  return [
          t001.rooms,
          t002.rooms
         ];
}

function getTestDataArraySize() {
  return [
          t001.size,
          t002.size
         ];
}

function getTestDataArrayAge() {
  return [
          t001.age,
          t002.age
         ];
}
