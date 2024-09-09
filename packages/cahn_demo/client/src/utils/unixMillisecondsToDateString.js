const unixInMillisecondsToDateString = (unixInMilliseconds) => {
  return new Date(Number(unixInMilliseconds)).toDateString();
};

export default unixInMillisecondsToDateString;
