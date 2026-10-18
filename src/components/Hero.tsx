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
      <p className="mt-3 max-w-[46ch] text-balance text-[14.5px] leading-[1.75] text-ink-2">
        {groupCount} 个分组、{modelCount} 个模型的实际售价。按
        <span className="whitespace-nowrap">每百万 tokens</span>
        计价，图片按张计费，充值赠送不计入。
      </p>
    </section>
  )
}
