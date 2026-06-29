using Microsoft.AspNetCore.Mvc;
using Wydarzenia.Api.Models;
using Wydarzenia.Api.Services;

namespace Wydarzenia.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EventsController(EventStore eventStore) : ControllerBase
{
    [HttpGet]
    public ActionResult<IReadOnlyCollection<EventItem>> GetAll()
    {
        return Ok(eventStore.GetAll());
    }

    [HttpGet("{id:int}")]
    public ActionResult<EventItem> GetById(int id)
    {
        var result = eventStore.Get(id);
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public ActionResult<EventItem> Create([FromBody] EventItem request)
    {
        if (!IsValid(request, out var message))
        {
            return BadRequest(message);
        }

        var created = eventStore.Add(request);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:int}")]
    public ActionResult<EventItem> Update(int id, [FromBody] EventItem request)
    {
        if (!IsValid(request, out var message))
        {
            return BadRequest(message);
        }

        var updated = eventStore.Update(id, request);
        return updated is null ? NotFound() : Ok(updated);
    }

    [HttpDelete("{id:int}")]
    public IActionResult Delete(int id)
    {
        return eventStore.Delete(id) ? NoContent() : NotFound();
    }

    private static bool IsValid(EventItem item, out string message)
    {
        if (string.IsNullOrWhiteSpace(item.Title))
        {
            message = "Tytuł wydarzenia jest wymagany.";
            return false;
        }

        if (string.IsNullOrWhiteSpace(item.Location))
        {
            message = "Miejsce wydarzenia jest wymagane.";
            return false;
        }

        if (item.EndDate < item.StartDate)
        {
            message = "Data zakończenia nie może być wcześniejsza od daty rozpoczęcia.";
            return false;
        }

        message = string.Empty;
        return true;
    }
}
