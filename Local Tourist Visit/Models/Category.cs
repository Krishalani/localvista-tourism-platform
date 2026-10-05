namespace Local_Tourist_Visit.Models;

public class Category
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;

    public ICollection<Attraction> Attractions { get; set; } = new List<Attraction>();
}
