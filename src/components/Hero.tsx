export function Hero({
  groupCount,
  modelCount,
}: {
  groupCount: number
  modelCount: number
}) {
  return (
    <section className="pt-10 sm:pt-14">
      <h1 className="text-[clamp(2rem,4.4vw,2.9rem)] text-ink">模型广场</h1>

      {/*
        `break-keep` stops Chinese from breaking inside a word — without it a
        narrow paragraph splits 每百万 into 每百 / 万. Both notes are kept to a
        single line at 1440px so there is nothing for it to wrap.
      */}
      <p className="mt-3 max-w-[62ch] break-keep text-balance text-[14.5px] leading-[1.75] text-ink-2">
        站内 {groupCount} 个分组、{modelCount} 个模型，以下数字即实付价：渠道单价 × 分组倍率。
      </p>

      <p className="mt-1.5 max-w-[62ch] break-keep text-[12.5px] leading-relaxed text-ink-3">
        按每百万 tokens 计价，图片按张计费。
      </p>
    </section>
  )
}
