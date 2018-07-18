export interface RandomProvider {
  getRandom(max: number): number;
  getRandomWithMin(min: number, max: number): number;
}

export class DefaultRandomProvider implements RandomProvider {
  getRandom(max: number): number {
    return this.getRandomWithMin(1, max);
  }
  
  getRandomWithMin(min: number, max: number): number {
    return Math.floor(min + (Math.random() * (max-min+1)));
  }
}