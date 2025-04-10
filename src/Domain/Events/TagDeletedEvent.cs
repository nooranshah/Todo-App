namespace Todo_App.Domain.Events;
public class TagDeletedEvent : BaseEvent
{
    public TagDeletedEvent(Tag item)
    {
        Item = item;
    }
    public Tag Item { get; }
}
