
module.exports = {
  getRandom: max => {
    return this.getRandomWithMin(1, max);
  },
  
  getRandomWithMin: (min, max) => {
    return Math.floor(min + (Math.random() * (max-min+1)));
  }
}