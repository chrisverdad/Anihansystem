export const DEMO_WASTE_TYPE_IMAGES = {
  bananas: '/photos/overripe banana.jpg',
  tomatoes: '/photos/bruised tomatos.jpg',
  lettuce: '/photos/wilted lettuce.jpg',
  papayas: '/photos/overripe papaya.jpg',
  compost: '/photos/banana compost.jpg',
  vegetables: '/photos/vegetables.webp',
  tomatoFertilizer: '/photos/tomato fertilizer.jpg',
  vegetableCompost: '/photos/vegetable compost.webp'
} as const

const LEGACY_DEMO_IMAGE_REDIRECTS: Record<string, string> = {
  '/images/overripe-bananas.jpg': DEMO_WASTE_TYPE_IMAGES.bananas,
  '/images/bruised-tomatoes.jpg': DEMO_WASTE_TYPE_IMAGES.tomatoes,
  '/images/wilted-lettuce.jpg': DEMO_WASTE_TYPE_IMAGES.lettuce,
  '/images/overripe-papayas.jpg': DEMO_WASTE_TYPE_IMAGES.papayas,
  '/photos/overripe banana.jpg': DEMO_WASTE_TYPE_IMAGES.bananas,
  '/photos/bruised tomatos.jpg': DEMO_WASTE_TYPE_IMAGES.tomatoes,
  '/photos/wilted lettuce.jpg': DEMO_WASTE_TYPE_IMAGES.lettuce,
  '/photos/overripe papaya.jpg': DEMO_WASTE_TYPE_IMAGES.papayas,
  '/photos/banana compost.jpg': DEMO_WASTE_TYPE_IMAGES.compost,
  '/photos/vegetables.webp': DEMO_WASTE_TYPE_IMAGES.vegetables,
  '/photos/tomato fertilizer.jpg': DEMO_WASTE_TYPE_IMAGES.tomatoFertilizer,
  '/photos/vegetable compost.webp': DEMO_WASTE_TYPE_IMAGES.vegetableCompost,
  '/images/placeholder.jpg': '/placeholder-image.svg'
}

export function resolveDemoImageUrl(url: string): string {
  const t = String(url || '').trim()
  return LEGACY_DEMO_IMAGE_REDIRECTS[t] ?? url
}
