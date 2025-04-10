namespace Todo_App.Domain.Entities;
public class Tag : BaseAuditableEntity
{
    public string Name { get; set; }
    public int TodoItemId { get; set; }
    public TodoItem TodoItem { get; set; }
}
