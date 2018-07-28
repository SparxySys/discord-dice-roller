export interface IRandomProvider {
  getRandom(max: number): number;
  getRandomWithMin(min: number, max: number): number;
}

export class DefaultRandomProvider implements IRandomProvider {
  public getRandom(max: number): number {
    return this.getRandomWithMin(1, max);
  }

  public getRandomWithMin(min: number, max: number): number {
    return Math.floor(min + (Math.random() * (max - min + 1)));
  }
}
