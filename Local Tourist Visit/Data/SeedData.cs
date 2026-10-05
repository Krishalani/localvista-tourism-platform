using Local_Tourist_Visit.Models;

namespace Local_Tourist_Visit.Data;

/// <summary>
/// Initial catalogue: the seven predefined categories (BR-03) and the 15 attractions
/// listed in the project proposal (Table 2). Image paths are served by the Angular app.
/// </summary>
public static class SeedData
{
    public const int ReligiousHeritage = 1;
    public const int Nature = 2;
    public const int Adventure = 3;
    public const int Museum = 4;
    public const int Viewpoint = 5;
    public const int Recreation = 6;
    public const int EcoTourism = 7;

    public static readonly Category[] Categories =
    [
        new() { Id = ReligiousHeritage, Name = "Religious & Heritage" },
        new() { Id = Nature, Name = "Nature" },
        new() { Id = Adventure, Name = "Adventure" },
        new() { Id = Museum, Name = "Museum" },
        new() { Id = Viewpoint, Name = "Viewpoint" },
        new() { Id = Recreation, Name = "Recreation" },
        new() { Id = EcoTourism, Name = "Eco Tourism" },
    ];

    public static Attraction[] Attractions() =>
    [
        new()
        {
            Name = "Royal Botanical Gardens, Peradeniya",
            CategoryId = Nature,
            DistanceFromKandyKm = 6m,
            Description = "A world-renowned botanical garden beside the Mahaweli River, featuring a diverse collection of plants, an orchid house, an avenue of royal palms and wide landscaped lawns.",
            OpeningHours = "Daily 7:30 AM - 5:00 PM",
            TravelTips = "Allow two to three hours. Go early in the morning to avoid the heat and the weekend crowds, and carry water and an umbrella.",
            ImageUrl = "/images/attractions/botanical-gardens.jpg",
            Latitude = 7.2711, Longitude = 80.5956,
        },
        new()
        {
            Name = "Hanthana Katusukonda Hike, Tea & Waterfall",
            CategoryId = Adventure,
            DistanceFromKandyKm = 8m,
            Description = "A scenic hiking destination in the Hanthana mountain range offering tea plantations, small waterfalls and panoramic mountain views over Kandy.",
            OpeningHours = "Open all day; start before 9:00 AM for clear views",
            TravelTips = "Wear shoes with good grip and carry water and a rain jacket. Mist rolls in quickly in the afternoon, so plan to be down before then. Leech socks help in the wet season.",
            ImageUrl = "/images/attractions/hanthana.jpg",
            Latitude = 7.2586, Longitude = 80.6286,
        },
        new()
        {
            Name = "British Garrison Cemetery",
            CategoryId = ReligiousHeritage,
            DistanceFromKandyKm = 1m,
            Description = "A historic cemetery established in 1817 that preserves the graves of British colonial officers and civilians who died in Kandy.",
            OpeningHours = "Monday - Saturday 8:00 AM - 1:00 PM and 2:00 PM - 6:00 PM",
            TravelTips = "A short walk from the Temple of the Tooth. The caretaker gives an informative tour; entry is free and donations are welcome.",
            ImageUrl = "/images/attractions/garrison-cemetery.jpg",
            Latitude = 7.2928, Longitude = 80.6432,
        },
        new()
        {
            Name = "Sir James Taylor's Loolkandura Tea Heritage Hike",
            CategoryId = ReligiousHeritage,
            DistanceFromKandyKm = 20m,
            Description = "The historic Loolkandura (Loolecondera) estate, where James Taylor started Sri Lanka's first commercial tea plantation in 1867. The trail passes his cabin site, stone seat and well.",
            OpeningHours = "Daily 8:00 AM - 5:00 PM",
            TravelTips = "The estate road is narrow and winding, so allow about 90 minutes each way from Kandy. Bring a light jacket; the estate is cooler than the city.",
            ImageUrl = "/images/attractions/loolkandura.jpg",
            Latitude = 7.1480, Longitude = 80.6990,
        },
        new()
        {
            Name = "Udawattakele Forest Sanctuary",
            CategoryId = Nature,
            DistanceFromKandyKm = 2m,
            Description = "A protected forest reserve on the ridge above the Temple of the Tooth, known for its biodiversity, shaded walking trails, giant lianas and birdlife.",
            OpeningHours = "Daily 6:00 AM - 6:00 PM (ticket counter closes around 4:30 PM)",
            TravelTips = "Early morning is best for bird watching. Wear covered shoes and keep food out of sight of the monkeys.",
            Latitude = 7.2994, Longitude = 80.6389,
        },
        new()
        {
            Name = "Ceylon Tea Museum",
            CategoryId = Museum,
            DistanceFromKandyKm = 4m,
            Description = "A museum in the former Hanthana tea factory that showcases the history and development of Sri Lanka's tea industry, with vintage machinery and a tea room on the top floor.",
            OpeningHours = "Tuesday - Saturday 8:30 AM - 3:45 PM, Sunday 8:30 AM - 3:00 PM, closed Monday",
            TravelTips = "Combine it with the Hanthana hike, which starts further up the same road. The top-floor tea room has a view over the hills.",
            ImageUrl = "/images/attractions/tea-museum.jpg",
            Latitude = 7.2686, Longitude = 80.6327,
        },
        new()
        {
            Name = "Bellwood View Point",
            CategoryId = Viewpoint,
            DistanceFromKandyKm = 15m,
            Description = "A scenic viewpoint above the Bellwood tea country offering panoramic views of the surrounding mountains and valleys.",
            OpeningHours = "Open all day; best at sunrise or late afternoon",
            TravelTips = "The last stretch of road is steep and narrow, so a tuk-tuk or a vehicle with good ground clearance is recommended. There are no shops nearby.",
            Latitude = 7.2148, Longitude = 80.6795,
        },
        new()
        {
            Name = "Water World Kandy",
            CategoryId = Recreation,
            DistanceFromKandyKm = 9m,
            Description = "A recreational attraction featuring aquatic exhibits, suitable for families and visitors travelling with children.",
            OpeningHours = "Daily 9:00 AM - 5:30 PM",
            TravelTips = "Weekday mornings are the quietest time to visit. Allow about an hour.",
        },
        new()
        {
            Name = "Sri Dalada Maligawa (Temple of the Sacred Tooth Relic)",
            CategoryId = ReligiousHeritage,
            DistanceFromKandyKm = 0.5m,
            Description = "Sri Lanka's most sacred Buddhist temple, which houses the tooth relic of the Buddha. It stands inside the former royal palace complex and is part of the Kandy UNESCO World Heritage Site.",
            OpeningHours = "Daily 5:30 AM - 8:00 PM; puja at 5:30 AM, 9:30 AM and 6:30 PM",
            TravelTips = "Dress modestly with shoulders and knees covered, and remove shoes before entering. Arrive about 30 minutes before a puja to see the relic chamber opened.",
            ImageUrl = "/images/attractions/dalada-maligawa.jpg",
            Latitude = 7.2936, Longitude = 80.6414,
        },
        new()
        {
            Name = "Lankatilaka Temple",
            CategoryId = ReligiousHeritage,
            DistanceFromKandyKm = 14m,
            Description = "A 14th-century temple built on a rock outcrop, famous for its unique architecture, Kandyan-era murals and historical importance.",
            OpeningHours = "Daily 8:00 AM - 6:00 PM",
            TravelTips = "Visit together with Gadaladeniya and Embekka, which are a few kilometres apart. Dress modestly; the rock steps are slippery after rain.",
            ImageUrl = "/images/attractions/lankatilaka.jpg",
            Latitude = 7.2338, Longitude = 80.5650,
        },
        new()
        {
            Name = "Gadaladeniya Temple",
            CategoryId = ReligiousHeritage,
            DistanceFromKandyKm = 13m,
            Description = "A historic stone temple dating from 1344 whose design reflects South Indian architectural influence.",
            OpeningHours = "Daily 8:00 AM - 6:00 PM",
            TravelTips = "Just off the Colombo-Kandy road near Pilimathalawa, so it is an easy first stop on the three-temple loop. Dress modestly.",
            ImageUrl = "/images/attractions/gadaladeniya.jpg",
            Latitude = 7.2573, Longitude = 80.5561,
        },
        new()
        {
            Name = "Ambuluwawa Biodiversity Complex & Tower",
            CategoryId = EcoTourism,
            DistanceFromKandyKm = 24m,
            Description = "A biodiversity reserve on a mountain summit near Gampola, featuring an iconic spiral observation tower and wide scenic landscapes.",
            OpeningHours = "Daily 8:30 AM - 5:00 PM",
            TravelTips = "The spiral staircase is narrow and exposed, so it is not suitable for anyone uncomfortable with heights. Go on a clear morning and avoid windy or rainy days.",
            Latitude = 7.1611, Longitude = 80.5473,
        },
        new()
        {
            Name = "National Museum of Kandy",
            CategoryId = Museum,
            DistanceFromKandyKm = 0.5m,
            Description = "A museum in the former royal palace quarters displaying Kandyan cultural artefacts, weapons, jewellery and historical collections.",
            OpeningHours = "Tuesday - Saturday 9:00 AM - 5:00 PM, closed Sunday, Monday and public holidays",
            TravelTips = "Next to the Temple of the Tooth, so visit both in the same morning. Allow 45 minutes.",
            ImageUrl = "/images/attractions/national-museum.jpg",
            Latitude = 7.2947, Longitude = 80.6408,
        },
        new()
        {
            Name = "Commonwealth War Cemetery",
            CategoryId = ReligiousHeritage,
            DistanceFromKandyKm = 5m,
            Description = "A well-maintained cemetery commemorating Commonwealth soldiers who died during World War II.",
            OpeningHours = "Daily 7:00 AM - 4:00 PM",
            TravelTips = "A quiet stop on the way to or from Peradeniya. Entry is free; please keep to the paths.",
            ImageUrl = "/images/attractions/war-cemetery.jpg",
            Latitude = 7.2816, Longitude = 80.6085,
        },
        new()
        {
            Name = "Kandy Viewpoint (Arthur's Seat)",
            CategoryId = Viewpoint,
            DistanceFromKandyKm = 2m,
            Description = "A popular viewpoint on Rajapihilla Mawatha overlooking Kandy city, Kandy Lake, the Temple of the Tooth and the surrounding hills.",
            OpeningHours = "Open all day",
            TravelTips = "Best in the early morning or at sunset. It is a steep 20-minute walk from the lake, or a short tuk-tuk ride.",
            Latitude = 7.2890, Longitude = 80.6399,
        },
    ];
}
