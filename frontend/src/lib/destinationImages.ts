// Curated, high-resolution destination images for VOYNEX travel platform

const DESTINATION_IMAGE_MAP: Record<string, string> = {
  // Himachal / Mountains
  'manali': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=1200&auto=format&fit=crop&q=80',
  'himachal': 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=1200&auto=format&fit=crop&q=80',
  'shimla': 'https://images.unsplash.com/photo-1597074866923-dc0589150358?w=1200&auto=format&fit=crop&q=80',
  'kasol': 'https://images.unsplash.com/photo-1618172193763-c511deb635ca?w=1200&auto=format&fit=crop&q=80',
  'dharamshala': 'https://images.unsplash.com/photo-1605649487212-47bdab064df7?w=1200&auto=format&fit=crop&q=80',

  // Ladakh / Kashmir
  'ladakh': 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?w=1200&auto=format&fit=crop&q=80',
  'leh': 'https://images.unsplash.com/photo-1506197603052-3cc9c3a201bd?w=1200&auto=format&fit=crop&q=80',
  'kashmir': 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=1200&auto=format&fit=crop&q=80',
  'srinagar': 'https://images.unsplash.com/photo-1595815771614-ade9d652a65d?w=1200&auto=format&fit=crop&q=80',
  'gulmarg': 'https://images.unsplash.com/photo-1562670652-e5947bddb335?w=1200&auto=format&fit=crop&q=80',

  // Coastal / Beaches / Islands
  'goa': 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=1200&auto=format&fit=crop&q=80',
  'andaman': 'https://images.unsplash.com/photo-1589136777351-fdc9c606132e?w=1200&auto=format&fit=crop&q=80',
  'havelock': 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=80',
  'bali': 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=1200&auto=format&fit=crop&q=80',
  'phuket': 'https://images.unsplash.com/photo-1589394815804-964ed0be2eb5?w=1200&auto=format&fit=crop&q=80',
  'maldives': 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=1200&auto=format&fit=crop&q=80',

  // Rajasthan / Heritage
  'rajasthan': 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=1200&auto=format&fit=crop&q=80',
  'jaipur': 'https://images.unsplash.com/photo-1603262110263-fb010d6e75dc?w=1200&auto=format&fit=crop&q=80',
  'udaipur': 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=1200&auto=format&fit=crop&q=80',
  'jaisalmer': 'https://images.unsplash.com/photo-1574950578143-858c6fc58922?w=1200&auto=format&fit=crop&q=80',
  'jodhpur': 'https://images.unsplash.com/photo-1588661799716-6316f1abaf4e?w=1200&auto=format&fit=crop&q=80',

  // South India
  'kerala': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&auto=format&fit=crop&q=80',
  'munnar': 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=1200&auto=format&fit=crop&q=80',
  'alleppey': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=1200&auto=format&fit=crop&q=80',
  'ooty': 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?w=1200&auto=format&fit=crop&q=80',
  'coorg': 'https://images.unsplash.com/photo-1600100397608-f010f44414b3?w=1200&auto=format&fit=crop&q=80',

  // Spiritual / Culture
  'varanasi': 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=1200&auto=format&fit=crop&q=80',
  'rishikesh': 'https://images.unsplash.com/photo-1600100397608-f010f44414b3?w=1200&auto=format&fit=crop&q=80',
  'amritsar': 'https://images.unsplash.com/photo-1588096344356-9b497b76735c?w=1200&auto=format&fit=crop&q=80',

  // International
  'paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1200&auto=format&fit=crop&q=80',
  'tokyo': 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&auto=format&fit=crop&q=80',
  'dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1200&auto=format&fit=crop&q=80',
  'singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=1200&auto=format&fit=crop&q=80',
  'switzerland': 'https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1200&auto=format&fit=crop&q=80',
};

const DEFAULT_DESTINATION_IMAGE =
  'https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&auto=format&fit=crop&q=80';

/**
 * Returns a high quality photo matching the destination name.
 * If trips associated with this destination already have a photo, uses that if no exact match is found.
 */
export function getDestinationImage(name?: string, fallbackTripImage?: string): string {
  if (!name) return fallbackTripImage || DEFAULT_DESTINATION_IMAGE;

  const normalized = name.toLowerCase().trim();

  // 1. Direct or partial keyword match in map
  for (const [key, url] of Object.entries(DESTINATION_IMAGE_MAP)) {
    if (normalized.includes(key) || key.includes(normalized)) {
      return url;
    }
  }

  // 2. If destination has trip images from the database
  if (fallbackTripImage && fallbackTripImage.startsWith('http')) {
    return fallbackTripImage;
  }

  // 3. Fallback to default high-quality travel image
  return DEFAULT_DESTINATION_IMAGE;
}
