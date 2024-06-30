const parseContactType = (contactType) => {
  const isString = typeof contactType === 'string';
  if (!isString) return;
const isContactType = (contactType) => ['work', 'home', 'personal'].includes(contactType);
if (isContactType(contactType)) return contactType;
};



const parseContactIsFavourite= (isFavourite) => {
  if (!['true', 'false'].includes(isFavourite)) return;
  return isFavourite === 'true' ? true : false;
};

export const parseFilterParams = (query) => {
const { isFavourite, contactType } = query;
const parsedContactType = parseContactType(contactType);
const parsedContactIsFavourite = parseContactIsFavourite(isFavourite);

  return {
      isFavourite: parsedContactIsFavourite,
      contactType: parsedContactType,
};
};