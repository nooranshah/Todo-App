using MediatR;
using Microsoft.Extensions.Logging;
using Todo_App.Domain.Events;

namespace Todo_App.Application.Tags.EventHandlers;
public class TagAddedEventHandler : INotificationHandler<TagCreatedEvent>
{
    private readonly ILogger<TagAddedEventHandler> _logger;

    public TagAddedEventHandler(ILogger<TagAddedEventHandler> logger)
    {
        _logger = logger;
    }
    public Task Handle(TagCreatedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Tag Added Event Fired: {EventName}, Tag: {TagName}, TodoItem ID: {TodoItemId}",
            notification.GetType().Name,
            notification.Item.Name,
            notification.Item.TodoItemId);

        return Task.CompletedTask;
    }
}
