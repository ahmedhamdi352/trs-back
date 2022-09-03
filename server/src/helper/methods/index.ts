import crypto from 'crypto';
import sanitizeHtml from 'sanitize-html';

export const serialize = (doc: any): string => {
  //base condition
  if (typeof doc !== 'object') {
    return `${doc.toString()}`;
  }

  let serializedString = '';

  for (const [key, value] of Object.entries(doc)) {
    // console.log(`${key}: ${value}`, 'typeof', Array.isArray(value));

    if (typeof value !== 'object') {
      serializedString += capitalize(key);
      serializedString += serialize(value);
    }

    if (typeof value === 'object') {
      serializedString += capitalize(key);
      for (const [innerKey, innerValue] of Object.entries(value)) {
        serializedString += capitalize(innerKey);
        serializedString += serialize(innerValue);
      }
    }
  }
  return serializedString;
};

export const hashSHA256 = (str: string) => {
  return crypto.createHash('sha256').update(str).digest('hex');
};

const capitalize = (str: string) => {
  return `\"${str.toString().toUpperCase()}\"`;
};

export const chunkArray = (myArray, chunk_size) => {
  var index = 0;
  var arrayLength = myArray.length;
  var tempArray = [];

  for (index = 0; index < arrayLength; index += chunk_size) {
    let myChunk = myArray.slice(index, index + chunk_size);
    // Do something if you want with the group
    tempArray.push(myChunk);
  }

  return tempArray;
};

export const delay = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getDateString = (MyDate): string => {
  if (!MyDate) return '';
  const MyDateString = MyDate.getFullYear() + '-' + ('0' + (MyDate.getMonth() + 1)).slice(-2) + '-' + ('0' + MyDate.getDate()).slice(-2);
  return MyDateString;
};

export const formateDateTimeIssued = (MyDate): string => {
  if (!MyDate) return '';
  const MyDateString = new Date(MyDate).toISOString().split('.')[0] + 'Z';
  return MyDateString;
};

export const cleanText = (text: any) => {
  return sanitizeHtml(text);
};
