const ES_API = Object.freeze({
  v5_x: '5_x',
  v7_x: '7_x'
});

function formatTotalHits(value, format) {
  switch (format) {
    case ES_API.v5_x:
      return value;
    case ES_API.v7_x:
      return {
        value,
        relation: 'eq'
      };
    default:
      return value;
  }
}

export {
  ES_API,
  formatTotalHits
};
