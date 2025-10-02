export interface BitrateCalcInput {
    targetMb: number;
    durationSec: number;
    audioKbps?: number;
    safetyMargin?: number;
    minVideoKbps?: number;
}


export function calculateVideoBitrateKbps({
                                              targetMb,
                                              durationSec,
                                              audioKbps = 128,
                                              safetyMargin = 0.95,
                                              minVideoKbps = 200,
                                          }: BitrateCalcInput): number {
    if(targetMb < 0 || durationSec < 0) throw new Error("Invalid inputs");

    const targetBytes = targetMb *1024 * 1024;
    const audioBytes= (audioKbps *1000/8)* durationSec;
    const videoBytes= Math.max(0,targetBytes-audioBytes);

    if(videoBytes<=0)return minVideoKbps;

    const videoBitPerSec = (videoBytes*8)/durationSec;
    const videoKbps = Math.floor((videoBitPerSec/1000)*safetyMargin);

    return Math.max(minVideoKbps,videoKbps)

}