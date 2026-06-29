using System.Collections.Concurrent;
using Wydarzenia.Api.Models;

namespace Wydarzenia.Api.Services;

public class EventStore
{
    private readonly ConcurrentDictionary<int, EventItem> _events = new();
    private int _nextId;

    public EventStore()
    {
        Add(new EventItem
        {
            Title = "Warszawski Festiwal Książki",
            Description = "Spotkania autorskie i targi książki w centrum miasta.",
            Location = "Pałac Kultury i Nauki",
            StartDate = new DateTimeOffset(2026, 7, 5, 10, 0, 0, TimeSpan.Zero),
            EndDate = new DateTimeOffset(2026, 7, 5, 18, 0, 0, TimeSpan.Zero)
        });
    }

    public IReadOnlyCollection<EventItem> GetAll()
    {
        return _events.Values.OrderBy(x => x.StartDate).ToArray();
    }

    public EventItem? Get(int id)
    {
        return _events.TryGetValue(id, out var existing) ? existing : null;
    }

    public EventItem Add(EventItem item)
    {
        var id = Interlocked.Increment(ref _nextId);
        item.Id = id;
        _events[id] = item;
        return item;
    }

public EventItem? Update(int id, EventItem item)
{
    while (_events.TryGetValue(id, out var existing))
    {
        item.Id = id;
        if (_events.TryUpdate(id, item, existing))
        {
            return item;
        }
    }

    return null;
}

    public bool Delete(int id)
    {
        return _events.TryRemove(id, out _);
    }
}
