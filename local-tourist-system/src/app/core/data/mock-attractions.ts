import { Attraction } from '../models/attraction.model';

/** Seed catalogue — 15 places within ~25 km of Kandy (Proposal Table 2). */
export const MOCK_ATTRACTIONS: Attraction[] = [
  {
    id: 1,
    name: 'Royal Botanical Gardens, Peradeniya',
    category: 'Nature',
    description:
      'A world-renowned botanical garden featuring orchids, palms, and landscaped avenues beside the Mahaweli River.',
    openingHours: 'Daily 7:30 AM – 5:00 PM',
    travelTips: 'Visit early to avoid midday heat. Allow 2–3 hours for a relaxed walk.',
    distanceKm: 6,
    imageUrls: [
      '/images/attractions/royal-botanical-gardens.jpg',
      'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 7.2715,
    longitude: 80.5966,
  },
  {
    id: 2,
    name: 'Hanthana Katusukonda Hike, Tea & Waterfall',
    category: 'Adventure',
    description:
      'A scenic hike through tea estates with waterfall stops and panoramic mountain views above Kandy.',
    openingHours: 'Daylight hours recommended (6:00 AM – 5:00 PM)',
    travelTips: 'Wear sturdy shoes and carry water. Trails can be slippery after rain.',
    distanceKm: 8,
    imageUrls: [
      '/images/attractions/hanthana-hike.jpg',
      'https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 7.2502,
    longitude: 80.6335,
  },
  {
    id: 3,
    name: 'British Garrison Cemetery',
    category: 'Religious & Heritage',
    description:
      'A historic cemetery preserving graves of British colonial officers and civilians from the Kandyan era.',
    openingHours: 'Daily 8:00 AM – 5:00 PM',
    travelTips: 'A short, quiet stop near the Temple of the Tooth — ideal between city sights.',
    distanceKm: 1,
    imageUrls: [
      '/images/attractions/british-garrison-cemetery.jpg',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 7.2945,
    longitude: 80.6401,
  },
  {
    id: 4,
    name: "Sir James Taylor's Loolkandura Tea Heritage Hike",
    category: 'Nature',
    description:
      'A historic tea estate linked to the pioneer of Sri Lanka’s commercial tea industry, with heritage trails.',
    openingHours: 'Typically 8:00 AM – 4:30 PM (confirm locally)',
    travelTips: 'Combine with a factory visit if open. Plan extra travel time from central Kandy.',
    distanceKm: 20,
    imageUrls: [
      '/images/attractions/loolkandura-tea-estate.jpg',
      'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1597318112767-7dfb7295c2d0?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 7.145,
    longitude: 80.652,
  },
  {
    id: 5,
    name: 'Udawattakele Forest Sanctuary',
    category: 'Nature',
    description:
      'A protected forest reserve above Kandy known for walking trails, birdlife, and cool canopy shade.',
    openingHours: 'Daily 8:00 AM – 5:00 PM',
    travelTips: 'Stay on marked paths. Mornings are best for birdwatching.',
    distanceKm: 2,
    imageUrls: [
      '/images/attractions/udawattakele-forest.jpg',
      'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 7.299,
    longitude: 80.643,
  },
  {
    id: 6,
    name: 'Ceylon Tea Museum',
    category: 'Museum',
    description:
      'A museum showcasing the history and development of Sri Lanka’s tea industry in a former factory setting.',
    openingHours: 'Tue–Sat 8:30 AM – 3:45 PM; Sun 8:30 AM – 3:00 PM (closed Mon)',
    travelTips: 'Pair with a short tea tasting if available. Allow about 1–1.5 hours.',
    distanceKm: 4,
    imageUrls: [
      '/images/attractions/ceylon-tea-museum.jpg',
      'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 7.2705,
    longitude: 80.6205,
  },
  {
    id: 7,
    name: 'Bellwood View Point',
    category: 'Viewpoint',
    description:
      'A scenic viewpoint offering panoramic views of surrounding mountains and valleys near Kandy.',
    openingHours: 'Daylight hours',
    travelTips: 'Best in clear weather; late afternoon light is often dramatic.',
    distanceKm: 15,
    imageUrls: [
      '/images/attractions/bellwood-view-point.jpg',
      'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 7.22,
    longitude: 80.7,
  },
  {
    id: 8,
    name: 'Water World Kandy',
    category: 'Recreation',
    description:
      'A family-friendly recreational attraction featuring aquatic exhibits and leisure facilities.',
    openingHours: 'Daily 8:30 AM – 5:30 PM',
    travelTips: 'Good option for families needing a cooler indoor stop midday.',
    distanceKm: 9,
    imageUrls: [
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1437622368342-7a3d73a34c8f?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 7.255,
    longitude: 80.61,
  },
  {
    id: 9,
    name: 'Sri Dalada Maligawa (Temple of the Sacred Tooth Relic)',
    category: 'Religious & Heritage',
    description:
      "Sri Lanka’s most sacred Buddhist temple and a UNESCO World Heritage Site at the heart of Kandy.",
    openingHours: 'Daily 5:30 AM – 8:00 PM (puja times vary)',
    travelTips: 'Dress modestly (cover shoulders and knees). Remove shoes before entering.',
    distanceKm: 0.5,
    imageUrls: [
      '/images/attractions/temple-of-the-tooth.jpg',
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 7.2936,
    longitude: 80.6412,
  },
  {
    id: 10,
    name: 'Lankatilaka Temple',
    category: 'Religious & Heritage',
    description:
      'An ancient temple known for distinctive architecture and historical importance southwest of Kandy.',
    openingHours: 'Daily ~6:00 AM – 6:00 PM',
    travelTips: 'Often combined with Gadaladeniya and Embekke in one half-day loop.',
    distanceKm: 14,
    imageUrls: [
      '/images/attractions/lankatilaka-temple.jpg',
      'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 7.2333,
    longitude: 80.5667,
  },
  {
    id: 11,
    name: 'Gadaladeniya Temple',
    category: 'Religious & Heritage',
    description:
      'A historic temple reflecting South Indian architectural influence on a rocky outcrop near Kandy.',
    openingHours: 'Daily ~6:00 AM – 6:00 PM',
    travelTips: 'Wear sun protection; the site is partly exposed. Combine with Lankatilaka.',
    distanceKm: 13,
    imageUrls: [
      '/images/attractions/gadaladeniya-temple.jpg',
      'https://images.unsplash.com/photo-1605649487212-47bdab064df7?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 7.25,
    longitude: 80.55,
  },
  {
    id: 12,
    name: 'Ambuluwawa Biodiversity Complex & Tower',
    category: 'Eco Tourism',
    description:
      'A biodiversity reserve featuring an iconic spiral observation tower and wide landscape views.',
    openingHours: 'Daily 8:30 AM – 5:30 PM (tower access may vary)',
    travelTips: 'The tower climb is steep and open — avoid if uncomfortable with heights.',
    distanceKm: 24,
    imageUrls: [
      '/images/attractions/ambuluwawa-tower.jpg',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 7.1415,
    longitude: 80.5385,
  },
  {
    id: 13,
    name: 'National Museum of Kandy',
    category: 'Museum',
    description:
      'A museum displaying Kandyan cultural artifacts and historical collections next to the palace complex.',
    openingHours: 'Tue–Sat 9:00 AM – 5:00 PM (closed Sun–Mon; confirm locally)',
    travelTips: 'Easy to combine with the Temple of the Tooth in the same morning.',
    distanceKm: 0.5,
    imageUrls: [
      '/images/attractions/national-museum-kandy.jpg',
      'https://images.unsplash.com/photo-1566127444979-b3d2b654e3d7?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 7.294,
    longitude: 80.6405,
  },
  {
    id: 14,
    name: 'Commonwealth War Cemetery',
    category: 'Religious & Heritage',
    description:
      'A well-maintained cemetery commemorating Commonwealth soldiers of the Second World War.',
    openingHours: 'Daily daylight hours',
    travelTips: 'A quiet reflective stop; keep voices low and stay on paths.',
    distanceKm: 5,
    imageUrls: [
      '/images/attractions/commonwealth-war-cemetery.jpg',
      'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 7.28,
    longitude: 80.62,
  },
  {
    id: 15,
    name: "Kandy Viewpoint (Arthur's Seat)",
    category: 'Viewpoint',
    description:
      'A popular viewpoint overlooking Kandy city, Kandy Lake, and the surrounding hills.',
    openingHours: 'Daylight hours',
    travelTips: 'Sunset is popular — arrive early for parking and clear views.',
    distanceKm: 2,
    imageUrls: [
      '/images/attractions/kandy-viewpoint.jpg',
      'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&q=80',
    ],
    latitude: 7.2905,
    longitude: 80.6355,
  },
];
