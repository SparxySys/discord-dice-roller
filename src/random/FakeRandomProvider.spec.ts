import { IRandomProvider } from './random';

// Helper class for unit tests, returns average ceiled

export class FakeRandomProvider implements IRandomProvider {
  public getRandom(max: number): number {
      return this.getRandomWithMin(1, max);
  }

  public getRandomWithMin(min: number, max: number): number {
      // gets average roll, rounded up
      return (Math.ceil((max - min) / 2)) + min;
  }
}
