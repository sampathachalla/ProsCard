// pages/addCard/Utils/addCardName.ts

/** Splits a single "Name" input into the parts the professional section renders. */
export function splitName(name: string) {
  const [firstName = '', ...rest] = name.trim().split(/\s+/);
  return {
    prefix: '',
    firstName,
    middleName: '',
    lastName: rest.join(' '),
    suffix: '',
  };
}
