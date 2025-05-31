import {GameResult} from "../app/enums/GameResult.ts";

export interface EloResult {
  newWhiteRating: number;
  newBlackRating: number;
}

export class EloService {
  private readonly kFactor: number;

  constructor(kFactor = 32) {
    this.kFactor = kFactor;
  }

  calculateNewRatings(whiteRating: number, blackRating: number, result: GameResult): EloResult {
    const scoreWhite = this.getScoreFromResult(result);
    const scoreBlack = 1 - scoreWhite;

    const expectedWhite = this.getExpectedScore(whiteRating, blackRating);
    const expectedBlack = this.getExpectedScore(blackRating, whiteRating);

    const newWhiteRating = whiteRating + this.kFactor * (scoreWhite - expectedWhite);
    const newBlackRating = blackRating + this.kFactor * (scoreBlack - expectedBlack);

    return {
      newWhiteRating: Math.round(newWhiteRating),
      newBlackRating: Math.round(newBlackRating),
    };
  }

  private getExpectedScore(ratingA: number, ratingB: number): number {
    return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
  }

  private getScoreFromResult(result: GameResult): number {
    switch (result) {
      case GameResult.WIN:
        return 1;
      case GameResult.DRAW:
        return 0.5;
      case GameResult.LOSS:
        return 0;
      default:
        throw new Error(`Invalid result: ${result}`);
    }
  }
}
