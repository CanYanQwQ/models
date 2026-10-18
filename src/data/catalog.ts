/* ------------------------------------------------------------------ *
 * Hard-coded catalogue.
 *
 * Source: GET https://ai.zhouwanx.top/api/v1/model-plaza, read on
 * 2026-10-18. Group names, model ids, tier labels and raw per-token prices
 * are copied verbatim from that payload; nothing here is derived at runtime
 * from the API, because the plaza endpoint returns 404 whenever
 * `model_plaza_enabled` is off and because anonymous visitors cannot read
 * group pricing any other way.
 *
 * Prices are the channel's own per-token USD price. The price you actually
 * sell at is that value multiplied by `rateMultiplier` — see lib/pricing.ts,
 * which mirrors PlazaModelPricingTable.vue:424 in Sub2API 0.2.17. Tier labels
 * (`≤272K` / `>272K`, `1K` / `2K` / `4K`) are the API's own `tier_label`
 * strings. Group 16 bills long context per whole request
 * (`long_context_basis: 'whole_request'`), so the higher tier applies to the
 * entire request once it crosses 272K.
 *
 * `label` and `note` are presentation copy, written by hand: the API only
 * carries the slug, and its `platform` is the channel's protocol family (every
 * group reports `openai`), which says nothing about who makes the model.
 * ------------------------------------------------------------------ */

export type GroupKind = 'chat' | 'image' | 'free'

export interface PriceTier {
  label: string
  /** USD per token. */
  input?: number
  output?: number
  cacheRead?: number
  /** USD per generated image. */
  perImage?: number
}

export interface PlazaModel {
  /** Slug, exactly as the API spells it — the thing people paste into code. */
  name: string
  /** Human-facing name for the block heading. */
  label: string
  note?: string
  tiers: PriceTier[]
}

export interface PlazaGroup {
  id: number
  name: string
  description: string
  /** Billing rule that applies to every model in the group, shown once. */
  rule?: string
  kind: GroupKind
  rateMultiplier: number
  /**
   * True only when every token model's channel price matches the official
   * price, so the multiplier is the one and only discount factor and quoting
   * it is meaningful. When the two disagree the multiplier says nothing about
   * the price you pay, so the badge is omitted.
   */
  rateVerified: boolean
  models: PlazaModel[]
}

/** Pulled 2026-10-18. Bump this whenever catalog prices change. */
export const UPDATED_AT = '2026-10-18'

export const GROUPS: PlazaGroup[] = [
  {
    id: 16,
    name: 'ChatGPT-ProMax【满血】',
    description: '已经破甲，发送宝宝进行激活',
    rule: '请求超过 272K tokens 后，整单按 >272K 档计价。',
    kind: 'chat',
    rateMultiplier: 0.17,
    rateVerified: true,
    models: [
      {
        name: 'gpt-5.6',
        label: 'GPT-5.6',
        note: '对话旗舰档。按 token 计费，超过 272K 后整单按高价档计算。',
        tiers: [
          { label: '≤272K', input: 5e-6, output: 3e-5, cacheRead: 5e-7 },
          { label: '>272K', input: 1e-5, output: 4.5e-5, cacheRead: 1e-6 },
        ],
      },
      {
        name: 'gpt-5.6-sol',
        label: 'GPT-5.6 Sol',
        note: '与 GPT-5.6 同价，档位与计费方式完全一致。',
        tiers: [
          { label: '≤272K', input: 5e-6, output: 3e-5, cacheRead: 5e-7 },
          { label: '>272K', input: 1e-5, output: 4.5e-5, cacheRead: 1e-6 },
        ],
      },
      {
        name: 'gpt-6-astra',
        label: 'GPT-6 Astra',
        note: '组内单价最高的对话模型，输入与输出都落在最高档。',
        tiers: [
          { label: '≤272K', input: 1e-5, output: 5e-5, cacheRead: 1e-6 },
          { label: '>272K', input: 2e-5, output: 7.5e-5, cacheRead: 2e-6 },
        ],
      },
      {
        name: 'gpt-6-sol',
        label: 'GPT-6 Sol',
        note: '单价最低的 GPT-6 版本，适合大流量调用。',
        tiers: [
          { label: '≤272K', input: 2e-6, output: 1e-5, cacheRead: 2e-7 },
          { label: '>272K', input: 4e-6, output: 1.5e-5, cacheRead: 4e-7 },
        ],
      },
      {
        name: 'gpt-6.1-sol',
        label: 'GPT-6.1 Sol',
        note: '与 GPT-6 Sol 同价，缓存读更便宜，重复上下文多的场景更省。',
        tiers: [
          { label: '≤272K', input: 2e-6, output: 1e-5, cacheRead: 1e-7 },
          { label: '>272K', input: 4e-6, output: 1.5e-5, cacheRead: 2e-7 },
        ],
      },
    ],
  },
  {
    id: 12,
    name: 'GPT生图',
    description: '按张计费，档位对应输出分辨率',
    kind: 'image',
    rateMultiplier: 1,
    rateVerified: true,
    models: [
      {
        name: 'gpt-image-2',
        label: 'GPT Image 2',
        note: '按输出分辨率计价，不按 token 计费；三档分别对应 1K / 2K / 4K。',
        tiers: [
          { label: '1K', perImage: 0.15 },
          { label: '2K', perImage: 0.2 },
          { label: '4K', perImage: 0.25 },
        ],
      },
    ],
  },
  {
    id: 6,
    name: '国产模型',
    description: '按 token 计费，不限上下文长度',
    kind: 'chat',
    rateMultiplier: 1,
    rateVerified: false,
    models: [
      {
        name: 'deepseek-v4-pro',
        label: 'DeepSeek V4 Pro',
        note: 'DeepSeek 的高配档，输入与输出单价都高于 flash 版本。',
        tiers: [{ label: '', input: 2.5e-7, output: 7.5e-7, cacheRead: 8e-9 }],
      },
      {
        name: 'deepseek-v4.1-flash',
        label: 'DeepSeek V4.1 Flash',
        note: '轻量档，适合高并发与批量调用。',
        tiers: [{ label: '', input: 1e-7, output: 3e-7, cacheRead: 2e-9 }],
      },
      {
        name: 'glm-5.3-flash',
        label: 'GLM 5.3 Flash',
        note: '组内最便宜的一档，缓存读低到每百万 $0.006。',
        tiers: [{ label: '', input: 3e-8, output: 1e-7, cacheRead: 6e-9 }],
      },
    ],
  },
  {
    id: 11,
    name: '免费分组',
    description: '不限量试用，按 token 计费但当前价格为 0',
    kind: 'free',
    rateMultiplier: 1,
    rateVerified: false,
    models: [
      {
        name: 'deepseek-v4-pro',
        label: 'DeepSeek V4 Pro',
        tiers: [{ label: '', input: 0, output: 0, cacheRead: 0 }],
      },
      {
        name: 'deepseek-v4.1-flash',
        label: 'DeepSeek V4.1 Flash',
        tiers: [{ label: '', input: 0, output: 0, cacheRead: 0 }],
      },
      {
        name: 'glm-5.3-flash',
        label: 'GLM 5.3 Flash',
        tiers: [{ label: '', input: 0, output: 0, cacheRead: 0 }],
      },
    ],
  },
]
