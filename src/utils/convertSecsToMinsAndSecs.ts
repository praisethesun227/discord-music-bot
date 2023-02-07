export function convertSecsToMinsAndSecs(seconds: number) {
    let mins = Math.floor(seconds/60);
    let secs = seconds % 60;

    let secsS = secs < 10 ? `0${secs}` : `${secs}`;
    let minsS = mins < 10 ? `0${mins}` : `${mins}`;

    return `${minsS}:${secsS}`;
}