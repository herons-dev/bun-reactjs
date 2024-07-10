import {DateTime} from "luxon";

export default class Watcher {
  startTime: DateTime | null = null;

  stopTime: DateTime | null = null;

  start() {
    this.startTime = DateTime.now();
  }

  stop(message?: string) {
    this.stopTime = DateTime.now();

    if (message) {
      process.stdout.write(message);
    }
  }

  getRanTime(): number {
    if (!this.startTime) {
      return 0.0;
    }

    if (!this.stopTime) {
      this.stop();
    }

    return Math.abs(this.startTime.diffNow().get("milliseconds")) / 1000;
  }

  getRanTimeFixed(fractionDigits = 2): string {
    return this.getRanTime().toFixed(fractionDigits);
  }

  static new() {
    return new Watcher();
  }

  static newAndStart(message?: string) {
    const w = new Watcher();
    w.start();

    if (message) {
      process.stdout.write(message);
    }

    return w;
  }
}
