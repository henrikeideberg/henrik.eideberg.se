/*
 * Predict housing prices using k-nearest algorithm
 * Training Data
 * Henrik Eideberg 2018
 *
*/

const s001 = {
  id: 's001',
  price: 500000,
  rooms: 2,
  size: 45,
  age: 25
}

const s002 = {
  id: 's002',
  price: 800000,
  rooms: 3,
  size: 65,
  age: 30
}

const s003 = {
  id: 's003',
  price: 1000000,
  rooms: 6,
  size: 100,
  age: 40
}

const s004 = {
  id: 's004',
  price: 350000,
  rooms: 2,
  size: 30,
  age: 20
}

const s005 = {
  id: 's005',
  price: 100000,
  rooms: 2,
  size: 25,
  age: 20
}

function getTraningDataArray() {
  return [
          s001,
          s002,
          s003,
          s004,
          s005
         ];
}

function getTraningDataArrayRoom() {
  return [
          s001.rooms,
          s002.rooms,
          s003.rooms,
          s004.rooms,
          s005.rooms
         ];
}

function getTraningDataArraySize() {
  return [
          s001.size,
          s002.size,
          s003.size,
          s004.size,
          s005.size
         ];
}

function getTraningDataArrayAge() {
  return [
          s001.age,
          s002.age,
          s003.age,
          s004.age,
          s005.age
         ];
}

function getTrainingSample(id) {
  switch(id) {
    case 's001':
      return s001;
      break;
    case 's002':
      return s002;
      break;
    case 's003':
      return s003;
      break;
    case 's004':
      return s004;
      break;
    case 's005':
      return s005;
      break;
    default:
      return false;
      break;
  }
}
