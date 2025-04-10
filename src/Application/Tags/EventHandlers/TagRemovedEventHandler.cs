using MediatR;
using Microsoft.Extensions.Logging;
using Todo_App.Domain.Events;

namespace Todo_App.Application.Tags.EventHandlers;
public class TagRemovedEventHandler : INotificationHandler<TagDeletedEvent>
{
    private readonly ILogger<TagRemovedEventHandler> _logger;

    public TagRemovedEventHandler(ILogger<TagRemovedEventHandler> logger)
    {
        _logger = logger;
    }
    public Task Handle(TagDeletedEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Tag Removed Event Fired: {EventName}, Tag: {TagName}, TodoItem ID: {TodoItemId}",
            notification.GetType().Name,
            notification.Item.Name,
            notification.Item.TodoItemId);

        return Task.CompletedTask;
    }
}
