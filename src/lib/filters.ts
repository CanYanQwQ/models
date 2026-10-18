import type { GroupKind, PlazaGroup, PlazaModel } from '../data/catalog'

/**
 * Filtering mirroring Sub2API's own plaza filter bar
 * (`frontend/src/components/modelPlaza/PlazaFilterBar.vue` in 0.2.17): the
 * dimensions are faceted, so an option is only selectable when the *other*
 * active dimensions still leave a group for it. That is why every helper here
 * takes the whole state — an option's enabled-ness is never a property of the
 * option alone.
 */

export type PlatformFilter = string | 'all'
export type GroupFilter = number | 'all'
export type RateFilter = number | 'all'

export type SortMode = 'default' | 'price'

export interface FilterState {
  platform: PlatformFilter
  groupId: GroupFilter
  rate: RateFilter
  search: string
  sort: SortMode
}

export const EMPTY_FILTERS: FilterState = {
  platform: 'all',
  groupId: 'all',
  rate: 'all',
  search: '',
  sort: 'default',
}

/** The multiplier a visitor actually pays; anonymous visits have no user rate. */
export function rateOf(group: PlazaGroup): number {
  return group.rateMultiplier
}

export function platformsOf(groups: PlazaGroup[]): string[] {
  return [...new Set(groups.map((g) => g.platform).filter(Boolean))].sort()
}

export function ratesOf(groups: PlazaGroup[]): number[] {
  return [...new Set(groups.map(rateOf))].sort((a, b) => a - b)
}

export function platformEnabled(groups: PlazaGroup[], state: FilterState, platform: string): boolean {
  return groups.some(
    (g) =>
      g.platform === platform &&
      (state.groupId === 'all' || g.id === state.groupId) &&
      (state.rate === 'all' || rateOf(g) === state.rate),
  )
}

export function groupEnabled(state: FilterState, group: PlazaGroup): boolean {
  return (
    (state.platform === 'all' || group.platform === state.platform) &&
    (state.rate === 'all' || rateOf(group) === state.rate)
  )
}

export function rateEnabled(groups: PlazaGroup[], state: FilterState, rate: number): boolean {
  return groups.some(
    (g) =>
      rateOf(g) === rate &&
      (state.platform === 'all' || g.platform === state.platform) &&
      (state.groupId === 'all' || g.id === state.groupId),
  )
}

/**
 * What one model costs at the entry tier, in USD — per 1M tokens for chat, per
 * image for image models. Only used to rank, never displayed, so an image and a
 * token price never end up in the same sorted list (groups are homogeneous).
 */
export function entryValue(group: PlazaGroup, model: PlazaModel): number {
  const tier = model.tiers[0]
  if (!tier) return Number.POSITIVE_INFINITY
  if (tier.perImage !== undefined) return tier.perImage * rateOf(group)
  return (tier.input ?? 0) * rateOf(group)
}

function matchesQuery(model: PlazaModel, query: string): boolean {
  return (
    model.name.toLowerCase().includes(query) || model.label.toLowerCase().includes(query)
  )
}

export function activeFilterCount(state: FilterState): number {
  return (
    (state.platform === 'all' ? 0 : 1) +
    (state.groupId === 'all' ? 0 : 1) +
    (state.rate === 'all' ? 0 : 1) +
    (state.search.trim() ? 1 : 0)
  )
}

/** Cheapest entry-tier price inside a group, used to order the sections. */
function groupEntry(group: PlazaGroup): number {
  return Math.min(...group.models.map((model) => entryValue(group, model)))
}

/**
 * Token prices are per million tokens and image prices are per image, so a
 * single "cheapest first" line across both would compare unlike things. Free
 * goes first, then per-token groups by price, then per-image groups by price.
 */
const KIND_RANK: Record<GroupKind, number> = { free: 0, chat: 1, image: 2 }

function kindRank(group: PlazaGroup): number {
  return KIND_RANK[group.kind] ?? 9
}

/**
 * The groups to render, with their model lists narrowed by the search box and
 * ordered by the sort mode. Groups that end up empty disappear entirely.
 */
export function visibleGroups(groups: PlazaGroup[], state: FilterState): PlazaGroup[] {
  const query = state.search.trim().toLowerCase()

  const shown = groups
    .filter(
      (g) =>
        (state.platform === 'all' || g.platform === state.platform) &&
        (state.groupId === 'all' || g.id === state.groupId) &&
        (state.rate === 'all' || rateOf(g) === state.rate),
    )
    .map((group) => {
      const narrowed = query ? group.models.filter((m) => matchesQuery(m, query)) : group.models
      const models =
        state.sort === 'price'
          ? [...narrowed].sort((a, b) => entryValue(group, a) - entryValue(group, b))
          : narrowed
      return { ...group, models }
    })
    .filter((group) => group.models.length > 0)

  // Price order has to move whole groups, not just the models inside them —
  // otherwise a $0.03 model still sits under a $1.70 one and the page reads as
  // unsorted.
  return state.sort === 'price'
    ? shown.sort((a, b) => kindRank(a) - kindRank(b) || groupEntry(a) - groupEntry(b))
    : shown
}
