namespace Todo_App.Domain.Events;
public class TagCreatedEvent : BaseEvent
{
    public TagCreatedEvent(Tag item)
    {
        Item = item;
    }
    public Tag Item { get; }

}
